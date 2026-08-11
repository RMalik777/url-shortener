import { defineConfig } from "vite";
import { devtools } from "@tanstack/devtools-vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact, { reactCompilerPreset } from "@vitejs/plugin-react";
import babel from "@rolldown/plugin-babel";
import viteTsConfigPaths from "vite-tsconfig-paths";
import tailwindcss from "@tailwindcss/vite";
import { cloudflare } from "@cloudflare/vite-plugin";

const config = defineConfig({
	server: {
		port: 3000,
	},
	plugins: [
		cloudflare({ viteEnvironment: { name: "ssr" } }),
		// this is the plugin that enables path aliases
		viteTsConfigPaths({
			projects: ["./tsconfig.json"],
		}),
		devtools(),
		tailwindcss(),
		tanstackStart({
			sitemap: {
				enabled: true,
				host: "https://url.raflimalik.com",
			},
		}),
		viteReact(),
		// plugin-react v6 dropped its own `babel` option, so the React Compiler runs
		// through @rolldown/plugin-babel instead (same wiring as apps/server).
		babel({ presets: [reactCompilerPreset()] }),
	],
});

export default config;
