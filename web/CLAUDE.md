# web — CLAUDE.md

Next.js 16 (App Router) + React 19 + Tailwind 4 + shadcn/ui + SWR. PWA via `next-pwa`.

## Commands

- `pnpm dev` — dev server on **port 3001** (webpack)
- `pnpm build` / `pnpm start`
- `pnpm lint`
- `pnpm generate-icons` — regenerate PWA icons from source

## Layout

- `app/` — routes: `home/`, `login/`, `signup/`, `profile/`, `budgets/`, `analysis/`; `layout.tsx`, `error.tsx`, `global-error.tsx`, `providers/`
- `features/` — domain code grouped by feature: `auth/`, `budgets/`, `expenses/`, `analysis/` (hooks, components, API)
- `components/` — shadcn primitives + shared UI
- `shared/`, `lib/`, `helpers/`, `utils/`, `constants/`, `types/`
- `proxy.ts` — API proxy config
- `public/` — PWA manifest, icons; `scripts/generate-icons.js`

## Conventions

- Server actions / fetching live in `features/*/api` (or similar) — UI components stay thin.
- SWR for client data fetching; mutate after writes.
- Use shadcn components from `components/ui/` before adding new primitives; check `components.json` for config.
- Tailwind 4 — config is CSS-first (`globals.css`); no `tailwind.config.js`.
- Path alias `@/*` resolves to project root.
- API base URL comes through `proxy.ts` / env — don't hardcode `localhost:8000`.
