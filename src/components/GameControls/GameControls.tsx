import { Html } from '@react-three/drei';

import { useChessState } from '../../utils/ChessStateContext';

export interface IGameControlsProps {
    /**
     * Undo & New Game only make sense when the whole game runs locally;
     * remote games hide them.
     */
    showUndo?: boolean;
    showNewGame?: boolean;
}

export const GameControls = ({
    showUndo = true,
    showNewGame = true,
}: IGameControlsProps) => {
    const { newGame, undo } = useChessState();

    return (
        <Html fullscreen wrapperClass='game-controls-wrapper'>
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
                {/* Plain anchor: router context is not available inside the Canvas */}
                <a href='#/'>Menu</a>
            </div>
        </Html>
    );
};
