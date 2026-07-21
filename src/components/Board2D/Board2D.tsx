import { useMemo } from 'react';

import { Side } from '../../types';
import { useChessState } from '../../utils/ChessStateContext';
import { PieceIcon } from '../PieceIcon';

export interface IBoard2DProps {
    /**
     * Side played on this device — it gets the near edge of the board, the
     * same way the 3D camera sits behind it.
     */
    playerSide: Side;
}

const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

/**
 * Flat board over the same `ChessState` as the 3D one: identical click
 * semantics (select own piece, then move) and the same highlight meanings —
 * white for a move, orange for a capture, red for check, blue for the last
 * move played.
 */
export const Board2D = ({ playerSide }: IBoard2DProps) => {
    const {
        cells,
        capturedPieces,
        selectedCell,
        playingSide,
        status,
        lastMove,
        selectCell,
        moveTo,
    } = useChessState();

    // Board is drawn top row first; white reads ranks 8→1 with files a→h,
    // black sees it rotated a half turn
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

    const moveTargets = useMemo(() => {
        const targets = new Map<number, boolean>();

        if (selectedCell !== undefined) {
            for (const move of cells[selectedCell].possibleMoves ?? []) {
                targets.set(move.index, move.capture);
            }
        }

        return targets;
    }, [cells, selectedCell]);

    const onClick = (index: number) => {
        if (selectedCell === undefined || selectedCell === index) {
            selectCell(index);
            return;
        }

        if (cells[index].side === playingSide) {
            selectCell(index);
        } else {
            moveTo(index);
        }
    };

    const captureRow = (side: Side) => (
        <div className='board-2d-captured'>
            {capturedPieces[side].map((piece, index) => (
                <PieceIcon
                    key={`${side}-${piece}-${index}`}
                    piece={piece}
                    side={side === 'white' ? 'black' : 'white'}
                />
            ))}
        </div>
    );

    return (
        <div className='board-2d-wrapper'>
            {/* capturedPieces is keyed by the capturing side, so the pieces
                a player has taken sit on that player's own side */}
            {captureRow(playerSide === 'white' ? 'black' : 'white')}
            <div className='board-2d'>
                {order.map((index, position) => {
                    const cell = cells[index];
                    const target = moveTargets.get(index);

                    const isChecked =
                        (status === 'check' || status === 'checkmate') &&
                        cell.piece === 'king' &&
                        cell.side === playingSide;

                    const isLastMove =
                        selectedCell === undefined &&
                        (lastMove?.from === index || lastMove?.to === index);

                    const classes = [
                        'board-2d-cell',
                        cell.color,
                        selectedCell === index
                            ? cell.possibleMoves?.length
                                ? 'selected'
                                : 'selected-blocked'
                            : '',
                        target === undefined ? '' : target ? 'capture' : 'move',
                        isChecked ? 'check' : '',
                        isLastMove ? 'last-move' : '',
                    ]
                        .filter(Boolean)
                        .join(' ');

                    return (
                        <button
                            type='button'
                            key={index}
                            className={classes}
                            onClick={() => onClick(index)}
                            aria-label={`${FILES[cell.column - 1]}${cell.row}`}
                        >
                            {position % 8 === 0 && (
                                <span className='rank-label'>{cell.row}</span>
                            )}
                            {position >= 56 && (
                                <span className='file-label'>
                                    {FILES[cell.column - 1]}
                                </span>
                            )}
                            {cell.piece && cell.side && (
                                <PieceIcon
                                    piece={cell.piece}
                                    side={cell.side}
                                />
                            )}
                        </button>
                    );
                })}
            </div>
            {captureRow(playerSide)}
        </div>
    );
};
