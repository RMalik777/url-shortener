# web

The dashboard of the URL shortener. Users sign in, create short links, edit them, and remove them. The app runs on Cloudflare Workers at `url.raflimalik.com` (Worker `url-shortener`).

## Routes

| Route           | Page                                        |
| --------------- | ------------------------------------------- |
| `/`             | Create a short link.                        |
| `/list`         | Table of the links of the user.             |
| `/list/$id`     | Details and edit form of one link.          |
| `/profile`      | Account details and linked sign-in methods. |
| `/link-removed` | Page for a link that the owner removed.     |
| `/signin`       | Sign in with Google, GitHub, or a passkey.  |
| `/signup`       | Sends the user to `/signin`.                |
| `/api/auth/*`   | Better Auth handler.                        |

## Environment variables

Copy `.env.example` to `.env`. `src/env.ts` validates these variables:

| Variable                                   | Type   | Description                                 |
| ------------------------------------------ | ------ | ------------------------------------------- |
| `BETTER_AUTH_SECRET`                       | secret | Key that Better Auth uses to sign sessions. |
| `BETTER_AUTH_URL`                          | server | Base URL of this app.                       |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | secret | Google OAuth app.                           |
| `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET` | secret | GitHub OAuth app.                           |
| `VITE_APP_URL`                             | public | URL of this app.                            |
| `VITE_SHORT_URL`                           | public | Base URL of short links (`apps/server`).    |
| `VITE_LONG_URL`                            | public | URL for the "link removed" page.            |

In production, public values come from `vars` in `wrangler.jsonc`. Store secrets with `pnpm exec wrangler secret put <NAME>`.

## Scripts

| Command                                          | Action                                                                  |
| ------------------------------------------------ | ----------------------------------------------------------------------- |
| `pnpm dev`                                       | Start Vite on port 3000.                                                |
| `pnpm build`                                     | Build the Worker into `dist`.                                           |
| `pnpm preview`                                   | Serve the build.                                                        |
| `pnpm deploy`                                    | Deploy with Wrangler. Use `pnpm deploy:web` at the root to build first. |
| `pnpm cf-typegen`                                | Generate `worker-configuration.d.ts`.                                   |
| `pnpm test`                                      | Run Vitest (`src/**/*.test.{ts,tsx}`).                                  |
| `pnpm bench`                                     | Run the benchmarks (`src/**/*.bench.ts`) with CodSpeed.                 |
| `pnpm auth:generate`                             | Generate the Better Auth schema into `packages/db`.                     |
| `pnpm check-types`, `pnpm lint`, `pnpm lint:fix` | Type check and lint.                                                    |

## Folder structure

```text
src/
  components/   App components (table, dialogs, header, footer)
  db/           D1 database instance from @repo/db
  lib/
    auth/       Better Auth server and client configuration
    middleware/ Route middleware for authentication
    query/      TanStack Query options and server functions
    schema/     Zod schemas for forms
    functions/  Helper functions (with benchmarks)
  routes/       File-based routes (TanStack Router)
```

`vite.config.ts` is for dev and build. `vitest.config.ts` is for tests, because the Cloudflare plugin does not operate in Vitest.
