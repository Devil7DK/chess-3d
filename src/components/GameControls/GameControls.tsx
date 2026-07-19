import { Link } from 'react-router-dom';

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
                <Link to='/'>Menu</Link>
            </div>
        </div>
    );
};
