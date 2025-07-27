// Battleship.tsx
import React, { useEffect, useCallback } from "react";
import type { SnackbarCloseReason } from "@mui/material/Snackbar";
import {
	Alert,
	Container,
	Button,
	Grid,
	Typography,
	Snackbar,
} from "@mui/material";
import { useGameState, useInputHandler, useAttackHandler } from "../hooks";
import { GameBoard, CoordinateInput } from "./components";
import { convertToCoordinates, hasBeenAttacked } from "../utils";
import { GAME_CONFIG } from "../constants";

function Battleship() {
	const {
		playerBoard,
		computerBoard,
		playerShips,
		computerShips,
		gameStatus,
		message,
		isSnackbarOpen,
		setPlayerBoard,
		setComputerBoard,
		setPlayerShips,
		setComputerShips,
		setGameStatus,
		initializeGame,
		resetGame,
		showMessage,
		hideSnackbar,
	} = useGameState();

	const { inputValue, targetCoordinates, handleInputChange, clearInput } =
		useInputHandler();

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
		showMessage,
	);

	const handlePlayerAttack = useCallback(
		(e: React.FormEvent<HTMLFormElement>): void => {
			e.preventDefault();
			const coords = convertToCoordinates(inputValue);
			clearInput();

			if (!coords) {
				showMessage("Invalid coordinates.", "error");
				return;
			}

			const { row, col } = coords;

			if (hasBeenAttacked(computerBoard[row][col])) {
				showMessage("You already attacked this cell.", "warning");
			} else {
				attack({ attacker: "player", row, col });
			}
		},
		[inputValue, computerBoard, clearInput, showMessage, attack],
	);

	const handleSnackbarClose = useCallback(
		(
			_event: React.SyntheticEvent | Event,
			reason?: SnackbarCloseReason,
		) => {
			if (reason === "clickaway") return;
			hideSnackbar();
		},
		[hideSnackbar],
	);

	// Initialize game on mount
	useEffect(() => {
		initializeGame();
	}, [initializeGame]);

	return (
		<Container maxWidth="md">
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
				<Grid size={12}>
					{gameStatus === "game over" && (
						<Button
							variant="contained"
							color="primary"
							size="small"
							sx={{ minWidth: "fit-content" }}
							onClick={resetGame}
						>
							Play Again
						</Button>
					)}
				</Grid>
			</Grid>

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

			<Grid container spacing={4}>
				<Grid size={{ xs: 12, md: 6 }}>
					<GameBoard
						board={playerBoard}
						title="Your Board"
						isComputerBoard={false}
					/>
				</Grid>
				<Grid size={{ xs: 12, md: 6 }}>
					<GameBoard
						board={computerBoard}
						title="Computer's Board"
						isComputerBoard={true}
						targetCoordinates={targetCoordinates}
					/>
				</Grid>
			</Grid>

			<Snackbar
				open={isSnackbarOpen}
				autoHideDuration={GAME_CONFIG.SNACKBAR_AUTO_HIDE_DURATION}
				onClose={handleSnackbarClose}
				anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
			>
				<Alert
					onClose={handleSnackbarClose}
					severity={message?.type}
					variant="filled"
				>
					{message?.text}
				</Alert>
			</Snackbar>
		</Container>
	);
}

export default Battleship;
