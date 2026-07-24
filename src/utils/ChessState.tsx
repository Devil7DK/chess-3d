import { Chess, Color, PieceSymbol, Square } from 'chess.js';
import React, {
    PropsWithChildren,
    useCallback,
    useMemo,
    useRef,
    useState,
} from 'react';
import {
    CellState,
    ChessPiece,
    GameStatus,
    MoveRecord,
    PieceState,
    PossibleMove,
    Side,
    Tuple,
} from '../types';
import { ChessStateContext } from './ChessStateContext';
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

const pieceSymbolMap: Record<ChessPiece, PieceSymbol> = {
    king: 'k',
    queen: 'q',
    rook: 'r',
    bishop: 'b',
    knight: 'n',
    pawn: 'p',
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

        // Several moves can share a destination (a promotion offers one per
        // piece type), so collapse them, capturing if any of them captures
        const possibleMoves = entry
            ? [
                  ...game
                      .moves({ square: indexToSquare(index), verbose: true })
                      .reduce((moves, move) => {
                          const to = squareToIndex(move.to);

                          moves.set(to, {
                              index: to,
                              capture:
                                  Boolean(move.captured) ||
                                  Boolean(moves.get(to)?.capture),
                          });

                          return moves;
                      }, new Map<number, PossibleMove>())
                      .values(),
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

const backRank: ChessPiece[] = [
    'rook',
    'knight',
    'bishop',
    'queen',
    'king',
    'bishop',
    'knight',
    'rook',
];

/**
 * Rebuilds the piece list (with stable ids) by replaying the game's move
 * history from the starting position. Handles captures, en passant,
 * castling rook moves, promotions, and undo (the replay is simply shorter).
 */
function derivePieces(game: Chess): PieceState[] {
    const pieces: PieceState[] = [];

    for (let column = 0; column < 8; column++) {
        for (const [side, pieceRow, pawnRow] of [
            ['white', 0, 8],
            ['black', 56, 48],
        ] as const) {
            pieces.push({
                id: `${side}-${indexToSquare(pieceRow + column)}`,
                piece: backRank[column],
                side,
                cellIndex: pieceRow + column,
                captured: false,
            });
            pieces.push({
                id: `${side}-${indexToSquare(pawnRow + column)}`,
                piece: 'pawn',
                side,
                cellIndex: pawnRow + column,
                captured: false,
            });
        }
    }

    let capturedCount = 0;

    for (const move of game.history({ verbose: true })) {
        const fromIndex = squareToIndex(move.from);
        const toIndex = squareToIndex(move.to);

        if (move.captured) {
            // In an en passant capture the captured pawn is not on the
            // target square but beside the capturing pawn.
            const captureIndex = move.flags.includes('e')
                ? squareToIndex(
                      `${move.to.charAt(0)}${move.from.charAt(1)}` as Square,
                  )
                : toIndex;

            const capturedPiece = pieces.find(
                (piece) => !piece.captured && piece.cellIndex === captureIndex,
            );
            if (capturedPiece) {
                capturedPiece.captured = true;
                capturedPiece.capturedOrder = capturedCount++;
            }
        }

        const movingPiece = pieces.find(
            (piece) => !piece.captured && piece.cellIndex === fromIndex,
        );
        if (movingPiece) {
            movingPiece.cellIndex = toIndex;

            if (move.promotion) {
                movingPiece.piece = pieceMap[move.promotion];
            }
        }

        const castling = move.flags.includes('k')
            ? 'k'
            : move.flags.includes('q')
              ? 'q'
              : undefined;
        if (castling) {
            const rank = move.color === 'w' ? '1' : '8';
            const rookFrom = `${castling === 'k' ? 'h' : 'a'}${rank}` as Square;
            const rookTo = `${castling === 'k' ? 'f' : 'd'}${rank}` as Square;

            const rook = pieces.find(
                (piece) =>
                    !piece.captured &&
                    piece.cellIndex === squareToIndex(rookFrom),
            );
            if (rook) {
                rook.cellIndex = squareToIndex(rookTo);
            }
        }
    }

    return pieces;
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

function deriveHistory(game: Chess): MoveRecord[] {
    return game.history({ verbose: true }).map((move) => ({
        from: move.from,
        to: move.to,
        promotion: move.promotion ? pieceMap[move.promotion] : undefined,
        san: move.san,
    }));
}

function deriveStatus(game: Chess): GameStatus {
    if (game.isCheckmate()) return 'checkmate';
    if (game.isStalemate()) return 'stalemate';
    if (game.isDraw()) return 'draw';
    if (game.inCheck()) return 'check';

    return 'playing';
}

export const ChessStateProvider: React.FC<
    PropsWithChildren<{
        /**
         * Side that cannot be moved by clicking (e.g. the AI's side).
         */
        lockedSide?: Side;
    }>
> = ({ children, lockedSide }) => {
    const [game] = useState(() => new Chess());

    const [cells, setCells] = useState(() => deriveCells(game));
    const [pieces, setPieces] = useState(() => derivePieces(game));
    const [capturedPieces, setCapturedPieces] = useState(() =>
        deriveCapturedPieces(game),
    );
    const [playingSide, setPlayingSide] = useState<Side>(
        () => sideMap[game.turn()],
    );
    const [status, setStatus] = useState<GameStatus>(() => deriveStatus(game));
    const [fen, setFen] = useState(() => game.fen());
    const [history, setHistory] = useState(() => deriveHistory(game));

    // Wall-clock timing. Every ply's think time is recorded as it happens;
    // the running side's live time is derived from turnStartedAt by consumers.
    // Purely observational: no time control, so it never affects the game.
    const [moveTimes, setMoveTimes] = useState<number[]>([]);
    const [turnStartedAt, setTurnStartedAt] = useState(() =>
        performance.now(),
    );
    const turnStartRef = useRef(turnStartedAt);
    const plyCountRef = useRef(0);

    const [selectedCell, setSelectedCell] = useState<number>();
    const [pendingPromotion, setPendingPromotion] = useState<{
        from: number;
        to: number;
    }>();

    const lastMove = useMemo(() => {
        const move = history[history.length - 1];

        return move
            ? {
                  from: squareToIndex(move.from),
                  to: squareToIndex(move.to),
              }
            : undefined;
    }, [history]);

    const syncState = useCallback(() => {
        setCells(deriveCells(game));
        setPieces(derivePieces(game));
        setCapturedPieces(deriveCapturedPieces(game));
        setPlayingSide(sideMap[game.turn()]);
        setStatus(deriveStatus(game));
        setFen(game.fen());
        setHistory(deriveHistory(game));
        setSelectedCell(undefined);

        // Attribute the span since the turn began to the ply just played.
        // Growth by more than one ply (a remote replay) can't be split, so
        // only the newest ply carries a duration; a shrink (undo/reset)
        // simply drops the trailing entries.
        const now = performance.now();
        const plyCount = game.history().length;
        const previousCount = plyCountRef.current;

        if (plyCount > previousCount) {
            const span = now - turnStartRef.current;
            setMoveTimes((times) => {
                const next = times.slice(0, plyCount);
                for (let ply = previousCount; ply < plyCount; ply++) {
                    next[ply] = ply === plyCount - 1 ? span : 0;
                }
                return next;
            });
        } else if (plyCount < previousCount) {
            setMoveTimes((times) => times.slice(0, plyCount));
        }

        plyCountRef.current = plyCount;
        turnStartRef.current = now;
        setTurnStartedAt(now);
    }, [game]);

    const selectCell = useCallback(
        (index: number) => {
            if (pendingPromotion) return;
            if (lockedSide && playingSide === lockedSide) return;

            const cell = cells[index];
            if (cell && cell.side === playingSide) {
                setSelectedCell(index);
            }
        },
        [cells, playingSide, pendingPromotion, lockedSide],
    );

    const moveTo = useCallback(
        (index: number) => {
            if (selectedCell === undefined || pendingPromotion) return;

            const from = indexToSquare(selectedCell);
            const to = indexToSquare(index);

            const isPromotion = game
                .moves({ square: from, verbose: true })
                .some((move) => move.to === to && move.promotion);

            if (isPromotion) {
                setPendingPromotion({ from: selectedCell, to: index });
                return;
            }

            try {
                game.move({ from, to });
            } catch {
                return; // Ignore illegal moves
            }

            syncState();
        },
        [game, selectedCell, pendingPromotion, syncState],
    );

    const promote = useCallback(
        (piece: ChessPiece | null) => {
            if (!pendingPromotion) return;

            setPendingPromotion(undefined);

            if (piece === null) {
                setSelectedCell(undefined);
                return; // Promotion cancelled
            }

            try {
                game.move({
                    from: indexToSquare(pendingPromotion.from),
                    to: indexToSquare(pendingPromotion.to),
                    promotion: pieceSymbolMap[piece],
                });
            } catch {
                return; // Ignore illegal moves
            }

            syncState();
        },
        [game, pendingPromotion, syncState],
    );

    const applyMove = useCallback(
        (from: Square, to: Square, promotion?: ChessPiece) => {
            try {
                game.move({
                    from,
                    to,
                    promotion: promotion
                        ? pieceSymbolMap[promotion]
                        : undefined,
                });
            } catch {
                return; // Ignore illegal moves
            }

            syncState();
        },
        [game, syncState],
    );

    const newGame = useCallback(() => {
        game.reset();
        setPendingPromotion(undefined);
        syncState();
    }, [game, syncState]);

    const undo = useCallback(() => {
        if (pendingPromotion) {
            setPendingPromotion(undefined);
            setSelectedCell(undefined);
            return; // Cancel the pending promotion instead of undoing a move
        }

        game.undo();

        // Against the AI, take back the AI's reply as well so it's still
        // the player's turn afterwards
        if (lockedSide && sideMap[game.turn()] === lockedSide) {
            game.undo();
        }

        syncState();
    }, [game, pendingPromotion, syncState, lockedSide]);

    return (
        <ChessStateContext.Provider
            value={{
                capturedPieces,
                cells,
                pieces,
                selectedCell,
                playingSide,
                status,
                pendingPromotion,
                fen,
                history,
                lastMove,
                moveTimes,
                turnStartedAt,
                selectCell,
                moveTo,
                promote,
                applyMove,
                newGame,
                undo,
            }}
        >
            {children}
        </ChessStateContext.Provider>
    );
};
