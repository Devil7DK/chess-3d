import { Square } from 'chess.js';
import { useEffect, useRef } from 'react';

import { AIDifficulty, ChessPiece, Side } from '../../types';
import { useChessState } from '../../utils/ChessStateContext';

const difficultySettings: Record<
    AIDifficulty,
    { skill: number; depth: number; moveTime: number }
> = {
    easy: { skill: 1, depth: 2, moveTime: 300 },
    medium: { skill: 5, depth: 8, moveTime: 1000 },
    hard: { skill: 15, depth: 14, moveTime: 3000 },
};

const promotionMap: Record<string, ChessPiece> = {
    q: 'queen',
    r: 'rook',
    b: 'bishop',
    n: 'knight',
};

export interface IAIPlayerProps {
    side: Side;
    difficulty: AIDifficulty;
}

export const AIPlayer = ({ side, difficulty }: IAIPlayerProps) => {
    const { fen, playingSide, status, applyMove } = useChessState();

    const workerRef = useRef<Worker | null>(null);
    const pendingFenRef = useRef<string | undefined>(undefined);

    // Keep the latest applyMove reachable from the worker callback without
    // recreating the worker on every state change
    const applyMoveRef = useRef(applyMove);
    useEffect(() => {
        applyMoveRef.current = applyMove;
    }, [applyMove]);

    useEffect(() => {
        const worker = new Worker(
            `${import.meta.env.BASE_URL}stockfish/stockfish-18-lite-single.js`,
        );
        workerRef.current = worker;

        worker.onmessage = (event: MessageEvent<string>) => {
            const line = typeof event.data === 'string' ? event.data : '';
            if (!line.startsWith('bestmove')) return;

            // Ignore results for positions we're no longer waiting on
            // (e.g. after an undo or new game)
            if (pendingFenRef.current === undefined) return;
            pendingFenRef.current = undefined;

            const [, best] = line.split(' ');
            if (!best || best === '(none)') return;

            applyMoveRef.current(
                best.slice(0, 2) as Square,
                best.slice(2, 4) as Square,
                promotionMap[best.charAt(4)],
            );
        };

        worker.postMessage('uci');
        worker.postMessage(
            `setoption name Skill Level value ${difficultySettings[difficulty].skill}`,
        );
        worker.postMessage('ucinewgame');

        return () => {
            worker.terminate();
            workerRef.current = null;
        };
    }, [difficulty]);

    useEffect(() => {
        if (playingSide !== side) return;
        if (status !== 'playing' && status !== 'check') return;

        const worker = workerRef.current;
        if (!worker) return;

        const { depth, moveTime } = difficultySettings[difficulty];

        // Small delay so the player's move animation settles first
        const timeout = setTimeout(() => {
            pendingFenRef.current = fen;
            worker.postMessage(`position fen ${fen}`);
            worker.postMessage(`go depth ${depth} movetime ${moveTime}`);
        }, 600);

        return () => {
            clearTimeout(timeout);
            pendingFenRef.current = undefined;
        };
    }, [fen, playingSide, side, status, difficulty]);

    return null;
};
