import { Square } from 'chess.js';

import { ChessPiece } from './ChessPiece';

export type MoveRecord = {
    from: Square;
    to: Square;
    promotion?: ChessPiece;
};
