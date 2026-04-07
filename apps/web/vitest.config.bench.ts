import { defineConfig } from "vitest/config";
import codspeedPlugin from "@codspeed/vitest-plugin";
import viteTsConfigPaths from "vite-tsconfig-paths";

export default defineConfig({
	plugins: [
		codspeedPlugin(),
		viteTsConfigPaths({
			projects: ["./tsconfig.json"],
		}),
	],
	test: {
		benchmark: {
			include: ["src/**/*.bench.ts"],
		},
	},
});
