import { useMemo } from 'react';

import { ChessPiece, Side } from '../../types';
import { PieceIcon } from '../PieceIcon';

export interface IBoardSquare {
    index: number;
    row: number;
    column: number;
    color: 'black' | 'white';
    piece?: ChessPiece;
    side?: Side;
}

export interface IBoardGridProps {
    /** All 64 squares, keyed by cell index (index 0 is a1). */
    squares: IBoardSquare[];
    /** Side whose end of the board faces the viewer. */
    playerSide: Side;
    /** Extra class names per cell index: selection, moves, check... */
    highlights?: Map<number, string>;
    showLabels?: boolean;
    className?: string;
    /** Omit to render a board that cannot be played on. */
    onSelect?: (index: number) => void;
}

const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

/**
 * The flat board itself, with no opinion about where the position came
 * from: the live game renders one of these, the move history renders
 * another for a past position.
 */
export const BoardGrid = ({
    squares,
    playerSide,
    highlights,
    showLabels = false,
    className = '',
    onSelect,
}: IBoardGridProps) => {
    // Drawn top row first: white reads ranks 8 to 1 with files a to h, black
    // sees the board rotated a half turn
    const order = useMemo(() => {
        const indices: number[] = [];

        for (let step = 0; step < 8; step++) {
            const row = playerSide === 'white' ? 8 - step : step + 1;

            for (let file = 0; file < 8; file++) {
                const column = playerSide === 'white' ? file + 1 : 8 - file;
                indices.push((row - 1) * 8 + (column - 1));
            }
        }

        return indices;
    }, [playerSide]);

    return (
        <div className={`board-2d ${className}`.trim()}>
            {order.map((index, position) => {
                const square = squares[index];
                const classes = [
                    'board-2d-cell',
                    square.color,
                    highlights?.get(index) ?? '',
                ]
                    .filter(Boolean)
                    .join(' ');

                const content = (
                    <>
                        {showLabels && position % 8 === 0 && (
                            <span className='rank-label'>{square.row}</span>
                        )}
                        {showLabels && position >= 56 && (
                            <span className='file-label'>
                                {FILES[square.column - 1]}
                            </span>
                        )}
                        {square.piece && square.side && (
                            <PieceIcon
                                piece={square.piece}
                                side={square.side}
                            />
                        )}
                    </>
                );

                return onSelect ? (
                    <button
                        type='button'
                        key={index}
                        className={classes}
                        onClick={() => onSelect(index)}
                        aria-label={`${FILES[square.column - 1]}${square.row}`}
                    >
                        {content}
                    </button>
                ) : (
                    <div key={index} className={classes}>
                        {content}
                    </div>
                );
            })}
        </div>
    );
};
