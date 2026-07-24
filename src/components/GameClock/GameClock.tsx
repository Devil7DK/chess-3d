import { useEffect, useState } from 'react';

import { Side } from '../../types';
import { formatDuration } from '../../utils';
import { useChessState } from '../../utils/ChessStateContext';

const sides: Side[] = ['white', 'black'];

/**
 * Count-up clocks that run even without a time control, so a casual game
 * still shows each side's total think time, the current move's timer, and
 * the overall session length. Wall-clock based and local to this device.
 */
export const GameClock = () => {
    const { moveTimes, turnStartedAt, playingSide, status } = useChessState();

    // Only white and black are ever "on the clock"; a finished game freezes
    const running = status === 'playing' || status === 'check';

    const [now, setNow] = useState(() => performance.now());

    useEffect(() => {
        if (!running) return;

        const id = setInterval(() => setNow(performance.now()), 250);
        return () => clearInterval(id);
    }, [running]);

    // now can trail turnStartedAt by a tick right after a move. Clamp so the
    // live segment never reads negative
    const live =
        running && now > turnStartedAt ? now - turnStartedAt : 0;

    const committedFor = (side: Side) =>
        moveTimes.reduce(
            (total, ms, ply) =>
                (ply % 2 === 0 ? 'white' : 'black') === side
                    ? total + ms
                    : total,
            0,
        );

    const totalFor = (side: Side) =>
        committedFor(side) + (side === playingSide ? live : 0);

    const sessionTotal = totalFor('white') + totalFor('black');

    return (
        <div className='game-clock-wrapper'>
            <div className='game-clock'>
                <div className='game-clock-session'>
                    <span className='clock-label'>Session</span>
                    <span className='clock-time'>
                        {formatDuration(sessionTotal)}
                    </span>
                </div>
                {sides.map((side) => {
                    const active = running && side === playingSide;

                    return (
                        <div
                            key={side}
                            className={`game-clock-side${active ? ' active' : ''}`}
                        >
                            <span className={`side-dot ${side}`} />
                            <span className='clock-label'>{side}</span>
                            {active && (
                                <span className='clock-move'>
                                    +{formatDuration(live)}
                                </span>
                            )}
                            <span className='clock-time'>
                                {formatDuration(totalFor(side))}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
