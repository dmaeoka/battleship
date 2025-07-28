import { useEffect, useCallback } from "react";
import type { SnackbarCloseReason } from "@mui/material/Snackbar";
import {
	Container,
	Grid,
	Typography,
} from "@mui/material";
import { useGameState, useInputHandler, useAttackHandler } from "../hooks";
import { GameBoard, CoordinateInput, GameSnackbar, GameOverDialog } from "./components";
import { convertToCoordinates, hasBeenAttacked } from "../utils";

/**
 * Main Battleship game component that renders the complete game interface
 * Renders the boards and handles the user coordinates and display status
 */
function Battleship() {
	// Load the hooks from gameState
	const {
		playerBoard,        // Player's board with ships and attacks
		computerBoard,      // Computer's board with ships and attacks
		playerShips,        // The collection of player's ship with positions and their status
		computerShips,      // The collection of computer's ship with positions and their status
		gameStatus,         // Current game state: "setup" | "playing" | "game over"
		message,            // Toast message for the user
		isSnackbarOpen,     // Check if snackbar is open
		setPlayerBoard,     // Set function to update player's board state
		setComputerBoard,   // Set function to update computer's board state
		setPlayerShips,     // Set function to update player's ships state
		setComputerShips,   // Set function to update computer's ships state
		setGameStatus,      // Set function to update game status
		setMessage,         // Set function to set message content and type
		initializeGame,     // Set function to set up a new game with random ship placement
		resetGame,          // Set function to restart the game completely
		showMessage,        // Set function to display a message in the snackbar
		hideSnackbar,       // Set function to hide the snackbar notification
	} = useGameState();

	// Input handling hook - manages coordinate input field state and validation
	const {
		inputValue,         // Raw value in the coordinate input field
		targetCoordinates,  // Parsed coordinates values from input (for highlighting on board)
		handleInputChange,  // Function to handle input field changes
		clearInput          // Function to clear the input field
	} = useInputHandler();

	// Attack handling hook - manages attack logic for both player and computer
	const { attack } = useAttackHandler(
		playerBoard,
		computerBoard,
		playerShips,
		computerShips,
		gameStatus,
		setPlayerBoard,
		setComputerBoard,
		setPlayerShips,
		setComputerShips,
		setGameStatus,
		setMessage,
		showMessage,
	);

	/**
	 * Handles player attack submission from the coordinate input form using useCallback to store the function
	 * Validates coordinates, checks for duplicate attacks, and executes the attack
	 */
	const handlePlayerAttack = useCallback(
		(e: React.FormEvent<HTMLFormElement>): void => {
			e.preventDefault(); // Prevent form from refreshing the page

			// Convert user input (e.g., "A5") to grid coordinates (e.g., {row: 0, col: 4})
			const coords = convertToCoordinates(inputValue);
			clearInput(); // Clear input field immediately after submission

			// Validate that coordinates are in correct format
			if (!coords) {
				showMessage("Invalid coordinates.", "error");
				return;
			}

			const { row, col } = coords;

			// Check if this cell has already been attacked to prevent duplicate attacks
			if (hasBeenAttacked(computerBoard[row][col])) {
				showMessage("You already attacked this cell.", "warning");
			} else {
				// Execute the attack on the computer's board
				attack({ attacker: "player", row, col });
			}
		},
		[inputValue, computerBoard, clearInput, showMessage, attack],
	);

	/**
	 * Handles snackbar close events
	 * Prevents closing when user clicks away but allows manual close
	 */
	const handleSnackbarClose = useCallback(
		(
			_e: React.SyntheticEvent | Event,
			reason?: SnackbarCloseReason,
		) => {
			// Don't close snackbar if user just clicked elsewhere
			if (reason === "clickaway") return;
			hideSnackbar();
		},
		[hideSnackbar],
	);

	// Initialize the game when component first mounts
	useEffect(() => {
		initializeGame();
	}, [initializeGame]);

	return (
		<Container maxWidth="md">
			{/* Game Title */}
			<Grid container spacing={2}>
				<Grid size={12}>
					<Typography
						variant="h2"
						textAlign="center"
						sx={{ fontWeight: "bold" }}
					>
						Battleship Game
					</Typography>
				</Grid>
			</Grid>

			{/* Coordinate Input Section - Only shown during active gameplay */}
			{gameStatus === "playing" && (
				<Grid
					container
					spacing={2}
					direction="row"
					sx={{
						justifyContent: "center",
						alignItems: "center",
						mb: 4,
					}}
				>
					<CoordinateInput
						inputValue={inputValue}
						onInputChange={handleInputChange}
						onSubmit={handlePlayerAttack}
					/>
				</Grid>
			)}

			{/* Game Boards Section - Player board on left, computer board on right */}
			<Grid container spacing={4}>
				{/* Player's Board - Shows player's ships and computer's attacks */}
				<Grid size={{ xs: 12, md: 6 }} data-testid="player-board">
					<GameBoard
						board={playerBoard}
						title="Your Board"
						isComputerBoard={false}
					/>
				</Grid>

				{/* Computer's Board - Shows player's attacks, hides computer ships */}
				<Grid size={{ xs: 12, md: 6 }} data-testid="computer-board">
					<GameBoard
						board={computerBoard}
						title="Computer's Board"
						isComputerBoard={true}
						targetCoordinates={targetCoordinates} // Highlights target cell
					/>
				</Grid>
			</Grid>

			{/* Snackbar for temporary notifications */}
			<GameSnackbar
				isOpen={isSnackbarOpen}
				message={message}
				onClose={handleSnackbarClose}
			/>

			{/* Game Over Dialog */}
			<GameOverDialog
				isOpen={gameStatus === "game over"}
				message={message}
				onClose={resetGame}
			/>
		</Container>
	);
}

export default Battleship;
