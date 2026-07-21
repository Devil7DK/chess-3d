import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

import { Side } from '../../types';
import { useChessState } from '../../utils/ChessStateContext';
import type { RoomState } from '../../utils/RemoteRooms';

type RemoteRoomsModule = typeof import('../../utils/RemoteRooms');

export interface IRemotePlayerProps {
    roomId: string;
    /**
     * Side played on this device.
     */
    side: Side;
}

/**
 * Keeps the local game in sync with the Firebase room: applies opponent
 * moves from the room record and publishes moves made on this device.
 * Also renders the room overlays (waiting for opponent / disconnected).
 */
export const RemotePlayer = ({ roomId, side }: IRemotePlayerProps) => {
    const { fen, history, status, playingSide, applyMove } = useChessState();

    const [service, setService] = useState<RemoteRoomsModule>();
    const [room, setRoom] = useState<RoomState | null>();

    // Keep the latest applyMove reachable without resubscribing to the room
    const applyMoveRef = useRef(applyMove);
    useEffect(() => {
        applyMoveRef.current = applyMove;
    }, [applyMove]);

    // The firebase-heavy service is only loaded here, keeping the SDK out
    // of the main bundle
    useEffect(() => {
        let cancelled = false;

        import('../../utils/RemoteRooms').then((module) => {
            if (!cancelled) setService(() => module);
        });

        return () => {
            cancelled = true;
        };
    }, []);

    useEffect(() => {
        if (!service) return;

        const unsubscribe = service.subscribeToRoom(roomId, setRoom);
        const releasePresence = service.registerPresence(roomId);

        return () => {
            unsubscribe();
            releasePresence();
        };
    }, [service, roomId]);

    // Apply moves the room record has that the local game doesn't (one per
    // pass — applying updates history, which re-runs the effect for the
    // next one, so a rejoin catches up move by move)
    useEffect(() => {
        if (!service || !room) return;

        if (room.moves.length > history.length) {
            const move = service.uciToMove(room.moves[history.length]);
            applyMoveRef.current(move.from, move.to, move.promotion);
        }
    }, [service, room, history]);

    // Publish the move made on this device once the local game is exactly
    // one move ahead of the room record
    useEffect(() => {
        if (!service || !room) return;
        if (history.length !== room.moves.length + 1) return;

        const lastMover: Side = history.length % 2 === 1 ? 'white' : 'black';
        if (lastMover !== side) return;

        service
            .pushMoves(roomId, history.map(service.moveToUci), fen)
            .catch((error) => console.error('Failed to publish move', error));
    }, [service, room, history, fen, side, roomId]);

    const opponentUid = room?.players[side === 'white' ? 'black' : 'white'];
    const opponentConnected = Boolean(
        opponentUid && room?.presence?.[opponentUid],
    );

    // A resignation ends the game even though the position is still
    // playable, so the room record is the authority alongside chess.js
    const resignedBy = room?.resignedBy;
    const result = resignedBy
        ? resignedBy === side
            ? 'You resigned.'
            : 'Opponent resigned — you win!'
        : status === 'checkmate'
          ? playingSide === side
              ? 'Checkmate — you lose.'
              : 'Checkmate — you win!'
          : status === 'stalemate'
            ? 'Stalemate — the game is a draw.'
            : status === 'draw'
              ? 'The game is a draw.'
              : undefined;

    // Dismissing leaves the final position visible on the board. Keyed by
    // the result itself so a later, different one shows up again
    const [dismissedResult, setDismissedResult] = useState<string>();
    const showResult = Boolean(result) && dismissedResult !== result;

    return (
        <div className='remote-overlay-wrapper'>
            {room === null && (
                <div className='remote-backdrop'>
                    <div className='remote-modal'>
                        <span className='remote-modal-title'>
                            Room not found
                        </span>
                        <span>This room no longer exists.</span>
                        <Link to='/'>Back to menu</Link>
                    </div>
                </div>
            )}
            {room?.status === 'waiting' && (
                <div className='remote-backdrop'>
                    <div className='remote-modal'>
                        <span className='remote-modal-title'>
                            Waiting for opponent…
                        </span>
                        <span>Share this room code:</span>
                        <span className='remote-room-code'>{roomId}</span>
                        <button
                            type='button'
                            onClick={() =>
                                navigator.clipboard.writeText(
                                    window.location.href,
                                )
                            }
                        >
                            Copy link
                        </button>
                    </div>
                </div>
            )}
            {room?.status === 'playing' && showResult && (
                <div className='remote-backdrop'>
                    <div className='remote-modal'>
                        <span className='remote-modal-title'>Game over</span>
                        <span>{result}</span>
                        <div className='remote-modal-actions'>
                            <button
                                type='button'
                                onClick={() => setDismissedResult(result)}
                            >
                                View board
                            </button>
                            <Link to='/'>Back to menu</Link>
                        </div>
                    </div>
                </div>
            )}
            {/* The status banner keeps reporting whose turn it is (chess.js
                knows nothing about resigning), so restate the result */}
            {room?.status === 'playing' && result && !showResult && (
                <div className='remote-notice result'>{result}</div>
            )}
            {/* `!result` — leaving after the game ended is not a
                disconnect worth warning about */}
            {room?.status === 'playing' && !result && !opponentConnected && (
                <div className='remote-notice'>Opponent disconnected</div>
            )}
        </div>
    );
};
