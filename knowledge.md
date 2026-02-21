# Project knowledge

Flick is an anonymous social platform (monorepo) with a web client, admin dashboard, landing page, OCR microservice, and shared library.

## Quickstart
- **Package manager:** pnpm (v10) with workspaces; orchestrated by Turborepo
- **Install:** `pnpm install`
- **Dev (all packages):** `pnpm dev` (runs all workspace `dev` scripts in parallel)
- **Build:** `pnpm build`
- **Lint:** `pnpm lint`
- **Test:** `pnpm test`

## Architecture
- **web/** — Main user-facing Next.js 16 app (React 19, Tailwind v4, Zustand, Biome)
- **admin/** — Admin dashboard built with Vite + React 18 (React Router, Tailwind v3, ESLint)
- **server/** — Express 5 API on Bun runtime (Drizzle ORM, PostgreSQL, Redis, Socket.IO, better-auth, Zod, Winston logging, Biome)
- **landing/** — Marketing site, Next.js 16 with Turbopack (Motion, Cobe globe)
- **ocr/** — OCR microservice using Tesseract.js (Express 4, CommonJS, ts-node/nodemon)
- **shared/** — Shared TypeScript types/utilities consumed by web and server (`@flick/shared`)

### Key infra
- PostgreSQL + Redis via Docker Compose (`server/infra/docker-compose.yml`)
- DB migrations: `pnpm --filter @flick/server db:migrate` (Drizzle Kit)
- DB seed: `pnpm --filter @flick/server seed`
- Start DB containers: `pnpm --filter @flick/server db:up`

## Per-package commands
| Package | Dev | Build | Lint | Type-check |
|---------|-----|-------|------|------------|
| web | `next dev` | `next build` | `biome check` | `tsc --noEmit` |
| server | `bun --watch src/server.ts` | `bun run build.ts` | `biome check` | — |
| admin | `vite` | `tsc -b && vite build` | `eslint .` | — |
| landing | `next dev --turbopack` | `next build` | `next lint` | — |
| ocr | `nodemon … ts-node src/index.ts` | `tsc` | — | — |

Run a single package: `pnpm --filter <name> <script>` (e.g. `pnpm --filter web dev`)

## Conventions
- **Formatting/linting:**
  - **web & server** use Biome (web: 2-space indent; server: tab indent, double quotes, semicolons)
  - **admin** uses ESLint
  - Server has Husky + lint-staged + commitlint (conventional commits)
- **State management:** Zustand stores in `store/` directories (web, admin)
- **UI components:** Radix UI primitives + shadcn/ui patterns + Tailwind + `class-variance-authority` + `clsx`/`tailwind-merge`
- **API client:** Axios throughout web & admin
- **Auth:** better-auth (web + server)
- **Validation:** Zod schemas
- **Real-time:** Socket.IO (server ↔ web/admin)
- **Styling pattern:** Tailwind utility classes; component variants via CVA

## Gotchas
- Server runs on **Bun**, not Node — use `bun` to run server scripts
- OCR service is **CommonJS** (`type: "commonjs"`) unlike the rest of the monorepo
- web uses **Tailwind v4** (PostCSS plugin via `@tailwindcss/postcss`); admin uses **Tailwind v3**
- web uses **Next.js 16 + React 19**; admin uses **React 18**
- shared package has no build step — it exports raw `.ts` files directly
