import { OrbitControls, Stage } from '@react-three/drei';
import { PresetsType } from '@react-three/drei/helpers/environment-assets';
import { Canvas } from '@react-three/fiber';
import React, { Suspense, useMemo, useState } from 'react';

import {
    AIPlayer,
    Board,
    GameControls,
    IAIPlayerProps,
    IRemotePlayerProps,
    PromotionPicker,
    RemotePlayer,
    Settings,
    StatusBanner,
} from './components';
import { Side } from './types';
import { ChessStateProvider } from './utils/ChessState';
import { ChessStateContext, useChessState } from './utils/ChessStateContext';

export interface ISceneProps {
    /**
     * When set, the given side is played by the stockfish engine.
     */
    ai?: IAIPlayerProps;
    /**
     * When set, the opponent's side is synced through the Firebase room.
     */
    remote?: IRemotePlayerProps;
}

const SceneCanvas: React.FC<{
    environment: PresetsType;
    playerSide: Side;
}> = ({ environment, playerSide }) => {
    // The Canvas hosts a separate React root, which context does not cross —
    // capture the chess state here and re-provide it inside for the Board
    const chessState = useChessState();

    return (
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
                    position: [0, 150, playerSide === 'white' ? -150 : 150],
                    fov: 40,
                    zoom: 1,
                }}
            >
                <color attach='background' args={['#8b6b55']} />
                <Stage environment={environment} intensity={0.6}>
                    <ChessStateContext.Provider value={chessState}>
                        <Board
                            borderColor='grey'
                            borderWidth={2}
                            cellSize={5}
                            position={{ x: 0, y: -0.5, z: 0 }}
                            thickness={1}
                        />
                    </ChessStateContext.Provider>
                </Stage>
                {/* makeDefault lets Stage's camera fit cooperate with the
                    controls instead of fighting over the camera */}
                <OrbitControls makeDefault target={[0, 0, 0]} />
            </Canvas>
        </Suspense>
    );
};

export const Scene: React.FC<ISceneProps> = ({ ai, remote }) => {
    const [environment, setEnvironment] = useState<PresetsType>(
        (localStorage.getItem('environment') as PresetsType) || 'studio',
    );

    // Side played on this device — the camera starts behind it and the
    // other side is locked from being moved by clicks
    const playerSide = useMemo(
        () =>
            ai
                ? ai.side === 'white'
                    ? 'black'
                    : 'white'
                : (remote?.side ?? 'white'),
        [ai, remote],
    );

    const setEnvironmentAndStore = (env: PresetsType) => {
        setEnvironment(env);
        localStorage.setItem('environment', env);
    };

    return (
        <ChessStateProvider
            lockedSide={
                ai || remote
                    ? playerSide === 'white'
                        ? 'black'
                        : 'white'
                    : undefined
            }
        >
            <SceneCanvas environment={environment} playerSide={playerSide} />
            {ai && <AIPlayer {...ai} />}
            {remote && <RemotePlayer {...remote} />}
            <StatusBanner />
            <PromotionPicker />
            <GameControls showUndo={!remote} showNewGame={!remote} />
            <Settings
                environment={environment}
                onChangeEnvironment={setEnvironmentAndStore}
            />
        </ChessStateProvider>
    );
};
