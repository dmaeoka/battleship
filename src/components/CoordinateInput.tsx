import { useCallback } from "react";
import {
	Box,
	Typography,
	InputLabel,
	TextField,
	Stack,
	Button,
} from "@mui/material";
import visuallyHidden from "@mui/utils/visuallyHidden";
import { VALID_COORDINATE_PATTERN } from "../constants";
import { convertToCoordinates } from "../utils";
import { useInputActions, useInputState } from "../stores/gameStore";

/**
 * Coordinate input component for players to enter attack coordinates
 * @param {CoordinateInputProps} // Object containing inputValue, onInputChange, onSubmit
 * @returns The form
 */
const CoordinateInput = () => {
	const { inputValue } = useInputState();
	const { setInput, setTargetCoordinates, handlePlayerAttack } = useInputActions();

	const handleSubmit = useCallback(
		(e: React.FormEvent<HTMLFormElement>): void => {
			e.preventDefault();
			handlePlayerAttack(inputValue);
		},
		[inputValue, handlePlayerAttack],
	);

	const handleInputChange = useCallback(
		(
			e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
		): void => {
			try {
				let value = e.currentTarget.value.toUpperCase();

				if (value.length > 3) {
					value = value.slice(0, 3);
				}
				setInput(value);

				const isValidFormat = VALID_COORDINATE_PATTERN.test(value);

				if (isValidFormat) {
					const coordinates = convertToCoordinates(value);
					setTargetCoordinates(coordinates);
				} else {
					// Clear highlighting for invalid input
					setTargetCoordinates(null);
				}

			} catch (error) {
				setInput("");
				setTargetCoordinates(null);
				console.warn(error);
			}
		},
		[setInput, setTargetCoordinates],
	);

	return (
		<Box
			component="form"
			noValidate
			autoComplete="off"
			onSubmit={handleSubmit}
		>
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
					autoFocus
					onChange={(e) => handleInputChange(e)}
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

export default CoordinateInput;
