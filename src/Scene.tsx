import { OrbitControls, Stage } from '@react-three/drei';
import { PresetsType } from '@react-three/drei/helpers/environment-assets';
import { Canvas } from '@react-three/fiber';
import React, { Suspense, useMemo, useState } from 'react';

import {
    AIPlayer,
    Board,
    Board2D,
    GameClock,
    GameControls,
    GameInfo,
    IAIPlayerProps,
    IRemotePlayerProps,
    MoveHistory,
    PromotionPicker,
    RemotePlayer,
    SceneEnvironment,
    Settings,
    StatusBanner,
} from './components';
import { BoardMode, Side } from './types';
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
                    position: [0, 70, playerSide === 'white' ? -70 : 70],
                    fov: 40,
                    zoom: 1,
                }}
            >
                <color attach='background' args={['#8b6b55']} />
                {/* Outside Stage, in its own Suspense boundary — a hanging
                    HDR fetch must never hold up the board */}
                <SceneEnvironment preset={environment} />
                <Stage adjustCamera={false} environment={null} intensity={0.6}>
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
                <OrbitControls makeDefault target={[0, 0, 0]} />
            </Canvas>
        </Suspense>
    );
};

export const Scene: React.FC<ISceneProps> = ({ ai, remote }) => {
    const [environment, setEnvironment] = useState<PresetsType>(
        (localStorage.getItem('environment') as PresetsType) || 'studio',
    );
    const [boardMode, setBoardMode] = useState<BoardMode>(
        (localStorage.getItem('boardMode') as BoardMode) || '3d',
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

    const setBoardModeAndStore = (mode: BoardMode) => {
        setBoardMode(mode);
        localStorage.setItem('boardMode', mode);
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
            {/* The two boards are interchangeable views of the same
                ChessState — only one is mounted at a time */}
            {boardMode === '3d' ? (
                <SceneCanvas
                    environment={environment}
                    playerSide={playerSide}
                />
            ) : (
                <Board2D playerSide={playerSide} />
            )}
            {ai && <AIPlayer {...ai} />}
            {remote && <RemotePlayer {...remote} />}
            <StatusBanner />
            <GameInfo ai={ai} remote={remote} playerSide={playerSide} />
            <GameClock />
            <PromotionPicker />
            <GameControls
                remote={remote}
                showNewGame={!remote}
                showUndo={!remote}
            />
            <MoveHistory playerSide={playerSide} />
            <Settings
                boardMode={boardMode}
                environment={environment}
                onChangeBoardMode={setBoardModeAndStore}
                onChangeEnvironment={setEnvironmentAndStore}
            />
        </ChessStateProvider>
    );
};
