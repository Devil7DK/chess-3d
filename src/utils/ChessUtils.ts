import { Point2D } from '../types';

export function getRowColumnFromIndex(index: number) {
    const row = Math.ceil((index + 1) / 8);
    const column = (index % 8) + 1;

    return { row, column };
}

export function get2DPointInGrid(
    cellSize: number,
    centerPoint: Point2D,
    index: number
): Point2D;
export function get2DPointInGrid(
    cellSize: number,
    centerPoint: Point2D,
    row: number,
    column?: number
): Point2D;
export function get2DPointInGrid(
    cellSize: number,
    centerPoint: Point2D,
    rowOrIndex: number,
    column?: number
): Point2D {
    const row =
        column === undefined
            ? getRowColumnFromIndex(rowOrIndex).row
            : rowOrIndex;
    column =
        column === undefined
            ? getRowColumnFromIndex(rowOrIndex).column
            : column;

    const x =
        column <= 4
            ? centerPoint.x - (4 - column) * cellSize - cellSize / 2
            : centerPoint.x + (column - 5) * cellSize + cellSize / 2;
    const y =
        row <= 4
            ? centerPoint.y - (4 - row) * cellSize - cellSize / 2
            : centerPoint.y + (row - 5) * cellSize + cellSize / 2;

    return { x, y };
}
