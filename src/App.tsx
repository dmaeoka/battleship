import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

import { useState, useEffect, useCallback, useMemo } from "react";
import * as motion from "motion/react-client"
import {
	Container,
	Button,
	Grid,
	Box,
	Typography,
	InputLabel,
	TextField,
	Stack
} from '@mui/material';
import visuallyHidden from '@mui/utils/visuallyHidden';

import "./App.css";

interface Ship {
	row: number;
	col: number;
	isHorizontal: boolean;
	hits: number;
	length: number;
}

type AttackParams = {
	attacker: "player" | "computer";
	row: number;
	col: number;
};

// Constants
const BOARD_SIZE: number = 10;
const BATTLESHIP_LENGTH: number = 5;
const DESTROYER_LENGTH: number = 4;
const ball = {
	width: "100%",
	height: 30,
	borderRadius: ".25rem",
}

// VALID PATTERN
const validPattern = /^[A-J](10|[1-9])$/;

/*
-1   0   1
+---+---+---+
| 0 | 0 | 0 | -1
+---+---+---+
| 0 | 0 | 0 | 0
+---+---+---+
| 0 | 0 | 0 | 1
+---+---+---+
Pre-calculated directions for adjacent cells
*/
const DIRECTIONS = [
	{ row: -1, col: 0 }, // up
	{ row: 1, col: 0 },  // down
	{ row: 0, col: -1 }, // left
	{ row: 0, col: 1 }   // right
] as const;

