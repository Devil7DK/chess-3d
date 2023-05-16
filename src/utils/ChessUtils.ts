import {
    CellPosition,
    CellState,
    ChessPiece,
    Point2D,
    Side,
    Tuple,
} from '../types';

// #region Grid
export function getIndexFromRowColumn(cellPosition: CellPosition): number;
export function getIndexFromRowColumn(row: number, column: number): number;
export function getIndexFromRowColumn(
    rowOrCell: CellPosition | number,
    column?: number
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

    const cells = data.split('').map<CellState>((char, index) => {
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

    for (let index = 0; index < cells.length; index++) {
        cells[index].possibleMoves = getPossiblePositions(cells, index);
    }

    return cells;
}
// #endregion Serialization

// #region Possible Possitions
function invalidPositions(position: CellPosition): boolean {
    return (
        position.column >= 1 &&
        position.column <= 8 &&
        position.row >= 1 &&
        position.row <= 8
    );
}

function occupiedPositions(cells: Tuple<CellState, 64>, side: Side) {
    return (position: CellPosition) => {
        const index = getIndexFromRowColumn(position.row, position.column);

        const cell = cells[index];

        return !cell.piece || cell.side !== side;
    };
}

function getHorizontalPositions(
    cells: Tuple<CellState, 64>,
    cellPosition: CellPosition,
    side: Side
) {
    const positions: CellPosition[] = [];

    for (let column = cellPosition.column - 1; column >= 1; column--) {
        const position: CellPosition = { row: cellPosition.row, column };
        const index = getIndexFromRowColumn(position);

        const cell = cells[index];
        if (cell && cell.piece) {
            if (cell.side !== side) {
                positions.push(position);
            }

            break;
        }

        positions.push(position);
    }

    for (let column = cellPosition.column + 1; column <= 8; column++) {
        const position: CellPosition = { row: cellPosition.row, column };
        const index = getIndexFromRowColumn(position);

        const cell = cells[index];
        if (cell && cell.piece) {
            if (cell.side !== side) {
                positions.push(position);
            }

            break;
        }

        positions.push(position);
    }

    return positions;
}

function getVerticalPositions(
    cells: Tuple<CellState, 64>,
    cellPosition: CellPosition,
    side: Side
) {
    const positions: CellPosition[] = [];

    for (let row = cellPosition.row - 1; row >= 1; row--) {
        const position: CellPosition = { row, column: cellPosition.column };
        const index = getIndexFromRowColumn(position);

        const cell = cells[index];
        if (cell && cell.piece) {
            if (cell.side !== side) {
                positions.push(position);
            }

            break;
        }

        positions.push(position);
    }

    for (let row = cellPosition.row + 1; row <= 8; row++) {
        const position: CellPosition = { row, column: cellPosition.column };
        const index = getIndexFromRowColumn(position);

        const cell = cells[index];
        if (cell && cell.piece) {
            if (cell.side !== side) {
                positions.push(position);
            }

            break;
        }

        positions.push(position);
    }

    return positions;
}

function getDiagonalPositions(
    cells: Tuple<CellState, 64>,
    cellPosition: CellPosition,
    side: Side
) {
    const positions: CellPosition[] = [];

    for (
        let position = {
            row: cellPosition.row - 1,
            column: cellPosition.column - 1,
        };
        position.column >= 1 && position.row >= 1;
        position.column--, position.row--
    ) {
        const index = getIndexFromRowColumn(position);

        const cell = cells[index];
        if (cell && cell.piece) {
            if (cell.side !== side) {
                positions.push({ ...position });
            }

            break;
        }

        positions.push({ ...position });
    }

    for (
        let position = {
            row: cellPosition.row + 1,
            column: cellPosition.column + 1,
        };
        position.column <= 8 && position.row <= 8;
        position.column++, position.row++
    ) {
        const index = getIndexFromRowColumn(position);

        const cell = cells[index];
        if (cell && cell.piece) {
            if (cell.side !== side) {
                positions.push({ ...position });
            }

            break;
        }

        positions.push({ ...position });
    }

    for (
        let position = {
            row: cellPosition.row - 1,
            column: cellPosition.column + 1,
        };
        position.column <= 8 && position.row >= 1;
        position.column++, position.row--
    ) {
        const index = getIndexFromRowColumn(position);

        const cell = cells[index];
        if (cell && cell.piece) {
            if (cell.side !== side) {
                positions.push({ ...position });
            }

            break;
        }

        positions.push({ ...position });
    }

    for (
        let position = {
            row: cellPosition.row + 1,
            column: cellPosition.column - 1,
        };
        position.column >= 1 && position.row <= 8;
        position.column--, position.row++
    ) {
        const index = getIndexFromRowColumn(position);

        const cell = cells[index];
        if (cell && cell.piece) {
            if (cell.side !== side) {
                positions.push({ ...position });
            }

            break;
        }

        positions.push({ ...position });
    }

    return positions;
}

export function getPossiblePositions(
    cells: Tuple<CellState, 64>,
    index: number
): number[] | undefined {
    const { column, row, piece, side } = cells[index];

    let possiblePositions: CellPosition[] | null = null;

    if (piece && side) {
        switch (piece) {
            case 'king':
                possiblePositions = [
                    { row: row - 1, column: column - 1 },
                    { row: row - 1, column: column },
                    { row: row - 1, column: column + 1 },
                    { row: row, column: column - 1 },
                    { row: row, column: column + 1 },
                    { row: row + 1, column: column - 1 },
                    { row: row + 1, column: column },
                    { row: row + 1, column: column + 1 },
                ];
                break;
            case 'queen':
                possiblePositions = [
                    ...getHorizontalPositions(cells, { row, column }, side),
                    ...getVerticalPositions(cells, { row, column }, side),
                    ...getDiagonalPositions(cells, { row, column }, side),
                ];
                break;
            case 'rook':
                possiblePositions = [
                    ...getHorizontalPositions(cells, { row, column }, side),
                    ...getVerticalPositions(cells, { row, column }, side),
                ];
                break;
            case 'bishop':
                possiblePositions = getDiagonalPositions(
                    cells,
                    { row, column },
                    side
                );
                break;
            case 'knight':
                possiblePositions = [
                    {
                        row: row + 1,
                        column: column + 2,
                    },
                    {
                        row: row + 1,
                        column: column - 2,
                    },
                    {
                        row: row - 1,
                        column: column + 2,
                    },
                    {
                        row: row - 1,
                        column: column - 2,
                    },
                    {
                        row: row + 2,
                        column: column + 1,
                    },
                    {
                        row: row + 2,
                        column: column - 1,
                    },
                    {
                        row: row - 2,
                        column: column + 1,
                    },
                    {
                        row: row - 2,
                        column: column - 1,
                    },
                ];
                break;
            case 'pawn':
                possiblePositions = [];

                const moves =
                    (side === 'black' && row === 7) ||
                    (side === 'white' && row === 2)
                        ? 2
                        : 1;
                for (let i = 1; i <= moves; i++) {
                    const position: CellPosition = {
                        row: side === 'black' ? row - i : row + i,
                        column,
                    };
                    const index = getIndexFromRowColumn(position);

                    const cell = cells[index];

                    if (cell && cell.piece) {
                        if (cell.side !== side) {
                            possiblePositions.push(position);
                        }
                    } else {
                        possiblePositions.push(position);
                    }
                }

                const diagonalPosition1 = {
                    row: side === 'black' ? row - 1 : row + 1,
                    column: column + 1,
                };
                const index1 = getIndexFromRowColumn(diagonalPosition1);
                const cell1 = cells[index1];
                if (cell1 && cell1.piece && cell1.side !== side) {
                    possiblePositions.push(diagonalPosition1);
                }

                const diagonalPosition2 = {
                    row: side === 'black' ? row - 1 : row + 1,
                    column: column - 1,
                };
                const index2 = getIndexFromRowColumn(diagonalPosition2);
                const cell2 = cells[index2];
                if (cell2 && cell2.piece && cell2.side !== side) {
                    possiblePositions.push(diagonalPosition2);
                }

                break;
        }

        if (possiblePositions) {
            return possiblePositions
                .filter(invalidPositions)
                .filter(occupiedPositions(cells, side))
                .map(getIndexFromRowColumn);
        }
    }
}
// #endregion
