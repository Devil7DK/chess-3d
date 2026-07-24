import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import { Scene } from '../../Scene';
import { Side } from '../../types';

type JoinState =
    | { status: 'joining' }
    | { status: 'error'; message: string }
    | { status: 'ready'; side: Side };

const RemoteGameRoom = ({ roomId }: { roomId: string }) => {
    const [state, setState] = useState<JoinState>({ status: 'joining' });

    useEffect(() => {
        let cancelled = false;

        (async () => {
            try {
                const { joinRoom } = await import('../../utils/RemoteRooms');
                const result = await joinRoom(roomId);

                if (cancelled) return;

                if ('error' in result) {
                    setState({
                        status: 'error',
                        message:
                            result.error === 'full'
                                ? 'This room already has two players.'
                                : 'Room not found. Check the code.',
                    });
                } else {
                    setState({ status: 'ready', side: result.side });
                }
            } catch (error) {
                console.error('Failed to join room', error);
                if (!cancelled) {
                    setState({
                        status: 'error',
                        message: 'Could not join the room, try again.',
                    });
                }
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [roomId]);

    if (state.status === 'ready') {
        return <Scene remote={{ roomId, side: state.side }} />;
    }

    return (
        <div className='remote-join'>
            {state.status === 'joining' ? (
                <span>Joining room {roomId}...</span>
            ) : (
                <>
                    <span>{state.message}</span>
                    <Link to='/'>Back to menu</Link>
                </>
            )}
        </div>
    );
};

/**
 * Route wrapper for `/game/:roomId`. Joins (or rejoins) the room, then
 * renders the scene locked to the joined side. Keyed by room id so
 * navigating to another room resets the join state.
 */
export const RemoteGame = () => {
    const { roomId = '' } = useParams();
    const normalizedRoomId = roomId.toUpperCase();

    return <RemoteGameRoom key={normalizedRoomId} roomId={normalizedRoomId} />;
};
