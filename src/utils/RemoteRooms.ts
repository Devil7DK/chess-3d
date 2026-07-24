import { DEFAULT_POSITION, Square } from 'chess.js';
import {
    child,
    endAt,
    get,
    limitToFirst,
    onDisconnect,
    onValue,
    orderByChild,
    push,
    query,
    ref,
    remove,
    runTransaction,
    serverTimestamp,
    set,
    update,
} from 'firebase/database';

import { ChessPiece, MoveRecord, Side } from '../types';
import {
    ensureSignedIn,
    getFirebaseAuth,
    getFirebaseDatabase,
} from './Firebase';

export type RoomStatus = 'waiting' | 'playing';

export interface RoomState {
    status: RoomStatus;
    players: Partial<Record<Side, string>>;
    /**
     * Moves since the start position in long algebraic notation
     * (e.g. `e2e4`, `e7e8q`), the authoritative game record. Stored as an
     * append-only push-list and flattened here in key order.
     */
    moves: string[];
    fen: string;
    presence?: Record<string, boolean>;
    /**
     * Set when a player gave up. The game is over even though the
     * position itself is still playable.
     */
    resignedBy?: Side;
    /**
     * Games played in this room so far. Move entries are immutable, so a
     * rematch cannot clear them. Each round gets its own subtree instead.
     */
    round: number;
    /**
     * `uid -> the round that player has offered to play`. Once both point at
     * the next round, either client may advance `round`.
     */
    rematch: Record<string, number>;
}

export type JoinRoomResult = { side: Side } | { error: 'not-found' | 'full' };

// No 0/O or 1/I so codes read back unambiguously
const ROOM_CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const ROOM_CODE_LENGTH = 6;

const generateRoomCode = () =>
    Array.from(
        { length: ROOM_CODE_LENGTH },
        () =>
            ROOM_CODE_ALPHABET[
                Math.floor(Math.random() * ROOM_CODE_ALPHABET.length)
            ],
    ).join('');

const promotionMap: Record<string, ChessPiece> = {
    q: 'queen',
    r: 'rook',
    b: 'bishop',
    n: 'knight',
};

const promotionSymbolMap: Partial<Record<ChessPiece, string>> = {
    queen: 'q',
    rook: 'r',
    bishop: 'b',
    knight: 'n',
};

export const moveToUci = (move: Omit<MoveRecord, 'san'>): string =>
    `${move.from}${move.to}${move.promotion ? promotionSymbolMap[move.promotion] : ''}`;

// The room record stores long algebraic moves, which carry no SAN. The
// caller only needs the squares to replay the move through chess.js
export const uciToMove = (uci: string): Omit<MoveRecord, 'san'> => ({
    from: uci.slice(0, 2) as Square,
    to: uci.slice(2, 4) as Square,
    promotion: promotionMap[uci.charAt(4)],
});

/** Nothing expires on its own, so clients tidy up after each other. */
const ROOM_TTL_MS = 24 * 60 * 60 * 1000;
const SWEEP_LIMIT = 20;

/**
 * Deletes a batch of long-abandoned rooms. Best effort by design: the
 * security rules only allow deleting rooms past the same TTL, so a failure
 * here is never worth interrupting the caller for.
 */
export const sweepStaleRooms = async (): Promise<number> => {
    const database = getFirebaseDatabase();

    const stale = await get(
        query(
            ref(database, 'rooms'),
            orderByChild('createdAt'),
            endAt(Date.now() - ROOM_TTL_MS),
            limitToFirst(SWEEP_LIMIT),
        ),
    );

    const deletions: Promise<unknown>[] = [];

    stale.forEach((room) => {
        // Someone is still connected. Leave it to their disconnect
        if (room.hasChild('presence')) return;

        deletions.push(remove(room.ref).catch(() => undefined));
    });

    await Promise.all(deletions);

    return deletions.length;
};

export const createRoom = async (
    preferredSide: Side | 'random',
): Promise<{ roomId: string; side: Side }> => {
    const user = await ensureSignedIn();
    const database = getFirebaseDatabase();

    // Creating a room is the natural moment to take out the rubbish, and
    // the caller must not wait for it
    sweepStaleRooms().catch(() => undefined);

    const side =
        preferredSide === 'random'
            ? Math.random() < 0.5
                ? 'white'
                : 'black'
            : preferredSide;

    // Retry on the (unlikely) code collision. The transaction aborts when
    // the room already exists
    for (let attempt = 0; attempt < 5; attempt++) {
        const roomId = generateRoomCode();

        const result = await runTransaction(
            ref(database, `rooms/${roomId}`),
            (current) => {
                if (current !== null) return undefined;

                return {
                    createdAt: serverTimestamp(),
                    status: 'waiting',
                    players: { [side]: user.uid },
                    fen: DEFAULT_POSITION,
                };
            },
        );

        if (result.committed) {
            return { roomId, side };
        }
    }

    throw new Error('Could not allocate a room code');
};

