//  @ts-check

import { fileURLToPath } from "node:url";
import { includeIgnoreFile } from "@eslint/compat";
import { tanstackConfig } from "@tanstack/eslint-config";

const gitignorePath = fileURLToPath(new URL("../../.gitignore", import.meta.url));

export const eslintconfig = [
	...tanstackConfig,
	{
		rules: {
			"import/no-cycle": "off",
			"import/order": "off",
			"sort-imports": "off",
			"@typescript-eslint/array-type": "off",
			"@typescript-eslint/require-await": "off",
			"pnpm/json-enforce-catalog": "off",
		},
	},
	includeIgnoreFile(gitignorePath, "Imported .gitignore patterns"),
	{ ignores: ["**/worker-configuration.d.ts", "**/routeTree.gen.ts"] },
	...tanstackConfig,
];
