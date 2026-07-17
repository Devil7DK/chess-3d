import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { AIDifficulty, Side } from '../../types';

export const MainMenu = () => {
    const navigate = useNavigate();

    const [showSinglePlayer, setShowSinglePlayer] = useState(false);
    const [side, setSide] = useState<Side>('white');
    const [difficulty, setDifficulty] = useState<AIDifficulty>('medium');

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
                    <div className='single-player-options'>
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
                <button type='button' disabled>
                    2 Player (Remote)
                    <span>Coming soon</span>
                </button>
            </nav>
        </div>
    );
};
