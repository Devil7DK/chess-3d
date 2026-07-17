import { Chess, Color, PieceSymbol } from 'chess.js';
import React, {
    PropsWithChildren,
    createContext,
    useCallback,
    useContext,
    useState,
} from 'react';
import { CellState, ChessPiece, ChessState, Side, Tuple } from '../types';
import {
    getRowColumnFromIndex,
    indexToSquare,
    squareToIndex,
} from './ChessUtils';

const pieceMap: Record<PieceSymbol, ChessPiece> = {
    k: 'king',
    q: 'queen',
    r: 'rook',
    b: 'bishop',
    n: 'knight',
    p: 'pawn',
};

const sideMap: Record<Color, Side> = {
    w: 'white',
    b: 'black',
};

function deriveCells(game: Chess): Tuple<CellState, 64> {
    const board = game.board();

    const cells: CellState[] = [];

    for (let index = 0; index < 64; index++) {
        const { row, column } = getRowColumnFromIndex(index);

        const color =
            row % 2
                ? column % 2
                    ? 'white'
                    : 'black'
                : column % 2
                  ? 'black'
                  : 'white';

        const entry = board[8 - row][column - 1];

        const possibleMoves = entry
            ? [
                  ...new Set(
                      game
                          .moves({
                              square: indexToSquare(index),
                              verbose: true,
                          })
                          .map((move) => squareToIndex(move.to)),
                  ),
              ]
            : undefined;

        cells.push({
            index,
            row,
            column,
            color,
            piece: entry ? pieceMap[entry.type] : undefined,
            side: entry ? sideMap[entry.color] : undefined,
            possibleMoves,
        });
    }

    return cells as Tuple<CellState, 64>;
}

function deriveCapturedPieces(game: Chess): Record<Side, ChessPiece[]> {
    const capturedPieces: Record<Side, ChessPiece[]> = {
        black: [],
        white: [],
    };

    for (const move of game.history({ verbose: true })) {
        if (move.captured) {
            capturedPieces[sideMap[move.color]].push(pieceMap[move.captured]);
        }
    }

    return capturedPieces;
}

const ChessStateContext = createContext<ChessState>(
    {} as unknown as ChessState,
);

export const useChessState = () => useContext(ChessStateContext);

export const ChessStateProvider: React.FC<PropsWithChildren> = ({
    children,
}) => {
    const [game] = useState(() => new Chess());

    const [cells, setCells] = useState(() => deriveCells(game));
    const [capturedPieces, setCapturedPieces] = useState(() =>
        deriveCapturedPieces(game),
    );
    const [playingSide, setPlayingSide] = useState<Side>(
        () => sideMap[game.turn()],
    );
    const [selectedCell, setSelectedCell] = useState<number>();

    const selectCell = useCallback(
        (index: number) => {
            const cell = cells[index];
            if (cell && cell.side === playingSide) {
                setSelectedCell(index);
            }
        },
        [cells, playingSide],
    );

    const moveTo = useCallback(
        (index: number) => {
            if (selectedCell === undefined) return;

            try {
                game.move({
                    from: indexToSquare(selectedCell),
                    to: indexToSquare(index),
                    promotion: 'q', // TODO: Let the player pick the promotion piece
                });
            } catch {
                return; // Ignore illegal moves
            }

            setCells(deriveCells(game));
            setCapturedPieces(deriveCapturedPieces(game));
            setPlayingSide(sideMap[game.turn()]);
            setSelectedCell(undefined);
        },
        [game, selectedCell],
    );

    return (
        <ChessStateContext.Provider
            value={{
                capturedPieces,
                cells,
                selectedCell,
                playingSide,
                selectCell,
                moveTo,
            }}
        >
            {children}
        </ChessStateContext.Provider>
    );
};
