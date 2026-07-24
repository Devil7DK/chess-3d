import React, { useMemo } from 'react';
import { ColorRepresentation, Vector3 } from 'three';

import { useTexture } from '@react-three/drei';
import WoodBlack from '../../assets/textures/wood-black.webp';
import WoodBrown from '../../assets/textures/wood-brown.webp';
import WoodWhite from '../../assets/textures/wood-white.webp';
import { Point3D } from '../../types';
import { get2DPointInGrid } from '../../utils';
import { useChessState } from '../../utils/ChessStateContext';
import { Frame } from '../Frame';
import { Piece } from '../Piece';
import { Box, IBoxProps } from '../Shapes';

/** Destination that takes a piece, as opposed to a quiet move (white). */
const CAPTURE_COLOR = '#e2662c';
/** The move just played, only drawn while nothing is selected. */
const LAST_MOVE_COLOR = '#4da3ff';

export interface IBoardProps {
    position: Point3D;
    thickness: number;
    cellSize: number;
    borderColor: ColorRepresentation;
    borderWidth: number;
}

export const Board: React.FC<IBoardProps> = ({
    borderWidth,
    cellSize,
    position,
    thickness,
}) => {
    const {
        cells,
        pieces,
        selectedCell,
        playingSide,
        status,
        lastMove,
        selectCell,
        moveTo,
    } = useChessState();

    const blackTexture = useTexture(WoodBlack);
    const brownTexture = useTexture(WoodBrown);
    const whiteTexture = useTexture(WoodWhite);

    const onClick = (index: number) => {
        if (selectedCell === undefined) {
            selectCell(index);
        } else {
            if (selectedCell !== index) {
                const cell = cells[index];

                if (cell.side === playingSide) {
                    selectCell(index);
                } else {
                    moveTo(index);
                }
            }
        }
    };

    const boxes = useMemo<IBoxProps[]>(() => {
        const boxes = cells.map<IBoxProps>((cell) => {
            const { row, column, color } = cell;
            const { x, y } = get2DPointInGrid(cellSize, position, row, column);

            return {
                position: { x, z: y, y: position.y },
                height: thickness,
                width: cellSize,
                length: cellSize,
                textures: [
                    brownTexture,
                    brownTexture,
                    color === 'black' ? blackTexture : whiteTexture,
                    brownTexture,
                    brownTexture,
                    brownTexture,
                ],
            };
        });

        return boxes;
    }, [
        cells,
        cellSize,
        position,
        thickness,
        blackTexture,
        brownTexture,
        whiteTexture,
    ]);

    const borders = useMemo(() => {
        const border: IBoxProps[] = [];

        for (let i = 0; i < 8; i++) {
            const cell = boxes[i];

            const x = cell.position.x;
            const y = cell.position.y;
            const z = cell.position.z - cellSize / 2 - borderWidth / 2;

            const point1: IBoxProps = {
                height: thickness,
                length: borderWidth,
                width: cellSize,
                position: { x, y, z },
                textures: [
                    brownTexture,
                    brownTexture,
                    brownTexture,
                    brownTexture,
                    brownTexture,
                    brownTexture,
                ],
            };

            border.push(point1);

            const cell2 = boxes[56 + i];
            border.push({
                ...point1,
                position: {
                    ...point1.position,
                    z: cell2.position.z + cellSize / 2 + borderWidth / 2,
                },
            });
        }

        for (let i = 0; i < 8; i++) {
            const cell = boxes[i * 8];

            const x = cell.position.x - cellSize / 2 - borderWidth / 2;
            const y = cell.position.y;
            const z = cell.position.z;

            const point1: IBoxProps = {
                height: thickness,
                length: cellSize,
                width: borderWidth,
                position: { x, y, z },
                textures: [
                    brownTexture,
                    brownTexture,
                    brownTexture,
                    brownTexture,
                    brownTexture,
                    brownTexture,
                ],
            };

            border.push(point1);

            const cell2 = boxes[(i + 1) * 8 - 1];
            border.push({
                ...point1,
                position: {
                    ...point1.position,
                    x: cell2.position.x + cellSize / 2 + borderWidth / 2,
                },
            });
        }

        const topLeftCell = boxes[0];
        const topRightCell = boxes[7];
        const bottomLeftCell = boxes[56];
        const bottomRightCell = boxes[63];

        const corner: IBoxProps = {
            height: thickness,
            length: borderWidth,
            width: borderWidth,
            position: {
                x: topLeftCell.position.x - cellSize / 2 - borderWidth / 2,
                y: topLeftCell.position.y,
                z: topLeftCell.position.z - cellSize / 2 - borderWidth / 2,
            },
            textures: [
                brownTexture,
                brownTexture,
                brownTexture,
                brownTexture,
                brownTexture,
                brownTexture,
            ],
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

        return border;
    }, [boxes, borderWidth, cellSize, thickness, brownTexture]);

    const capturedTray = useMemo(() => {
        const tray = new Map<string, { index: number; count: number }>();

        for (const side of ['white', 'black'] as const) {
            const captured = pieces
                .filter((piece) => piece.captured && piece.side === side)
                .sort(
                    (a, b) => (a.capturedOrder ?? 0) - (b.capturedOrder ?? 0),
                );

            captured.forEach((piece, index) =>
                tray.set(piece.id, { index, count: captured.length }),
            );
        }

        return tray;
    }, [pieces]);

    return (
        <>
            {boxes.map((props, index) => {
                const cell = cells[index];

                return (
                    <React.Fragment key={`cell-${index}`}>
                        <Box {...props} onClick={() => onClick(index)} />
                        {(status === 'check' || status === 'checkmate') &&
                            selectedCell !== index &&
                            cell.piece === 'king' &&
                            cell.side === playingSide && (
                                <Frame
                                    color='red'
                                    cellSize={cellSize}
                                    boardThickness={thickness}
                                    position={
                                        new Vector3(
                                            props.position.x,
                                            props.position.y + 0.5,
                                            props.position.z,
                                        )
                                    }
                                />
                            )}
                        {selectedCell === index && (
                            <>
                                {cells[index].piece && (
                                    <Frame
                                        color={
                                            cells[index].possibleMoves?.length
                                                ? 'white'
                                                : 'red'
                                        }
                                        cellSize={cellSize}
                                        boardThickness={thickness}
                                        position={
                                            new Vector3(
                                                props.position.x,
                                                props.position.y + 0.5,
                                                props.position.z,
                                            )
                                        }
                                    />
                                )}
                                {cell.possibleMoves?.map((move) => {
                                    const box = boxes[move.index];

                                    return (
                                        <Frame
                                            key={`frame-${move.index}`}
                                            color={
                                                move.capture
                                                    ? CAPTURE_COLOR
                                                    : undefined
                                            }
                                            cellSize={cellSize}
                                            boardThickness={thickness}
                                            position={
                                                new Vector3(
                                                    box.position.x,
                                                    box.position.y + 0.5,
                                                    box.position.z,
                                                )
                                            }
                                        />
                                    );
                                })}
                            </>
                        )}
                    </React.Fragment>
                );
            })}
            {/* Hidden while a piece is selected, so the move frames being
                chosen from are never competing with it for the same cell */}
            {selectedCell === undefined &&
                lastMove &&
                [lastMove.from, lastMove.to].map((index) => {
                    const box = boxes[index];

                    return (
                        <Frame
                            key={`last-move-${index}`}
                            color={LAST_MOVE_COLOR}
                            cellSize={cellSize}
                            boardThickness={thickness}
                            position={
                                new Vector3(
                                    box.position.x,
                                    box.position.y + 0.5,
                                    box.position.z,
                                )
                            }
                        />
                    );
                })}
            {borders.map((props, index) => (
                <Box key={`cell-${index}`} {...props} />
            ))}
            {pieces.map((piece) => {
                if (piece.captured) {
                    const tray = capturedTray.get(piece.id);
                    if (!tray) return null;

                    return (
                        <Piece
                            key={piece.id}
                            cellPosition={{
                                x:
                                    position.x +
                                    cellSize *
                                        5 *
                                        (piece.side === 'white' ? 1 : -1),
                                y: position.y - thickness,
                                z:
                                    position.z -
                                    (tray.count / 2) * cellSize +
                                    cellSize / 2 +
                                    cellSize * tray.index,
                            }}
                            piece={piece.piece}
                            side={piece.side}
                        />
                    );
                }

                return (
                    <Piece
                        key={piece.id}
                        cellPosition={boxes[piece.cellIndex].position}
                        piece={piece.piece}
                        side={piece.side}
                        onClick={(e) => {
                            e.stopPropagation();
                            onClick(piece.cellIndex);
                        }}
                    />
                );
            })}
        </>
    );
};
