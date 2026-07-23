import { useEffect, useRef } from 'react';

import { useChessState } from '../../utils/ChessStateContext';
import { playSound, SoundName } from '../../utils/sounds';

/**
 * Plays a cue for each change in the game — headless, renders nothing.
 * Watching `history` length and `status` (both derived from the same move)
 * covers every mode: local, AI, and remote moves all flow through the same
 * chess state, so opponent moves are heard too.
 */
export const GameSounds = () => {
    const { history, status } = useChessState();

    const previousLength = useRef(history.length);

    useEffect(() => {
        const grewBy = history.length - previousLength.current;
        previousLength.current = history.length;

        if (grewBy > 0) {
            const move = history[history.length - 1];
            const san = move.san;

            // Most salient cue wins: a capture that gives check sounds the
            // check, a checkmate sounds the end
            let sound: SoundName = 'move';
            if (san.includes('x')) sound = 'capture';
            if (san.startsWith('O-O')) sound = 'castle';
            if (move.promotion) sound = 'promote';
            if (status === 'check' || san.includes('+')) sound = 'check';
            if (
                status === 'checkmate' ||
                status === 'stalemate' ||
                status === 'draw'
            ) {
                sound = 'game-end';
            }

            void playSound(sound);
        } else if (grewBy < 0 && history.length === 0) {
            // Reset to the opening position — undo mid-game stays silent
            void playSound('game-start');
        }
    }, [history, status]);

    return null;
};
