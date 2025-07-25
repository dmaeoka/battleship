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

	const placeShips = (player:string = "computer"): void => {
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

	const handlePlayerAttack = (row: number, col: number): void => {
		console.log(computerBoard[row][col]);
		if (gameStatus !== "playing" || computerBoard[row][col] === 2) return;
		const newBoard:number[][] = [...computerBoard];
		let hit = false;

		for (let ship of computerShips) {
			for (let i = 0; i < ship.length; i++) {
				const r = ship.isHorizontal ? ship.row : ship.row + i;
				const c = ship.isHorizontal ? ship.col + i : ship.col;
				if (r === row && c === col) {
					hit = true;
					ship.hits++;
				}
			}
		}
		console.log(hit);
		newBoard[row][col] = hit ? 3 : 2;

		setComputerBoard(newBoard);
		setComputerShips([...computerShips]);

		if (hit) {
			setMessage("You hit a ship!");
		} else {
			setMessage("You missed.");
		}

		if (computerShips.every((s) => s.hits >= s.length)) {
			setGameStatus("game over");
			setWinner("player");
			setMessage("You won!");
		} else {
			setTimeout(computerTurn, 1000);
		}
	};

	const computerTurn = (): void => {
		console.log(gameStatus);

		if (gameStatus !== "playing") return;

		let row: number;
		let col: number;

		do {
			row = Math.floor(Math.random() * BOARD_SIZE);
			col = Math.floor(Math.random() * BOARD_SIZE);
		} while (playerBoard[row][col] === 1 || playerBoard[row][col] === 2);

		const newPlayerBoard = [...playerBoard];
		let hit = false;

		for (let ship of playerShips) {
			for (let i = 0; i < ship.length; i++) {
				const r = ship.isHorizontal ? ship.row : ship.row + i;
				const c = ship.isHorizontal ? ship.col + i : ship.col;
				if (r === row && c === col) {
					hit = true;
					ship.hits++;
				}
			}
		}

		newPlayerBoard[row][col] = hit ? 3 : 2;
		setPlayerBoard(newPlayerBoard);
		setPlayerShips([...playerShips]);

		if (hit) {
			setMessage("Computer hit your ship!");
		} else {
			setMessage("Computer missed your ship.");
		}

		if (playerShips.every(s => s.hits >= s.length)) {
			setGameStatus("game over");
			setWinner("computer");
			setMessage("Computer won!");
		}
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
				onClick={() => handlePlayerAttack(row, col)}
			>{cellValue}</div>
		);
	};

	const resetGame = (): void => {
		// setPlayerBoard(createBoard());
		// setComputerBoard(createBoard());
		// setPlayerShip(null);
		// placeComputerShips(BATTLESHIP_LENGTH);
		// placeComputerShips(DESTROYER_LENGTH);
		// placeComputerShips(DESTROYER_LENGTH);

		// setGameStatus("setup");
		// setWinner(null);
		setMessage("Place your 5-block ship on the board");
	};

	// STATE
	const [playerBoard, setPlayerBoard] = useState<number[][]>([]);
	const [computerBoard, setComputerBoard] = useState<number[][]>([]);
	const [computerShips, setComputerShips] = useState<Ship[]>([]);
	const [playerShips, setPlayerShips] = useState<Ship[]>([]);
	const [gameStatus, setGameStatus] = useState("setup");
	const [winner, setWinner] = useState<string | null>(null);
	const [message, setMessage] = useState("Place your 5-block ship on the board");

	// EFFECT
	useEffect(() => {
		console.log("useEffect");
		setGameStatus("playing")
		placeShips("player");
		placeShips("computer");
	}, []);

	return (
		<div className="battleship-game">
			<h1>Battleship Game</h1>
			<div className="message">{message}</div>
			<div>{ gameStatus }</div>

			<div className="boards">
				<div className="board-container">
					<h2>Your Board</h2>
					<div className="board">
						{playerBoard.map((row, rowIndex) => (
							<div key={rowIndex} className="row">
								{row.map((_, colIndex) => renderCell(playerBoard, rowIndex, colIndex, true))}
							</div>
						))}
					</div>
				</div>

				<div className="board-container">
					<h2>Computer's Board</h2>
					<div className="board">
						{computerBoard.map((row, rowIndex) => (
							<div key={rowIndex} className="row">
								{row.map((_, colIndex) => renderCell(computerBoard, rowIndex, colIndex, false))}
							</div>
						))}
					</div>
				</div>
			</div>

			{gameStatus === 'gameOver' && (
				<div className="game-over">
					<h2>{winner === 'player' ? 'You Won!' : 'Computer Won!'}</h2>
					<button onClick={resetGame}>Play Again</button>
				</div>
			)}
		</div>
	);
}

export default App;
