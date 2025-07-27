// utils.ts
import {
	BOARD_SIZE,
	VALID_COORDINATE_PATTERN,
	CELL_VALUES,
} from "../constants";
import type { Coordinates, Board } from "../types";

export const createEmptyBoard = (): Board => {
	return Array(BOARD_SIZE)
		.fill(null)
		.map(() => Array(BOARD_SIZE).fill(CELL_VALUES.EMPTY));
};

export const convertToCoordinates = (value: string): Coordinates | null => {
	if (!VALID_COORDINATE_PATTERN.test(value)) return null;

	const letter = value[0];
	const col = letter.charCodeAt(0) - 65; // A=0, B=1, etc.
	const row = parseInt(value.slice(1)) - 1; // 1-indexed to 0-indexed

	return { row, col };
};

export const isValidCoordinate = (row: number, col: number): boolean => {
	return row >= 0 && row < BOARD_SIZE && col >= 0 && col < BOARD_SIZE;
};

export const getCellClass = (
	cellValue: number,
	isComputerBoard: boolean,
	isTarget: boolean = false,
): string => {
	let cellClass = "cell";

	if (cellValue === CELL_VALUES.SHIP && !isComputerBoard) {
		cellClass += " ship";
	} else if (cellValue === CELL_VALUES.MISS) {
		cellClass += " miss";
	} else if (cellValue === CELL_VALUES.HIT) {
		cellClass += " hit";
	}

	if (isTarget) {
		cellClass += " target";
	}

	return cellClass;
};

export const hasBeenAttacked = (cellValue: number): boolean => {
	return cellValue === CELL_VALUES.MISS || cellValue === CELL_VALUES.HIT;
};
