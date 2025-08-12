import { create } from "zustand";
import { devtools, subscribeWithSelector } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { useShallow } from "zustand/react/shallow";
import { GameLogic } from "../logic/gameLogic";
import { convertToCoordinates, hasBeenAttacked } from "../utils";
import { GAME_CONFIG } from "../constants";
import type {
	Board,
	Ship,
	GameStatus,
	Message,
	Coordinates,
	Player,
} from "../types";

interface GameState {
	// Core game state
	playerBoard: Board;
	computerBoard: Board;
	playerShips: Ship[];
	computerShips: Ship[];
	gameStatus: GameStatus;

	// UI state
	message: Message | null;
	isSnackbarOpen: boolean;
	hasSeenInstructions: boolean;

	// Input state
	inputValue: string;
	targetCoordinates: Coordinates | null;
}

interface GameActions {
	// Game actions
	initializeGame: () => void;
	resetGame: () => void;
	attack: (attacker: Player, row: number, col: number) => void;

	// UI actions
	showMessage: (text: string, type?: Message["type"]) => void;
	hideSnackbar: () => void;
	closeDialog: () => void;

	// Input actions
	setInput: (value: string) => void;
	clearInput: () => void;
	handlePlayerAttack: (inputValue: string) => void;
	setTargetCoordinates: (coordinates: Coordinates | null) => void;
}

type GameStore = GameState & GameActions;

export const useGameStore = create<GameStore>()(
	devtools(
		subscribeWithSelector(
			immer((set, get) => ({
				// Initial State
				playerBoard: [],
				computerBoard: [],
				playerShips: [],
				computerShips: [],
				gameStatus: "setup" as GameStatus,
				message: null,
				isSnackbarOpen: false,
				hasSeenInstructions:
					localStorage.getItem("battleship-instructions-seen") ===
						"true" || false,
				inputValue: "",
				targetCoordinates: null,

				// Game actions
				initializeGame: () => {
					try {
						const playerResult = GameLogic.placeShipsOnBoard();
						const compyterResult = GameLogic.placeShipsOnBoard();

						set((state) => {
							state.playerBoard = playerResult?.board;
							state.playerShips = playerResult?.ships;
							state.computerBoard = compyterResult?.board;
							state.computerShips = compyterResult?.ships;
							state.gameStatus = "playing";
							state.message = null;
							state.isSnackbarOpen = false;
						});
					} catch (error) {
						console.warn(error);
					}
				},
				resetGame: () => {
					try {
						set((state) => {
							state.playerBoard = [];
							state.playerShips = [];
							state.computerBoard = [];
							state.computerShips = [];
							state.gameStatus = "setup";
							state.message = null;
							state.isSnackbarOpen = false;
							state.inputValue = "";
							state.targetCoordinates = null;
						});

						setTimeout(() => {
							localStorage.setItem(
								"battleship-instructions-seen",
								"false",
							);

							set((state) => {
								state.hasSeenInstructions = false;
							});
							// Initialize the game
							get().initializeGame();
						}, 1000);
					} catch (error) {
						console.warn(error);
					}
				},
				attack: (attacker: Player, row: number, col: number) => {
					try {
						const state = get();
						if (state.gameStatus !== "playing") return;

						const isPlayer = attacker === "player";
						const targetBoard = isPlayer
							? state.computerBoard
							: state.playerBoard;
						if (hasBeenAttacked(targetBoard[row][col])) return;

						set((draft) => {
							const board = isPlayer
								? draft.computerBoard
								: draft.playerBoard;
							const ships = isPlayer
								? draft.computerShips
								: draft.playerShips;
							let hit = false;
							let hitShip: Ship | null = null;

							for (const ship of ships) {
								for (let i = 0; i < ship.length; i++) {
									const r = ship.isHorizontal
										? ship.row
										: ship.row + i;
									const c = ship.isHorizontal
										? ship.col + i
										: ship.col;
									if (r === row && c === col) {
										hit = true;
										ship.hits++;
										hitShip = ship;
										break;
									}
								}
								if (hit) break;
							}

							board[row][col] = hit ? 3 : 2; // HIT : MISS

							let message: string = "";
							let messageType: Message["type"] = "info";

							if (hit && hitShip) {
								const isShipSunk =
									hitShip.hits >= hitShip.length;
								const shipType = hitShip.type;
								if (isShipSunk) {
									message = isPlayer
										? `${shipType} sunk!`
										: `Your ${shipType} was sunk!`;
									messageType = isPlayer
										? "success"
										: "error";
								} else {
									message = isPlayer
										? "You hit the enemy ship!"
										: "Computer hit your ship!";
									messageType = isPlayer
										? "success"
										: "error";
								}
							} else {
								message = isPlayer
									? "You missed."
									: "Computer missed.";
								messageType = "info";
							}

							if (GameLogic.areAllShipsDestroyed(ships)) {
								draft.gameStatus = "game over";
								draft.message = {
									text:
										attacker === "player"
											? "Congratulations! You won!"
											: "Computer won!",
									type: "info",
								};
							} else {
								draft.message = {
									text: message,
									type: messageType,
								};
							}

							draft.isSnackbarOpen = true;
						});

						// Schedule computer turn if player attacked
						if (isPlayer && get().gameStatus === "playing") {
							setTimeout(() => {
								const currentState = get();
								const target = GameLogic.getSmartTarget(
									currentState.playerBoard,
									currentState.playerShips,
								);
								get().attack(
									"computer",
									target.row,
									target.col,
								);
							}, GAME_CONFIG.COMPUTER_ATTACK_DELAY);
						}
					} catch (error) {
						console.warn(error);
					}
				},
				showMessage: (text: string, type: Message["type"] = "info") => {
					try {
						set((state) => {
							state.message = {
								text,
								type,
							};
							state.isSnackbarOpen = true;
						});
					} catch (error) {
						console.warn(error);
					}
				},
				hideSnackbar: () => {
					try {
						set((state) => {
							state.isSnackbarOpen = false;
						});
					} catch (error) {
						console.warn(error);
					}
				},
				closeDialog: () => {
					try {
						localStorage.setItem(
							"battleship-instructions-seen",
							"true",
						);
						set((state) => {
							state.hasSeenInstructions = true;
						});
					} catch (error) {
						console.warn(error);
					}
				},
				setInput: (value: string) => {
					try {
						set((state) => {
							state.inputValue = value;
						});
					} catch (error) {
						console.warn(error);
					}
				},
				setTargetCoordinates: (coordinates: Coordinates | null) => {
					try {
						set((state) => {
							state.targetCoordinates = coordinates;
						});
					} catch (error) {
						console.warn(error);
					}
				},
				clearInput: () => {
					try {
						set((state) => {
							state.inputValue = "";
						});
					} catch (error) {
						console.warn(error);
					}
				},
				handlePlayerAttack: (inputValue: string) => {
					try {
						const coords = convertToCoordinates(inputValue);
						const {
							computerBoard,
							showMessage,
							attack,
							clearInput,
							setTargetCoordinates
						} = get();

						clearInput();

						setTargetCoordinates(null);

						if (!coords) {
							showMessage("Invalid coordinates.", "error");
							return;
						}
						const { row, col } = coords;

						if (hasBeenAttacked(computerBoard[row][col])) {
							showMessage(
								"You already attacked this cell.",
								"warning",
							);
						} else {
							attack("player", row, col);
						}
					} catch (error) {
						console.warn(error);
					}
				},
			})),
		),
		{ name: "battleship-store" },
	),
);

