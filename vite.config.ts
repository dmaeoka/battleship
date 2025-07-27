import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
	plugins: [react()],
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
});
