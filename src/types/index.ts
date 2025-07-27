// types.ts
export interface Ship {
	row: number;
	col: number;
	isHorizontal: boolean;
	hits: number;
	length: number;
}

export interface Coordinates {
	row: number;
	col: number;
}

export type Player = "player" | "computer";

export interface AttackParams {
	attacker: Player;
	row: number;
	col: number;
}

export interface Message {
	open: boolean;
	text: string;
	type: "success" | "error" | "info" | "warning";
}

export type GameStatus = "setup" | "playing" | "game over";

export type CellValue = 0 | 1 | 2 | 3; // 0: empty, 1: ship, 2: miss, 3: hit

export type Board = CellValue[][];
