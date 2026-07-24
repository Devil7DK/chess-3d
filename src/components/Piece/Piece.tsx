import { useGLTF, useTexture } from '@react-three/drei';
import { ThreeElements, useFrame } from '@react-three/fiber';
import React, { useMemo, useRef } from 'react';
import { Group, MathUtils, Mesh, MeshStandardMaterial, Vector3 } from 'three';
import { GLTF } from 'three-stdlib';

import Bishop from '../../assets/models/Bishop.glb';
import King from '../../assets/models/King.glb';
import Knight from '../../assets/models/Knight.glb';
import Pawn from '../../assets/models/Pawn.glb';
import Queen from '../../assets/models/Queen.glb';
import Rook from '../../assets/models/Rook.glb';
import WoodBlack from '../../assets/textures/wood-black.webp';
import WoodWhite from '../../assets/textures/wood-white.webp';
import { ChessPiece, Point3D, Side } from '../../types';
import { getBakedGeometry } from '../../utils';

export type IPieceProps = ThreeElements['group'] & {
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
                    : Rook,
    ) as unknown as GLTFResult;

    const texture = useTexture(side === 'black' ? WoodBlack : WoodWhite);

    const { geometry, material } = useMemo(() => {
        return {
            // Shared across every piece of this type. Only the material is
            // per-instance, since each side gets its own wood map
            geometry: getBakedGeometry(gltf.nodes.mesh01),
            material: gltf.materials.material01.clone(),
        };
    }, [gltf]);

    const target = useMemo(() => {
        return new Vector3(cellPosition.x, cellPosition.y, cellPosition.z);
    }, [cellPosition]);

    const groupRef = useRef<Group>(null);
    const initialized = useRef(false);

    useFrame((_, delta) => {
        const group = groupRef.current;
        if (!group) return;

        // Spawn directly at the target so pieces don't fly in from the origin
        if (!initialized.current) {
            group.position.copy(target);
            initialized.current = true;
            return;
        }

        const dx = target.x - group.position.x;
        const dz = target.z - group.position.z;
        const remaining = Math.sqrt(dx * dx + dz * dz);

        // Lift the piece slightly while it travels; settles as it arrives
        const lift = Math.min(remaining * 0.35, 2);

        group.position.x = MathUtils.damp(group.position.x, target.x, 8, delta);
        group.position.z = MathUtils.damp(group.position.z, target.z, 8, delta);
        group.position.y = MathUtils.damp(
            group.position.y,
            target.y + lift,
            10,
            delta,
        );
    });

    return (
        <group
            {...props}
            ref={groupRef}
            dispose={null}
            scale={new Vector3(0.3, 0.3, 0.3)}
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
