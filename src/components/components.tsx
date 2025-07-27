import React, { useMemo } from "react";
import * as motion from "motion/react-client";
import {
	Box,
	Typography,
	InputLabel,
	TextField,
	Stack,
	Button,
} from "@mui/material";
import visuallyHidden from "@mui/utils/visuallyHidden";
import { getCellClass } from "../utils";
import { CELL_STYLE } from "../constants";
import type { Board, GameBoardProps, CoordinateInputProps } from "../types";

const GameCell: React.FC<{
	board: Board;
	row: number;
	col: number;
	isComputerBoard: boolean;
	isTarget: boolean;
}> = ({ board, row, col, isComputerBoard, isTarget }) => {
	const cellValue = board[row][col];
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

export const GameBoard: React.FC<GameBoardProps> = ({
	board,
	title,
	isComputerBoard = false,
	targetCoordinates,
}) => {
	const boardCells = useMemo(() => {
		if (!board.length) return [];

		return board.flatMap((row, rowIndex: number) =>
			row.map((_, colIndex: number) => {
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
			<Typography variant="h4" textAlign="center" sx={{ pl: 4 }}>
				{title}
			</Typography>
			<Box
				sx={{
					pt: 4,
					pl: 4,
					position: "relative",
				}}
			>
				<Box className="row">
					{["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"].map(
						(letter) => (
							<span key={letter}>{letter}</span>
						),
					)}
				</Box>
				<Box className="col">
					{[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((number) => (
						<span key={number}>{number}</span>
					))}
				</Box>
				<Box className="board">{boardCells}</Box>
			</Box>
		</Box>
	);
};

export const CoordinateInput: React.FC<CoordinateInputProps> = ({
	inputValue,
	onInputChange,
	onSubmit,
}) => {
	return (
		<Box component="form" noValidate autoComplete="off" onSubmit={onSubmit}>
			<Stack
				direction={{ xs: "column", sm: "row" }}
				spacing={1}
				useFlexGap
				sx={{ pt: 2, width: { xs: "100%" } }}
			>
				<InputLabel htmlFor="coordinates" sx={visuallyHidden}>
					Coordinates:
				</InputLabel>
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
