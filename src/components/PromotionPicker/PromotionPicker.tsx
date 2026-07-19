import { ChessPiece } from '../../types';
import { useChessState } from '../../utils/ChessStateContext';

const choices: { piece: ChessPiece; label: string; symbol: string }[] = [
    { piece: 'queen', label: 'Queen', symbol: '♛' },
    { piece: 'rook', label: 'Rook', symbol: '♜' },
    { piece: 'bishop', label: 'Bishop', symbol: '♝' },
    { piece: 'knight', label: 'Knight', symbol: '♞' },
];

export const PromotionPicker = () => {
    const { pendingPromotion, promote } = useChessState();

    if (!pendingPromotion) return null;

    return (
        <div className='promotion-picker-wrapper'>
            <div className='promotion-picker'>
                <span className='promotion-picker-title'>Promote pawn to</span>
                <div className='promotion-picker-choices'>
                    {choices.map(({ piece, label, symbol }) => (
                        <button
                            key={piece}
                            type='button'
                            onClick={() => promote(piece)}
                        >
                            <span className='symbol'>{symbol}</span>
                            {label}
                        </button>
                    ))}
                </div>
                <button
                    type='button'
                    className='promotion-picker-cancel'
                    onClick={() => promote(null)}
                >
                    Cancel
                </button>
            </div>
        </div>
    );
};
