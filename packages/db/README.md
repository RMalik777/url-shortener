# @repo/db

Drizzle ORM schema and migrations for the Cloudflare D1 database `url-shortener`. The two apps use this package.

## Exports

| Import            | Content                                                                                 |
| ----------------- | --------------------------------------------------------------------------------------- |
| `@repo/db`        | `createDb(d1)` and the `Database` type.                                                 |
| `@repo/db/schema` | Tables (`urls`, `user`, `session`, `account`, `verification`, `passkey`) and row types. |

Example in a Worker:

```ts
import { env } from "cloudflare:workers";
import { createDb } from "@repo/db";

export const db = createDb(env.DB);
```

## Files

| Path                 | Content                                                                              |
| -------------------- | ------------------------------------------------------------------------------------ |
| `src/schema.ts`      | App tables. Re-exports the auth tables.                                              |
| `src/auth-schema.ts` | Better Auth tables. Edit by hand after `pnpm auth:generate`.                         |
| `drizzle/`           | SQL migrations and snapshots from `drizzle-kit generate`. Do not edit the snapshots. |
| `drizzle.config.ts`  | `drizzle-kit` configuration (D1 HTTP driver).                                        |

## Environment variables

`drizzle-kit` uses the D1 HTTP API. Copy `.env.example` to `.env` and enter these values:

| Variable                 | Description                                                |
| ------------------------ | ---------------------------------------------------------- |
| `CLOUDFLARE_ACCOUNT_ID`  | Cloudflare account ID.                                     |
| `CLOUDFLARE_DATABASE_ID` | ID of the D1 database (`database_id` in `wrangler.jsonc`). |
| `CLOUDFLARE_D1_TOKEN`    | API token with D1 edit permission.                         |

## Scripts

Run these from the repository root (`pnpm db:<command>`) or in this folder:

| Command            | Action                                     |
| ------------------ | ------------------------------------------ |
| `pnpm db:generate` | Generate a migration from the schema.      |
| `pnpm db:migrate`  | Apply the migrations to D1.                |
| `pnpm db:check`    | Examine the migration history for errors.  |
| `pnpm db:push`     | Push the schema to D1 without a migration. |
| `pnpm db:pull`     | Get the schema from D1.                    |
| `pnpm db:studio`   | Open Drizzle Studio.                       |

> **CAUTION:** `db:migrate` and `db:push` change the production database. Make a backup first. Refer to the root README for the command.
