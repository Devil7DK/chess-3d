import { Chess, DEFAULT_POSITION } from 'chess.js';
import { useEffect, useMemo, useRef, useState } from 'react';

import { Side } from '../../types';
import { squareToIndex } from '../../utils';
import { useChessState } from '../../utils/ChessStateContext';
import { BoardPreview } from '../BoardPreview';
import { MoveSan } from './MoveSan';

export interface IMoveHistoryProps {
    /** Orientation for the replay preview. */
    playerSide: Side;
}

/**
 * Collapsible move list. Self-contained (own toggle + panel) so it can sit
 * clear of the top control cluster, which portrait layouts already crowd.
 * Selecting a move replays the position it produced.
 */
export const MoveHistory = ({ playerSide }: IMoveHistoryProps) => {
    const { history } = useChessState();

    const [open, setOpen] = useState(false);
    const listRef = useRef<HTMLOListElement>(null);

    // Tagged with the history length it was chosen at, so a move played
    // while an old position is open drops the selection instead of leaving
    // a silently stale preview on screen
    const [selection, setSelection] = useState<{ ply: number; at: number }>();
    const selectedPly =
        selection?.at === history.length ? selection.ply : undefined;

    const selectPly = (ply: number) =>
        setSelection(
            selectedPly === ply ? undefined : { ply, at: history.length },
        );

    // Position after every ply, replayed once per history change. Index 0 is
    // the starting position, so ply n lives at n + 1
    const positions = useMemo(() => {
        const game = new Chess();
        const fens = [DEFAULT_POSITION];

        for (const move of history) {
            try {
                game.move({
                    from: move.from,
                    to: move.to,
                    promotion: move.promotion?.charAt(0),
                });
            } catch {
                break; // Should not happen; stop rather than mislead
            }

            fens.push(game.fen());
        }

        return fens;
    }, [history]);

    // Pair the moves up the way a score sheet reads: white then black
    const rows = useMemo(
        () =>
            Array.from({ length: Math.ceil(history.length / 2) }, (_, row) => ({
                number: row + 1,
                white: { ply: row * 2, move: history[row * 2] },
                black:
                    row * 2 + 1 < history.length
                        ? { ply: row * 2 + 1, move: history[row * 2 + 1] }
                        : undefined,
            })),
        [history],
    );

    // Follow the game rather than leaving the reader at move one
    useEffect(() => {
        const list = listRef.current;
        if (list) list.scrollTop = list.scrollHeight;
    }, [rows, open]);

    const selectedMove =
        selectedPly === undefined ? undefined : history[selectedPly];
    const previewLastMove = selectedMove && {
        from: squareToIndex(selectedMove.from),
        to: squareToIndex(selectedMove.to),
    };

    const moveButton = (entry?: { ply: number; move: { san: string } }) => {
        if (!entry) return <span className='move' />;

        return (
            <button
                type='button'
                className={`move${selectedPly === entry.ply ? ' selected' : ''}`}
                onClick={() => selectPly(entry.ply)}
            >
                <MoveSan
                    san={entry.move.san}
                    side={entry.ply % 2 === 0 ? 'white' : 'black'}
                />
            </button>
        );
    };

    return (
        <div className='move-history-wrapper'>
            {open && (
                <div className='move-history-panel'>
                    <div className='move-history-header'>
                        <span>Moves</span>
                        <button
                            type='button'
                            aria-label='Close move history'
                            onClick={() => setOpen(false)}
                        >
                            ✕
                        </button>
                    </div>
                    {selectedPly !== undefined && (
                        <div className='move-history-preview'>
                            {/* Above the board: anything below it risks
                                being pushed off a short mobile viewport */}
                            <button
                                type='button'
                                className='move-history-live'
                                onClick={() => setSelection(undefined)}
                            >
                                Back to live game
                            </button>
                            <BoardPreview
                                fen={positions[selectedPly + 1]}
                                lastMove={previewLastMove}
                                playerSide={playerSide}
                            />
                        </div>
                    )}
                    {rows.length ? (
                        <ol className='move-history-list' ref={listRef}>
                            {rows.map((row) => (
                                <li key={row.number}>
                                    <span className='move-number'>
                                        {row.number}.
                                    </span>
                                    {moveButton(row.white)}
                                    {moveButton(row.black)}
                                </li>
                            ))}
                        </ol>
                    ) : (
                        <span className='move-history-empty'>
                            No moves yet.
                        </span>
                    )}
                </div>
            )}
            <button
                type='button'
                className='move-history-toggle'
                aria-expanded={open}
                onClick={() => setOpen((value) => !value)}
            >
                {open ? 'Hide moves' : `Moves (${history.length})`}
            </button>
        </div>
    );
};
