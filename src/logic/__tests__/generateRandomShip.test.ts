import { GameLogic } from "../gameLogic";
import { BOARD_SIZE } from "../../constants";
import type { Ship } from "../../types";

describe("GameLogic.generateRandomShip", () => {
	const existingShips: Ship[] = [
		{ row: 2, col: 2, isHorizontal: true, length: 3, hits: 0 },
	];

	it("returns a ship within board boundaries", () => {
		const ship = GameLogic.generateRandomShip(3, []);
		const positions = Array.from({ length: ship.length }).map((_, i) => {
			return ship.isHorizontal
				? { row: ship.row, col: ship.col + i }
				: { row: ship.row + i, col: ship.col };
		});

		for (const { row, col } of positions) {
			expect(row).toBeGreaterThanOrEqual(0);
			expect(row).toBeLessThan(BOARD_SIZE);
			expect(col).toBeGreaterThanOrEqual(0);
			expect(col).toBeLessThan(BOARD_SIZE);
		}
	});

	it("does not generate a ship that collides with existing ships", () => {
		// Run multiple times to increase confidence
		for (let i = 0; i < 20; i++) {
			const newShip = GameLogic.generateRandomShip(3, existingShips);
			const doesCollide = GameLogic.doesShipCollide(
				existingShips,
				newShip,
			);
			expect(doesCollide).toBe(false);
		}
	});
});
