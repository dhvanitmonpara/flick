# Flick - Agent Development Guide

This is a pnpm monorepo with Turbo. The workspace contains multiple packages:
- `admin/` - React + Vite admin dashboard
- `web/` - Next.js web application  
- `landing/` - Next.js landing page
- `server/` - Bun + Express backend API
- `shared/` - Shared TypeScript types
- `ocr/` - Node.js OCR service

## Build/Lint/Test Commands

### Root (all packages)
```bash
pnpm dev          # Run dev in all packages (parallel)
pnpm build        # Build all packages
pnpm clean        # Clean all packages
pnpm lint         # Lint all packages
pnpm test         # Test all packages
```

### Server (Bun + Express + Drizzle ORM)
```bash
cd server
bun run dev              # Development with watch
bun run build            # Build (runs lint-format & db:migrate first)
bun run start            # Start production server
bun run lint             # Biome check
bun run lint-format      # Biome check --write
bun run typecheck        # tsc --noEmit

# Database
bun run db:up            # Start Docker PostgreSQL
bun run db:down          # Stop Docker PostgreSQL
bun run db:migrate       # Run Drizzle migrations
bun run db:generate      # Generate Drizzle types
bun run db:check         # Check migrations
bun run seed             # Seed database
```

### Web (Next.js + Biome)
```bash
cd web
pnpm dev                 # Next.js dev
pnpm build               # Next.js build
pnpm lint                # Biome check
pnpm format              # Biome format --write
pnpm check-types         # tsc --noEmit
```

### Admin (Vite + React + ESLint)
```bash
cd admin
pnpm dev                 # Vite dev
pnpm build               # tsc -b && vite build
pnpm lint                # ESLint check
```

### OCR (Express + TypeScript)
```bash
cd ocr
pnpm dev                 # nodemon with ts-node
pnpm build               # tsc
pnpm start               # node dist/index.js
```

### Running a Single Test
The server uses Node.js's built-in test runner. Run tests with:
```bash
cd server
bun test                           # Run all tests
bun test <path-to-test-file>       # Run specific test file
```

## Code Style Guidelines

### Formatting
- **VS Code**: Use Biome formatter (`biome.json` configs in each package)
- **Server**: Uses tabs, double quotes, semicolons always
- **Web**: Uses 2-space indentation
- **Admin**: Uses ESLint + Prettier (via VS Code)
- Enable in VS Code: `"editor.formatOnSave": true`

### Import Organization
- Biome handles import sorting automatically (enabled via `organizeImports` action)
- Group imports: external libs, internal modules

### TypeScript
- `strict: true` enabled in tsconfig.json
- Use explicit types for function parameters and return values
- Use Zod for runtime validation (server uses Zod v4, web uses Zod v4)

### Naming Conventions
- **Files**: kebab-case (`user-service.ts`) or PascalCase (`UserService.ts`)
- **Components**: PascalCase (`UserProfile.tsx`)
- **Variables/functions**: camelCase
- **Constants**: SCREAMING_SNAKE_CASE for config values

### Error Handling
- Server: Use Zod schemas for request validation
- Use try/catch with proper error logging (server uses Winston)
- Return appropriate HTTP status codes

### React Patterns
- Use functional components with hooks
- Use `zod` + `react-hook-form` for form validation
- Use Radix UI primitives for accessible components
- Use `zustand` for state management
- Use `sonner` for toasts

### Database
- Use Drizzle ORM with PostgreSQL
- Run `bun run db:generate` after schema changes
- Run `bun run db:migrate` to apply migrations

### Git Conventions
- Commits follow Conventional Commits (`feat:`, `fix:`, `chore:`, etc.)
- Husky pre-commit hooks run linting
- Use `pnpm -r --parallel` for parallel operations across packages

### Key Dependencies
- **Auth**: better-auth
- **Database**: Drizzle ORM + PostgreSQL
- **Validation**: Zod
- **UI**: Radix UI, Tailwind CSS (admin/landing), clsx + tailwind-merge
- **State**: zustand
- **Backend**: Express (ocr), Bun + Express (server)
- **Frontend**: React 18/19, Next.js 16

## Project Structure

### Server (`server/src/`)
- `routes/` - API route handlers
- `controllers/` - Business logic
- `services/` - Service layer
- `infra/` - Infrastructure (DB, auth, etc.)
- `middleware/` - Express middleware
- `utils/` - Utility functions

### Web (`web/src/`)
- `app/` - Next.js app router pages
- `components/` - React components
- `lib/` - Utilities and helpers
- `stores/` - Zustand stores

### Admin (`admin/src/`)
- `pages/` - React Router pages
- `components/` - Reusable components
- `hooks/` - Custom React hooks
- `stores/` - Zustand stores

## Environment Variables

Create `.env` files as needed. The server uses:
- `DATABASE_URL` - PostgreSQL connection string
- `BETTER_AUTH_SECRET` - Auth secret key
- Various service API keys

Check `.env.example` files in each package for required variables.

## API Development

### Server Routes
- Routes are defined in `server/src/routes/`
- Use Express router pattern
- Validate request bodies with Zod schemas
- Return JSON responses with appropriate status codes

### Testing Patterns
Tests use Node.js built-in test runner (`node:test`):
```typescript
import { describe, it } from "node:test";
import assert from "node:assert/strict";
```
- Place test files alongside source files with `.test.ts` suffix
- Use descriptive test names following the pattern "should..."

## Development Workflow

1. Start database: `bun run db:up` (server)
2. Run migrations: `bun run db:migrate` (server)
3. Generate types: `bun run db:generate` (server)
4. Start dev server: `pnpm dev` (root) or `bun run dev` (server)
5. Make changes following code style guidelines
6. Run lint/typecheck before committing
7. Tests should pass before committing
