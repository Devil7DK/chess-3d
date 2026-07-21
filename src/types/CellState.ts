import { CellPosition } from './CellPosition';
import { ChessPiece } from './ChessPiece';
import { Side } from './Side';

export type PossibleMove = {
    index: number;
    /**
     * The move takes an opponent piece (including en passant, where the
     * captured pawn is not on the destination square).
     */
    capture: boolean;
};

export type CellState = CellPosition & {
    index: number;
    color: 'black' | 'white';
    piece?: ChessPiece;
    side?: Side;
    possibleMoves?: PossibleMove[];
};
