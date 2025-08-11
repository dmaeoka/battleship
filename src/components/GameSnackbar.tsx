import { Alert, Snackbar } from "@mui/material";
import type { GameSnackbarProps } from "../types";
import { GAME_CONFIG } from "../constants";

/**
 * Snackbar component for temporary notifications (hits, misses, warnings, etc.)
 */
const GameSnackbar: React.FC<GameSnackbarProps> = ({
	isOpen,
	message,
	onClose,
}) => {
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
};
export default GameSnackbar;
