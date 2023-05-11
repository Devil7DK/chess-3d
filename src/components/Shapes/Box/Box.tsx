import { useFrame } from '@react-three/fiber';
import React, { useRef } from 'react';
import {
    BufferGeometry,
    ColorRepresentation,
    Material,
    Mesh,
    NormalBufferAttributes,
    Texture,
} from 'three';

import { Box as BoxType } from '../../../types';

export interface IBoxProps extends BoxType {
    color?:
        | ColorRepresentation
        | [
              ColorRepresentation,
              ColorRepresentation,
              ColorRepresentation,
              ColorRepresentation,
              ColorRepresentation,
              ColorRepresentation
          ];
    textures?: [
        Texture | null,
        Texture | null,
        Texture | null,
        Texture | null,
        Texture | null,
        Texture | null
    ];
}

export const Box: React.FC<IBoxProps> = ({
    color,
    height,
    length,
    position,
    width,
    textures,
}) => {
    const ref =
        useRef<
            Mesh<BufferGeometry<NormalBufferAttributes>, Material | Material[]>
        >(null);

    useFrame(() => {
        if (ref.current) {
            ref.current.position.set(position.x, position.y, position.z);
        }
    });

    return (
        <mesh ref={ref} receiveShadow>
            <boxGeometry args={[width, height, length]} attach='geometry' />
            {Array.isArray(color) || Array.isArray(textures) ? (
                new Array(6).fill('').map((_, index) => {
                    return (
                        <meshBasicMaterial
                            key={`face-${index}`}
                            color={
                                Array.isArray(color)
                                    ? !Array.isArray(textures) ||
                                      !textures[index]
                                        ? color[index]
                                        : undefined
                                    : color
                            }
                            map={
                                Array.isArray(textures) ? textures[index] : null
                            }
                            attach={`material-${index}`}
                        />
                    );
                })
            ) : (
                <meshBasicMaterial color={color} />
            )}
        </mesh>
    );
};
