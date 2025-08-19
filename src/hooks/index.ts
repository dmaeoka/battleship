import { useState, useEffect, useCallback } from "react";
import { GameLogic } from "../logic/gameLogic";
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
import { Height } from '@mui/icons-material';

/**
 * Main game state management hook for Battleship game
 * Handles all game-related state including boards, ships, and game status
 * Provides functions for game initialization, reset, and message handling
 * @return playerBoard <Board>
 * @return computerBoard <Board>
 * @return playerShips <Ship[]>
 * @return computerShips <Ship[]>
 * @return gameStatus <GameStatus>
 * @return message <Message>
 * @return isSnackbarOpen boolean
 * @return setPlayerBoard
 * @return setComputerBoard
 * @return setPlayerShips
 * @return setComputerShips
 * @return setGameStatus
 * @return setMessage
 * @return initializeGame
 * @return resetGame
 * @return showMessage
 * @return hideSnackbar
 */
export const useGameState = () => {
	// Have the user seen the instructions?
	const [hasSeenInstructions, setHasSeenInstructions] = useState(() => {
		return localStorage.getItem("battleship-instructions-seen") === "true";
	});

	// Game board states - 2D arrays representing the grid
	const [playerBoard, setPlayerBoard] = useState<Board>([]); // Player's board with their ships
	const [computerBoard, setComputerBoard] = useState<Board>([]); // Computer's board with computer ships

	// Ship states - arrays of ship objects containing position and hit information
	const [computerShips, setComputerShips] = useState<Ship[]>([]); // Computer's ships data
	const [playerShips, setPlayerShips] = useState<Ship[]>([]); // Player's ships data

	// Game flow states
	const [gameStatus, setGameStatus] = useState<GameStatus>("setup"); // Current game phase
	const [message, setMessage] = useState<Message>(); // Current message to display
	const [isSnackbarOpen, setIsSnackbarOpen] = useState(false); // Snackbar visibility flag

	/**
	 * Initializes a new game by placing ships randomly on both boards
	 * Sets up the game state for active gameplay
	 */
	const initializeGame = useCallback(() => {
		// Generate random ship placements for both players
		const playerResult = GameLogic.placeShipsOnBoard();
		const computerResult = GameLogic.placeShipsOnBoard();

		// Update all game state to start fresh game
		setPlayerBoard(playerResult.board);
		setPlayerShips(playerResult.ships);
		setComputerBoard(computerResult.board);
		setComputerShips(computerResult.ships);
		setGameStatus("playing"); // Enable gameplay
		setMessage(undefined); // Clear any previous messages
		setIsSnackbarOpen(false); // Hide any notifications
	}, []);

	/**
	 * Resets the entire game state and starts a new game after a brief delay
	 * Clears all boards, ships, and messages before reinitializing
	 */
	const resetGame = useCallback(() => {
		// Clear all game state
		setPlayerBoard([]);
		setComputerBoard([]);
		setPlayerShips([]);
		setComputerShips([]);
		setGameStatus("setup"); // Return to setup phase
		setMessage(undefined);
		setIsSnackbarOpen(false);

		// Delay before starting new game for better UX
		setTimeout(() => {
			localStorage.setItem("battleship-instructions-seen", "false");
			setHasSeenInstructions(false);
			initializeGame();
		}, 1000);
	}, [initializeGame]);

	const closeDialog = useCallback(() => {
		localStorage.setItem("battleship-instructions-seen", "true");
		setHasSeenInstructions(true);
	}, []);

	/**
	 * Displays a message to the user via snackbar notification
	 * @param text - Message text to display
	 * @param type - Message severity type (success, error, warning, info)
	 */
	const showMessage = useCallback(
		(text: string, type: Message["type"] = "info") => {
			setMessage({ text, type });
			setIsSnackbarOpen(true); // Show the snackbar
		},
		[],
	);

	/**
	 * Hides the currently displayed snackbar message
	 */
	const hideSnackbar = useCallback(() => {
		setIsSnackbarOpen(false);
	}, []);

	return {
		// State values for components to read
		playerBoard,
		computerBoard,
		playerShips,
		computerShips,
		gameStatus,
		message,
		isSnackbarOpen,
		hasSeenInstructions,
		// State setters for direct manipulation
		setPlayerBoard,
		setComputerBoard,
		setPlayerShips,
		setComputerShips,
		setGameStatus,
		setMessage,
		// Game control functions
		initializeGame,
		resetGame,
		closeDialog,
		showMessage,
		hideSnackbar,
	};
};

