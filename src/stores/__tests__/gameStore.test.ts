import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { GAME_CONFIG } from "../../constants";
import { GameLogic } from "../../logic/gameLogic";
import type { Ship } from "../../types";
import { useGameStore } from "../gameStore";

// Mock the game logic module to control its behavior in tests
vi.mock("../../logic/gameLogic", () => ({
	GameLogic: {
		placeShipsOnBoard: vi.fn(),
		areAllShipsDestroyed: vi.fn(),
		getSmartTarget: vi.fn(),
	},
}));

// Mock localStorage since it's a browser API not available in Node
const localStorageMock = (() => {
	let store: Record<string, string> = {};
	return {
		getItem: (key: string) => store[key] || null,
		setItem: (key: string, value: string) => {
			store[key] = value.toString();
		},
		clear: () => {
			store = {};
		},
		removeItem: (key: string) => {
			delete store[key];
		},
	};
})();

Object.defineProperty(window, "localStorage", {
	value: localStorageMock,
});

describe("useGameStore", () => {
	// Save the initial state to reset to before each test
	const initialStoreState = useGameStore.getState();

	// Reset store, mocks, and timers before each test
	beforeEach(() => {
		vi.useFakeTimers(); // Allows us to control setTimeout
		useGameStore.setState(initialStoreState, true);
		vi.clearAllMocks();
		localStorageMock.clear();
	});

	afterEach(() => {
		vi.useRealTimers(); // Clean up fake timers
		vi.restoreAllMocks(); // Restore any spies or mocks
	});

	it("should have correct initial state", () => {
		const state = useGameStore.getState();

		expect(state.playerBoard).toEqual([]);
		expect(state.computerBoard).toEqual([]);
		expect(state.playerShips).toEqual([]);
		expect(state.computerShips).toEqual([]);
		expect(state.gameStatus).toBe("setup");
		expect(state.message).toBe(null);
		expect(state.isSnackbarOpen).toBe(false);
		// This works because our mocked localStorage is cleared in beforeEach
		expect(state.hasSeenInstructions).toBe(false);
		expect(state.inputValue).toBe("");
		expect(state.targetCoordinates).toBe(null);
	});

	describe("initializeGame", () => {
		it('should place ships and set game status to "playing"', () => {
			const mockBoard = Array(10)
				.fill(0)
				.map(() => Array(10).fill(0));
			const mockShips: Ship[] = [
				{
					type: "Battleship",
					length: 5,
					hits: 0,
					row: 0,
					col: 0,
					isHorizontal: true,
				},
			];

			(GameLogic.placeShipsOnBoard as vi.Mock).mockReturnValue({
				board: mockBoard,
				ships: mockShips,
			});

			useGameStore.getState().initializeGame();

			const state = useGameStore.getState();
			expect(GameLogic.placeShipsOnBoard).toHaveBeenCalledTimes(2);
			expect(state.playerBoard).toEqual(mockBoard);
			expect(state.playerShips).toEqual(mockShips);
			expect(state.computerBoard).toEqual(mockBoard);
			expect(state.computerShips).toEqual(mockShips);
			expect(state.gameStatus).toBe("playing");
		});
	});

	describe("resetGame", () => {
		it("should reset the game state and re-initialize", () => {
			// Setup an initial "played" state
			useGameStore.setState({
				gameStatus: "game over",
				inputValue: "A1",
			});
			const initializeGameSpy = vi.spyOn(
				useGameStore.getState(),
				"initializeGame",
			);

			useGameStore.getState().resetGame();

			// Check intermediate state before timeout
			let state = useGameStore.getState();
			expect(state.gameStatus).toBe("setup");
			expect(state.inputValue).toBe("");

			// Fast-forward timers to execute the setTimeout
			vi.runAllTimers();

			// Check final state
			state = useGameStore.getState();
			expect(localStorage.getItem("battleship-instructions-seen")).toBe(
				"false",
			);
			expect(state.hasSeenInstructions).toBe(false);
			expect(initializeGameSpy).toHaveBeenCalled();
		});
	});

	describe("attack", () => {
		beforeEach(() => {
			// Setup a game in 'playing' state with a known ship layout
			const mockBoard = Array(10)
				.fill(0)
				.map(() => Array(10).fill(0));
			const computerShips: Ship[] = [
				{
					type: "Destroyer",
					length: 4,
					hits: 0,
					row: 0,
					col: 0,
					isHorizontal: true,
				},
			];
			// Place the ship on the board
			mockBoard[0][0] = 1;
			mockBoard[0][1] = 1;
			mockBoard[0][2] = 1;
			mockBoard[0][3] = 1;

			useGameStore.setState({
				gameStatus: "playing",
				computerBoard: mockBoard,
				computerShips: JSON.parse(JSON.stringify(computerShips)), // Deep copy to prevent test interference
				playerBoard: Array(10)
					.fill(0)
					.map(() => Array(10).fill(0)),
				playerShips: [],
			});
		});

		it("should register a player hit and not trigger computer turn if game over", () => {
			(GameLogic.areAllShipsDestroyed as vi.Mock).mockReturnValue(true);

			useGameStore.getState().attack("player", 0, 0);

			const state = useGameStore.getState();
			expect(state.computerBoard[0][0]).toBe(3); // 3 = HIT
			expect(state.computerShips[0].hits).toBe(1);
			expect(state.message?.text).toContain("Congratulations! You won!");
			expect(state.gameStatus).toBe("game over");

			// Ensure computer turn is not scheduled by advancing timer
			vi.advanceTimersByTime(GAME_CONFIG.COMPUTER_ATTACK_DELAY);
			expect(GameLogic.getSmartTarget).not.toHaveBeenCalled();
		});

		it("should register a player miss and trigger computer turn", () => {
			(GameLogic.areAllShipsDestroyed as vi.Mock).mockReturnValue(false);
			(GameLogic.getSmartTarget as vi.Mock).mockReturnValue({
				row: 5,
				col: 5,
			});

			useGameStore.getState().attack("player", 1, 1); // Attack an empty cell

			let state = useGameStore.getState();
			expect(state.computerBoard[1][1]).toBe(2); // 2 = MISS
			expect(state.message?.text).toBe("You missed.");

			// Fast-forward for computer's turn
			vi.runAllTimers();

			state = useGameStore.getState();
			expect(GameLogic.getSmartTarget).toHaveBeenCalled();
			expect(state.playerBoard[5][5]).toBe(2); // Computer missed
			expect(state.message?.text).toBe("Computer missed.");
		});

		it("should sink a ship and show the correct message", () => {
			const shipToSink: Ship = {
				type: "Destroyer",
				length: 2,
				hits: 1, // One hit away from sinking
				row: 0,
				col: 0,
				isHorizontal: true,
			};
			useGameStore.setState({ computerShips: [shipToSink] });
			(GameLogic.areAllShipsDestroyed as vi.Mock).mockReturnValue(false);

			useGameStore.getState().attack("player", 0, 1); // The final hit

			const state = useGameStore.getState();
			expect(state.computerShips[0].hits).toBe(2);
			expect(state.message?.text).toBe("Destroyer sunk!");
			expect(state.message?.type).toBe("success");
		});

		it("should not allow attacking the same cell twice", () => {
			useGameStore.getState().attack("player", 1, 1); // First miss
			const messageAfterFirstAttack = useGameStore.getState().message;

			useGameStore.getState().attack("player", 1, 1); // Second attempt
			const messageAfterSecondAttack = useGameStore.getState().message;

			// The message should not have changed, because the action should have returned early.
			expect(messageAfterFirstAttack).toBe(messageAfterSecondAttack);
		});
	});

	describe("handlePlayerAttack", () => {
		beforeEach(() => {
			// Set up a minimal 'playing' state for these tests
			useGameStore.setState({
				gameStatus: "playing",
				computerBoard: Array(10)
					.fill(0)
					.map(() => Array(10).fill(0)),
			});
		});

		it("should register an attack on valid input and clear the input", () => {
			useGameStore.getState().handlePlayerAttack("A1");

			const state = useGameStore.getState();
			// Check that the attack was processed (A1 is a miss on an empty board)
			expect(state.computerBoard[0][0]).toBe(2); // 2 = MISS
			// Check that the input was cleared
			expect(state.inputValue).toBe("");
		});

		it("should show an error message for invalid coordinates", () => {
			useGameStore.getState().handlePlayerAttack("Z99");

			const state = useGameStore.getState();
			expect(state.message?.text).toBe("Invalid coordinates.");
			expect(state.message?.type).toBe("error");
			expect(state.isSnackbarOpen).toBe(true);
		});

		it("should show a warning message for an already attacked cell", () => {
			// Mark A1 as already attacked (2 = MISS)
			useGameStore.setState((draft) => {
				draft.computerBoard[0][0] = 2;
			});

			useGameStore.getState().handlePlayerAttack("A1");

			const state = useGameStore.getState();
			expect(state.message?.text).toBe("You already attacked this cell.");
			expect(state.message?.type).toBe("warning");
		});
	});

	describe("UI and Input Actions", () => {
		it("setInput should update the inputValue", () => {
			useGameStore.getState().setInput("B2");
			expect(useGameStore.getState().inputValue).toBe("B2");
		});

		it("clearInput should reset the inputValue", () => {
			useGameStore.setState({ inputValue: "C3" });
			useGameStore.getState().clearInput();
			expect(useGameStore.getState().inputValue).toBe("");
		});

		it("showMessage should set message and open snackbar", () => {
			useGameStore.getState().showMessage("Test message", "success");
			const state = useGameStore.getState();
			expect(state.message).toEqual({
				text: "Test message",
				type: "success",
			});
			expect(state.isSnackbarOpen).toBe(true);
		});

		it("hideSnackbar should close the snackbar", () => {
			useGameStore.setState({ isSnackbarOpen: true });
			useGameStore.getState().hideSnackbar();
			expect(useGameStore.getState().isSnackbarOpen).toBe(false);
		});

		it("closeDialog should set hasSeenInstructions and update localStorage", () => {
			useGameStore.getState().closeDialog();
			const state = useGameStore.getState();
			expect(state.hasSeenInstructions).toBe(true);
			expect(localStorage.getItem("battleship-instructions-seen")).toBe(
				"true",
			);
		});
	});
});
