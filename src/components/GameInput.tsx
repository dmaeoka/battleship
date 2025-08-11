import { Button, TextField } from "@mui/material";
import React from "react";
import {
	useGameState,
	useInputActions,
	useInputState,
} from "../stores/gameStore";

export const GameInput = () => {
	// Use the custom hooks with shallow comparison for optimized re-renders.
	// This prevents the infinite loop that was causing the tests to fail.
	const { gameStatus } = useGameState();
	const { inputValue } = useInputState();
	const { setInput, handlePlayerAttack } = useInputActions();

	const isPlaying = gameStatus === "playing";

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (isPlaying && inputValue) {
			handlePlayerAttack(inputValue);
		}
	};

	return (
		<form onSubmit={handleSubmit} style={{ display: "flex", gap: "8px" }}>
			<TextField
				label="Coordinates"
				variant="outlined"
				value={inputValue}
				onChange={(e) => setInput(e.target.value)}
				placeholder="Enter coordinates (e.g., A5)"
				disabled={!isPlaying}
				inputProps={{ "aria-label": "Coordinates Input" }}
			/>
			<Button
				type="submit"
				variant="contained"
				disabled={!isPlaying || !inputValue}
			>
				Fire
			</Button>
		</form>
	);
};
