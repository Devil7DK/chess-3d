import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import {
    faChessBishop,
    faChessKing,
    faChessKnight,
    faChessPawn,
    faChessQueen,
    faChessRook,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { ChessPiece, Side } from '../../types';

const icons: Record<ChessPiece, IconDefinition> = {
    king: faChessKing,
    queen: faChessQueen,
    rook: faChessRook,
    bishop: faChessBishop,
    knight: faChessKnight,
    pawn: faChessPawn,
};

export interface IPieceIconProps {
    piece: ChessPiece;
    side: Side;
}

/**
 * A piece as a Font Awesome glyph, shared by the 2D board and the move
 * history so both read the same way. Icons are imported individually so
 * the rest of the set is tree-shaken away.
 */
export const PieceIcon = ({ piece, side }: IPieceIconProps) => (
    <FontAwesomeIcon
        icon={icons[piece]}
        className={`piece-icon ${side}`}
        title={`${side} ${piece}`}
    />
);
