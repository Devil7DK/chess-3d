import { OrbitControls, Stage } from '@react-three/drei';
import { PresetsType } from '@react-three/drei/helpers/environment-assets';
import { Canvas } from '@react-three/fiber';
import React, { Suspense, useState } from 'react';

import {
    AIPlayer,
    Board,
    GameControls,
    IAIPlayerProps,
    PromotionPicker,
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

    return (
        <>
            <div className='overlay'>
                <select
                    value={environment}
                    onChange={(e) => {
                        setEnvironment(e.target.value as PresetsType);
                        localStorage.setItem('environment', e.target.value);
                    }}
                >
                    <option value='sunset'>sunset</option>
                    <option value='dawn'>dawn</option>
                    <option value='night'>night</option>
                    <option value='warehouse'>warehouse</option>
                    <option value='forest'>forest</option>
                    <option value='apartment'>apartment</option>
                    <option value='studio'>studio</option>
                    <option value='city'>city</option>
                    <option value='park'>park</option>
                    <option value='lobby'>lobby</option>
                </select>
            </div>
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
                        position: [0, 0, 150],
                        fov: 40,
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
                        </ChessStateProvider>
                    </Stage>
                    <OrbitControls />
                </Canvas>
            </Suspense>
        </>
    );
};
