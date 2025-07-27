import { useMemo } from "react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import type { ThemeOptions } from "@mui/material/styles";
import { red } from "@mui/material/colors";

interface AppThemeProps {
	children: React.ReactNode;
	disableCustomTheme?: boolean;
	themeComponents?: ThemeOptions["components"];
}

export default function AppTheme(props: AppThemeProps) {
	const { children, disableCustomTheme, themeComponents } = props;
	const theme = useMemo(() => {
		return disableCustomTheme
			? {}
			: createTheme({
					cssVariables: {
						colorSchemeSelector: "data-mui-color-scheme",
						cssVarPrefix: "template",
					},
					components: {
						...themeComponents,
					},
					palette: {
						primary: {
							main: "#556cd6",
						},
						secondary: {
							main: "#19857b",
						},
						error: {
							main: red.A400,
						},
					},
				});
	}, [disableCustomTheme, themeComponents]);
	if (disableCustomTheme) {
		return <>{children}</>;
	}
	return (
		<ThemeProvider theme={theme} disableTransitionOnChange>
			{children}
		</ThemeProvider>
	);
}