/**
 * Input handling hook for coordinate entry and validation
 * Manages the coordinate input field and provides real-time target highlighting
 * @returns inputValue
 * @returns targetCoordinates
 * @returns handleInputChange
 * @returns clearInput
 */
export const useInputHandler = () => {
	// Current input field value
	const [inputValue, setInputValue] = useState("");
	// Parsed coordinates for highlighting
	const [targetCoordinates, setTargetCoordinates] =
		useState<Coordinates | null>(null);

	/**
	 * Handles changes to the coordinate input field
	 * Validates format in real-time and updates target highlighting
	 */
	const handleInputChange = useCallback(
		(event: React.ChangeEvent<HTMLInputElement>) => {
			console.log(event);
			// Convert to uppercase and limit to 3 characters (e.g., "A10")
			let value = event.target.value.toUpperCase();
			if (value.length > 3) {
				value = value.slice(0, 3); // Prevent overly long input
			}
			setInputValue(value);

			// Check if input matches valid coordinate pattern (A1, B5, J10, etc.)
			const isValidFormat = VALID_COORDINATE_PATTERN.test(value);

			if (isValidFormat) {
				// Convert valid input to grid coordinates for highlighting
				const coordinates = convertToCoordinates(value);

				setTargetCoordinates(coordinates);
			} else {
				// Clear highlighting for invalid input
				setTargetCoordinates(null);
			}
		},
		[],
	);

	/**
	 * Clears the input field and removes target highlighting
	 * Typically called after a successful attack
	 */
	const clearInput = useCallback(() => {
		setInputValue("");
		setTargetCoordinates(null);
	}, []);

	return {
		inputValue, // Current input field value
		targetCoordinates, // Coordinates to highlight on board (or null)
		handleInputChange, // Input change handler
		clearInput, // Function to clear input
	};
};

/**
 * Custom hook
 * Attack handling hook that manages combat logic for both player and computer
 * Handles hit detection, ship sinking, game over conditions, and turn management
 * @param {Board} playerBoard
 * @param {Board} computerBoard
 * @param {Ship[]} playerShips
 * @param {Ship[]} computerShips
 * @param {GameStatus} gameStatus
 * @param {Board} setPlayerBoard
 * @param {Board} setComputerBoard
 * @param {Ship[]} setPlayerShips
 * @param {Ship[]} setComputerShips
 * @param {GameStatus} setGameStatus
 * @param {Message} setMessage
 * @param {string, Message} showMessage
 * @returns The attack function
 */
