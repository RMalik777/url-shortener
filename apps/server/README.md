# server

The redirect Worker of the URL shortener. It runs on Cloudflare Workers at `raf.li` (Worker `url-shortener-server`). It reads the short code from the path, finds the link in D1, and sends the visitor to the full URL.

## Routes

| Route    | Condition                                    | Result                                              |
| -------- | -------------------------------------------- | --------------------------------------------------- |
| `/`      | Always                                       | `301` redirect to `VITE_ROOT_REDIRECT_URL`.         |
| `/$code` | The link exists                              | `301` redirect to the full URL.                     |
| `/$code` | The link has the intermediary screen enabled | Page that shows the destination before the visit.   |
| `/$code` | The owner removed the link                   | `301` redirect to `/link-removed` on the dashboard. |
| `/$code` | The code is unknown                          | `301` redirect to `VITE_ROOT_REDIRECT_URL`.         |

The Worker only reads the `urls` table. The dashboard (`apps/web`) writes it.

## Environment variables

Copy `.env.example` to `.env`. `src/env.ts` validates these variables:

| Variable                 | Description                                |
| ------------------------ | ------------------------------------------ |
| `VITE_SHORT_URL`         | Base URL of this Worker.                   |
| `VITE_LONG_URL`          | URL of the dashboard (`apps/web`).         |
| `VITE_ROOT_REDIRECT_URL` | Destination for `/` and for unknown codes. |

In production, the values come from `vars` in `wrangler.jsonc`.

## Scripts

| Command                                          | Action                                                                     |
| ------------------------------------------------ | -------------------------------------------------------------------------- |
| `pnpm dev`                                       | Start Vite on port 5173.                                                   |
| `pnpm build`                                     | Build the Worker into `dist`.                                              |
| `pnpm preview`                                   | Serve the build.                                                           |
| `pnpm deploy`                                    | Deploy with Wrangler. Use `pnpm deploy:server` at the root to build first. |
| `pnpm cf-typegen`                                | Generate `worker-configuration.d.ts`.                                      |
| `pnpm test`                                      | Run Vitest (`src/**/*.test.{ts,tsx}`).                                     |
| `pnpm check-types`, `pnpm lint`, `pnpm lint:fix` | Type check and lint.                                                       |
