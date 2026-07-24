import { useMemo } from 'react';

import { Side } from '../../types';
import { useChessState } from '../../utils/ChessStateContext';
import { BoardGrid } from '../BoardGrid';
import { PieceIcon } from '../PieceIcon';

export interface IBoard2DProps {
    /**
     * Side played on this device. It gets the near edge of the board, the
     * same way the 3D camera sits behind it.
     */
    playerSide: Side;
}

/**
 * Flat board over the same `ChessState` as the 3D one: identical click
 * semantics (select own piece, then move) and the same highlight meanings:
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

    const highlights = useMemo(() => {
        const classes = new Map<number, string>();

        // Last move only while nothing is selected, so it never competes
        // with the move being chosen for the same square
        if (selectedCell === undefined && lastMove) {
            classes.set(lastMove.from, 'last-move');
            classes.set(lastMove.to, 'last-move');
        }

        if (selectedCell !== undefined) {
            const cell = cells[selectedCell];

            classes.set(
                selectedCell,
                cell.possibleMoves?.length ? 'selected' : 'selected-blocked',
            );

            for (const move of cell.possibleMoves ?? []) {
                classes.set(move.index, move.capture ? 'capture' : 'move');
            }
        }

        if (status === 'check' || status === 'checkmate') {
            const king = cells.find(
                (cell) => cell.piece === 'king' && cell.side === playingSide,
            );

            if (king && !classes.has(king.index)) {
                classes.set(king.index, 'check');
            }
        }

        return classes;
    }, [cells, selectedCell, lastMove, status, playingSide]);

    const onSelect = (index: number) => {
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
            <BoardGrid
                showLabels
                highlights={highlights}
                playerSide={playerSide}
                squares={cells}
                onSelect={onSelect}
            />
            {captureRow(playerSide)}
        </div>
    );
};
