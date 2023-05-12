import { CellState } from './CellState';
import { ChessPiece } from './ChessPiece';
import { Side } from './Side';
import { Tuple } from './Tuple';

export type ChessState = {
    capturedPieces: Record<Side, ChessPiece[]>;
    cells: Tuple<CellState, 64>;
    selectedCell?: number;
    playingSide: Side;

    selectCell: (index: number) => void;
    moveTo: (index: number) => void;
};