export const joinRoom = async (roomId: string): Promise<JoinRoomResult> => {
    const user = await ensureSignedIn();
    const database = getFirebaseDatabase();
    const roomRef = ref(database, `rooms/${roomId}`);

    // Two attempts: if claiming a seat races with another player, re-read
    // and try the remaining one
    for (let attempt = 0; attempt < 2; attempt++) {
        const snapshot = await get(roomRef);
        if (!snapshot.exists()) return { error: 'not-found' };

        const players = (snapshot.child('players').val() ?? {}) as Partial<
            Record<Side, string>
        >;

        // Already in the room (creator arriving, or a rejoin after reload)
        if (players.white === user.uid) return { side: 'white' };
        if (players.black === user.uid) return { side: 'black' };

        const openSide: Side | undefined = !players.white
            ? 'white'
            : !players.black
              ? 'black'
              : undefined;

        if (!openSide) return { error: 'full' };

        // The transaction claims just the one seat. Aborting a whole-room
        // transaction on null would trip over the SDK's empty local cache,
        // but the null -> uid direction here is safe: an optimistic claim of
        // a taken seat is re-run with the server value and aborts.
        const result = await runTransaction(
            ref(database, `rooms/${roomId}/players/${openSide}`),
            (current) => (current === null ? user.uid : undefined),
        );

        if (result.committed) {
            await update(roomRef, { status: 'playing' });
            return { side: openSide };
        }
    }

    return { error: 'full' };
};

interface MatchmakingEntry {
    uid: string;
    roomId: string;
    createdAt: number;
}

const WAITING_PATH = 'matchmaking/waiting';

/**
 * A queue entry outlives its owner whenever `onDisconnect` doesn't fire
 * (killed tab, lost network). Past this age, assume nobody is waiting.
 */
const QUEUE_TTL_MS = 10 * 60 * 1000;

/**
 * Pairs with the waiting player if there is one, otherwise creates a room
 * and advertises it in the queue. Either way resolves with the room to
 * navigate to; the caller lands in the normal room flow (waiting modal
 * until the opponent arrives).
 */
export const findRandomMatch = async (): Promise<{ roomId: string }> => {
    const user = await ensureSignedIn();
    const database = getFirebaseDatabase();
    const waitingRef = ref(database, WAITING_PATH);

    for (let attempt = 0; attempt < 3; attempt++) {
        const snapshot = await get(waitingRef);
        const waiting = snapshot.val() as MatchmakingEntry | null;

        // Re-clicking while already queued goes back to the waiting room
        if (waiting?.uid === user.uid) {
            return { roomId: waiting.roomId };
        }

        if (waiting && waiting.createdAt < Date.now() - QUEUE_TTL_MS) {
            // Abandoned entry: clear it and take the slot ourselves
            await remove(waitingRef);
            continue;
        }

        if (waiting) {
            // Take the waiting player's open seat. The seat transaction
            // inside joinRoom is the arbiter if several players race for it
            const result = await joinRoom(waiting.roomId);

            if ('side' in result) {
                remove(waitingRef).catch(() => undefined);
                return { roomId: waiting.roomId };
            }

            // Room gone or already full. Clear the stale entry and retry
            await remove(waitingRef);
            continue;
        }

        // No one waiting: create a room and claim the queue slot. The
        // null -> entry transaction direction is safe against the SDK's
        // empty local cache (see joinRoom).
        const { roomId } = await createRoom('random');

        const claim = await runTransaction(waitingRef, (current) =>
            current === null
                ? { uid: user.uid, roomId, createdAt: Date.now() }
                : undefined,
        );

        if (!claim.committed) {
            // Someone entered the queue first. Drop our unused room and
            // match with them on the next pass
            await remove(ref(database, `rooms/${roomId}`));
            continue;
        }

        // If we bail while waiting, free the slot for others
        onDisconnect(waitingRef).remove();

        // Once our game starts, stop the disconnect cleanup and clear the
        // entry (if still ours) so a later waiter can't get clobbered
        const unsubscribe = onValue(
            ref(database, `rooms/${roomId}/status`),
            (statusSnapshot) => {
                if (statusSnapshot.val() !== 'playing') return;

                unsubscribe();
                onDisconnect(waitingRef).cancel();

                get(waitingRef).then((entrySnapshot) => {
                    const entry =
                        entrySnapshot.val() as MatchmakingEntry | null;
                    if (entry?.uid === user.uid && entry.roomId === roomId) {
                        remove(waitingRef).catch(() => undefined);
                    }
                });
            },
        );

        return { roomId };
    }

    throw new Error('Could not find a match');
};

