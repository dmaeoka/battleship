import { useState, useEffect } from "react";
import "./App.css";

const BOARD_SIZE: number = 10;
const BATTLESHIP_LENGTH: number = 5;
const DESTROYER_LENGTH: number = 4;

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

function App() {
	// CREATE BOARD
	const createBoard = (): number[][] => {
		return Array(BOARD_SIZE).fill(0).map(() => Array(BOARD_SIZE).fill(0));
	};

	// CHECK IF THE SHIP FITS
	const doesShipCollide = (ships: Ship[], newShip: Ship): boolean => {
		for (let ship of ships) {
			for (let i = 0; i < ship.length; i++) {
				const shipRow = ship.isHorizontal ? ship.row : ship.row + i;
				const shipCol = ship.isHorizontal ? ship.col + i : ship.col;
				for (let j = 0; j < newShip.length; j++) {
					const newRow = newShip.isHorizontal ? newShip.row : newShip.row + j;
					const newCol = newShip.isHorizontal ? newShip.col + j : newShip.col;
					if (shipRow === newRow && shipCol === newCol) {
						return true;
					}
				}
			}
		}
		return false;
	};

	const randomShip = (length: number, existingShips: Ship[]): Ship => {
		let ship: Ship = {
			row: 0,
			col: 0,
			isHorizontal: false,
			hits: 0,
			length
		};
		let valid = false;
		while (!valid) {
			const isHorizontal = Math.random() < 0.5;
			const row = isHorizontal
				? Math.floor(Math.random() * BOARD_SIZE)
				: Math.floor(Math.random() * (BOARD_SIZE - length + 1));
			const col = isHorizontal
				? Math.floor(Math.random() * (BOARD_SIZE - length + 1))
				: Math.floor(Math.random() * BOARD_SIZE);

			ship = {
				row,
				col,
				isHorizontal,
				hits: 0,
				length
			};

			valid = !doesShipCollide(existingShips, ship);
		}

		return ship;
	};

	const placeShips = (player: string = "computer"): void => {
		const ships: Ship[] = [];
		const lengths = [BATTLESHIP_LENGTH, DESTROYER_LENGTH, DESTROYER_LENGTH];

		for (let len of lengths) {
			const newShip = randomShip(len, ships);
			ships.push(newShip);
		}

		const newBoard = createBoard();
		for (let ship of ships) {
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
	};

	// COMMON ATTACK METHOD
	const attack = ({ attacker, row, col }: AttackParams): void => {
		console.log(`${attacker} attacking ${row}, ${col}`);

		if (gameStatus !== "playing") return;

		// Determine target board and ships based on attacker
		const targetBoard = attacker === "player" ? computerBoard : playerBoard;
		const targetShips = attacker === "player" ? computerShips : playerShips;
		const setTargetBoard = attacker === "player" ? setComputerBoard : setPlayerBoard;
		const setTargetShips = attacker === "player" ? setComputerShips : setPlayerShips;

		// Check if cell already attacked
		if (targetBoard[row][col] === 2 || targetBoard[row][col] === 3) return;

		const newBoard: number[][] = [...targetBoard];
		let hit = false;

		// Check if attack hits any ship
		for (let ship of targetShips) {
			for (let i = 0; i < ship.length; i++) {
				const r = ship.isHorizontal ? ship.row : ship.row + i;
				const c = ship.isHorizontal ? ship.col + i : ship.col;
				if (r === row && c === col) {
					hit = true;
					ship.hits++;
					break;
				}
			}
		}

		// Update board: 2 = miss, 3 = hit
		newBoard[row][col] = hit ? 3 : 2;

		// Update state
		setTargetBoard(newBoard);
		setTargetShips([...targetShips]);

		// Set message based on attacker and result
		if (attacker === "player") {
			setMessage(hit ? "You hit a ship!" : "You missed.");
		} else {
			setMessage(hit ? "Computer hit your ship!" : "Computer missed your ship.");
		}

		// Check for game over
		if (targetShips.every((s) => s.hits >= s.length)) {
			setGameStatus("game over");
			setWinner(attacker);
			setMessage(attacker === "player" ? "You won!" : "Computer won!");
		} else if (attacker === "player") {
			// If player attacked, trigger computer turn after delay
			setTimeout(computerTurn, 1000);
		}
	};

	const handlePlayerAttack = (row: number, col: number): void => {
		attack({ attacker: "player", row, col });
	};

	// Helper function to get valid adjacent cells
	const getAdjacentCells = (row: number, col: number): { row: number; col: number }[] => {
		const adjacent = [];
		const directions = [
			{ row: -1, col: 0 }, // up
			{ row: 1, col: 0 },  // down
			{ row: 0, col: -1 }, // left
			{ row: 0, col: 1 }   // right
		];

		for (const dir of directions) {
			const newRow = row + dir.row;
			const newCol = col + dir.col;

			// Check bounds and if cell hasn't been attacked
			if (newRow >= 0 && newRow < BOARD_SIZE &&
				newCol >= 0 && newCol < BOARD_SIZE &&
				playerBoard[newRow][newCol] !== 2 &&
				playerBoard[newRow][newCol] !== 3) {
				adjacent.push({ row: newRow, col: newCol });
			}
		}

		return adjacent;
	};

	// Check if a hit belongs to a destroyed ship
	const isHitFromDestroyedShip = (row: number, col: number): boolean => {
		for (let ship of playerShips) {
			// Check if this hit belongs to this ship
			for (let i = 0; i < ship.length; i++) {
				const r = ship.isHorizontal ? ship.row : ship.row + i;
				const c = ship.isHorizontal ? ship.col + i : ship.col;
				if (r === row && c === col) {
					// If we found the ship this hit belongs to, check if it's destroyed
					return ship.hits >= ship.length;
				}
			}
		}
		return false;
	};

	// Smart computer targeting
	const getSmartTarget = (): { row: number; col: number } => {
		// First priority: Look for hits (3) that belong to ships that are NOT destroyed
		for (let row = 0; row < BOARD_SIZE; row++) {
			for (let col = 0; col < BOARD_SIZE; col++) {
				if (playerBoard[row][col] === 3 && !isHitFromDestroyedShip(row, col)) {
					const adjacentCells = getAdjacentCells(row, col);
					if (adjacentCells.length > 0) {
						// Return a random adjacent cell
						return adjacentCells[Math.floor(Math.random() * adjacentCells.length)];
					}
				}
			}
		}

		// Second priority: Look for a line of hits from non-destroyed ships to continue the pattern
		for (let row = 0; row < BOARD_SIZE; row++) {
			for (let col = 0; col < BOARD_SIZE; col++) {
				if (playerBoard[row][col] === 3 && !isHitFromDestroyedShip(row, col)) {
					// Check for horizontal line of hits
					if (col < BOARD_SIZE - 1 && playerBoard[row][col + 1] === 3 && !isHitFromDestroyedShip(row, col + 1)) {
						// Found horizontal line, try to extend it
						// Check left end
						if (col > 0 && playerBoard[row][col - 1] !== 2 && playerBoard[row][col - 1] !== 3) {
							return { row, col: col - 1 };
						}
						// Check right end
						let rightEnd = col + 1;
						while (rightEnd < BOARD_SIZE && playerBoard[row][rightEnd] === 3 && !isHitFromDestroyedShip(row, rightEnd)) {
							rightEnd++;
						}
						if (rightEnd < BOARD_SIZE && playerBoard[row][rightEnd] !== 2 && playerBoard[row][rightEnd] !== 3) {
							return { row, col: rightEnd };
						}
					}

					// Check for vertical line of hits
					if (row < BOARD_SIZE - 1 && playerBoard[row + 1][col] === 3 && !isHitFromDestroyedShip(row + 1, col)) {
						// Found vertical line, try to extend it
						// Check top end
						if (row > 0 && playerBoard[row - 1][col] !== 2 && playerBoard[row - 1][col] !== 3) {
							return { row: row - 1, col };
						}
						// Check bottom end
						let bottomEnd = row + 1;
						while (bottomEnd < BOARD_SIZE && playerBoard[bottomEnd][col] === 3 && !isHitFromDestroyedShip(bottomEnd, col)) {
							bottomEnd++;
						}
						if (bottomEnd < BOARD_SIZE && playerBoard[bottomEnd][col] !== 2 && playerBoard[bottomEnd][col] !== 3) {
							return { row: bottomEnd, col };
						}
					}
				}
			}
		}

		// Fallback: Random targeting (no active targets from non-destroyed ships)
		let row: number;
		let col: number;
		do {
			row = Math.floor(Math.random() * BOARD_SIZE);
			col = Math.floor(Math.random() * BOARD_SIZE);
		} while (playerBoard[row][col] === 2 || playerBoard[row][col] === 3);

		return { row, col };
	};

	const computerTurn = (): void => {
		if (gameStatus !== "playing") return;

		const target = getSmartTarget();
		attack({ attacker: "computer", row: target.row, col: target.col });
	};

	// board, row, col, isPlayerBoard
	const renderCell = (
		board: number[][],
		row: number,
		col: number,
		isPlayerBoard: boolean,
	) => {
		const cellValue = board[row][col];
		let cellClass = "cell";
		if (cellValue === 1) {
			cellClass += " ship";
		} else if (cellValue === 2) {
			cellClass += " miss";
		} else if (cellValue === 3) {
			cellClass += " hit";
		}

		return (
			<div
				key={`${row}-${col}`}
				className={cellClass}
				onClick={() => !isPlayerBoard && handlePlayerAttack(row, col)}
			>{cellValue}</div>
		);
	};

	const resetGame = (): void => {
		setPlayerBoard(createBoard());
		setComputerBoard(createBoard());
		setPlayerShips([]);
		setComputerShips([]);
		setGameStatus("setup");
		setWinner(null);
		setMessage("Game reset! Starting new game...");

		// Restart the game
		setTimeout(() => {
			setGameStatus("playing");
			placeShips("player");
			placeShips("computer");
			setMessage("Game started! Attack the computer's board.");
		}, 1000);
	};

	// STATE
	const [playerBoard, setPlayerBoard] = useState<number[][]>([]);
	const [computerBoard, setComputerBoard] = useState<number[][]>([]);
	const [computerShips, setComputerShips] = useState<Ship[]>([]);
	const [playerShips, setPlayerShips] = useState<Ship[]>([]);
	const [gameStatus, setGameStatus] = useState("setup");
	const [winner, setWinner] = useState<string | null>(null);
	const [message, setMessage] = useState("Initializing game...");

	// EFFECT
	useEffect(() => {
		console.log("useEffect");
		setGameStatus("playing");
		placeShips("player");
		placeShips("computer");
		setMessage("Game started! Attack the computer's board.");
	}, []);

	return (
		<div className="battleship-game">
			<h1>Battleship Game</h1>
			<div className="message">{message}</div>
			<div>Status: {gameStatus}</div>

			<div className="boards">
				<div className="board-container">
					<h2>Your Board</h2>
					<div className="board">
						{playerBoard.map((row, rowIndex) => row.map((_, colIndex) => renderCell(playerBoard, rowIndex, colIndex, true)))}
					</div>
				</div>

				<div className="board-container">
					<h2>Computer's Board</h2>
					<div className="board">
						{computerBoard.map((row, rowIndex) => row.map((_, colIndex) => renderCell(computerBoard, rowIndex, colIndex, false)))}
					</div>
				</div>
			</div>

			{gameStatus === 'game over' && (
				<div className="game-over">
					<h2>{winner === 'player' ? 'You Won!' : 'Computer Won!'}</h2>
					<button onClick={resetGame}>Play Again</button>
				</div>
			)}
		</div>
	);
}

export default App;
