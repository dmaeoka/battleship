import { useState, useEffect } from "react";
import "./App.css";

const BOARD_SIZE: number = 10;
const SHIP_LENGTH: number = 5;

interface Ship {
	row: number;
	col: number;
	isHorizontal: boolean;
	hits: number;
}

function App() {
	// CREATE BOARD
	const createBoard = (): number[][] => {
		const board: number[][] = [];
		for (let i = 0; i < BOARD_SIZE; i++) {
			const row: number[] = [];
			for (let j = 0; j < BOARD_SIZE; j++) {
				row.push(0);
			}
			board.push(row);
		}
		return board;
	};

	const placeComputerShip = (): void => {
		const isHorizontal: boolean = Math.random() < 0.5;
		let row: number = 0;
		let col: number = 0;

		if (isHorizontal) {
			row = Math.floor(Math.random() * BOARD_SIZE);
			col = Math.floor(Math.random() * (BOARD_SIZE - SHIP_LENGTH + 1));
		} else {
			row = Math.floor(Math.random() * (BOARD_SIZE - SHIP_LENGTH + 1));
			col = Math.floor(Math.random() * BOARD_SIZE);
		}

		// PC SHIP
		const ship: Ship = {
			row,
			col,
			isHorizontal,
			hits: 0,
		};

		setPlayerShip(ship);
	}

	const placePlayerShip = (row: number, col: number, isHorizontal: boolean): boolean => {
		// Test if the ship fits
		if (isHorizontal) {
			if (col + SHIP_LENGTH > BOARD_SIZE) return false;
		} else {
			if (row + SHIP_LENGTH > BOARD_SIZE) return false;
		}

		const newBoard: number[][] = createBoard();

		const ship: Ship = {
			row,
			col,
			isHorizontal,
			hits: 0,
		};

		if (isHorizontal) {
			for (let i = 0; i < SHIP_LENGTH; i++) {
				newBoard[row][col + i] = 1;
			}
		} else {
			for (let i = 0; i < SHIP_LENGTH; i++) {
				newBoard[row + i][col] = 1;
			}
		}

		setPlayerBoard(newBoard);
		setPlayerShip(ship);
		setGameStatus("playing");
		setMessage("Game started! Your turn to attack the computer's board.");

		return true;
	}

	const handlePlayerPlacement = (row: number, col: number, isHorizontal: boolean): void => {
		if (gameStatus === "setup") {
			placePlayerShip(row, col, isHorizontal);
		}
		return;
	}

	const [playerBoard, setPlayerBoard] = useState(createBoard());
	const [computerBoard, setComputerBoard] = useState(createBoard());
	const [computerShip, setComputerShip] = useState<Ship | null>(null);
	const [playerShip, setPlayerShip] = useState<Ship | null>(null);
	const [gameStatus, setGameStatus] = useState("setup"); // setup, playing, game over
	const [winner, setWinner] = useState<string | null>(null);
	const [message, setMessage] = useState("Place your 5-block ship on the board");

	useEffect(() => {
		console.log("useEffect");
		placeComputerShip();

		console.log(playerBoard);
		console.log(computerBoard);
		console.log(computerShip);
		console.log(playerShip);
		console.log(gameStatus);
		console.log(winner);
		console.log(message);
	}, []);

	return (
		<div className="card">
			placeholder;
		</div>
	);
}

export default App;
