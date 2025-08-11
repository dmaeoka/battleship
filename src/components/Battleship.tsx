import { useEffect } from "react";
import {
	Container,
	Grid,
	type SnackbarCloseReason,
	Typography,
} from "@mui/material";
import GameBoard from "./GameBoard";
import CoordinateInput from "./CoordinateInput";
import GameSnackbar from "./GameSnackbar";
import GameDialog from "./GameDialog";
import {
	useGameState,
	useUIState,
	useGameActions,
	useUIActions,
} from "../stores/gameStore";

function Battleship() {
	const { playerBoard, computerBoard, gameStatus } = useGameState();
	const { message, isSnackbarOpen, hasSeenInstructions } = useUIState();
	const { initializeGame, resetGame } = useGameActions();
	const { hideSnackbar, closeDialog } = useUIActions();

	useEffect(() => {
		initializeGame();
	}, [initializeGame]);

	const handleSnackbarClose = (
		_: React.SyntheticEvent | Event,
		reason?: SnackbarCloseReason,
	): void => {
		if (reason === "clickaway") return;
		hideSnackbar();
	};

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
					<CoordinateInput />
				</Grid>
			)}

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
					/>
				</Grid>
			</Grid>

			<GameSnackbar
				isOpen={isSnackbarOpen}
				message={message}
				onClose={handleSnackbarClose}
			/>

			<GameDialog
				title="Battleship Game - How to Play"
				isOpen={!hasSeenInstructions}
				onClose={closeDialog}
				button="Let's play"
			>
				<span>
					You are tasked to sink one Battleship (5 cells) and two
					Destroyers (4 cells each) on a 10×10 grid.
				</span>
				<ul>
					<li>
						Enter coordinates like A5 or J10 to attack (A–J for
						columns, 1–10 for rows).
					</li>
					<li>You'll get feedback: Hit, Miss, Sunk, or Game Over.</li>
					<li>
						Invalid input shows an error and highlights the cell.
					</li>
				</ul>
				<span>
					<strong>Good luck, Commander!</strong>
				</span>
			</GameDialog>

			<GameDialog
				title="Game Over"
				isOpen={gameStatus === "game over"}
				onClose={resetGame}
				button="Play Again"
			>
				{message?.text}
			</GameDialog>
		</Container>
	);
}

export default Battleship;
