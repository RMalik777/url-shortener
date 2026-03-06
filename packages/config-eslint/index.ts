//  @ts-check

import { fileURLToPath } from "node:url";
import { includeIgnoreFile } from "@eslint/compat";
import { tanstackConfig } from "@tanstack/eslint-config";

const gitignorePath = fileURLToPath(new URL("../../.gitignore", import.meta.url));

export const eslintconfig = [
	includeIgnoreFile(gitignorePath, "Imported .gitignore patterns"),
	...tanstackConfig,
];
