import { ChessPiece, Side } from '../../types';
import { PieceIcon } from '../PieceIcon';

const sanPieces: Record<string, ChessPiece> = {
    K: 'king',
    Q: 'queen',
    R: 'rook',
    B: 'bishop',
    N: 'knight',
};

export interface IMoveSanProps {
    san: string;
    side: Side;
}

/**
 * A move in algebraic notation with its piece as an icon. Castling has no
 * piece letter to replace, and a pawn move has none to begin with, so both
 * fall back to plain text.
 */
export const MoveSan = ({ san, side }: IMoveSanProps) => {
    const piece = san.startsWith('O-O') ? undefined : sanPieces[san.charAt(0)];

    return (
        <span className='move-san'>
            {piece ? (
                <>
                    <PieceIcon piece={piece} side={side} />
                    {san.slice(1)}
                </>
            ) : (
                san
            )}
        </span>
    );
};
