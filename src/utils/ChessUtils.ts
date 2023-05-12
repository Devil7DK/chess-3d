import { CellState, ChessPiece, Point2D, Tuple } from '../types';

// #region Grid
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
// #endregion Grid

// #region Serialization
const pieceSerializationMap: Record<ChessPiece, string> = {
    king: 'A',
    queen: 'B',
    rook: 'C',
    bishop: 'D',
    knight: 'E',
    pawn: 'F',
};

const pieceDeserializationMap: Record<string, ChessPiece> = Object.fromEntries(
    Object.entries(pieceSerializationMap).map(([key, value]) => [
        value,
        key as ChessPiece,
    ])
);

export function serialize(cells: Tuple<CellState, 64>): string {
    return cells
        .map((cell) =>
            cell.piece
                ? pieceSerializationMap[cell.piece][
                      cell.side === 'black' ? 'toUpperCase' : 'toLowerCase'
                  ]()
                : '0'
        )
        .join('');
}

export function deserialize(data: string): Tuple<CellState, 64> {
    if (data.length !== 64) throw new Error('Invalid data! Length mismatch!');

    return data.split('').map<CellState>((char, index) => {
        const { column, row } = getRowColumnFromIndex(index);

        const color =
            row % 2
                ? column % 2
                    ? 'white'
                    : 'black'
                : column % 2
                ? 'black'
                : 'white';
        const piece = pieceDeserializationMap[char.toUpperCase()];

        const charCode = char.charCodeAt(0);
        const side =
            charCode >= 65 && charCode <= 70
                ? 'black'
                : charCode >= 97 && charCode <= 102
                ? 'white'
                : undefined;

        return {
            index,
            column,
            row,
            color,
            piece,
            side,
        };
    }) as Tuple<CellState, 64>;
}
// #endregion Serialization
