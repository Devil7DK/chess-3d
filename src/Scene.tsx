import { CameraControls } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import React from 'react';
import { MathUtils } from 'three';

import { Board } from './components';

export const Scene: React.FC = () => {
    return (
        <Canvas>
            <ambientLight />

            <pointLight position={[10, 10, 10]} />

            <Board
                borderColor='grey'
                borderWidth={2}
                cellSize={5}
                position={{ x: 0, y: -0.5, z: 0 }}
                thickness={1}
            />

            <CameraControls
                distance={50}
                azimuthAngle={1}
                polarAngle={MathUtils.degToRad(40)}
            />
        </Canvas>
    );
};
