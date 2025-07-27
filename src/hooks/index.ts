// hooks.ts
import { useState, useCallback } from "react";
import { GameLogic } from "../gameLogic";
import { convertToCoordinates, hasBeenAttacked } from "../utils";
import {
	CELL_VALUES,
	GAME_CONFIG,
	VALID_COORDINATE_PATTERN,
} from "../constants";
import type {
	Board,
	Ship,
	GameStatus,
	Message,
	AttackParams,
	Coordinates,
} from "../types";

export const useGameState = () => {
	const [playerBoard, setPlayerBoard] = useState<Board>([]);
	const [computerBoard, setComputerBoard] = useState<Board>([]);
	const [computerShips, setComputerShips] = useState<Ship[]>([]);
	const [playerShips, setPlayerShips] = useState<Ship[]>([]);
	const [gameStatus, setGameStatus] = useState<GameStatus>("setup");
	const [message, setMessage] = useState<Message>();
	const [isSnackbarOpen, setIsSnackbarOpen] = useState(false);

	const initializeGame = useCallback(() => {
		const playerResult = GameLogic.placeShipsOnBoard();
		const computerResult = GameLogic.placeShipsOnBoard();

		setPlayerBoard(playerResult.board);
		setPlayerShips(playerResult.ships);
		setComputerBoard(computerResult.board);
		setComputerShips(computerResult.ships);
		setGameStatus("playing");
		setMessage(undefined);
		setIsSnackbarOpen(false);
	}, []);

	const resetGame = useCallback(() => {
		setPlayerBoard([]);
		setComputerBoard([]);
		setPlayerShips([]);
		setComputerShips([]);
		setGameStatus("setup");
		setMessage(undefined);
		setIsSnackbarOpen(false);

		setTimeout(() => {
			initializeGame();
		}, 1000);
	}, [initializeGame]);

	const showMessage = useCallback((text: string, type: Message["type"]) => {
		setMessage({ text, type, open: true });
		setIsSnackbarOpen(true);
	}, []);

	const hideSnackbar = useCallback(() => {
		setIsSnackbarOpen(false);
	}, []);

	return {
		// State
		playerBoard,
		computerBoard,
		playerShips,
		computerShips,
		gameStatus,
		message,
		isSnackbarOpen,
		// Actions
		setPlayerBoard,
		setComputerBoard,
		setPlayerShips,
		setComputerShips,
		setGameStatus,
		initializeGame,
		resetGame,
		showMessage,
		hideSnackbar,
	};
};

export const useInputHandler = () => {
	const [inputValue, setInputValue] = useState("");
	const [targetCoordinates, setTargetCoordinates] =
		useState<Coordinates | null>(null);

	const handleInputChange = useCallback(
		(event: React.ChangeEvent<HTMLInputElement>) => {
			let value = event.target.value.toUpperCase();
			if (value.length > 3) {
				value = value.slice(0, 3);
			}
			setInputValue(value);

			const isValidFormat = VALID_COORDINATE_PATTERN.test(value);
			if (isValidFormat) {
				const coordinates = convertToCoordinates(value);
				setTargetCoordinates(coordinates);
			} else {
				setTargetCoordinates(null);
			}
		},
		[],
	);

	const clearInput = useCallback(() => {
		setInputValue("");
		setTargetCoordinates(null);
	}, []);

	return {
		inputValue,
		targetCoordinates,
		handleInputChange,
		clearInput,
	};
};

export const useAttackHandler = (
	playerBoard: Board,
	computerBoard: Board,
	playerShips: Ship[],
	computerShips: Ship[],
	gameStatus: GameStatus,
	setPlayerBoard: (board: Board) => void,
	setComputerBoard: (board: Board) => void,
	setPlayerShips: (ships: Ship[]) => void,
	setComputerShips: (ships: Ship[]) => void,
	setGameStatus: (status: GameStatus) => void,
	showMessage: (text: string, type: Message["type"]) => void,
) => {
	const attack = useCallback(
		({ attacker, row, col }: AttackParams) => {
			if (gameStatus !== "playing") return;

			const isPlayer = attacker === "player";
			const targetBoard = isPlayer ? computerBoard : playerBoard;
			const targetShips = isPlayer ? computerShips : playerShips;

			// Check if cell already attacked
			if (hasBeenAttacked(targetBoard[row][col])) return;

			// Create new board and ships arrays
			const newBoard = targetBoard.map((row) => [...row]);
			const newShips = targetShips.map((ship) => ({ ...ship }));
			let hit = false;

			// Check for hit
			for (const ship of newShips) {
				for (let i = 0; i < ship.length; i++) {
					const r = ship.isHorizontal ? ship.row : ship.row + i;
					const c = ship.isHorizontal ? ship.col + i : ship.col;
					if (r === row && c === col) {
						hit = true;
						ship.hits++;
						break;
					}
				}
				if (hit) break;
			}

			// Update board
			newBoard[row][col] = hit ? CELL_VALUES.HIT : CELL_VALUES.MISS;

			// Update state
			if (isPlayer) {
				setComputerBoard(newBoard);
				setComputerShips(newShips);
				showMessage(
					hit ? "You hit a ship!" : "You missed.",
					hit ? "success" : "info",
				);
			} else {
				setPlayerBoard(newBoard);
				setPlayerShips(newShips);
				showMessage(
					hit ? "Computer hit your ship!" : "Computer missed.",
					hit ? "error" : "info",
				);
			}

			// Check for game over
			if (GameLogic.areAllShipsDestroyed(newShips)) {
				setGameStatus("game over");
				showMessage(
					attacker === "player" ? "You won!" : "Computer won!",
					"success",
				);
			} else if (isPlayer) {
				// Schedule computer turn
				setTimeout(() => {
					const target = GameLogic.getSmartTarget(
						playerBoard,
						playerShips,
					);
					attack({
						attacker: "computer",
						row: target.row,
						col: target.col,
					});
				}, GAME_CONFIG.COMPUTER_ATTACK_DELAY);
			}
		},
		[
			gameStatus,
			computerBoard,
			playerBoard,
			computerShips,
			playerShips,
			setComputerBoard,
			setPlayerBoard,
			setComputerShips,
			setPlayerShips,
			setGameStatus,
			showMessage,
		],
	);

	return { attack };
};
