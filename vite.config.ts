/// <reference types="vitest" />

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
	plugins: [react(), tailwindcss()],
	build: {
		rollupOptions: {
			output: {
				manualChunks: {
					// Split vendor libraries into separate chunks
					vendor: ["react", "react-dom"],
				},
			},
		},
		// Adjust the chunk size warning limit if needed
		chunkSizeWarningLimit: 1000, // Set to 1MB, adjust as needed
		// Enable minification (esbuild is default and faster)
		minify: true,
	},
	test: {
		environment: "jsdom",
		globals: true,
		setupFiles: "./setupTests.ts",
		css: true,
		coverage: {
			provider: "v8", // or 'istanbul'
			reporter: ["text", "json", "html"],
			// Reports will be generated in a `coverage` directory
			reportsDirectory: "./coverage",
			// Include all files in the src directory
			include: ["src/**/*.{ts,tsx}"],
			// Exclude files that don't need to be tested
			exclude: ["src/main.tsx", "src/types", "src/vite-env.d.ts"],
		},
	},
});
