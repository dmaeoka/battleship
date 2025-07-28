import {
	BOARD_SIZE,
	SHIP_LENGTHS,
	DIRECTIONS,
	CELL_VALUES,
	GAME_CONFIG,
} from "../constants";
import { createEmptyBoard, isValidCoordinate, hasBeenAttacked } from "../utils";
import type { Ship, Board, Coordinates } from "../types";

/**
 * GameLogic class containing all core game mechanics for Battleship
 * Handles ship placement, collision detection, AI targeting, and game state validation
 */
export class GameLogic {
	/**
	 * Checks if a new ship would collide with any existing ships on the board
	 * Uses coordinate string comparison for efficient collision detection
	 * @param ships - Array of existing ships already placed on the board
	 * @param newShip - The ship to check for collisions
	 * @returns true if collision detected, false if placement is valid
	 */
	static doesShipCollide(ships: Ship[], newShip: Ship): boolean {
		// Create a set of coordinate strings for the new ship for O(1) lookup
		const newShipCells = new Set<string>();

		// Calculate all cells that the new ship would occupy
		for (let j = 0; j < newShip.length; j++) {
			// Determine cell position based on ship orientation
			const newRow = newShip.isHorizontal ? newShip.row : newShip.row + j;
			const newCol = newShip.isHorizontal ? newShip.col + j : newShip.col;
			// Store as string for efficient set operations
			newShipCells.add(`${newRow}-${newCol}`);
		}

		// Check if any existing ship occupies the same cells
		for (const ship of ships) {
			for (let i = 0; i < ship.length; i++) {
				// Calculate existing ship's cell positions
				const shipRow = ship.isHorizontal ? ship.row : ship.row + i;
				const shipCol = ship.isHorizontal ? ship.col + i : ship.col;

				// Check for collision using set lookup (O(1))
				if (newShipCells.has(`${shipRow}-${shipCol}`)) {
					return true; // Collision detected
				}
			}
		}
		return false; // No collision found
	}

	/**
	 * Generates a random ship placement that doesn't collide with existing ships
	 * Uses retry logic with a maximum attempt limit to prevent infinite loops
	 * @param length - Length of the ship to generate
	 * @param existingShips - Ships already placed on the board
	 * @returns A valid ship placement, or fallback position if max attempts reached
	 */
	static generateRandomShip(length: number, existingShips: Ship[]): Ship {
		let attempts = 0;

		// Try to find valid placement within attempt limit
		while (attempts < GAME_CONFIG.MAX_SHIP_PLACEMENT_ATTEMPTS) {
			// Randomly choose horizontal or vertical orientation
			const isHorizontal = Math.random() < 0.5;

			// Calculate valid starting position ranges based on orientation
			// Horizontal ships need room to extend right, vertical ships need room to extend down
			const maxRow = isHorizontal ? BOARD_SIZE : BOARD_SIZE - length + 1;
			const maxCol = isHorizontal ? BOARD_SIZE - length + 1 : BOARD_SIZE;

			// Generate random ship with valid starting position
			const ship: Ship = {
				row: Math.floor(Math.random() * maxRow),
				col: Math.floor(Math.random() * maxCol),
				isHorizontal,
				hits: 0, // No hits initially
				length,
			};

			// Check if this placement is valid (no collisions)
			if (!this.doesShipCollide(existingShips, ship)) {
				return ship; // Found valid placement
			}
			attempts++;
		}

		// Fallback placement if we couldn't find valid position
		// This should rarely happen with proper game configuration
		return {
			row: 0,
			col: 0,
			isHorizontal: true,
			hits: 0,
			length,
		};
	}

	/**
	 * Places all ships randomly on a board and returns the configured game state
	 * Creates both the visual board representation and ship data structures
	 * @returns Object containing the populated board and array of ship objects
	 */
	static placeShipsOnBoard(): { board: Board; ships: Ship[] } {
		const ships: Ship[] = [];

		// Generate and place each ship type defined in SHIP_LENGTHS
		for (const length of SHIP_LENGTHS) {
			const newShip = this.generateRandomShip(length, ships);
			ships.push(newShip);
		}

		// Create empty board and mark ship positions
		const board = createEmptyBoard();
		for (const ship of ships) {
			// Mark each cell occupied by this ship
			for (let i = 0; i < ship.length; i++) {
				// Calculate cell position based on ship orientation
				const r = ship.isHorizontal ? ship.row : ship.row + i;
				const c = ship.isHorizontal ? ship.col + i : ship.col;
				board[r][c] = CELL_VALUES.SHIP; // Mark as ship cell
			}
		}

		return { board, ships };
	}

	/**
	 * Gets all valid adjacent cells around a given position for AI targeting
	 * Only returns cells that are within bounds and haven't been attacked yet
	 * @param row - Row coordinate of the center cell
	 * @param col - Column coordinate of the center cell
	 * @param board - Current game board state
	 * @returns Array of valid adjacent coordinates
	 */
	static getAdjacentCells(
		row: number,
		col: number,
		board: Board,
	): Coordinates[] {
		const adjacent: Coordinates[] = [];

		// Check all four directions (up, down, left, right)
		for (const dir of DIRECTIONS) {
			const newRow = row + dir.row;
			const newCol = col + dir.col;

			// Only include valid, unattacked cells
			if (
				isValidCoordinate(newRow, newCol) &&
				!hasBeenAttacked(board[newRow][newCol])
			) {
				adjacent.push({ row: newRow, col: newCol });
			}
		}

		return adjacent;
	}

