import { useGLTF } from '@react-three/drei';
import React, { useMemo } from 'react';
import {
    MathUtils,
    Mesh,
    MeshStandardMaterial,
    Vector3
} from 'three';
import { GLTF } from 'three-stdlib';

import Bishop from '../../assets/models/Bishop.gltf';
import King from '../../assets/models/King.gltf';
import Knight from '../../assets/models/Knight.gltf';
import Pawn from '../../assets/models/Pawn.gltf';
import Queen from '../../assets/models/Queen.gltf';
import Rook from '../../assets/models/Rook.gltf';
import { Point3D } from '../../types';
import { get2DPointInGrid } from '../../utils';

export type IPieceProps = JSX.IntrinsicElements['group'] & {
    piece: 'king' | 'queen' | 'bishop' | 'knight' | 'rook' | 'pawn';
    cellIndex: number;
    cellSize: number;
    boardPosition: Point3D;
    color: 'white' | 'black';
};

type GLTFResult = GLTF & {
    nodes: {
        mesh01: Mesh;
    };
    materials: {
        material01: MeshStandardMaterial;
    };
};

export const Piece: React.FC<IPieceProps> = ({
    piece,
    boardPosition,
    cellIndex,
    cellSize,
    color,
    ...props
}) => {
    const gltf = useGLTF(
        piece === 'bishop'
            ? Bishop
            : piece === 'king'
            ? King
            : piece === 'knight'
            ? Knight
            : piece === 'pawn'
            ? Pawn
            : piece === 'queen'
            ? Queen
            : Rook
    ) as GLTFResult;

    const { geometry, material } = useMemo(() => {
        return {
            geometry: gltf.nodes.mesh01.geometry.clone(),
            material: gltf.materials.material01.clone(),
        };
    }, [gltf]);

    const position = useMemo(() => {
        const { x, y } = get2DPointInGrid(cellSize, boardPosition, cellIndex);

        return new Vector3(x, boardPosition.y, y);
    }, [cellIndex]);

    return (
        <group
            {...props}
            dispose={null}
            scale={new Vector3(0.3, 0.3, 0.3)}
            position={position}
        >
            <mesh
                geometry={geometry}
                material={material}
                material-color={color}
                rotation={[
                    MathUtils.degToRad(270),
                    0,
                    piece === 'knight'
                        ? color === 'white'
                            ? MathUtils.degToRad(90)
                            : MathUtils.degToRad(270)
                        : 0,
                ]}
                castShadow
                receiveShadow
            />
        </group>
    );
};

useGLTF.preload(Bishop);
useGLTF.preload(King);
useGLTF.preload(Knight);
useGLTF.preload(Pawn);
useGLTF.preload(Queen);
useGLTF.preload(Rook);
