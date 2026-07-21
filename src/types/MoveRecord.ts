import { Square } from 'chess.js';

import { ChessPiece } from './ChessPiece';

export type MoveRecord = {
    from: Square;
    to: Square;
    promotion?: ChessPiece;
    /**
     * Standard algebraic notation (`Nf3`, `exd5`, `O-O`, `Qh4#`) — what a
     * move list is expected to show.
     */
    san: string;
};