	/**
	 * Determines if a hit cell belongs to a completely destroyed ship
	 * Used by AI to avoid targeting around already sunk ships
	 * @param row - Row coordinate to check
	 * @param col - Column coordinate to check
	 * @param ships - Array of all ships with their current hit status
	 * @returns true if the cell belongs to a destroyed ship
	 */
	static isHitFromDestroyedShip(
		row: number,
		col: number,
		ships: Ship[],
	): boolean {
		for (const ship of ships) {
			// Only check completely destroyed ships
			if (ship.hits < ship.length) continue;

			// Check if the given coordinates are part of this destroyed ship
			for (let i = 0; i < ship.length; i++) {
				const r = ship.isHorizontal ? ship.row : ship.row + i;
				const c = ship.isHorizontal ? ship.col + i : ship.col;
				if (r === row && c === col) {
					return true; // This hit belongs to a destroyed ship
				}
			}
		}
		return false; // Hit belongs to a ship that's still active
	}

	/**
	 * Advanced AI targeting system that uses pattern recognition and strategic targeting
	 * Implements a three-tier targeting strategy:
	 * 1. Pattern targeting - follows lines of hits to finish off ships
	 * 2. Adjacent targeting - targets cells next to isolated hits
	 * 3. Random targeting - fallback when no strategic targets available
	 * @param board - Current game board state
	 * @param ships - Array of ships with hit information
	 * @returns Coordinates for the AI's next attack
	 */
	static getSmartTarget(board: Board, ships: Ship[]): Coordinates {
		const validTargets: Coordinates[] = []; // Adjacent to isolated hits
		const patternTargets: Coordinates[] = []; // Following hit patterns

		// Single pass through the board to find strategic targets
		for (let row = 0; row < BOARD_SIZE; row++) {
			for (let col = 0; col < BOARD_SIZE; col++) {
				// Look for hit cells that belong to non-destroyed ships
				if (
					board[row][col] === CELL_VALUES.HIT &&
					!this.isHitFromDestroyedShip(row, col, ships)
				) {
					// Add adjacent cells for potential targeting
					const adjacentCells = this.getAdjacentCells(
						row,
						col,
						board,
					);
					validTargets.push(...adjacentCells);

					// Check for horizontal hit patterns (two or more consecutive hits)
					if (
						col < BOARD_SIZE - 1 &&
						board[row][col + 1] === CELL_VALUES.HIT &&
						!this.isHitFromDestroyedShip(row, col + 1, ships)
					) {
						// Target the left end of the horizontal line
						if (col > 0 && !hasBeenAttacked(board[row][col - 1])) {
							patternTargets.push({ row, col: col - 1 });
						}

						// Find the right end of the horizontal hit sequence
						let rightEnd = col + 1;
						while (
							rightEnd < BOARD_SIZE &&
							board[row][rightEnd] === CELL_VALUES.HIT &&
							!this.isHitFromDestroyedShip(row, rightEnd, ships)
						) {
							rightEnd++;
						}
						// Target the right end if it's valid
						if (
							rightEnd < BOARD_SIZE &&
							!hasBeenAttacked(board[row][rightEnd])
						) {
							patternTargets.push({ row, col: rightEnd });
						}
					}

					// Check for vertical hit patterns (two or more consecutive hits)
					if (
						row < BOARD_SIZE - 1 &&
						board[row + 1][col] === CELL_VALUES.HIT &&
						!this.isHitFromDestroyedShip(row + 1, col, ships)
					) {
						// Target the top end of the vertical line
						if (row > 0 && !hasBeenAttacked(board[row - 1][col])) {
							patternTargets.push({ row: row - 1, col });
						}

						// Find the bottom end of the vertical hit sequence
						let bottomEnd = row + 1;
						while (
							bottomEnd < BOARD_SIZE &&
							board[bottomEnd][col] === CELL_VALUES.HIT &&
							!this.isHitFromDestroyedShip(bottomEnd, col, ships)
						) {
							bottomEnd++;
						}
						// Target the bottom end if it's valid
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

		// Priority 1: Target pattern completions (most likely to hit)
		if (patternTargets.length > 0) {
			return patternTargets[
				Math.floor(Math.random() * patternTargets.length)
			];
		}

		// Priority 2: Target cells adjacent to isolated hits
		if (validTargets.length > 0) {
			return validTargets[
				Math.floor(Math.random() * validTargets.length)
			];
		}

		// Priority 3: Random targeting as fallback
		// Collect all unattacked cells
		const availableCells: Coordinates[] = [];
		for (let row = 0; row < BOARD_SIZE; row++) {
			for (let col = 0; col < BOARD_SIZE; col++) {
				if (!hasBeenAttacked(board[row][col])) {
					availableCells.push({ row, col });
				}
			}
		}

		// Return random cell, or default position if board is full
		return availableCells.length > 0
			? availableCells[Math.floor(Math.random() * availableCells.length)]
			: { row: 0, col: 0 };
	}

	/**
	 * Checks if all ships have been completely destroyed (game over condition)
	 * @param ships - Array of ships to check
	 * @returns true if all ships are destroyed, false if any ship remains
	 */
	static areAllShipsDestroyed(ships: Ship[]): boolean {
		// Check that every ship has been hit at least as many times as its length
		return ships.every((ship) => ship.hits >= ship.length);
	}
}
