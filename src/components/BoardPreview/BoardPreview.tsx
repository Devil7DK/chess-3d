import { Chess, Color, PieceSymbol } from 'chess.js';
import { useMemo } from 'react';

import { ChessPiece, Side } from '../../types';
import { getRowColumnFromIndex } from '../../utils';
import { BoardGrid, IBoardSquare } from '../BoardGrid';

const pieceMap: Record<PieceSymbol, ChessPiece> = {
    k: 'king',
    q: 'queen',
    r: 'rook',
    b: 'bishop',
    n: 'knight',
    p: 'pawn',
};

const sideMap: Record<Color, Side> = { w: 'white', b: 'black' };

export interface IBoardPreviewProps {
    fen: string;
    playerSide: Side;
    lastMove?: { from: number; to: number };
}

/**
 * Read-only board for a position that is not the live game, used by the
 * move history to replay earlier positions.
 */
export const BoardPreview = ({
    fen,
    playerSide,
    lastMove,
}: IBoardPreviewProps) => {
    const squares = useMemo<IBoardSquare[]>(() => {
        // chess.js returns ranks 8 to 1, the same mapping deriveCells uses
        const board = new Chess(fen).board();

        return Array.from({ length: 64 }, (_, index) => {
            const { row, column } = getRowColumnFromIndex(index);
            const entry = board[8 - row][column - 1];

            return {
                index,
                row,
                column,
                color:
                    row % 2
                        ? column % 2
                            ? 'white'
                            : 'black'
                        : column % 2
                          ? 'black'
                          : 'white',
                piece: entry ? pieceMap[entry.type] : undefined,
                side: entry ? sideMap[entry.color] : undefined,
            };
        });
    }, [fen]);

    const highlights = useMemo(() => {
        const classes = new Map<number, string>();

        if (lastMove) {
            classes.set(lastMove.from, 'last-move');
            classes.set(lastMove.to, 'last-move');
        }

        return classes;
    }, [lastMove]);

    return (
        <BoardGrid
            className='preview'
            highlights={highlights}
            playerSide={playerSide}
            squares={squares}
        />
    );
};
