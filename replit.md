# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Structure

```text
artifacts-monorepo/
├── artifacts/              # Deployable applications
│   ├── api-server/         # Express API server
│   └── exampro/            # EXAMPRO X EXAMCORE frontend (React + Vite)
├── lib/                    # Shared libraries
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   └── db/                 # Drizzle ORM schema + DB connection
├── scripts/                # Utility scripts (single workspace package)
│   └── src/                # Individual .ts scripts, run via `pnpm --filter @workspace/scripts run <script>`
├── pnpm-workspace.yaml     # pnpm workspace (artifacts/*, lib/*, lib/integrations/*, scripts)
├── tsconfig.base.json      # Shared TS options (composite, bundler resolution, es2022)
├── tsconfig.json           # Root TS project references
└── package.json            # Root package with hoisted devDeps
```

## Project: EXAMPRO X EXAMCORE — Admin PDF Generator

JAMB past question PDF generator for admin use. Single admin account only.

### Admin Credentials
- Email: `infocheelee01@gmail.com`
- Password: `admin123`

### Frontend (artifacts/exampro)
- **Login page** (`/`) — Admin-only login, redirects to dashboard
- **Dashboard page** (`/dashboard`) — PDF generation form with:
  - Paper title, subtitle, school name, exam date, duration fields
  - Up to 4 JAMB subjects (English, Mathematics, Physics, etc.)
  - Per-subject year selection (2010–2024 or Mixed) and question count
  - Toggle: show answers inline OR include answer key page
  - Download button triggers backend PDF generation
- Dark navy professional theme with electric blue accents
- No registration — admin only

### Backend (artifacts/api-server)
- `POST /api/auth/login` — Hardcoded admin check (no DB)
- `POST /api/auth/logout` — Clears in-memory session
- `GET /api/auth/me` — Returns admin user from session
- `POST /api/pdf/generate` — Fetches questions from ALOC API, generates professional PDF

### ALOC Questions API
- Token: stored in `ALOC_TOKEN` env var (`QB-a426946c75c1e80cb2ef`)
- Base URL: `https://questions.aloc.com.ng/api/v2`
- Endpoint: `GET /q?subject=<subject>&year=<year>&type=utme`
- Header: `AccessToken: <token>`

### PDF Features
- Professional dark-themed header with EXAMCORE branding
- Per-subject section banners
- Numbered questions with A–D options
- Optional: highlight correct answers inline
- Optional: answer key page at end
- Generated using PDFKit (`pdfkit` package)

## TypeScript & Composite Projects

Every package extends `tsconfig.base.json` which sets `composite: true`. The root `tsconfig.json` lists all packages as project references. This means:

- **Always typecheck from the root** — run `pnpm run typecheck` (which runs `tsc --build --emitDeclarationOnly`). This builds the full dependency graph so that cross-package imports resolve correctly. Running `tsc` inside a single package will fail if its dependencies haven't been built yet.
- **`emitDeclarationOnly`** — we only emit `.d.ts` files during typecheck; actual JS bundling is handled by esbuild/tsx/vite...etc, not `tsc`.
- **Project references** — when package A depends on package B, A's `tsconfig.json` must list B in its `references` array. `tsc --build` uses this to determine build order and skip up-to-date packages.

## Root Scripts

- `pnpm run build` — runs `typecheck` first, then recursively runs `build` in all packages that define it
- `pnpm run typecheck` — runs `tsc --build --emitDeclarationOnly` using project references

## Packages

### `artifacts/exampro` (`@workspace/exampro`)

React + Vite frontend for EXAMPRO X EXAMCORE. Served at `/`.

- Auth state managed via `AuthContext`
- Uses `@workspace/api-client-react` generated hooks for API calls
- UI built with Shadcn components, Tailwind CSS, Framer Motion
- Routes: `/`, `/login`, `/register`, `/dashboard`

### `artifacts/api-server` (`@workspace/api-server`)

Express 5 API server. Routes live in `src/routes/` and use `@workspace/api-zod` for request and response validation and `@workspace/db` for persistence.

- Entry: `src/index.ts` — reads `PORT`, starts Express
- App setup: `src/app.ts` — mounts CORS, cookie-parser, JSON/urlencoded parsing, routes at `/api`
- Routes: `src/routes/index.ts` mounts sub-routers
  - `src/routes/health.ts` — `GET /api/healthz`
  - `src/routes/auth.ts` — auth endpoints at `/api/auth/*`
- Depends on: `@workspace/db`, `@workspace/api-zod`

### `lib/db` (`@workspace/db`)

Database layer using Drizzle ORM with PostgreSQL. Exports a Drizzle client instance and schema models.

- `src/schema/users.ts` — users table
- `src/schema/sessions.ts` — sessions table
- Production migrations are handled by Replit. In development: `pnpm --filter @workspace/db run push`

### `lib/api-spec` (`@workspace/api-spec`)

Owns the OpenAPI 3.1 spec (`openapi.yaml`) and the Orval config (`orval.config.ts`).

Run codegen: `pnpm --filter @workspace/api-spec run codegen`
