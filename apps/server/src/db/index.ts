import { createDb } from "@repo/db";
import { env as binding } from "cloudflare:workers";
import type { D1Database } from "@cloudflare/workers-types";

export function getDb(env: D1Database) {
	return createDb(env);
}

export const db = getDb(binding.DB);
