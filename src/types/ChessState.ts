import { Square } from 'chess.js';

import { CellState } from './CellState';
import { ChessPiece } from './ChessPiece';
import { GameStatus } from './GameStatus';
import { MoveRecord } from './MoveRecord';
import { PieceState } from './PieceState';
import { Side } from './Side';
import { Tuple } from './Tuple';

export type ChessState = {
    capturedPieces: Record<Side, ChessPiece[]>;
    cells: Tuple<CellState, 64>;
    pieces: PieceState[];
    selectedCell?: number;
    playingSide: Side;
    status: GameStatus;
    pendingPromotion?: { from: number; to: number };
    fen: string;
    history: MoveRecord[];
    /**
     * Cell indices of the move just played, for highlighting it.
     */
    lastMove?: { from: number; to: number };

    selectCell: (index: number) => void;
    moveTo: (index: number) => void;
    promote: (piece: ChessPiece | null) => void;
    applyMove: (from: Square, to: Square, promotion?: ChessPiece) => void;
    newGame: () => void;
    undo: () => void;
};
