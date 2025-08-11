import * as motion from "motion/react-client";
import type { Board } from "../types";
import { getCellClass } from "../utils";
import { CELL_STYLE } from "../constants";

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

export default GameCell;
