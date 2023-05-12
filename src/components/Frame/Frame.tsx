import { useGLTF } from '@react-three/drei';
import React, { useMemo } from 'react';
import { ColorRepresentation, Mesh, Vector3 } from 'three';
import { GLTF } from 'three-stdlib';

import FrameModel from '../../assets/models/Frame.glb';
import { Point3D } from '../../types';

type GLTFResult = GLTF & {
    nodes: {
        imagetostl_mesh0: Mesh;
    };
};

export interface IFrameProps {
    color?: ColorRepresentation;
    position: Point3D;
    cellSize: number;
    boardThickness: number;
}

export const Frame = ({
    boardThickness,
    cellSize,
    color,
    position,
}: IFrameProps) => {
    const { nodes } = useGLTF(FrameModel) as GLTFResult;

    const geometry = useMemo(() => {
        return nodes.imagetostl_mesh0.geometry;
    }, [nodes, color]);

    return (
        <group
            position={new Vector3(position.x, position.y, position.z)}
            scale={[
                0.01024 * cellSize,
                0.005 * boardThickness,
                0.01055 * cellSize,
            ]}
            dispose={null}
        >
            <mesh geometry={geometry}>
                <meshPhysicalMaterial color={color} />
            </mesh>
        </group>
    );
};

useGLTF.preload(FrameModel);
