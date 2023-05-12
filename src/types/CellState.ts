import { CellPosition } from './CellPosition';
import { ChessPiece } from './ChessPiece';
import { Side } from './Side';

export type CellState = CellPosition & {
    index: number;
    color: 'black' | 'white';
    piece?: ChessPiece;
    side?: Side;
    possibleMoves?: number[];
};
