import { useChessState } from '../../utils/ChessStateContext';

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
                      status === 'check' ? ' - Check!' : ''
                  }`;

    return (
        <div className='status-banner-wrapper'>
            <div
                className={`status-banner${
                    status !== 'playing' ? ` status-${status}` : ''
                }`}
            >
                {message}
            </div>
        </div>
    );
};
