import { GameLogic } from "../gameLogic";
import type { Ship } from "../../types";

describe("GameLogic.doesShipCollide", () => {
	const existingShips: Ship[] = [
		{ row: 1, col: 1, isHorizontal: true, length: 3, hits: 0 }, // occupies (1,1), (1,2), (1,3)
	];

	it("returns true if the new ship collides with existing ship", () => {
		const newShip: Ship = {
			row: 1,
			col: 2,
			isHorizontal: true,
			length: 2,
			hits: 0,
		}; // (1,2), (1,3)
		const result = GameLogic.doesShipCollide(existingShips, newShip);
		expect(result).toBe(true);
	});

	it("returns false if the new ship does not collide", () => {
		const newShip: Ship = {
			row: 3,
			col: 3,
			isHorizontal: true,
			length: 2,
			hits: 0,
		};
		const result = GameLogic.doesShipCollide(existingShips, newShip);
		expect(result).toBe(false);
	});
});
