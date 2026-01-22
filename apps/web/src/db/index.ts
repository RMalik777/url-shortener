import { createDb } from "@repo/db";
import { env } from "cloudflare:workers";

export function getDb() {
	return createDb(env.DB);
}

export const db = getDb();
