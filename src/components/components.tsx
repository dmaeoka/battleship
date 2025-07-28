import { useMemo } from "react";
import * as motion from "motion/react-client";
import {
	Box,
	Typography,
	InputLabel,
	TextField,
	Stack,
	Button,
	Alert,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	Snackbar,
} from "@mui/material";
import visuallyHidden from "@mui/utils/visuallyHidden";
import type {
	Board,
	GameBoardProps,
	CoordinateInputProps,
	GameSnackbarProps,
	GameDialogProps,
} from "../types";
import { getCellClass } from "../utils";
import { CELL_STYLE, GAME_CONFIG } from "../constants";

/**
 * Renders an individual cell component for the game board
 * @param {Board} board The game board data (2D array)
 * @param {number} row Row index of this cell
 * @param {number} col Column index of this cell
 * @param {boolean} isComputerBoard Whether this cell belongs to computer's board
 * @param {boolean} isTarget  Whether this cell is currently being targeted
 * @returns the react game cell
 */
const GameCell: React.FC<{
	board: Board;
	row: number;
	col: number;
	isComputerBoard: boolean;
	isTarget: boolean;
}> = ({ board, row, col, isComputerBoard, isTarget }) => {
	// Get the value at this cell position (empty, ship, hit, miss, etc.)
	const cellValue = board[row][col];

	// Determine CSS class based on cell value, board type, and target status
	const cellClass = getCellClass(cellValue, isComputerBoard, isTarget);

	return (
		<motion.div
			key={`${row}-${col}`}
			initial={{ opacity: 0, scale: 0 }}
			animate={{ opacity: 1, scale: 1 }}
			transition={{
				duration: 0.4,
				scale: {
					type: "spring",
					visualDuration: 0.4,
					bounce: 0.5,
				},
			}}
			style={CELL_STYLE}
			className={cellClass}
		/>
	);
};

/**
 * Main game board component that displays a 10x10 grid
 * Shows either player's board (with ships visible) or computer's board (ships hidden)
 * @param {GameBoardProps} Object containing board, title, isComputerBoard, targetCoordinates
 * @returns The battleship board
 */
export const GameBoard: React.FC<GameBoardProps> = ({
	board, // 2D array representing the game board state
	title, // Title to display above the board ("Your Board" / "Computer's Board")
	isComputerBoard = false, // Whether this is the computer's board (affects ship visibility)
	targetCoordinates, // Optional coordinates to highlight as target
}) => {
	/**
	 * Memoized calculation of all board cells to prevent unnecessary re-renders
	 * Flattens the 2D board array into a 1D array of GameCell components
	 */
	const boardCells = useMemo(() => {
		// Return empty array if board hasn't been initialized yet
		if (!board.length) return [];

		// Convert 2D board array to flat array of cell components
		return board.flatMap((row, rowIndex: number) =>
			row.map((_, colIndex: number) => {
				// Check if this cell should be highlighted as the current target
				const isTarget = Boolean(
					targetCoordinates &&
						targetCoordinates.row === rowIndex &&
						targetCoordinates.col === colIndex &&
						isComputerBoard, // Only highlight targets on computer's board
				);

				return (
					<GameCell
						key={`${rowIndex}-${colIndex}`}
						board={board}
						row={rowIndex}
						col={colIndex}
						isComputerBoard={isComputerBoard}
						isTarget={isTarget}
					/>
				);
			}),
		);
	}, [board, isComputerBoard, targetCoordinates]);

	return (
		<Box>
			{/* Board title (e.g., "Your Board", "Computer's Board") */}
			<Typography variant="h4" textAlign="center" sx={{ pl: 4 }}>
				{title}
			</Typography>

			{/* Main board container with coordinate labels */}
			<Box
				sx={{
					pt: 4,
					pl: 4,
					position: "relative",
				}}
			>
				{/* Column headers (A-J) displayed horizontally across the top */}
				<Box className="row">
					{["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"].map(
						(letter) => (
							<span key={letter}>{letter}</span>
						),
					)}
				</Box>

				{/* Row numbers (1-10) displayed vertically along the left side */}
				<Box className="col">
					{[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((number) => (
						<span key={number}>{number}</span>
					))}
				</Box>

				{/* The actual game board grid containing all cells */}
				<Box className="board">{boardCells}</Box>
			</Box>
		</Box>
	);
};

/**
 * Coordinate input component for players to enter attack coordinates
 * @param {CoordinateInputProps} // Object containing inputValue, onInputChange, onSubmit
 * @returns The form
 */
export const CoordinateInput: React.FC<CoordinateInputProps> = ({
	inputValue,
	onInputChange,
	onSubmit,
}) => {
	return (
		<Box component="form" noValidate autoComplete="off" onSubmit={onSubmit}>
			{/* Input field and attack button layout */}
			<Stack
				direction={{ xs: "column", sm: "row" }}
				spacing={1}
				useFlexGap
				sx={{ pt: 2, width: { xs: "100%" } }}
			>
				{/* Accessibility label (hidden visually but available to screen readers) */}
				<InputLabel htmlFor="coordinates" sx={visuallyHidden}>
					Coordinates:
				</InputLabel>

				{/* Text input field for coordinate entry */}
				<TextField
					id="coordinates"
					hiddenLabel
					size="small"
					variant="outlined"
					aria-label="Enter the coordinates"
					fullWidth
					slotProps={{
						htmlInput: {
							autoComplete: "off",
							"aria-label": "Enter your the coordinates",
						},
					}}
					value={inputValue}
					onChange={onInputChange}
				/>

				{/* Attack button to submit the coordinates */}
				<Button
					variant="contained"
					color="primary"
					size="small"
					sx={{ minWidth: "fit-content" }}
					type="submit"
				>
					Attack
				</Button>
			</Stack>

			{/* Help text showing the expected coordinate format */}
			<Typography
				variant="caption"
				color="text.secondary"
				sx={{ textAlign: "center" }}
			>
				Format must be: Letter (A-J) + Number (1-10). Example: A1, B5,
				J10
			</Typography>
		</Box>
	);
};

/**
 * Snackbar component for temporary notifications (hits, misses, warnings, etc.)
 */
export function GameSnackbar({ isOpen, message, onClose }: GameSnackbarProps) {
	return (
		<Snackbar
			open={isOpen}
			autoHideDuration={GAME_CONFIG.SNACKBAR_AUTO_HIDE_DURATION}
			onClose={onClose}
			anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
		>
			<Alert onClose={onClose} severity={message?.type} variant="filled">
				{message?.text}
			</Alert>
		</Snackbar>
	);
}

/**
 * Game Over Dialog component that appears when game ends with option to play again
 */
export function GameDialog({
	title,
	isOpen,
	onClose,
	button,
	children,
}: GameDialogProps) {
	return (
		<Dialog
			open={isOpen}
			onClose={onClose}
			fullWidth={true}
			maxWidth={"xs"}
			aria-labelledby="alert-dialog-title"
			aria-describedby="alert-dialog-description"
		>
			<DialogTitle id="alert-dialog-title">{title}</DialogTitle>
			<DialogContent id="alert-dialog-description">
				{children}
			</DialogContent>
			<DialogActions>
				<Button
					onClick={onClose}
					variant="contained"
					color="primary"
					size="small"
					sx={{ minWidth: "fit-content" }}
				>
					{button}
				</Button>
			</DialogActions>
		</Dialog>
	);
}
