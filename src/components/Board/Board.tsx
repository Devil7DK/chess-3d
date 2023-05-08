import React, { useMemo } from 'react';
import { CanvasTexture, ColorRepresentation } from 'three';

import { Point3D } from '../../types';
import { get2DPointInGrid, getRowColumnFromIndex } from '../../utils';
import { Box, IBoxProps } from '../Shapes';

export interface IBoardProps {
    position: Point3D;
    thickness: number;
    cellSize: number;
    borderColor: ColorRepresentation;
    borderWidth: number;
}

export const Board: React.FC<IBoardProps> = ({
    borderColor,
    borderWidth,
    cellSize,
    position,
    thickness,
}) => {
    const boxes = useMemo<IBoxProps[]>(() => {
        const cells = new Array(64).fill('').map<IBoxProps>((_, index) => {
            const { row, column } = getRowColumnFromIndex(index);
            const { x, y } = get2DPointInGrid(5, position, row, column);

            const color =
                row % 2
                    ? column % 2
                        ? 'white'
                        : 'black'
                    : column % 2
                    ? 'black'
                    : 'white';

            const textCanvas = document.createElement('canvas');
            textCanvas.width = 100;
            textCanvas.height = 100;
            const textContext = textCanvas.getContext('2d');
            if (textContext) {
                textContext.fillStyle = color;
                textContext.fillRect(0, 0, textCanvas.width, textCanvas.height);
                textContext.fillStyle = color === 'black' ? 'white' : 'black';
                textContext.font = '50px serif';
                textContext.textAlign = 'center';
                textContext.textBaseline = 'middle';
                textContext.fillText(index.toString(), 50, 50);
            }

            return {
                position: { x, z: y, y: position.y },
                height: thickness,
                width: cellSize,
                length: cellSize,
                color: [color, color, color, borderColor, color, color],
                textures: [
                    null,
                    null,
                    new CanvasTexture(textCanvas),
                    null,
                    null,
                    null,
                ],
            };
        });

        const border: IBoxProps[] = [];

        for (let i = 0; i < 8; i++) {
            const cell = cells[i];

            const x = cell.position.x;
            const y = cell.position.y;
            const z = cell.position.z - cellSize / 2 - borderWidth / 2;

            const textCanvas = document.createElement('canvas');
            textCanvas.width = cellSize * 100;
            textCanvas.height = borderWidth * 100;
            const textContext = textCanvas.getContext('2d');
            if (textContext) {
                textContext.fillStyle =
                    typeof borderColor === 'string'
                        ? borderColor
                        : borderColor.toString();
                textContext.fillRect(0, 0, textCanvas.width, textCanvas.height);
                textContext.fillStyle = 'white';
                textContext.font = `${cellSize * 30}px serif`;
                textContext.textAlign = 'center';
                textContext.textBaseline = 'middle';
                textContext.fillText(
                    String.fromCharCode(65 + i),
                    cellSize * 50,
                    borderWidth * 50
                );
            }

            const point1: IBoxProps = {
                color: borderColor,
                height: thickness,
                length: borderWidth,
                width: cellSize,
                position: { x, y, z },
                textures: [
                    null,
                    null,
                    new CanvasTexture(textCanvas),
                    null,
                    null,
                    null,
                ],
            };

            border.push(point1);

            const cell2 = cells[56 + i];
            border.push({
                ...point1,
                position: {
                    ...point1.position,
                    z: cell2.position.z + cellSize / 2 + borderWidth / 2,
                },
            });
        }

        for (let i = 0; i < 8; i++) {
            const cell = cells[i * 8];

            const x = cell.position.x - cellSize / 2 - borderWidth / 2;
            const y = cell.position.y;
            const z = cell.position.z;

            const textCanvas = document.createElement('canvas');
            textCanvas.width = borderWidth * 100;
            textCanvas.height = cellSize * 100;
            const textContext = textCanvas.getContext('2d');
            if (textContext) {
                textContext.fillStyle =
                    typeof borderColor === 'string'
                        ? borderColor
                        : borderColor.toString();
                textContext.fillRect(0, 0, textCanvas.width, textCanvas.height);
                textContext.fillStyle = 'white';
                textContext.font = `${cellSize * 30}px serif`;
                textContext.textAlign = 'center';
                textContext.textBaseline = 'middle';
                textContext.fillText(
                    String(i + 1),
                    borderWidth * 50,
                    cellSize * 50
                );
            }

            const point1: IBoxProps = {
                color: borderColor,
                height: thickness,
                length: cellSize,
                width: borderWidth,
                position: { x, y, z },
                textures: [
                    null,
                    null,
                    new CanvasTexture(textCanvas),
                    null,
                    null,
                    null,
                ],
            };

            border.push(point1);

            const cell2 = cells[(i + 1) * 8 - 1];
            border.push({
                ...point1,
                position: {
                    ...point1.position,
                    x: cell2.position.x + cellSize / 2 + borderWidth / 2,
                },
            });
        }

        const topLeftCell = cells[0];
        const topRightCell = cells[7];
        const bottomLeftCell = cells[56];
        const bottomRightCell = cells[63];

        const corner: IBoxProps = {
            color: borderColor,
            height: thickness,
            length: borderWidth,
            width: borderWidth,
            position: {
                x: topLeftCell.position.x - cellSize / 2 - borderWidth / 2,
                y: topLeftCell.position.y,
                z: topLeftCell.position.z - cellSize / 2 - borderWidth / 2,
            },
        };

        border.push(corner);
        border.push({
            ...corner,
            position: {
                ...corner.position,
                x: topRightCell.position.x + cellSize / 2 + borderWidth / 2,
                z: topRightCell.position.z - cellSize / 2 - borderWidth / 2,
            },
        });
        border.push({
            ...corner,
            position: {
                ...corner.position,
                x: bottomLeftCell.position.x - cellSize / 2 - borderWidth / 2,
                z: bottomLeftCell.position.z + cellSize / 2 + borderWidth / 2,
            },
        });
        border.push({
            ...corner,
            position: {
                ...corner.position,
                x: bottomRightCell.position.x + cellSize / 2 + borderWidth / 2,
                z: bottomRightCell.position.z + cellSize / 2 + borderWidth / 2,
            },
        });

        return [...cells, ...border];
    }, []);

    return (
        <>
            {boxes.map((props, index) => (
                <Box key={`cell-${index}`} {...props} />
            ))}
        </>
    );
};
