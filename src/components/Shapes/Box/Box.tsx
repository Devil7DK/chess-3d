import { useFrame } from '@react-three/fiber';
import React, { useRef } from 'react';
import {
    BufferGeometry,
    ColorRepresentation,
    Material,
    Mesh,
    NormalBufferAttributes,
} from 'three';

import { Box as BoxType } from '../../../types';

export interface IBoxProps extends BoxType {
    color:
        | ColorRepresentation
        | [
              ColorRepresentation,
              ColorRepresentation,
              ColorRepresentation,
              ColorRepresentation,
              ColorRepresentation,
              ColorRepresentation
          ];
}

export const Box: React.FC<IBoxProps> = ({
    color,
    height,
    length,
    position,
    width,
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
        <mesh ref={ref}>
            <boxGeometry args={[width, height, length]} attach='geometry' />
            {Array.isArray(color) ? (
                color.map((color, index) => (
                    <meshBasicMaterial
                        key={`face-${index}`}
                        color={color}
                        attach={`material-${index}`}
                    />
                ))
            ) : (
                <meshBasicMaterial color={color} />
            )}
        </mesh>
    );
};
