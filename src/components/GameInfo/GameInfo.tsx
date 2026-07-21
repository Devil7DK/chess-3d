import { AIDifficulty, Side } from '../../types';

const difficultyLabels: Record<AIDifficulty, string> = {
    easy: 'Easy',
    medium: 'Medium',
    hard: 'Hard',
};

export interface IGameInfoProps {
    ai?: { side: Side; difficulty: AIDifficulty };
    remote?: { roomId: string; side: Side };
    /**
     * Side played on this device. Meaningless in a single-screen game,
     * where both sides are played here.
     */
    playerSide: Side;
}

/**
 * Names the mode and the side being played — otherwise the only clue is
 * which end of the board the camera sits behind.
 */
export const GameInfo = ({ ai, remote, playerSide }: IGameInfoProps) => {
    const mode = ai
        ? `Single Player · ${difficultyLabels[ai.difficulty]}`
        : remote
          ? `2 Player · Room ${remote.roomId}`
          : '2 Player · Single Screen';

    return (
        <div className='game-info-wrapper'>
            <div className='game-info'>
                <span className='game-info-mode'>{mode}</span>
                {(ai || remote) && (
                    <span className='game-info-side'>
                        <span className={`side-dot ${playerSide}`} />
                        Playing {playerSide}
                    </span>
                )}
            </div>
        </div>
    );
};
