import { ChessPiece } from './ChessPiece';
import { Side } from './Side';

export type PieceState = {
    /**
     * Stable identifier for the piece across the whole game,
     * based on its starting square (e.g. "w-e2").
     */
    id: string;

    /**
     * Current piece type. Changes when a pawn is promoted.
     */
    piece: ChessPiece;

    side: Side;

    /**
     * Index of the cell the piece currently occupies
     * (its last position when captured).
     */
    cellIndex: number;

    captured: boolean;

    /**
     * Capture sequence number, used to lay out the captured pieces tray.
     */
    capturedOrder?: number;
};
