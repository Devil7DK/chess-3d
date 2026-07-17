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
                {/* Plain anchor: router context is not available inside the Canvas */}
                <a href='#/'>Menu</a>
            </div>
        </Html>
    );
};
