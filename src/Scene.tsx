import { OrbitControls, Stage } from '@react-three/drei';
import { PresetsType } from '@react-three/drei/helpers/environment-assets';
import { Canvas } from '@react-three/fiber';
import React, { Suspense, useMemo, useState } from 'react';

import {
    AIPlayer,
    Board,
    GameControls,
    IAIPlayerProps,
    PromotionPicker,
    Settings,
    StatusBanner,
} from './components';
import { ChessStateProvider } from './utils/ChessState';

export interface ISceneProps {
    /**
     * When set, the given side is played by the stockfish engine.
     */
    ai?: IAIPlayerProps;
}

export const Scene: React.FC<ISceneProps> = ({ ai }) => {
    const [environment, setEnvironment] = useState<PresetsType>(
        (localStorage.getItem('environment') as PresetsType) || 'sunset',
    );

    const initialSide = useMemo(
        () => (ai ? (ai.side === 'white' ? 'black' : 'white') : 'white'),
        [ai],
    );

    const setEnvironmentAndStore = (env: PresetsType) => {
        setEnvironment(env);
        localStorage.setItem('environment', env);
    };

    return (
        <>
            <Suspense
                fallback={
                    <div className='fullscreen-loader'>
                        <div className='spinner'>
                            <div></div>
                            <div></div>
                            <div></div>
                            <div></div>
                        </div>
                    </div>
                }
            >
                <Canvas
                    shadows
                    dpr={[1, 2]}
                    camera={{
                        position: [
                            0,
                            150,
                            initialSide === 'white' ? -150 : 150,
                        ],
                        fov: 40,
                        zoom: 1,
                    }}
                >
                    <color attach='background' args={['#8b6b55']} />
                    <Stage environment={environment} intensity={0.6}>
                        <ChessStateProvider lockedSide={ai?.side}>
                            {ai && <AIPlayer {...ai} />}
                            <Board
                                borderColor='grey'
                                borderWidth={2}
                                cellSize={5}
                                position={{ x: 0, y: -0.5, z: 0 }}
                                thickness={1}
                            />
                            <StatusBanner />
                            <PromotionPicker />
                            <GameControls />
                            <Settings
                                environment={environment}
                                onChangeEnvironment={setEnvironmentAndStore}
                            />
                        </ChessStateProvider>
                    </Stage>
                    <OrbitControls target={[0, 0, 0]} />
                </Canvas>
            </Suspense>
        </>
    );
};