// Selectors for better performance
export const useGameState = () =>
	useGameStore(
		useShallow((state) => ({
			playerBoard: state.playerBoard,
			playerShips: state.playerShips,
			computerBoard: state.computerBoard,
			computerShips: state.computerShips,
			gameStatus: state.gameStatus,
		})),
	);

export const useUIState = () =>
	useGameStore(
		useShallow((state) => ({
			message: state.message,
			isSnackbarOpen: state.isSnackbarOpen,
			hasSeenInstructions: state.hasSeenInstructions,
		})),
	);

export const useInputState = () =>
	useGameStore(
		useShallow((state) => ({
			inputValue: state.inputValue,
			targetCoordinates: state.targetCoordinates,
		})),
	);

export const useGameActions = () =>
	useGameStore(
		useShallow((state) => ({
			initializeGame: state.initializeGame,
			resetGame: state.resetGame,
			attack: state.attack,
		})),
	);

export const useUIActions = () =>
	useGameStore(
		useShallow((state) => ({
			showMessage: state.showMessage,
			hideSnackbar: state.hideSnackbar,
			closeDialog: state.closeDialog,
		})),
	);

export const useInputActions = () =>
	useGameStore(
		useShallow((state) => ({
			setInput: state.setInput,
			clearInput: state.clearInput,
			handlePlayerAttack: state.handlePlayerAttack,
			setTargetCoordinates: state.setTargetCoordinates,
		})),
	);
