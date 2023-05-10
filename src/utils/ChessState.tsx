import React, {
    PropsWithChildren,
    createContext,
    useContext,
    useState,
} from 'react';
import { ChessState } from '../types';
import { deserialize } from './ChessUtils';

const ChessStateContext = createContext<ChessState>(
    {} as unknown as ChessState
);

export const useChessState = () => useContext(ChessStateContext);

export const ChessStateProvider: React.FC<PropsWithChildren<{}>> = ({
    children,
}) => {
    const [cells, setCells] = useState(() =>
        deserialize(
            'cedabdecffffffff00000000000000000000000000000000FFFFFFFFCEDABDEC'
        )
    );

    return (
        <ChessStateContext.Provider value={{ cells }}>
            {children}
        </ChessStateContext.Provider>
    );
};
