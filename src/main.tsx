import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import CssBaseline from "@mui/material/CssBaseline";
import AppTheme from "./theme/AppTheme.tsx";
import Battleship from "./components/Battleship.tsx";
import "./styles/battleship.css";

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<AppTheme>
			<CssBaseline />
			<Battleship />
		</AppTheme>
	</StrictMode>,
);
