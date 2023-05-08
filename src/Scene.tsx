import { CameraControls } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import React from 'react';

export const Scene: React.FC = () => {
    return (
        <Canvas>
            <ambientLight />

            <pointLight position={[10, 10, 10]} />

            <mesh>
                <boxGeometry args={[10, 10, 10]} />
                <meshBasicMaterial color='red' />
            </mesh>

            <CameraControls distance={20} azimuthAngle={10} polarAngle={1} />
        </Canvas>
    );
};
