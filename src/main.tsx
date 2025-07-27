import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import CssBaseline from "@mui/material/CssBaseline";
import AppTheme from "./theme/AppTheme.tsx";
import App from "./App.tsx";

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<AppTheme>
			<CssBaseline />
			<App />
		</AppTheme>
	</StrictMode>,
);
