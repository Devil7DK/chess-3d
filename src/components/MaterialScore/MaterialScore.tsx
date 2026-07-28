import { useMemo } from 'react';

import { getMaterialAdvantage } from '../../utils';
import { useChessState } from '../../utils/ChessStateContext';

/**
 * Material lead for the 3D board, which shows captures as a tray of
 * pieces rather than a list. Hidden while the material is even, so the
 * badge only appears when there is something to report.
 */
export const MaterialScore = () => {
    const { capturedPieces } = useChessState();

    const advantage = useMemo(
        () => getMaterialAdvantage(capturedPieces),
        [capturedPieces],
    );

    if (!advantage) return null;

    return (
        <div className='material-score-wrapper'>
            <div className='material-score'>
                <span className={`side-dot ${advantage.side}`} />
                <span className='material-score-side'>{advantage.side}</span>
                <span className='material-score-value'>+{advantage.value}</span>
            </div>
        </div>
    );
};
