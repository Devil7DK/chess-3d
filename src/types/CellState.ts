import { ChessPiece } from './ChessPiece';
import { Side } from './Side';

export type CellState = {
    index: number;
    row: number;
    column: number;
    color: 'black' | 'white';
    piece?: ChessPiece;
    side?: Side;
    possibleMoves?: number[][];
};
