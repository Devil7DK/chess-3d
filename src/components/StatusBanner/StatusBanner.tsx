import { Html } from '@react-three/drei';

import { useChessState } from '../../utils/ChessState';

export const StatusBanner = () => {
    const { playingSide, status } = useChessState();

    const message =
        status === 'checkmate'
            ? `Checkmate! ${playingSide === 'white' ? 'Black' : 'White'} wins!`
            : status === 'stalemate'
              ? 'Stalemate!'
              : status === 'draw'
                ? 'Draw!'
                : `${playingSide === 'white' ? 'White' : 'Black'}'s turn${
                      status === 'check' ? ' — Check!' : ''
                  }`;

    return (
        <Html fullscreen wrapperClass='status-banner-wrapper'>
            <div
                className={`status-banner${
                    status !== 'playing' ? ` status-${status}` : ''
                }`}
            >
                {message}
            </div>
        </Html>
    );
};
