import './App.scss';

import React from 'react';

import { Scene } from './Scene';

export const App: React.FC = () => {
    return (
        <>
            <React.Suspense fallback={null}>
                <Scene />
            </React.Suspense>
        </>
    );
};
