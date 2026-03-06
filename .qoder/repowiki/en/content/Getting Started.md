# Getting Started

<cite>
**Referenced Files in This Document**
- [package.json](file://package.json)
- [pnpm-workspace.yaml](file://pnpm-workspace.yaml)
- [turbo.json](file://turbo.json)
- [server/package.json](file://server/package.json)
- [server/.env.sample](file://server/.env.sample)
- [server/src/config/env.ts](file://server/src/config/env.ts)
- [server/infra/docker-compose.yml](file://server/infra/docker-compose.yml)
- [server/infra/redis.conf](file://server/infra/redis.conf)
- [web/package.json](file://web/package.json)
- [web/.env.local](file://web/.env.local)
- [admin/package.json](file://admin/package.json)
- [admin/.env](file://admin/.env)
- [landing/package.json](file://landing/package.json)
- [ocr/package.json](file://ocr/package.json)
- [ocr/.env](file://ocr/.env)
- [shared/package.json](file://shared/package.json)
</cite>

## Table of Contents
1. [Introduction](#introduction)
2. [Prerequisites and System Requirements](#prerequisites-and-system-requirements)
3. [Installation and Setup](#installation-and-setup)
4. [Environment Variables Configuration](#environment-variables-configuration)
5. [Database and Infrastructure Setup](#database-and-infrastructure-setup)
6. [Running the Application Locally](#running-the-application-locally)
7. [Development Workflow](#development-workflow)
8. [Architecture Overview](#architecture-overview)
9. [Troubleshooting Guide](#troubleshooting-guide)
10. [Conclusion](#conclusion)

## Introduction
This guide helps you set up the Flick project for local development. It covers installing prerequisites, configuring environment variables, preparing databases and caches, orchestrating containers, and running all packages with Turborepo. You will also learn how to link packages, enable hot reloading, debug effectively, and troubleshoot common issues.

## Prerequisites and System Requirements
- Operating system: macOS, Linux, or Windows (WSL recommended on Windows)
- Node.js: 18.x or 20.x
- PNPM: 10.x (as specified by the workspace)
- Docker and Docker Compose: for PostgreSQL and Redis orchestration
- Git: for cloning the repository
- Text editor or IDE with TypeScript support

**Section sources**
- [package.json](file://package.json#L17-L17)
- [pnpm-workspace.yaml](file://pnpm-workspace.yaml#L1-L15)

## Installation and Setup
Follow these steps to prepare your environment:

1. Install PNPM globally if not installed:
   - Use your OS package manager or official installer to install PNPM 10.x.

2. Fork and clone the repository to your machine.

3. Navigate to the repository root and install workspace dependencies:
   - Run: pnpm install

4. Verify PNPM workspace configuration:
   - Confirm packages listed in pnpm-workspace.yaml are recognized.

5. Initialize Husky hooks (optional but recommended):
   - Run: pnpm prepare (executed per package scripts)

Notes:
- The root package.json defines a dev script that runs all packages in parallel.
- Turborepo is configured for persistent tasks during development.

**Section sources**
- [package.json](file://package.json#L7-L13)
- [pnpm-workspace.yaml](file://pnpm-workspace.yaml#L1-L15)
- [turbo.json](file://turbo.json#L18-L21)

## Environment Variables Configuration
Configure environment variables for each package. Create the indicated files and populate them with your values.

- Server (.env)
  - Copy the sample to .env and set:
    - PORT, NODE_ENV, HTTP_SECURE_OPTION
    - ACCESS_CONTROL_ORIGIN, SERVER_BASE_URI
    - DATABASE_URL, REDIS_URL, CACHE_DRIVER, CACHE_TTL
    - ACCESS_TOKEN_TTL, REFRESH_TOKEN_TTL, ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET
    - GOOGLE_OAUTH_CLIENT_ID, GOOGLE_OAUTH_CLIENT_SECRET
    - Optional: GMAIL_APP_USER, GMAIL_APP_PASS, MAILTRAP_TOKEN, MAIL_PROVIDER, PERSPECTIVE_API_KEY, MAIL_FROM, EMAIL_ENCRYPTION_KEY, EMAIL_SECRET, HMAC_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD

- Web (.env.local)
  - Set:
    - NODE_ENV, SERVER_URI
    - NEXT_PUBLIC_SERVER_API_ENDPOINT, NEXT_PUBLIC_OCR_SERVER_API_ENDPOINT, NEXT_PUBLIC_BASE_URL
    - NEXT_PUBLIC_GOOGLE_OAUTH_ID

- Admin (.env)
  - Set:
    - VITE_SERVER_URI, VITE_SERVER_API_URL, VITE_BASE_URL

- Landing (Next.js)
  - No .env file is present in the landing package; defaults are acceptable for local development.

- OCR (.env)
  - Set:
    - PORT, ENVIRONMENT, HTTP_SECURE_OPTION, ACCESS_CONTROL_ORIGIN

- Shared (no .env)
  - Not applicable; this package exports shared code.

Validation tip:
- The server validates environment variables using Zod. Ensure secrets meet minimum length requirements and enums match allowed values.

**Section sources**
- [server/.env.sample](file://server/.env.sample#L1-L23)
- [server/src/config/env.ts](file://server/src/config/env.ts#L4-L32)
- [web/.env.local](file://web/.env.local#L1-L8)
- [admin/.env](file://admin/.env#L1-L3)
- [landing/package.json](file://landing/package.json#L5-L10)
- [ocr/.env](file://ocr/.env#L1-L4)
- [shared/package.json](file://shared/package.json#L1-L19)

## Database and Infrastructure Setup
Flick uses PostgreSQL and Redis orchestrated via Docker Compose.

1. Start infrastructure:
   - From the server package, run: pnpm db:up
   - This starts:
     - PostgreSQL 17 (port 5432)
     - Adminer (port 8080) for database inspection
     - Redis 7 Alpine (port 6379)

2. Configure database connection:
   - Set DATABASE_URL in server .env to point to your local PostgreSQL instance.
   - Example pattern: postgresql://user:password@host:5432/dbname

3. Configure Redis:
   - Set REDIS_URL in server .env to connect to the Redis container.
   - Example pattern: redis://localhost:6379

4. Apply migrations:
   - From the server package, run: pnpm db:migrate
   - To generate new migrations after schema changes: pnpm db:generate

5. Seed data (optional):
   - Create initial admin user: pnpm create-admin
   - Seed sample data: pnpm seed

6. Stop infrastructure:
   - From the server package, run: pnpm db:down

Notes:
- The Docker Compose file defines health checks for PostgreSQL and Redis.
- Redis is configured with append-only persistence.

**Section sources**
- [server/infra/docker-compose.yml](file://server/infra/docker-compose.yml#L1-L49)
- [server/infra/redis.conf](file://server/infra/redis.conf#L1-L2)
- [server/package.json](file://server/package.json#L15-L19)

## Running the Application Locally
Use Turborepo to run all packages in development mode.

Option 1: Root dev script (recommended)
- Run: pnpm dev
- This executes dev scripts for all packages in parallel.

Option 2: Per-package dev
- Server: pnpm dev (Bun-based)
- Web: pnpm dev (Next.js)
- Admin: pnpm dev (Vite)
- Landing: pnpm dev (Next.js)
- OCR: pnpm dev (Express)
- Shared: no dev script; built as part of workspace

Ports summary:
- Server: default 8000 (adjust via PORT in server .env)
- Web: Next.js default port (typically 3000)
- Admin: Vite default port (typically 5173)
- Landing: Next.js default port (typically 3000)
- OCR: default 8003 (adjust via PORT in OCR .env)
- PostgreSQL: 5432
- Redis: 6379
- Adminer: 8080

Verification:
- Open http://localhost:8000 in your browser to confirm the server responds.
- Access http://localhost:8080 to inspect the database via Adminer.
- Test API endpoints under /api/v1.

**Section sources**
- [package.json](file://package.json#L8-L8)
- [server/package.json](file://server/package.json#L10-L10)
- [web/package.json](file://web/package.json#L6-L6)
- [admin/package.json](file://admin/package.json#L7-L7)
- [landing/package.json](file://landing/package.json#L6-L6)
- [ocr/package.json](file://ocr/package.json#L8-L8)
- [server/infra/docker-compose.yml](file://server/infra/docker-compose.yml#L1-L49)

## Development Workflow
Package linking and hot reloading:
- Workspace linking: PNPM workspace automatically links @flick/* packages. No manual linking required.
- Hot reload:
  - Server: Bun watches src/server.ts for changes.
  - Web: Next.js dev server hot-reloads React pages and API routes.
  - Admin: Vite dev server hot-reloads React components.
  - Landing: Next.js dev server hot-reloads pages.
  - OCR: nodemon watches TypeScript sources and restarts the Express server.

Debugging tips:
- Server: Use Bun’s built-in debugger or attach a Node inspector to the process.
- Web: Use your IDE’s debugger to attach to the Next.js dev server.
- Admin: Use browser devtools and Vite’s dev server logs.
- Landing: Use browser devtools and Next.js logs.
- OCR: Use Node/TSC debugging with nodemon watching.

Type checking and linting:
- Server: pnpm typecheck, pnpm lint, pnpm lint-format
- Web: pnpm check-types, pnpm lint, pnpm format
- Admin: pnpm lint
- Landing: pnpm lint
- OCR: pnpm build (TypeScript), pnpm lint

Build and production:
- Build all packages: pnpm build
- Start server in production: pnpm start (from server)
- Start Web/Admin/Landing in production via their respective start scripts.

**Section sources**
- [server/package.json](file://server/package.json#L8-L22)
- [web/package.json](file://web/package.json#L9-L11)
- [admin/package.json](file://admin/package.json#L9-L9)
- [landing/package.json](file://landing/package.json#L9-L9)
- [ocr/package.json](file://ocr/package.json#L6-L8)

## Architecture Overview
The Flick monorepo uses PNPM workspaces and Turborepo to coordinate six packages and a shared module.

```mermaid
graph TB
subgraph "Monorepo"
SH["@flick/shared"]
SRV["@flick/server"]
WEB["web"]
ADM["@flick/admin"]
LND["@flick/landing"]
OCR["@flick/ocr"]
end
WEB --> SRV
ADM --> SRV
LND --> SRV
OCR --> SRV
SRV --> SH
WEB --> SH
ADM --> SH
LND --> SH
```

**Diagram sources**
- [pnpm-workspace.yaml](file://pnpm-workspace.yaml#L1-L7)
- [shared/package.json](file://shared/package.json#L14-L17)
- [server/package.json](file://server/package.json#L28-L28)
- [web/package.json](file://web/package.json#L14-L14)
- [admin/package.json](file://admin/package.json#L12-L12)
- [landing/package.json](file://landing/package.json#L11-L11)
- [ocr/package.json](file://ocr/package.json#L15-L15)

## Troubleshooting Guide
Common setup issues and resolutions:

- PostgreSQL connection fails
  - Ensure DATABASE_URL matches the Docker container network and credentials.
  - Verify the db service is healthy (Compose healthcheck).
  - Check firewall and port conflicts on 5432.

- Redis connection fails
  - Ensure REDIS_URL points to localhost:6379.
  - Confirm the redis service is healthy (Compose healthcheck).
  - Review redis.conf for correctness.

- Port conflicts
  - Change PORT in server .env and/or OCR .env to free ports.
  - Adjust Next/Vite default ports via their dev commands if needed.

- Missing environment variables
  - The server validates environment variables with Zod. Ensure all required keys are present and meet constraints (e.g., secret min length, enum values).
  - Use the provided .env.sample files as templates.

- Package linking errors
  - Confirm PNPM workspace is configured correctly.
  - Reinstall dependencies: pnpm install.

- Docker permissions
  - On Linux, ensure your user is in the docker group.
  - Restart Docker daemon if containers fail to start.

- Hot reload not working
  - Verify dev scripts are running for each package.
  - Clear caches (delete .next, node_modules/.vite, etc.) and reinstall dependencies.

- Migrations failing
  - Run pnpm db:check to validate migration readiness.
  - Re-run pnpm db:migrate after fixing schema discrepancies.

**Section sources**
- [server/src/config/env.ts](file://server/src/config/env.ts#L4-L32)
- [server/infra/docker-compose.yml](file://server/infra/docker-compose.yml#L13-L17)
- [server/infra/docker-compose.yml](file://server/infra/docker-compose.yml#L37-L41)
- [server/package.json](file://server/package.json#L15-L19)

## Conclusion
You now have a complete local development setup for Flick. With PNPM, Turborepo, Dockerized infrastructure, and properly configured environment variables, you can develop, debug, and iterate across all packages efficiently. Refer to the troubleshooting section if you encounter issues, and leverage the monorepo’s hot reloading and build scripts for a smooth developer experience.