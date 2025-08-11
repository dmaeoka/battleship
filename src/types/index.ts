import type { SnackbarCloseReason } from "@mui/material/Snackbar";

type ShipType = "BATTLESHIP" | "DESTROYER";
export interface Ship {
	row: number;
	col: number;
	isHorizontal: boolean;
	hits: number;
	length: number;
	type?: ShipType;
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
	text: string;
	type: "success" | "error" | "info" | "warning";
}

export interface GameBoardProps {
	board: Board;
	title: string;
	isComputerBoard?: boolean;
	targetCoordinates?: Coordinates | null;
}

export interface CoordinateInputProps {
	inputValue: string;
	onInputChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
	onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
}

export type GameStatus = "setup" | "playing" | "game over";

export type CellValue = 0 | 1 | 2 | 3; // 0: empty, 1: ship, 2: miss, 3: hit

export type Board = CellValue[][];

export interface GameSnackbarProps {
	isOpen: boolean;
	message: Message | null | undefined;
	onClose?: (
		event: React.SyntheticEvent | Event,
		reason?: SnackbarCloseReason,
	) => void;
}

export interface GameDialogProps {
	isOpen: boolean;
	title?: string;
	children?: React.ReactNode | string;
	button: string;
	onClose: () => void;
}
