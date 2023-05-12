import { useGLTF, useTexture } from '@react-three/drei';
import React, { useMemo } from 'react';
import { MathUtils, Mesh, MeshStandardMaterial, Vector3 } from 'three';
import { GLTF } from 'three-stdlib';

import Bishop from '../../assets/models/Bishop.gltf';
import King from '../../assets/models/King.gltf';
import Knight from '../../assets/models/Knight.gltf';
import Pawn from '../../assets/models/Pawn.gltf';
import Queen from '../../assets/models/Queen.gltf';
import Rook from '../../assets/models/Rook.gltf';
import WoodBlack from '../../assets/textures/wood-black.jpg';
import WoodWhite from '../../assets/textures/wood-white.jpg';
import { ChessPiece, Point3D, Side } from '../../types';

export type IPieceProps = JSX.IntrinsicElements['group'] & {
    piece: ChessPiece;
    side: Side;
    cellPosition: Point3D;
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
    side,
    cellPosition,
    onClick,
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

    const texture = useTexture(side === 'black' ? WoodBlack : WoodWhite);

    const { geometry, material } = useMemo(() => {
        return {
            geometry: gltf.nodes.mesh01.geometry.clone(),
            material: gltf.materials.material01.clone(),
        };
    }, [gltf]);

    const position = useMemo(() => {
        return new Vector3(cellPosition.x, cellPosition.y, cellPosition.z);
    }, [cellPosition]);

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
                material-map={texture}
                rotation={[
                    MathUtils.degToRad(270),
                    0,
                    piece === 'knight'
                        ? side === 'white'
                            ? MathUtils.degToRad(90)
                            : MathUtils.degToRad(270)
                        : 0,
                ]}
                onClick={onClick}
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
