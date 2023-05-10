import { CellState } from './CellState';
import { Tuple } from './Tuple';

export type ChessState = { cells: Tuple<CellState, 64> };
