import { CameraControls } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import React from 'react';
import { MathUtils } from 'three';

import { Board, Piece } from './components';

export const Scene: React.FC = () => {
    return (
        <Canvas>
            <ambientLight />

            <pointLight position={[20, 20, 20]} />

            <Board
                borderColor='grey'
                borderWidth={2}
                cellSize={5}
                position={{ x: 0, y: -0.5, z: 0 }}
                thickness={1}
            />

            <Piece
                piece='rook'
                boardPosition={{ x: 0, y: -0.5, z: 0 }}
                cellIndex={0}
                cellSize={5}
                color='white'
            />

            <Piece
                piece='knight'
                boardPosition={{ x: 0, y: -0.5, z: 0 }}
                cellIndex={1}
                cellSize={5}
                color='white'
            />

            <Piece
                piece='bishop'
                boardPosition={{ x: 0, y: -0.5, z: 0 }}
                cellIndex={2}
                cellSize={5}
                color='white'
            />

            <Piece
                piece='king'
                boardPosition={{ x: 0, y: -0.5, z: 0 }}
                cellIndex={3}
                cellSize={5}
                color='white'
            />

            <Piece
                piece='queen'
                boardPosition={{ x: 0, y: -0.5, z: 0 }}
                cellIndex={4}
                cellSize={5}
                color='white'
            />

            <Piece
                piece='bishop'
                boardPosition={{ x: 0, y: -0.5, z: 0 }}
                cellIndex={5}
                cellSize={5}
                color='white'
            />

            <Piece
                piece='knight'
                boardPosition={{ x: 0, y: -0.5, z: 0 }}
                cellIndex={6}
                cellSize={5}
                color='white'
            />

            <Piece
                piece='rook'
                boardPosition={{ x: 0, y: -0.5, z: 0 }}
                cellIndex={7}
                cellSize={5}
                color='white'
            />

            <Piece
                piece='pawn'
                boardPosition={{ x: 0, y: -0.5, z: 0 }}
                cellIndex={8}
                cellSize={5}
                color='white'
            />

            <Piece
                piece='pawn'
                boardPosition={{ x: 0, y: -0.5, z: 0 }}
                cellIndex={9}
                cellSize={5}
                color='white'
            />

            <Piece
                piece='pawn'
                boardPosition={{ x: 0, y: -0.5, z: 0 }}
                cellIndex={10}
                cellSize={5}
                color='white'
            />

            <Piece
                piece='pawn'
                boardPosition={{ x: 0, y: -0.5, z: 0 }}
                cellIndex={11}
                cellSize={5}
                color='white'
            />

            <Piece
                piece='pawn'
                boardPosition={{ x: 0, y: -0.5, z: 0 }}
                cellIndex={12}
                cellSize={5}
                color='white'
            />

            <Piece
                piece='pawn'
                boardPosition={{ x: 0, y: -0.5, z: 0 }}
                cellIndex={13}
                cellSize={5}
                color='white'
            />

            <Piece
                piece='pawn'
                boardPosition={{ x: 0, y: -0.5, z: 0 }}
                cellIndex={14}
                cellSize={5}
                color='white'
            />

            <Piece
                piece='pawn'
                boardPosition={{ x: 0, y: -0.5, z: 0 }}
                cellIndex={15}
                cellSize={5}
                color='white'
            />

            {/** */}
            <Piece
                piece='rook'
                boardPosition={{ x: 0, y: -0.5, z: 0 }}
                cellIndex={63}
                cellSize={5}
                color='black'
            />

            <Piece
                piece='knight'
                boardPosition={{ x: 0, y: -0.5, z: 0 }}
                cellIndex={62}
                cellSize={5}
                color='black'
            />

            <Piece
                piece='bishop'
                boardPosition={{ x: 0, y: -0.5, z: 0 }}
                cellIndex={61}
                cellSize={5}
                color='black'
            />

            <Piece
                piece='king'
                boardPosition={{ x: 0, y: -0.5, z: 0 }}
                cellIndex={60}
                cellSize={5}
                color='black'
            />

            <Piece
                piece='queen'
                boardPosition={{ x: 0, y: -0.5, z: 0 }}
                cellIndex={59}
                cellSize={5}
                color='black'
            />

            <Piece
                piece='bishop'
                boardPosition={{ x: 0, y: -0.5, z: 0 }}
                cellIndex={58}
                cellSize={5}
                color='black'
            />

            <Piece
                piece='knight'
                boardPosition={{ x: 0, y: -0.5, z: 0 }}
                cellIndex={57}
                cellSize={5}
                color='black'
            />

            <Piece
                piece='rook'
                boardPosition={{ x: 0, y: -0.5, z: 0 }}
                cellIndex={56}
                cellSize={5}
                color='black'
            />

            <Piece
                piece='pawn'
                boardPosition={{ x: 0, y: -0.5, z: 0 }}
                cellIndex={55}
                cellSize={5}
                color='black'
            />

            <Piece
                piece='pawn'
                boardPosition={{ x: 0, y: -0.5, z: 0 }}
                cellIndex={54}
                cellSize={5}
                color='black'
            />

            <Piece
                piece='pawn'
                boardPosition={{ x: 0, y: -0.5, z: 0 }}
                cellIndex={53}
                cellSize={5}
                color='black'
            />

            <Piece
                piece='pawn'
                boardPosition={{ x: 0, y: -0.5, z: 0 }}
                cellIndex={52}
                cellSize={5}
                color='black'
            />

            <Piece
                piece='pawn'
                boardPosition={{ x: 0, y: -0.5, z: 0 }}
                cellIndex={51}
                cellSize={5}
                color='black'
            />

            <Piece
                piece='pawn'
                boardPosition={{ x: 0, y: -0.5, z: 0 }}
                cellIndex={50}
                cellSize={5}
                color='black'
            />

            <Piece
                piece='pawn'
                boardPosition={{ x: 0, y: -0.5, z: 0 }}
                cellIndex={49}
                cellSize={5}
                color='black'
            />

            <Piece
                piece='pawn'
                boardPosition={{ x: 0, y: -0.5, z: 0 }}
                cellIndex={48}
                cellSize={5}
                color='black'
            />

            <CameraControls
                distance={50}
                azimuthAngle={1}
                polarAngle={MathUtils.degToRad(40)}
            />
        </Canvas>
    );
};
