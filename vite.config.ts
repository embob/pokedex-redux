// vite.config.ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import svgr from "vite-plugin-svgr";

export default defineConfig({
	plugins: [
		react(), // React fast‑refresh + TSX transform
		tailwindcss(), // Tailwind v4 Vite plugin
		svgr(), // Import SVGs as React components
	],
	test: {
		globals: true,
		environment: "jsdom",
	},
});
