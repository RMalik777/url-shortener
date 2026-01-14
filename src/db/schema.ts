import { sql } from "drizzle-orm";
import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

import { user } from "./auth-schema";

export const urls = sqliteTable(
	"urls",
	{
		id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
		urlFull: text("url_full").notNull(),
		urlShort: text("url_short").notNull().unique(),
		clicked: integer("clicked").notNull().default(0),
		createdAt: integer("created_at", { mode: "timestamp_ms" })
			.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
			.notNull(),
		updatedAt: integer("updated_at", { mode: "timestamp_ms" })
			.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
			.$onUpdate(() => /* @__PURE__ */ new Date())
			.notNull(),
		createdBy: text("created_by")
			.notNull()
			.references(() => user.id),
	},
	(table) => [index("urls_createdBy_idx").on(table.createdBy)],
);

export { account, session, user, verification } from "./auth-schema";
export type { User, Session, Account, Verification } from "./auth-schema";
