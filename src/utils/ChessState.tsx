import React, {
    PropsWithChildren,
    createContext,
    useCallback,
    useContext,
    useState,
} from 'react';
import { ChessState, Side } from '../types';
import { deserialize, getPossiblePositions } from './ChessUtils';

const ChessStateContext = createContext<ChessState>(
    {} as unknown as ChessState
);

export const useChessState = () => useContext(ChessStateContext);

export const ChessStateProvider: React.FC<PropsWithChildren<{}>> = ({
    children,
}) => {
    const [capturedPieces, setCapturedPieces] = useState<
        ChessState['capturedPieces']
    >({ black: [], white: [] });
    const [playingSide, setPlayingSide] = useState<Side>('white');
    const [cells, setCells] = useState(() =>
        deserialize(
            'cedabdecffffffff00000000000000000000000000000000FFFFFFFFCEDABDEC'
        )
    );

    const [selectedCell, setSelectedCell] = useState<number>();

    const selectCell = useCallback(
        (index: number) => {
            const cell = cells[index];
            if (cell && cell.side === playingSide) {
                setSelectedCell(index);
            }
        },
        [cells, playingSide]
    );

    const moveTo = useCallback(
        (index: number) => {
            if (selectedCell) {
                setCells((oldCells) => {
                    const newCells = JSON.parse(
                        JSON.stringify(oldCells)
                    ) as typeof oldCells; // Create a deep clone so we can directly modify properties

                    const sourceCell = newCells[selectedCell];

                    if (
                        sourceCell &&
                        sourceCell.piece &&
                        sourceCell.side === playingSide &&
                        sourceCell.possibleMoves &&
                        sourceCell.possibleMoves.includes(index)
                    ) {
                        const targetCell = newCells[index];

                        if (targetCell.side === sourceCell.side) {
                            console.error(
                                'Invalid move! Cannot capture same side piece!'
                            );
                            return oldCells;
                        }

                        if (targetCell.piece && targetCell.side) {
                            setCapturedPieces((value) => ({
                                ...value,
                                [playingSide]: [
                                    ...value[playingSide],
                                    targetCell.piece,
                                ],
                            }));
                        }

                        targetCell.piece = sourceCell.piece;
                        targetCell.side = sourceCell.side;

                        sourceCell.piece = undefined;
                        sourceCell.side = undefined;

                        for (let i = 0; i < newCells.length; i++) {
                            newCells[i].possibleMoves = getPossiblePositions(
                                newCells,
                                i
                            );
                        }

                        setPlayingSide((side) =>
                            side === 'black' ? 'white' : 'black'
                        );
                        setSelectedCell(undefined);

                        return newCells;
                    }

                    return oldCells;
                });
            }
        },
        [selectedCell, playingSide]
    );

    return (
        <ChessStateContext.Provider
            value={{
                capturedPieces,
                cells,
                selectedCell,
                playingSide,
                selectCell,
                moveTo,
            }}
        >
            {children}
        </ChessStateContext.Provider>
    );
};
