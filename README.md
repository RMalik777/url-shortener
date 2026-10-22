# URL Shortener

[![CodSpeed](https://img.shields.io/endpoint?url=https://codspeed.io/badge.json)](https://codspeed.io/RMalik777/url-shortener?utm_source=badge)

A URL shortener on Cloudflare Workers. Users sign in to a dashboard, create short links, and share them. A second Worker reads the short code and sends the visitor to the full URL.

## Architecture

```text
             url.raflimalik.com                      raf.li
          ┌────────────────────┐            ┌────────────────────┐
 user ───▶│  apps/web          │            │  apps/server       │◀─── visitor
          │  dashboard + auth  │            │  redirect worker   │
          └─────────┬──────────┘            └─────────┬──────────┘
                    │ read / write                    │ read only
                    ▼                                 ▼
                 ┌──────────────────────────────────────┐
                 │  Cloudflare D1  "url-shortener"       │
                 │  schema + migrations: packages/db     │
                 └──────────────────────────────────────┘

 packages/ui       shared shadcn/ui components and global CSS (used by the two apps)
 packages/db       Drizzle schema, migrations, createDb()
 packages/*-config shared ESLint and TypeScript configuration
```

## Workspace

| Path                         | Package                   | Purpose                                             |
| ---------------------------- | ------------------------- | --------------------------------------------------- |
| `apps/web`                   | `web`                     | Dashboard. Sign-in, link list, link edit, profile.  |
| `apps/server`                | `server`                  | Redirect Worker for short links.                    |
| `packages/db`                | `@repo/db`                | Drizzle ORM schema and D1 migrations.               |
| `packages/ui`                | `@repo/ui`                | shadcn/ui components, templates, and `globals.css`. |
| `packages/eslint-config`     | `@repo/eslint-config`     | Shared ESLint flat config.                          |
| `packages/typescript-config` | `@repo/typescript-config` | Shared `tsconfig` presets.                          |

Internal packages have no build step. The apps import their TypeScript source directly, and Vite compiles it.

## Stack

- TanStack Start, TanStack Router, TanStack Query, TanStack Form, TanStack Table
- React 19 with React Compiler
- Tailwind CSS 4 and shadcn/ui (Base UI)
- Better Auth (Google, GitHub, passkey)
- Drizzle ORM on Cloudflare D1
- Cloudflare Workers, Wrangler, and the Cloudflare Vite plugin
- Turborepo and pnpm workspaces with a dependency catalog

## Prerequisites

- Node.js 24 or a newer version
- pnpm 12 (the version in `packageManager`. Corepack can install it.)
- A Cloudflare account with access to the D1 database `url-shortener`

## Setup

1. Install the dependencies:

   ```bash
   pnpm install
   ```

2. Copy each `.env.example` file to `.env` and enter the values:

   ```bash
   cp apps/web/.env.example apps/web/.env
   cp apps/server/.env.example apps/server/.env
   cp packages/db/.env.example packages/db/.env
   ```

3. Start the two apps:

   ```bash
   pnpm dev
   ```

The dashboard starts on `http://localhost:3000`. The redirect Worker starts on `http://localhost:5173`. The two apps use the remote D1 database (`"remote": true` in `wrangler.jsonc`).

## Environment variables

| File               | Variables                                                                                                                        | Used by                        |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------------- | ------------------------------ |
| `apps/web/.env`    | `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `GOOGLE_CLIENT_*`, `GITHUB_CLIENT_*`, `VITE_APP_URL`, `VITE_SHORT_URL`, `VITE_LONG_URL` | Dashboard and Better Auth      |
| `apps/server/.env` | `VITE_SHORT_URL`, `VITE_LONG_URL`, `VITE_ROOT_REDIRECT_URL`                                                                      | Redirect Worker                |
| `packages/db/.env` | `CLOUDFLARE_ACCOUNT_ID`, `CLOUDFLARE_DATABASE_ID`, `CLOUDFLARE_D1_TOKEN`                                                         | `drizzle-kit` (D1 HTTP driver) |

Each app validates its variables in `src/env.ts` with `@t3-oss/env-core`. Production values for public variables are in `vars` in each `wrangler.jsonc`. Store secrets with `wrangler secret put <NAME>`.

Turborepo runs in strict environment mode. Vite loads `.env` files itself, and Turborepo adds `VITE_*` variables to the task hash automatically.

## Scripts

Run these commands from the repository root.

| Command                             | Action                                                                 |
| ----------------------------------- | ---------------------------------------------------------------------- |
| `pnpm dev`                          | Start the two apps in dev mode.                                        |
| `pnpm dev:web` / `pnpm dev:server`  | Start one app.                                                         |
| `pnpm build`                        | Build the two apps (cached by Turborepo).                              |
| `pnpm preview`                      | Build, then serve the production build.                                |
| `pnpm check`                        | Do the Prettier check, lint, type check, and tests.                    |
| `pnpm lint` / `pnpm lint:fix`       | Run ESLint in each package. `lint:fix` also fixes problems.            |
| `pnpm check-types`                  | Run `tsc --noEmit` in each package.                                    |
| `pnpm test`                         | Run Vitest in each app.                                                |
| `pnpm format` / `pnpm format:check` | Format all files with Prettier, or only examine them.                  |
| `pnpm cf-typegen`                   | Generate `worker-configuration.d.ts` from `wrangler.jsonc`.            |
| `pnpm deploy`                       | Build and deploy the two Workers.                                      |
| `pnpm deploy:web` / `deploy:server` | Build and deploy one Worker.                                           |
| `pnpm clean`                        | Remove `dist` and `.turbo` folders in the packages.                    |
| `pnpm db:<command>`                 | Run `drizzle-kit` in `packages/db`. Refer to [Database](#database).    |
| `pnpm auth:generate`                | Generate the Better Auth schema. Refer to [Auth schema](#auth-schema). |

To run a task in one package, add a filter. For example: `pnpm turbo run lint --filter=@repo/ui`.

## Database

The schema is in `packages/db/src/schema.ts` and `packages/db/src/auth-schema.ts`. Migrations are in `packages/db/drizzle`.

To change the schema:

1. Edit the schema files.
2. Generate a migration:

   ```bash
   pnpm db:generate
   ```

3. Examine the SQL file in `packages/db/drizzle`.
4. Apply the migration to D1:

   ```bash
   pnpm db:migrate
   ```

Other commands:

- `pnpm db:check` examines the migration history for errors.
- `pnpm db:studio` opens Drizzle Studio.
- `pnpm db:push` and `pnpm db:pull` sync the schema without a migration file.

> **CAUTION:** `db:migrate` and `db:push` change the production D1 database. Make a backup before you run them:
>
> ```bash
> pnpm --filter web exec wrangler d1 export url-shortener --remote --output "$HOME/url-shortener-backup.sql"
> ```
>
> The backup contains user data. Keep it outside the repository, and do not commit it.

## Auth schema

Better Auth plugins can add tables or columns. After you change the plugins in `apps/web/src/lib/auth/index.ts`, run:

```bash
pnpm auth:generate
```

The command writes `packages/db/src/auth-schema.generated.ts`. Git ignores this file. Compare it with `auth-schema.ts` and copy the changes by hand. `auth-schema.ts` has custom code (UUID defaults and exported types) that the generator does not keep. Then run `pnpm db:generate`.

## Deployment

Each app is a Cloudflare Worker:

| App           | Worker name            | Domain               |
| ------------- | ---------------------- | -------------------- |
| `apps/web`    | `url-shortener`        | `url.raflimalik.com` |
| `apps/server` | `url-shortener-server` | `raf.li`             |

Log in to Wrangler one time with `pnpm --filter web exec wrangler login`. Then run `pnpm deploy`. Turborepo builds each app before it deploys. In CI, set `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`. Turborepo gives these two variables to the `deploy` task.

## CI

- `.github/workflows/ci.yml` runs on each push to `main` and on each pull request. It does the Prettier check, then lint, type check, tests, and build. Turborepo caching is not used in CI. Each run does all tasks.
- `.github/workflows/codspeed.yml` runs the benchmarks in `apps/web` (`*.bench.ts`) on CodSpeed.
- Dependabot opens weekly update pull requests for npm packages and GitHub Actions.

## Turborepo configuration

`turbo.json` has these important parts:

- `check-types`, `lint`, and `test` depend on a `transit` node. Thus these tasks run in parallel, but a change in a dependency also invalidates the cache.
- `build` caches `dist/**`. The task hash includes the `.env*` files.
- `dev`, `preview`, and `db:studio` are persistent tasks without cache.
- `deploy` and the `db:*` tasks do not use the cache, because they change remote systems.

The installed `turbo` package has the full Turborepo documentation in `node_modules/turbo/docs`.

## UI components

To add a shadcn/ui component, run this command in `apps/web`:

```bash
pnpm dlx shadcn@latest add button
```

The component goes into `packages/ui/src/components`. Import it from the `ui` package:

```tsx
import { Button } from "@repo/ui/components/button";
```

## License

[AGPL-3.0](./LICENSE)
