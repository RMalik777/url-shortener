// @ts-check

/** @type {import('prettier').Config & import('prettier-plugin-tailwindcss').PluginOptions} */
const config = {
	tabWidth: 2,
	useTabs: true,
	printWidth: 100,
	plugins: ["prettier-plugin-tailwindcss"],
	tailwindStylesheet: "./packages/ui/src/styles/globals.css",
	tailwindFunctions: ["clsx", "cn", "cva", "twMerge", "tv"],
};

export default config;
