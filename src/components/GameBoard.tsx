import { useMemo } from "react";
import { Box, Typography } from "@mui/material";
import GameCell from "./GameCell";
import { useInputState } from "../stores/gameStore";
import type { GameBoardProps } from "../types";

/**
 * Main game board component that displays a 10x10 grid
 * Shows either player's board (with ships visible) or computer's board (ships hidden)
 * @param {GameBoardProps} Object containing board, title, isComputerBoard, targetCoordinates
 * @returns The battleship board
 */
const GameBoard: React.FC<GameBoardProps> = ({
	board,
	title = "",
	isComputerBoard = false,
}) => {
	const { targetCoordinates } = useInputState();

	/**
	 * Memoized calculation of all board cells to prevent unnecessary re-renders
	 * Flattens the 2D board array into a 1D array of GameCell components
	 */
	const boardCells = useMemo(() => {
		// Return empty array if board hasn't been initialized yet
		if (!board.length) return [];

		// Convert 2D board array to flat array of cell components
		return board.flatMap((row, rowIndex: number) =>
			row.map((_, colIndex) => {
				const isTarget = Boolean(
					targetCoordinates &&
						targetCoordinates.row === rowIndex &&
						targetCoordinates.col === colIndex &&
						isComputerBoard,
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

export default GameBoard;
