import { OrbitControls, Stage } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import React, { Suspense } from 'react';

import { Board } from './components';

export const Scene: React.FC = () => {
    return (
        <Canvas
            shadows
            dpr={[1, 2]}
            camera={{
                position: [0, 0, 150],
                fov: 40,
            }}
        >
            <Suspense>
                <Stage environment='city' intensity={0.6}>
                    <Board
                        borderColor='grey'
                        borderWidth={2}
                        cellSize={5}
                        position={{ x: 0, y: -0.5, z: 0 }}
                        thickness={1}
                    />
                </Stage>
            </Suspense>

            <OrbitControls />
        </Canvas>
    );
};
