// gameLogic.ts
import {
	BOARD_SIZE,
	SHIP_LENGTHS,
	DIRECTIONS,
	CELL_VALUES,
	GAME_CONFIG,
} from "../constants";
import { createEmptyBoard, isValidCoordinate, hasBeenAttacked } from "../utils";
import type { Ship, Board, Coordinates } from "../types";

export class GameLogic {
	static doesShipCollide(ships: Ship[], newShip: Ship): boolean {
		const newShipCells = new Set<string>();

		// Pre-calculate new ship cells
		for (let j = 0; j < newShip.length; j++) {
			const newRow = newShip.isHorizontal ? newShip.row : newShip.row + j;
			const newCol = newShip.isHorizontal ? newShip.col + j : newShip.col;
			newShipCells.add(`${newRow}-${newCol}`);
		}

		// Check against existing ships
		for (const ship of ships) {
			for (let i = 0; i < ship.length; i++) {
				const shipRow = ship.isHorizontal ? ship.row : ship.row + i;
				const shipCol = ship.isHorizontal ? ship.col + i : ship.col;
				if (newShipCells.has(`${shipRow}-${shipCol}`)) {
					return true;
				}
			}
		}
		return false;
	}

	static generateRandomShip(length: number, existingShips: Ship[]): Ship {
		let attempts = 0;

		while (attempts < GAME_CONFIG.MAX_SHIP_PLACEMENT_ATTEMPTS) {
			const isHorizontal = Math.random() < 0.5;
			const maxRow = isHorizontal ? BOARD_SIZE : BOARD_SIZE - length + 1;
			const maxCol = isHorizontal ? BOARD_SIZE - length + 1 : BOARD_SIZE;

			const ship: Ship = {
				row: Math.floor(Math.random() * maxRow),
				col: Math.floor(Math.random() * maxCol),
				isHorizontal,
				hits: 0,
				length,
			};

			if (!this.doesShipCollide(existingShips, ship)) {
				return ship;
			}
			attempts++;
		}

		// Fallback - should rarely happen
		return {
			row: 0,
			col: 0,
			isHorizontal: true,
			hits: 0,
			length,
		};
	}

	static placeShipsOnBoard(): { board: Board; ships: Ship[] } {
		const ships: Ship[] = [];

		for (const length of SHIP_LENGTHS) {
			const newShip = this.generateRandomShip(length, ships);
			ships.push(newShip);
		}

		const board = createEmptyBoard();
		for (const ship of ships) {
			for (let i = 0; i < ship.length; i++) {
				const r = ship.isHorizontal ? ship.row : ship.row + i;
				const c = ship.isHorizontal ? ship.col + i : ship.col;
				board[r][c] = CELL_VALUES.SHIP;
			}
		}

		return { board, ships };
	}

	static getAdjacentCells(
		row: number,
		col: number,
		board: Board,
	): Coordinates[] {
		const adjacent: Coordinates[] = [];

		for (const dir of DIRECTIONS) {
			const newRow = row + dir.row;
			const newCol = col + dir.col;

			if (
				isValidCoordinate(newRow, newCol) &&
				!hasBeenAttacked(board[newRow][newCol])
			) {
				adjacent.push({ row: newRow, col: newCol });
			}
		}

		return adjacent;
	}

	static isHitFromDestroyedShip(
		row: number,
		col: number,
		ships: Ship[],
	): boolean {
		for (const ship of ships) {
			if (ship.hits < ship.length) continue; // Skip non-destroyed ships

			for (let i = 0; i < ship.length; i++) {
				const r = ship.isHorizontal ? ship.row : ship.row + i;
				const c = ship.isHorizontal ? ship.col + i : ship.col;
				if (r === row && c === col) {
					return true;
				}
			}
		}
		return false;
	}

	static getSmartTarget(board: Board, ships: Ship[]): Coordinates {
		const validTargets: Coordinates[] = [];
		const patternTargets: Coordinates[] = [];

		// Single pass through the board
		for (let row = 0; row < BOARD_SIZE; row++) {
			for (let col = 0; col < BOARD_SIZE; col++) {
				if (
					board[row][col] === CELL_VALUES.HIT &&
					!this.isHitFromDestroyedShip(row, col, ships)
				) {
					// Check for adjacent targets
					const adjacentCells = this.getAdjacentCells(
						row,
						col,
						board,
					);
					validTargets.push(...adjacentCells);

					// Check for horizontal pattern
					if (
						col < BOARD_SIZE - 1 &&
						board[row][col + 1] === CELL_VALUES.HIT &&
						!this.isHitFromDestroyedShip(row, col + 1, ships)
					) {
						// Check left side
						if (col > 0 && !hasBeenAttacked(board[row][col - 1])) {
							patternTargets.push({ row, col: col - 1 });
						}

						// Check right side
						let rightEnd = col + 1;
						while (
							rightEnd < BOARD_SIZE &&
							board[row][rightEnd] === CELL_VALUES.HIT &&
							!this.isHitFromDestroyedShip(row, rightEnd, ships)
						) {
							rightEnd++;
						}
						if (
							rightEnd < BOARD_SIZE &&
							!hasBeenAttacked(board[row][rightEnd])
						) {
							patternTargets.push({ row, col: rightEnd });
						}
					}

					// Check for vertical pattern
					if (
						row < BOARD_SIZE - 1 &&
						board[row + 1][col] === CELL_VALUES.HIT &&
						!this.isHitFromDestroyedShip(row + 1, col, ships)
					) {
						// Check top side
						if (row > 0 && !hasBeenAttacked(board[row - 1][col])) {
							patternTargets.push({ row: row - 1, col });
						}

						// Check bottom side
						let bottomEnd = row + 1;
						while (
							bottomEnd < BOARD_SIZE &&
							board[bottomEnd][col] === CELL_VALUES.HIT &&
							!this.isHitFromDestroyedShip(bottomEnd, col, ships)
						) {
							bottomEnd++;
						}
						if (
							bottomEnd < BOARD_SIZE &&
							!hasBeenAttacked(board[bottomEnd][col])
						) {
							patternTargets.push({ row: bottomEnd, col });
						}
					}
				}
			}
		}

		// Return pattern targets first (highest priority)
		if (patternTargets.length > 0) {
			return patternTargets[
				Math.floor(Math.random() * patternTargets.length)
			];
		}

		// Return adjacent targets
		if (validTargets.length > 0) {
			return validTargets[
				Math.floor(Math.random() * validTargets.length)
			];
		}

		// Fallback: Random targeting
		const availableCells: Coordinates[] = [];
		for (let row = 0; row < BOARD_SIZE; row++) {
			for (let col = 0; col < BOARD_SIZE; col++) {
				if (!hasBeenAttacked(board[row][col])) {
					availableCells.push({ row, col });
				}
			}
		}

		return availableCells.length > 0
			? availableCells[Math.floor(Math.random() * availableCells.length)]
			: { row: 0, col: 0 };
	}

	static areAllShipsDestroyed(ships: Ship[]): boolean {
		return ships.every((ship) => ship.hits >= ship.length);
	}
}