export const subscribeToRoom = (
    roomId: string,
    callback: (state: RoomState | null) => void,
) => {
    const database = getFirebaseDatabase();

    return onValue(ref(database, `rooms/${roomId}`), (snapshot) => {
        if (!snapshot.exists()) {
            callback(null);
            return;
        }

        // Rooms created before rounds existed have no `round`
        const round: number = snapshot.child('round').val() ?? 1;

        // Push keys sort chronologically, and forEach walks children in key
        // order, so this is the move list in the order they were played
        const moves: string[] = [];
        snapshot.child(`moves/${round}`).forEach((entry) => {
            moves.push(entry.child('uci').val());
        });

        callback({
            status: snapshot.child('status').val(),
            players: snapshot.child('players').val() ?? {},
            moves,
            fen: snapshot.child('fen').val(),
            presence: snapshot.child('presence').val() ?? undefined,
            resignedBy: snapshot.child('resignedBy').val() ?? undefined,
            round,
            rematch: snapshot.child('rematch').val() ?? {},
        });
    });
};

/**
 * Appends a single move. Entries are write-once and tagged with the side
 * that played them, so neither player can rewrite the record or slip in a
 * move on the other's behalf. The rules reject both.
 */
export const pushMove = (
    roomId: string,
    round: number,
    uci: string,
    side: Side,
    fen: string,
) => {
    const database = getFirebaseDatabase();
    const roomRef = ref(database, `rooms/${roomId}`);
    const moveKey = push(child(roomRef, `moves/${round}`)).key;

    return update(roomRef, {
        [`moves/${round}/${moveKey}`]: { uci, side },
        fen,
        lastMoveAt: serverTimestamp(),
    });
};

/** The uid this device plays as, the key rematch offers are stored under. */
export const getCurrentUid = (): string | undefined =>
    getFirebaseAuth().currentUser?.uid;

/**
 * Offers to play another game. When both players have offered the same
 * round, either client may advance `round`. The rules only accept a `+1`,
 * so whoever loses the race is simply rejected.
 */
export const offerRematch = (roomId: string, round: number) => {
    const uid = getCurrentUid();
    if (!uid) return Promise.resolve();

    const database = getFirebaseDatabase();

    return set(ref(database, `rooms/${roomId}/rematch/${uid}`), round + 1);
};

export const startNextRound = (roomId: string, round: number) => {
    const database = getFirebaseDatabase();

    return update(ref(database, `rooms/${roomId}`), {
        round: round + 1,
        fen: DEFAULT_POSITION,
        resignedBy: null,
        endedAt: null,
    });
};

/**
 * Gives the game up on behalf of `side`. The move record is left alone so
 * the final position stays on the board for both players.
 */
export const resignGame = (roomId: string, side: Side) => {
    const database = getFirebaseDatabase();

    return update(ref(database, `rooms/${roomId}`), {
        resignedBy: side,
        endedAt: serverTimestamp(),
    });
};

/**
 * Marks the current user as present in the room, clears the mark when the
 * connection drops (and restores it when it comes back). Returns a cleanup
 * function for unmount.
 */
export const registerPresence = (roomId: string) => {
    const uid = getFirebaseAuth().currentUser?.uid;
    if (!uid) return () => {};

    const database = getFirebaseDatabase();
    const presenceRef = ref(database, `rooms/${roomId}/presence/${uid}`);

    const unsubscribe = onValue(
        ref(database, '.info/connected'),
        (snapshot) => {
            if (snapshot.val() === true) {
                onDisconnect(presenceRef).remove();
                set(presenceRef, true);
            }
        },
    );

    return () => {
        unsubscribe();
        onDisconnect(presenceRef).cancel();
        remove(presenceRef);
    };
};
