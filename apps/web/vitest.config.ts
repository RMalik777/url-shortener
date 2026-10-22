import { defineConfig } from "vitest/config";

// Kept apart from vite.config.ts: the Cloudflare plugin does not run in Vitest.
export default defineConfig({
	resolve: {
		tsconfigPaths: true,
	},
	test: {
		environment: "jsdom",
		include: ["src/**/*.test.{ts,tsx}"],
	},
});
