# server — CLAUDE.md

NestJS 11 + MongoDB (Mongoose) + JWT auth.

## Commands

- `pnpm start:dev` — watch mode (port 8000 default)
- `pnpm build` — `nest build`
- `pnpm lint` — eslint --fix
- `pnpm test` / `pnpm test:e2e`

## Layout

- `src/main.ts` — bootstrap; CORS, global `ValidationPipe`, `HttpExceptionFilter`, `ResponseInterceptor`
- `src/app.module.ts` — root module
- `src/auth/` — JWT auth (controller, service, guards, schemas)
- `src/users/` — user CRUD
- `src/budgets/` — DDD layout: `domain/`, `application/`, `presentation/`
- `src/modules/expenses/` — layered: `controller/`, `service/`, `repository/`, `dto/`, `entities/`
- `src/email/`, `src/health/`
- `src/common/` — `decorators/`, `filters/`, `interceptors/`, `utils/` (incl. `cors.utils.ts`)

## Conventions

- Imports use `.js` extension (NodeNext resolution) even for `.ts` source.
- All responses wrapped by `ResponseInterceptor`; throw `HttpException` subclasses — `HttpExceptionFilter` formats them.
- DTOs use `class-validator`; `whitelist: true` is on, so undeclared fields are stripped.
- Two module styles coexist (`budgets/` DDD vs `modules/expenses/` layered). Match the style of the module you're editing — don't refactor across.
- Env: `PORT`, Mongo URI, JWT secret, CORS origins (see `common/utils/cors.utils.ts`).
