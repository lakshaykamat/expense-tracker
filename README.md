# Expense Tracker

Personal expense and budget tracker. Monorepo with a NestJS API and a Next.js PWA.

## Apps

| Path     | Stack                                                              | Dev port |
| -------- | ------------------------------------------------------------------ | -------- |
| `server` | NestJS 11, MongoDB (Mongoose), JWT auth                            | 8000     |
| `web`    | Next.js 16 (App Router), React 19, Tailwind 4, shadcn/ui, SWR, PWA | 3001     |

## Getting started

Requires Node ≥ 18 and pnpm.

```bash
# server
cd server && pnpm install && pnpm start:dev

# web (in another shell)
cd web && pnpm install && pnpm dev
```

The web app expects the API at the URL configured in `web/proxy.ts` / env.

## Environment

- **server**: `PORT`, MongoDB connection string, JWT secret, CORS origins (see `server/src/common/utils/cors.utils.ts`).
- **web**: API base URL / proxy config.

## Docs

- `server/CLAUDE.md` — backend layout and conventions
- `server/API.md` — HTTP API reference
- `web/CLAUDE.md` — frontend layout and conventions
- `web/README-PWA.md` — PWA setup notes