function Battleship() {
	// STATE
	const [playerBoard, setPlayerBoard] = useState<number[][]>([]);
	const [computerBoard, setComputerBoard] = useState<number[][]>([]);
	const [computerShips, setComputerShips] = useState<Ship[]>([]);
	const [playerShips, setPlayerShips] = useState<Ship[]>([]);
	const [gameStatus, setGameStatus] = useState("setup");
	const [winner, setWinner] = useState("");
	const [message, setMessage] = useState("Initializing game...");
	const [inputValue, setInputValue] = useState("");
	const [isValid, setIsValid] = useState(false);
	const [errorMessage, setErrorMessage] = useState("");
	const [targetCoordinates, setTargetCoordinates] = useState<{row: number, col: number} | null>(null);

	// Memoized board creation
	const createBoard = useCallback((): number[][] => {
		return Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(0));
	}, []);

	// CONVERT VALUE TO COORTINATE
	const convertToCoordinates = useCallback((value: string): { row: number; col: number } | null => {
		if (!validPattern.test(value)) return null;

		const letter: string = value[0];
		const col: number = letter.charCodeAt(0) - 65;
		const row: number = parseInt(value.slice(1)) - 1;

		return { row, col };
	}, []);


	const handleInputChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
		let value = event.target.value.toUpperCase();
		if (value.length > 3) {
			value = value.slice(0, 3);
		}
		setInputValue(value);
		const isValidFormat = validPattern.test(value.toUpperCase());

		if (isValidFormat) {
			setIsValid(true);
			const coordinates = convertToCoordinates(value);

			console.log(coordinates);

			setTargetCoordinates(coordinates);
		} else {
			setIsValid(false);
			setTargetCoordinates(null);
		}
	}, [convertToCoordinates]);

	// Memoized ship collision detection
	// Optimized ship collision detection with early exit
	const doesShipCollide = useCallback((ships: Ship[], newShip: Ship): boolean => {
		const newShipCells = new Set<string>();

		// Pre-calculate new ship cells
		for (let j = 0; j < newShip.length; j++) {
			const newRow = newShip.isHorizontal ? newShip.row : newShip.row + j;
			const newCol = newShip.isHorizontal ? newShip.col + j : newShip.col;
			newShipCells.add(`${newRow}-${newCol}`);
		}

		// Check against existing ships
		for (const ship of ships) {
			for (let i = 0; i < ship.length; i++) {
				const shipRow = ship.isHorizontal ? ship.row : ship.row + i;
				const shipCol = ship.isHorizontal ? ship.col + i : ship.col;
				if (newShipCells.has(`${shipRow}-${shipCol}`)) {
					return true;
				}
			}
		}
		return false;
	}, []);

	// Optimized random ship generation with bounds checking
	const randomShip = useCallback((length: number, existingShips: Ship[]): Ship => {
		let attempts = 0;
		const maxAttempts = 1000; // Prevent infinite loops

		while (attempts < maxAttempts) {
			const isHorizontal = Math.random() < 0.5;
			const maxRow = isHorizontal ? BOARD_SIZE : BOARD_SIZE - length + 1;
			const maxCol = isHorizontal ? BOARD_SIZE - length + 1 : BOARD_SIZE;

			const ship: Ship = {
				row: Math.floor(Math.random() * maxRow),
				col: Math.floor(Math.random() * maxCol),
				isHorizontal,
				hits: 0,
				length
			};

			if (!doesShipCollide(existingShips, ship)) {
				return ship;
			}
			attempts++;
		}

		// Fallback - should rarely happen
		return {
			row: 0,
			col: 0,
			isHorizontal: true,
			hits: 0,
			length
		};
	}, [doesShipCollide]);

	// Memoized ship placement
	const placeShips = useCallback((player: string = "computer"): void => {
		const ships: Ship[] = [];
		const lengths = [BATTLESHIP_LENGTH, DESTROYER_LENGTH, DESTROYER_LENGTH];

		for (const len of lengths) {
			const newShip = randomShip(len, ships);
			ships.push(newShip);
		}

		const newBoard = createBoard();
		for (const ship of ships) {
			for (let i = 0; i < ship.length; i++) {
				const r = ship.isHorizontal ? ship.row : ship.row + i;
				const c = ship.isHorizontal ? ship.col + i : ship.col;
				newBoard[r][c] = 1;
			}
		}

		if (player === "computer") {
			setComputerBoard(newBoard);
			setComputerShips(ships);
		} else {
			setPlayerBoard(newBoard);
			setPlayerShips(ships);
		}
	}, [createBoard, randomShip]);

	// Memoized adjacent cells calculation
	const getAdjacentCells = useCallback((row: number, col: number): { row: number; col: number }[] => {
		const adjacent: { row: number; col: number }[] = [];

		for (const dir of DIRECTIONS) {
			const newRow = row + dir.row;
			const newCol = col + dir.col;

			if (newRow >= 0 && newRow < BOARD_SIZE &&
				newCol >= 0 && newCol < BOARD_SIZE &&
				playerBoard[newRow][newCol] !== 2 &&
				playerBoard[newRow][newCol] !== 3) {
				adjacent.push({ row: newRow, col: newCol });
			}
		}

		return adjacent;
	}, [playerBoard]);

	// Optimized ship destruction check with early exit
	const isHitFromDestroyedShip = useCallback((row: number, col: number): boolean => {
		for (const ship of playerShips) {
			if (ship.hits < ship.length) continue; // Skip non-destroyed ships

			for (let i = 0; i < ship.length; i++) {
				const r = ship.isHorizontal ? ship.row : ship.row + i;
				const c = ship.isHorizontal ? ship.col + i : ship.col;
				if (r === row && c === col) {
					return true;
				}
			}
		}
		return false;
	}, [playerShips]);

	// Optimized smart targeting with memoization
	const getSmartTarget = useCallback((): { row: number; col: number } => {
		// Cache valid targets to avoid recalculation
		const validTargets: { row: number; col: number }[] = [];
		const patternTargets: { row: number; col: number }[] = [];

		// Single pass through the board
		for (let row = 0; row < BOARD_SIZE; row++) {
			for (let col = 0; col < BOARD_SIZE; col++) {
				if (playerBoard[row][col] === 3 && !isHitFromDestroyedShip(row, col)) {
					// Check for adjacent targets
					const adjacentCells = getAdjacentCells(row, col);
					validTargets.push(...adjacentCells);

					// Check for pattern targets
					if (col < BOARD_SIZE - 1 && playerBoard[row][col + 1] === 3 && !isHitFromDestroyedShip(row, col + 1)) {
						// Horizontal pattern
						if (col > 0 && playerBoard[row][col - 1] !== 2 && playerBoard[row][col - 1] !== 3) {
							patternTargets.push({ row, col: col - 1 });
						}
						let rightEnd = col + 1;
						while (rightEnd < BOARD_SIZE && playerBoard[row][rightEnd] === 3 && !isHitFromDestroyedShip(row, rightEnd)) {
							rightEnd++;
						}
						if (rightEnd < BOARD_SIZE && playerBoard[row][rightEnd] !== 2 && playerBoard[row][rightEnd] !== 3) {
							patternTargets.push({ row, col: rightEnd });
						}
					}

					if (row < BOARD_SIZE - 1 && playerBoard[row + 1][col] === 3 && !isHitFromDestroyedShip(row + 1, col)) {
						// Vertical pattern
						if (row > 0 && playerBoard[row - 1][col] !== 2 && playerBoard[row - 1][col] !== 3) {
							patternTargets.push({ row: row - 1, col });
						}
						let bottomEnd = row + 1;
						while (bottomEnd < BOARD_SIZE && playerBoard[bottomEnd][col] === 3 && !isHitFromDestroyedShip(bottomEnd, col)) {
							bottomEnd++;
						}
						if (bottomEnd < BOARD_SIZE && playerBoard[bottomEnd][col] !== 2 && playerBoard[bottomEnd][col] !== 3) {
							patternTargets.push({ row: bottomEnd, col });
						}
					}
				}
			}
		}

		// Return pattern targets first (highest priority)
		if (patternTargets.length > 0) {
			return patternTargets[Math.floor(Math.random() * patternTargets.length)];
		}

		// Return adjacent targets
		if (validTargets.length > 0) {
			return validTargets[Math.floor(Math.random() * validTargets.length)];
		}

		// Fallback: Random targeting with optimized loop
		const availableCells: { row: number; col: number }[] = [];
		for (let row = 0; row < BOARD_SIZE; row++) {
			for (let col = 0; col < BOARD_SIZE; col++) {
				if (playerBoard[row][col] !== 2 && playerBoard[row][col] !== 3) {
					availableCells.push({ row, col });
				}
			}
		}

		return availableCells.length > 0
			? availableCells[Math.floor(Math.random() * availableCells.length)]
			: { row: 0, col: 0 };
	}, [playerBoard, isHitFromDestroyedShip, getAdjacentCells]);

	// Optimized attack method with batch updates
	const attack = useCallback(({ attacker, row, col }: AttackParams): void => {
		if (gameStatus !== "playing") return;

		const isPlayer = attacker === "player";
		const targetBoard = isPlayer ? computerBoard : playerBoard;
		const targetShips = isPlayer ? computerShips : playerShips;

		// Check if cell already attacked
		if (targetBoard[row][col] === 2 || targetBoard[row][col] === 3) return;

		// Create new board and ships arrays
		const newBoard = targetBoard.map(row => [...row]);
		const newShips = targetShips.map(ship => ({ ...ship }));

		let hit = false;

		// Optimized hit detection with early exit
		for (const ship of newShips) {
			for (let i = 0; i < ship.length; i++) {
				const r = ship.isHorizontal ? ship.row : ship.row + i;
				const c = ship.isHorizontal ? ship.col + i : ship.col;
				if (r === row && c === col) {
					hit = true;
					ship.hits++;
					break;
				}
			}
			if (hit) break;
		}

		// Update board
		newBoard[row][col] = hit ? 3 : 2;

		// Batch state updates
		if (isPlayer) {
			setComputerBoard(newBoard);
			setComputerShips(newShips);
			setMessage(hit ? "You hit a ship!" : "You missed.");
			// Clear target after attack
			setTargetCoordinates(null);
		} else {
			setPlayerBoard(newBoard);
			setPlayerShips(newShips);
			setMessage(hit ? "Computer hit your ship!" : "Computer missed your ship.");
		}

		// Check for game over
		if (newShips.every((s) => s.hits >= s.length)) {
			setGameStatus("game over");
			setWinner(attacker);
			setMessage(attacker === "player" ? "You won!" : "Computer won!");
		} else if (isPlayer) {
			// Schedule computer turn
			setTimeout(() => {
				const target = getSmartTarget();
				attack({ attacker: "computer", row: target.row, col: target.col });
			}, 1000);
		}
	}, [gameStatus, computerBoard, playerBoard, computerShips, playerShips, getSmartTarget]);

	// Memoized player attack handler
	const handlePlayerAttack = useCallback((e: React.FormEvent<HTMLFormElement>): void => {
		e.preventDefault();
		const coords = convertToCoordinates(inputValue);

		setInputValue("");
		setIsValid(false);

		if (!coords) {
			setErrorMessage("Invalid coordinates.");
			return;
		}

		const { row, col } = coords

		if (computerBoard[row][col] === 2 || computerBoard[row][col] === 3) {
			setErrorMessage("You already attacked this cell.");
		} else {
			setErrorMessage("");
			attack({ attacker: "player", row, col });
		}
	}, [inputValue, computerBoard, convertToCoordinates, attack]);

	// Memoized cell renderer
	const renderCell = useCallback((
		board: number[][],
		row: number,
		col: number,
		isComputerBoard: boolean = false
	) => {
		const cellValue = board[row][col];
		let cellClass = "cell";

		if (cellValue === 1) cellClass += " ship";
		else if (cellValue === 2) cellClass += " miss";
		else if (cellValue === 3) cellClass += " hit";

		// Add target class if this is the computer board and matches target coordinates
		if (isComputerBoard && targetCoordinates &&
			targetCoordinates.row === row && targetCoordinates.col === col) {
			cellClass += " target";
		}

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
						bounce: 0.5
					},
				}}
				style={ball}
				className={cellClass}
			/>
		);
	}, [targetCoordinates]);

	// Memoized board rendering
	const playerBoardCells = useMemo(() => {
		return playerBoard.flatMap((row, rowIndex) =>
			row.map((_, colIndex) => renderCell(playerBoard, rowIndex, colIndex, false))
		);
	}, [playerBoard, renderCell]);

	const computerBoardCells = useMemo(() => {
		return computerBoard.flatMap((row, rowIndex) =>
			row.map((_, colIndex) => renderCell(computerBoard, rowIndex, colIndex, true))
		);
	}, [computerBoard, renderCell]);

	// Optimized reset function
	const resetGame = useCallback((): void => {
		setPlayerBoard([]);
		setComputerBoard([]);
		setPlayerShips([]);
		setComputerShips([]);
		setGameStatus("setup");
		setWinner("");
		setMessage("Game reset! Starting new game...");
		setTargetCoordinates(null);
		setInputValue("");
		setIsValid(false);
		setErrorMessage("");

		setTimeout(() => {
			setGameStatus("playing");
			placeShips("player");
			placeShips("computer");
			setMessage("Game started! Attack the computer's board.");
		}, 1000);
	}, [placeShips]);

	// Optimized initialization
	useEffect(() => {
		setGameStatus("playing");
		placeShips("player");
		placeShips("computer");
		setMessage("Game started! Attack the computer's board.");
	}, [placeShips]);


	return (
		<Container className="battleship-game" maxWidth="md">
			<Grid container spacing={2}>
				<Grid size={12}>
					<Typography variant="h1" textAlign="center">Battleship Game</Typography>
					<Typography variant="subtitle1" textAlign="center" gutterBottom>{message}</Typography>
				</Grid>
				<Grid size={12}>
					Status: {gameStatus}
					-- winer: {winner} --
					{gameStatus === 'game over' && (
						<button onClick={resetGame}>Play Again</button>
					)}
				</Grid>
			</Grid>
			<Grid container spacing={2}>
				-- {inputValue} --
				<Box
					component="form"
					noValidate
					autoComplete="off"
					onSubmit={(e) => handlePlayerAttack(e)}
				>
					<Stack
						direction={{ xs: 'column', sm: 'row' }}
						spacing={1}
						useFlexGap
						sx={{ pt: 2, width: { xs: '100%', sm: '350px' } }}
					>
						<InputLabel htmlFor="coordinates" sx={visuallyHidden}>Coordinates:</InputLabel>
						<TextField
							id="coordinates"
							hiddenLabel
							size="small"
							variant="outlined"
							aria-label="Enter the coordinates"
							fullWidth
							slotProps={{
								htmlInput: {
								autoComplete: 'off',
								'aria-label': 'Enter your the coordinates',
								},
							}}
							value={inputValue}
							onChange={handleInputChange}
						/>
						<Button
							variant="contained"
							color="primary"
							size="small"
							sx={{ minWidth: 'fit-content' }}
							type="submit"
							disabled={!isValid}
						>Attack</Button>
					</Stack>
					<Typography
						variant="caption"
						color="text.secondary"
						sx={{ textAlign: 'center' }}
					>Format must be: Letter (A-J) + Number (1-10). Example: A1, B5, J10</Typography>
				</Box>
			</Grid>
			<Grid container spacing={4}>
				<Grid size={6}>
					<h2>Your Board</h2>
					<div style={{ position: "relative", paddingTop: "2rem", paddingLeft: "2rem" }}>
						<div className="row">
							<span>A</span>
							<span>B</span>
							<span>C</span>
							<span>D</span>
							<span>E</span>
							<span>F</span>
							<span>G</span>
							<span>H</span>
							<span>I</span>
							<span>J</span>
						</div>
						<div className="row2">
							<span>1</span>
							<span>2</span>
							<span>3</span>
							<span>4</span>
							<span>5</span>
							<span>6</span>
							<span>7</span>
							<span>8</span>
							<span>9</span>
							<span>10</span>
						</div>
						<div className="board">{playerBoardCells}</div>
					</div>
				</Grid>
				<Grid size={6}>
					<h2>Computer's Board</h2>
					<div style={{ position: "relative", paddingTop: "2rem", paddingLeft: "2rem" }}>
						<div className="row">
							<span>A</span>
							<span>B</span>
							<span>C</span>
							<span>D</span>
							<span>E</span>
							<span>F</span>
							<span>G</span>
							<span>H</span>
							<span>I</span>
							<span>J</span>
						</div>
						<div className="row2">
							<span>1</span>
							<span>2</span>
							<span>3</span>
							<span>4</span>
							<span>5</span>
							<span>6</span>
							<span>7</span>
							<span>8</span>
							<span>9</span>
							<span>10</span>
						</div>
						<div className="board">{computerBoardCells}</div>
					</div>
				</Grid>
			</Grid>
		</Container>
	);
}

export default Battleship;
