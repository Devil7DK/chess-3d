import './App.scss';

import React from 'react';

import { Scene } from './Scene';
import { ChessStateProvider } from './utils/ChessState';

export const App: React.FC = () => {
    return (
        <>
            <ChessStateProvider>
                <Scene />
            </ChessStateProvider>
        </>
    );
};
