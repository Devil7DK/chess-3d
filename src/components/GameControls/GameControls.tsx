import { Html } from '@react-three/drei';

import { useChessState } from '../../utils/ChessStateContext';

export const GameControls = () => {
    const { newGame, undo } = useChessState();

    return (
        <Html fullscreen wrapperClass='game-controls-wrapper'>
            <div className='game-controls'>
                <button type='button' onClick={undo}>
                    Undo
                </button>
                <button type='button' onClick={newGame}>
                    New Game
                </button>
            </div>
        </Html>
    );
};
