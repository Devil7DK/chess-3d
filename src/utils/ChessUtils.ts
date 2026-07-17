import { Square } from 'chess.js';

import { CellPosition, Point2D } from '../types';

// #region Grid
export function getIndexFromRowColumn(cellPosition: CellPosition): number;
export function getIndexFromRowColumn(row: number, column: number): number;
export function getIndexFromRowColumn(
    rowOrCell: CellPosition | number,
    column?: number,
) {
    return typeof rowOrCell === 'object'
        ? (rowOrCell.row - 1) * 8 + (rowOrCell.column - 1)
        : (rowOrCell - 1) * 8 + ((column || 1) - 1);
}

export function getRowColumnFromIndex(index: number) {
    const row = Math.ceil((index + 1) / 8);
    const column = (index % 8) + 1;

    return { row, column };
}

export function get2DPointInGrid(
    cellSize: number,
    centerPoint: Point2D,
    index: number,
): Point2D;
export function get2DPointInGrid(
    cellSize: number,
    centerPoint: Point2D,
    row: number,
    column?: number,
): Point2D;
export function get2DPointInGrid(
    cellSize: number,
    centerPoint: Point2D,
    rowOrIndex: number,
    column?: number,
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
// #endregion Grid

// #region Notation
export function indexToSquare(index: number): Square {
    const { row, column } = getRowColumnFromIndex(index);

    return `${String.fromCharCode(96 + column)}${row}` as Square;
}

export function squareToIndex(square: Square): number {
    const column = square.charCodeAt(0) - 96;
    const row = Number(square.charAt(1));

    return getIndexFromRowColumn(row, column);
}
// #endregion Notation
