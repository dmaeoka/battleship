import {
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
} from "@mui/material";
import type { GameDialogProps } from "../types";

/**
 * Game Over Dialog component that appears when game ends with option to play again
 */

const GameDialog: React.FC<GameDialogProps> = ({
	title,
	isOpen,
	onClose,
	button,
	children,
}) => {
	return (
		<Dialog
			open={isOpen}
			onClose={onClose}
			fullWidth={true}
			maxWidth={"xs"}
			aria-labelledby="alert-dialog-title"
			aria-describedby="alert-dialog-description"
		>
			<DialogTitle id="alert-dialog-title">{title}</DialogTitle>
			<DialogContent id="alert-dialog-description">
				{children}
			</DialogContent>
			<DialogActions>
				<Button
					onClick={onClose}
					variant="contained"
					color="primary"
					size="small"
					sx={{ minWidth: "fit-content" }}
				>
					{button}
				</Button>
			</DialogActions>
		</Dialog>
	);
};

export default GameDialog;
