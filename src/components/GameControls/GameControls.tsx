import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { Side } from '../../types';
import { useChessState } from '../../utils/ChessStateContext';

export interface IGameControlsProps {
    /**
     * Undo & New Game only make sense when the whole game runs locally;
     * remote games hide them.
     */
    showUndo?: boolean;
    showNewGame?: boolean;
    /**
     * Set in remote games. Offers resigning the shared room instead.
     */
    remote?: { roomId: string; side: Side };
}

export const GameControls = ({
    showUndo = true,
    showNewGame = true,
    remote,
}: IGameControlsProps) => {
    const { newGame, undo, status } = useChessState();

    const [confirming, setConfirming] = useState(false);
    const [resigned, setResigned] = useState(false);

    // Either player resigning ends the game, and chess.js cannot tell.
    // Watch the room so the button goes away for both of them. RTDB folds
    // this into RemotePlayer's subscription on the same path.
    const roomId = remote?.roomId;
    useEffect(() => {
        if (!roomId) return;

        let unsubscribe: (() => void) | undefined;
        let cancelled = false;

        import('../../utils/RemoteRooms').then(({ subscribeToRoom }) => {
            if (cancelled) return;

            unsubscribe = subscribeToRoom(roomId, (room) =>
                setResigned(Boolean(room?.resignedBy)),
            );
        });

        return () => {
            cancelled = true;
            unsubscribe?.();
        };
    }, [roomId]);

    const canResign =
        remote && !resigned && (status === 'playing' || status === 'check');

    const resign = async () => {
        if (!remote) return;

        setResigned(true);
        setConfirming(false);

        try {
            const { resignGame } = await import('../../utils/RemoteRooms');
            await resignGame(remote.roomId, remote.side);
        } catch (error) {
            console.error('Failed to resign', error);
            setResigned(false);
        }
    };

    return (
        <div className='game-controls-wrapper'>
            <div className='game-controls'>
                {showUndo && (
                    <button type='button' onClick={undo}>
                        Undo
                    </button>
                )}
                {showNewGame && (
                    <button type='button' onClick={newGame}>
                        New Game
                    </button>
                )}
                {canResign &&
                    (confirming ? (
                        <>
                            <button
                                type='button'
                                className='danger'
                                onClick={resign}
                            >
                                Confirm
                            </button>
                            <button
                                type='button'
                                onClick={() => setConfirming(false)}
                            >
                                Cancel
                            </button>
                        </>
                    ) : (
                        <button
                            type='button'
                            onClick={() => setConfirming(true)}
                        >
                            Resign
                        </button>
                    ))}
                <Link to='/'>Menu</Link>
            </div>
        </div>
    );
};
