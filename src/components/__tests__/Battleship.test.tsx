import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useGameStore } from "../../stores/gameStore";
import Battleship from "../Battleship";

// Get the initial state to reset the store before each test
const initialStoreState = useGameStore.getState();

describe("Battleship Component", () => {
	beforeEach(() => {
		// Reset the store to its default state
		useGameStore.setState(initialStoreState, true);
		// Spy on the initializeGame action to prevent its full execution
		// during component tests, as it's already tested separately.
		vi.spyOn(useGameStore.getState(), "initializeGame").mockImplementation(
			() => {},
		);
	});

	afterEach(() => {
		// Clear all mocks and restore original implementations
		vi.restoreAllMocks();
	});

	it("should call initializeGame on mount and render boards", () => {
		const initializeGameSpy = useGameStore.getState().initializeGame;
		render(<Battleship />);
		expect(initializeGameSpy).toHaveBeenCalledTimes(1);

		// Check for board titles, which is more user-centric than test-ids
		expect(screen.getByText("Your Board")).toBeInTheDocument();
		expect(screen.getByText("Computer's Board")).toBeInTheDocument();
	});

	it("should show the instructions dialog initially and close it on button click", async () => {
		const user = userEvent.setup();
		const closeDialogSpy = vi.spyOn(useGameStore.getState(), "closeDialog");
		useGameStore.setState({ hasSeenInstructions: false });

		render(<Battleship />);

		// The dialog should be visible
		const dialogTitle = screen.getByRole("heading", {
			name: /how to play/i,
		});
		expect(dialogTitle).toBeInTheDocument();

		// Click the button to close it
		const closeButton = screen.getByRole("button", { name: /let's play/i });
		await user.click(closeButton);

		// Assert that the close action was called
		expect(closeDialogSpy).toHaveBeenCalledTimes(1);
	});

	it("should not show the instructions dialog if it has been seen before", () => {
		useGameStore.setState({ hasSeenInstructions: true });
		render(<Battleship />);
		expect(
			screen.queryByRole("heading", { name: /how to play/i }),
		).not.toBeInTheDocument();
	});

	it("should show the game over dialog and call resetGame on button click", async () => {
		const user = userEvent.setup();
		const resetGameSpy = vi.spyOn(useGameStore.getState(), "resetGame");
		useGameStore.setState({
			gameStatus: "game over",
			message: { text: "You won!", type: "success" },
		});

		render(<Battleship />);

		// Dialog and message should be visible
		expect(
			screen.getByRole("heading", { name: /game over/i }),
		).toBeInTheDocument();
		expect(screen.getByText(/you won!/i)).toBeInTheDocument();

		// Click the "Play Again" button
		const resetButton = screen.getByRole("button", { name: /play again/i });
		await user.click(resetButton);

		expect(resetGameSpy).toHaveBeenCalledTimes(1);
	});
});
