import { DEFAULT_POSITION, Square } from 'chess.js';
import {
    get,
    onDisconnect,
    onValue,
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
     * (e.g. `e2e4`, `e7e8q`) — the authoritative game record.
     */
    moves: string[];
    fen: string;
    presence?: Record<string, boolean>;
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

export const moveToUci = (move: MoveRecord): string =>
    `${move.from}${move.to}${move.promotion ? promotionSymbolMap[move.promotion] : ''}`;

export const uciToMove = (uci: string): MoveRecord => ({
    from: uci.slice(0, 2) as Square,
    to: uci.slice(2, 4) as Square,
    promotion: promotionMap[uci.charAt(4)],
});

export const createRoom = async (
    preferredSide: Side | 'random',
): Promise<{ roomId: string; side: Side }> => {
    const user = await ensureSignedIn();
    const database = getFirebaseDatabase();

    const side =
        preferredSide === 'random'
            ? Math.random() < 0.5
                ? 'white'
                : 'black'
            : preferredSide;

    // Retry on the (unlikely) code collision — the transaction aborts when
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
        // but the null → uid direction here is safe: an optimistic claim of
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

        if (waiting) {
            // Take the waiting player's open seat — the seat transaction
            // inside joinRoom is the arbiter if several players race for it
            const result = await joinRoom(waiting.roomId);

            if ('side' in result) {
                remove(waitingRef).catch(() => undefined);
                return { roomId: waiting.roomId };
            }

            // Room gone or already full — clear the stale entry and retry
            await remove(waitingRef);
            continue;
        }

        // No one waiting: create a room and claim the queue slot. The
        // null → entry transaction direction is safe against the SDK's
        // empty local cache (see joinRoom).
        const { roomId } = await createRoom('random');

        const claim = await runTransaction(waitingRef, (current) =>
            current === null
                ? { uid: user.uid, roomId, createdAt: Date.now() }
                : undefined,
        );

        if (!claim.committed) {
            // Someone entered the queue first — drop our unused room and
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
                    const entry = entrySnapshot.val() as MatchmakingEntry | null;
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
        const value = snapshot.val();

        if (!value) {
            callback(null);
            return;
        }

        callback({
            status: value.status,
            players: value.players ?? {},
            // Realtime Database drops empty arrays entirely
            moves: value.moves ?? [],
            fen: value.fen,
            presence: value.presence,
        });
    });
};

export const pushMoves = (roomId: string, moves: string[], fen: string) => {
    const database = getFirebaseDatabase();

    return update(ref(database, `rooms/${roomId}`), {
        moves,
        fen,
        lastMoveAt: serverTimestamp(),
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
