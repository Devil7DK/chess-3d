import './App.scss';

import React, { useEffect } from 'react';
import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';

import { MainMenu } from './components';
import { Scene } from './Scene';

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
                <Route path='*' element={<Navigate to='/' replace />} />
            </Routes>
        </HashRouter>
    );
};
