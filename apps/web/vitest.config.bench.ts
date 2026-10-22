import { defineConfig } from "vitest/config";
import codspeedPlugin from "@codspeed/vitest-plugin";

export default defineConfig({
	plugins: [codspeedPlugin()],
	resolve: {
		tsconfigPaths: true,
	},
	test: {
		benchmark: {
			include: ["src/**/*.bench.ts"],
		},
	},
});
