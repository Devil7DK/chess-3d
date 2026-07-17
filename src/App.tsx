import './App.scss';

import React, { useEffect } from 'react';
import {
    HashRouter,
    Navigate,
    Route,
    Routes,
    useSearchParams,
} from 'react-router-dom';

import { MainMenu } from './components';
import { Scene } from './Scene';
import { AIDifficulty } from './types';

const SinglePlayer: React.FC = () => {
    const [params] = useSearchParams();

    const playerSide = params.get('side') === 'black' ? 'black' : 'white';
    const difficulty = (params.get('difficulty') as AIDifficulty) || 'medium';

    return (
        <Scene
            ai={{
                side: playerSide === 'white' ? 'black' : 'white',
                difficulty,
            }}
        />
    );
};

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
        <HashRouter>
            <Routes>
                <Route path='/' element={<MainMenu />} />
                <Route path='/play' element={<Scene />} />
                <Route path='/play/ai' element={<SinglePlayer />} />
                <Route path='*' element={<Navigate to='/' replace />} />
            </Routes>
        </HashRouter>
    );
};
