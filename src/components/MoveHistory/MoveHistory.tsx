import { useEffect, useMemo, useRef, useState } from 'react';

import { useChessState } from '../../utils/ChessStateContext';

/**
 * Collapsible move list. Self-contained (own toggle + panel) so it can sit
 * clear of the top control cluster, which portrait layouts already crowd.
 */
export const MoveHistory = () => {
    const { history } = useChessState();

    const [open, setOpen] = useState(false);
    const listRef = useRef<HTMLOListElement>(null);

    // Pair the moves up the way a score sheet reads: white then black
    const rows = useMemo(
        () =>
            Array.from({ length: Math.ceil(history.length / 2) }, (_, row) => ({
                number: row + 1,
                white: history[row * 2].san,
                black: history[row * 2 + 1]?.san,
            })),
        [history],
    );

    // Follow the game rather than leaving the reader at move one
    useEffect(() => {
        const list = listRef.current;
        if (list) list.scrollTop = list.scrollHeight;
    }, [rows, open]);

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
                    {rows.length ? (
                        <ol className='move-history-list' ref={listRef}>
                            {rows.map((row) => (
                                <li key={row.number}>
                                    <span className='move-number'>
                                        {row.number}.
                                    </span>
                                    <span className='move'>{row.white}</span>
                                    <span className='move'>{row.black}</span>
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
