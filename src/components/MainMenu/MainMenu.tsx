import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { AIDifficulty, Side } from '../../types';
import { isFirebaseConfigured } from '../../utils/FirebaseConfig';

export const MainMenu = () => {
    const navigate = useNavigate();

    const [showSinglePlayer, setShowSinglePlayer] = useState(false);
    const [side, setSide] = useState<Side>('white');
    const [difficulty, setDifficulty] = useState<AIDifficulty>('medium');

    const [showRemote, setShowRemote] = useState(false);
    const [remoteSide, setRemoteSide] = useState<Side | 'random'>('random');
    const [joinCode, setJoinCode] = useState('');
    const [creatingRoom, setCreatingRoom] = useState(false);
    const [findingMatch, setFindingMatch] = useState(false);
    const [remoteError, setRemoteError] = useState<string>();

    const createRoom = async () => {
        setCreatingRoom(true);
        setRemoteError(undefined);

        try {
            // Dynamic import keeps the firebase SDK out of the main bundle
            const { createRoom } = await import('../../utils/RemoteRooms');
            const { roomId } = await createRoom(remoteSide);

            navigate(`/game/${roomId}`);
        } catch (error) {
            console.error('Failed to create room', error);
            setRemoteError('Could not create a room, try again.');
            setCreatingRoom(false);
        }
    };

    const findRandomOpponent = async () => {
        setFindingMatch(true);
        setRemoteError(undefined);

        try {
            const { findRandomMatch } = await import('../../utils/RemoteRooms');
            const { roomId } = await findRandomMatch();

            navigate(`/game/${roomId}`);
        } catch (error) {
            console.error('Failed to find a match', error);
            setRemoteError('Could not find a match, try again.');
            setFindingMatch(false);
        }
    };

    return (
        <div className='main-menu'>
            <h1>3D Chess</h1>
            <nav>
                <button
                    type='button'
                    onClick={() => setShowSinglePlayer((value) => !value)}
                >
                    Single Player
                </button>
                {showSinglePlayer && (
                    <div className='mode-options'>
                        <label>
                            Play as
                            <select
                                value={side}
                                onChange={(e) =>
                                    setSide(e.target.value as Side)
                                }
                            >
                                <option value='white'>White</option>
                                <option value='black'>Black</option>
                            </select>
                        </label>
                        <label>
                            Difficulty
                            <select
                                value={difficulty}
                                onChange={(e) =>
                                    setDifficulty(
                                        e.target.value as AIDifficulty,
                                    )
                                }
                            >
                                <option value='easy'>Easy</option>
                                <option value='medium'>Medium</option>
                                <option value='hard'>Hard</option>
                            </select>
                        </label>
                        <button
                            type='button'
                            onClick={() =>
                                navigate(
                                    `/play/ai?side=${side}&difficulty=${difficulty}`,
                                )
                            }
                        >
                            Start
                        </button>
                    </div>
                )}
                <Link to='/play'>2 Player (Single Screen)</Link>
                <button
                    type='button'
                    disabled={!isFirebaseConfigured}
                    onClick={() => setShowRemote((value) => !value)}
                >
                    2 Player (Remote)
                    {!isFirebaseConfigured && <span>Unavailable</span>}
                </button>
                {showRemote && (
                    <div className='mode-options'>
                        <label>
                            Play as
                            <select
                                value={remoteSide}
                                onChange={(e) =>
                                    setRemoteSide(
                                        e.target.value as Side | 'random',
                                    )
                                }
                            >
                                <option value='random'>Random</option>
                                <option value='white'>White</option>
                                <option value='black'>Black</option>
                            </select>
                        </label>
                        <button
                            type='button'
                            disabled={creatingRoom}
                            onClick={createRoom}
                        >
                            {creatingRoom ? 'Creating room…' : 'Create Room'}
                        </button>
                        <div className='mode-options-divider'>or</div>
                        <label>
                            Room code
                            <input
                                type='text'
                                maxLength={6}
                                placeholder='ABC123'
                                value={joinCode}
                                onChange={(e) =>
                                    setJoinCode(e.target.value.toUpperCase())
                                }
                            />
                        </label>
                        <button
                            type='button'
                            disabled={joinCode.length !== 6}
                            onClick={() => navigate(`/game/${joinCode}`)}
                        >
                            Join Room
                        </button>
                        <div className='mode-options-divider'>or</div>
                        <button
                            type='button'
                            disabled={findingMatch}
                            onClick={findRandomOpponent}
                        >
                            {findingMatch
                                ? 'Finding match…'
                                : 'Random Opponent'}
                        </button>
                        {remoteError && (
                            <div className='mode-options-error'>
                                {remoteError}
                            </div>
                        )}
                    </div>
                )}
            </nav>
        </div>
    );
};
