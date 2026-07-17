import { createContext, useContext } from 'react';

import { ChessState } from '../types';

export const ChessStateContext = createContext<ChessState>(
    {} as unknown as ChessState,
);

export const useChessState = () => useContext(ChessStateContext);
