// Font imports: Load Roboto font family with different weights
// These imports load the actual font files from the fontsource package
import "@fontsource/roboto/300.css"; // Light weight - used for subtle text
import "@fontsource/roboto/400.css"; // Regular weight - primary body text
import "@fontsource/roboto/500.css"; // Medium weight - emphasized text and buttons
import "@fontsource/roboto/700.css"; // Bold weight - headings and important text

// React core imports
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

// Material-UI imports
import CssBaseline from "@mui/material/CssBaseline";

// Application-specific imports
import AppTheme from "./theme/AppTheme.tsx"; // Custom theme provider component
import Battleship from "./components/Battleship.tsx"; // Main game component
import "./styles/battleship.css"; // Custom CSS styles for game-specific styling

/**
 * Application entry point that sets up the React application with proper theming and styling
 *
 * Component hierarchy:
 * 1. StrictMode - Enables additional development checks and warnings
 * 2. AppTheme - Provides Material-UI theme configuration throughout the app
 * 3. CssBaseline - Normalizes CSS across browsers and applies Material-UI baseline styles
 * 4. Battleship - The main game component
 */
createRoot(document.getElementById("root")!).render(
	<StrictMode>
		{/*
		AppTheme: Wraps the entire application with Material-UI theme context
		- Provides consistent colors, typography, and component styling
		- Enables CSS custom properties for dynamic theming
		- Makes theme available to all child components via React context
		*/}
		<AppTheme>
			{/*
			CssBaseline: Material-UI component that applies consistent baseline styles
			- Removes default browser margins and paddings
			- Sets consistent box-sizing across all elements
			- Applies Material Design typography defaults
			- Ensures consistent rendering across different browsers
			- Must be inside ThemeProvider to access theme variables
			*/}
			<CssBaseline />

			{/*
			Battleship: Main game component that renders the entire game interface
			- Contains game boards, input controls, and game state management
			- Inherits theme and baseline styles from parent providers
			*/}
			<Battleship />
		</AppTheme>
	</StrictMode>,
);
