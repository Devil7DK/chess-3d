import { CameraControls } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import React from 'react';
import { MathUtils } from 'three';

import { Box } from './components';

export const Scene: React.FC = () => {
    return (
        <Canvas>
            <ambientLight />

            <pointLight position={[10, 10, 10]} />

            <Box
                color='red'
                height={10}
                length={10}
                width={10}
                position={{ x: 0, y: 0, z: 0 }}
            />

            <CameraControls
                distance={50}
                azimuthAngle={1}
                polarAngle={MathUtils.degToRad(40)}
            />
        </Canvas>
    );
};
