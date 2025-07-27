import {
	createEmptyBoard,
	convertToCoordinates,
	isValidCoordinate,
	getCellClass,
} from "../index";
import { CELL_VALUES } from "../../constants";

describe("utils", () => {
	describe("createEmptyBoard", () => {
		it("creates a 10x10 board filled with EMPTY values", () => {
			const board = createEmptyBoard();
			expect(board.length).toBe(10);
			expect(board.every((row) => row.length === 10)).toBe(true);
			expect(
				board.flat().every((cell) => cell === CELL_VALUES.EMPTY),
			).toBe(true);
		});
	});

	describe("convertToCoordinates", () => {
		it('converts "A1" to { row: 0, col: 0 }', () => {
			expect(convertToCoordinates("A1")).toEqual({ row: 0, col: 0 });
		});

		it("returns null for invalid coordinate", () => {
			expect(convertToCoordinates("Z100")).toBeNull();
		});
	});

	describe("isValidCoordinate", () => {
		it("returns true for valid coordinates within 0-9", () => {
			expect(isValidCoordinate(5, 5)).toBe(true);
		});

		it("returns false for out-of-bound coordinates", () => {
			expect(isValidCoordinate(-1, 0)).toBe(false);
			expect(isValidCoordinate(10, 10)).toBe(false);
		});
	});

	describe("getCellClass", () => {
		it('returns class with "ship" for player ship cells', () => {
			expect(getCellClass(CELL_VALUES.SHIP, false)).toContain("ship");
		});

		it('does not include "ship" for computer board cells', () => {
			expect(getCellClass(CELL_VALUES.SHIP, true)).not.toContain("ship");
		});

		it('includes "target" if isTarget is true', () => {
			const result = getCellClass(CELL_VALUES.EMPTY, false, true);
			expect(result).toContain("target");
		});
	});
});