export const useAttackHandler = (
	// Game state dependencies
	playerBoard: Board,
	computerBoard: Board,
	playerShips: Ship[],
	computerShips: Ship[],
	gameStatus: GameStatus,
	// State setters
	setPlayerBoard: (board: Board) => void,
	setComputerBoard: (board: Board) => void,
	setPlayerShips: (ships: Ship[]) => void,
	setComputerShips: (ships: Ship[]) => void,
	setGameStatus: (status: GameStatus) => void,
	setMessage: (message: Message | undefined) => void,
	showMessage: (text: string, type: Message["type"]) => void,
) => {
	/**
	 * Executes an attack on the specified coordinates
	 * Handles hit detection, ship damage, game over checks, and computer AI turns
	 */
	const attack = useCallback(
		({ attacker, row, col }: AttackParams) => {
			// Only allow attacks during active gameplay
			if (gameStatus !== "playing") return;

			// Determine which board and ships are being attacked
			const isPlayer = attacker === "player";
			const targetBoard = isPlayer ? computerBoard : playerBoard;
			const targetShips = isPlayer ? computerShips : playerShips;

			// Prevent attacking the same cell twice
			if (hasBeenAttacked(targetBoard[row][col])) return;

			// Create copies of board and ships for immutable updates
			const newBoard = targetBoard.map((row) => [...row]);
			const newShips = targetShips.map((ship) => ({ ...ship }));
			let hit = false;
			let hitShip: Ship | null = null;

			// Check if attack hits any ship by comparing coordinates
			for (const ship of newShips) {
				for (let i = 0; i < ship.length; i++) {
					// Calculate cell position based on ship orientation
					const r = ship.isHorizontal ? ship.row : ship.row + i;
					const c = ship.isHorizontal ? ship.col + i : ship.col;

					// Check if attack coordinates match ship position
					if (r === row && c === col) {
						hit = true;
						ship.hits++; // Increment hit counter for this ship
						hitShip = ship;
						break;
					}
				}
				if (hit) break; // Stop searching once we find a hit
			}

			// Update the board cell based on hit or miss
			newBoard[row][col] = hit ? CELL_VALUES.HIT : CELL_VALUES.MISS;

			// Generate appropriate message based on attack result
			let message = "";
			let messageType: Message["type"] = "info";

			if (hit && hitShip) {
				// Ship was hit - check if it's completely destroyed
				const isShipSunk = hitShip.hits >= hitShip.length;

				if (isShipSunk) {
					// Ship is completely destroyed
					const shipType =
						hitShip.length === 5 ? "BATTLESHIP" : "DESTROYER";
					message = isPlayer
						? `${shipType} sunk!`
						: `Your ${shipType} was sunk!`;
					messageType = isPlayer ? "success" : "error";
				} else {
					// Ship hit but still has remaining parts
					message = isPlayer
						? "You hit a ship!"
						: "Computer hit your ship!";
					messageType = isPlayer ? "success" : "error";
				}
			} else {
				// Attack missed - no ship at this location
				message = isPlayer ? "You missed." : "Computer missed.";
				messageType = "info";
			}

			// Update game state with new board and ship data
			if (isPlayer) {
				setComputerBoard(newBoard);
				setComputerShips(newShips);
			} else {
				setPlayerBoard(newBoard);
				setPlayerShips(newShips);
			}

			// Display attack result message
			showMessage(message, messageType);

			// Check if all ships are destroyed (game over condition)
			if (GameLogic.areAllShipsDestroyed(newShips)) {
				setGameStatus("game over");
				setMessage({
					text: attacker === "player" ? "You won!" : "Computer won!",
					type: "info",
				});
			} else if (isPlayer) {
				// Player's turn is over - schedule computer's turn
				setTimeout(() => {
					// Use AI to determine computer's next target
					const target = GameLogic.getSmartTarget(
						playerBoard,
						playerShips,
					);
					// Execute computer's attack
					attack({
						attacker: "computer",
						row: target.row,
						col: target.col,
					});
				}, GAME_CONFIG.COMPUTER_ATTACK_DELAY); // Delay for better UX
			}
		},
		[
			// Dependencies for the attack function
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
			setMessage,
			showMessage,
		],
	);

	return { attack };
};

export function useLocalStorage<T>(key: string, initialValue: T):[T, (value: T) => void] {
	const [storedValue, setStoredValue] = useState<T>(() => {
		const item = window.localStorage.getItem(key);
		return item ? JSON.parse(item) : initialValue;
	})
	const setValue = (value: T): void => {
		setStoredValue(value);
		window.localStorage.setItem(key, JSON.stringify(value));
	}

	return [
		storedValue,
		setValue
	];
}

export function useDebounce<T>(value: T, delay = 500): T {
	const [debouncedValue, setDebouncedValue] = useState<T>(value);

	useEffect(() => {
		const timer = window.setTimeout(() => {
			setDebouncedValue(value);
		}, delay);

		return () => {
			window.clearTimeout(timer);
		}
	},[value, delay]);

	return debouncedValue;
}

interface WindowSize {
	width: number | null;
	height: number | null;
}

export const useWindowSize = (): WindowSize => {
	const [windowSize, setWindowSize] = useState<WindowSize>({
		width: null,
		height: null,
	});

	useEffect(() => {
		function handleResize() {
			setWindowSize({
				width: window.innerWidth,
				height: window.innerHeight,
			});
		}
		handleResize();
		window.addEventListener('resize', handleResize);
		return () => window.removeEventListener('resize', handleResize);
	}, []);

	return windowSize;
}
