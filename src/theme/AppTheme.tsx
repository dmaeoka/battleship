import { useMemo } from "react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import type { ThemeOptions } from "@mui/material/styles";
import { red } from "@mui/material/colors";

/**
 * Props interface for the AppTheme component
 */
interface AppThemeProps {
	children: React.ReactNode; // Child components to wrap with theme
	disableCustomTheme?: boolean; // Flag to bypass custom theme and use default MUI theme
	themeComponents?: ThemeOptions["components"]; // Additional component overrides to merge
}

/**
 * AppTheme component that provides a consistent Material-UI theme throughout the application
 * Acts as a wrapper that can either apply a custom theme or pass through children unchanged
 *
 * Features:
 * - CSS variables support for dynamic theming
 * - Custom color palette configuration
 * - Optional theme disabling for testing or fallback scenarios
 * - Component override support for customizing MUI components
 */
export default function AppTheme(props: AppThemeProps) {
	const { children, disableCustomTheme, themeComponents } = props;

	/**
	 * Memoized theme creation to prevent unnecessary re-computations
	 * Only recreates theme when dependencies change (disableCustomTheme or themeComponents)
	 */
	const theme = useMemo(() => {
		// Return empty object if custom theme is disabled
		// This allows the component to render children without theme provider
		return disableCustomTheme
			? {}
			: createTheme({
					// CSS Variables configuration for dynamic theme switching
					cssVariables: {
						// Attribute selector used to detect color scheme changes
						colorSchemeSelector: "data-mui-color-scheme",
						// Prefix for CSS custom properties to avoid naming conflicts
						cssVarPrefix: "template",
					},
					// Component-specific styling overrides
					components: {
						// Spread any additional component overrides passed as props
						...themeComponents,
					},
					// Color palette definition
					palette: {
						// Primary color used for main actions and highlights
						primary: {
							main: "#556cd6", // Blue-purple shade
						},
						// Secondary color for accents and supporting elements
						secondary: {
							main: "#19857b", // Teal/green shade
						},
						// Error color for warnings, alerts, and destructive actions
						error: {
							main: red.A400, // Material-UI red accent color
						},
					},
				});
	}, [disableCustomTheme, themeComponents]); // Dependency array for memoization

	// Early return: render children without theme provider if custom theme is disabled
	// Useful for testing scenarios or when you want to use default MUI theme
	if (disableCustomTheme) {
		return <>{children}</>;
	}

	// Main render: wrap children with MUI ThemeProvider
	return (
		<ThemeProvider
			theme={theme}
			disableTransitionOnChange // Prevents flickering during theme transitions
		>
			{children}
		</ThemeProvider>
	);
}
