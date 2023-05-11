import './App.scss';

import React, { useEffect } from 'react';

import { Scene } from './Scene';
import { ChessStateProvider } from './utils/ChessState';

export const App: React.FC = () => {
    useEffect(() => {
        const preloader = document.getElementById('preloader');
        if (preloader) {
            setTimeout(() => {
                preloader.remove();
            }, 1000);
        }
    }, []);

    return (
        <>
            <ChessStateProvider>
                <Scene />
            </ChessStateProvider>
        </>
    );
};
