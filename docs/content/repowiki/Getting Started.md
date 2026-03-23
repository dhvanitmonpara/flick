# Getting Started

<cite>
**Referenced Files in This Document**
- [README.md](file://README.md)
- [package.json](file://package.json)
- [pnpm-workspace.yaml](file://pnpm-workspace.yaml)
- [turbo.json](file://turbo.json)
- [server/package.json](file://server/package.json)
- [server/.env.sample](file://server/.env.sample)
- [server/infra/docker-compose.yml](file://server/infra/docker-compose.yml)
- [server/drizzle.config.ts](file://server/drizzle.config.ts)
- [server/src/config/env.ts](file://server/src/config/env.ts)
- [admin/.env](file://admin/.env)
- [admin/src/config/env.ts](file://admin/src/config/env.ts)
- [web/.env.local](file://web/.env.local)
- [landing/package.json](file://landing/package.json)
- [ocr/.env](file://ocr/.env)
</cite>

## Table of Contents
1. [Introduction](#introduction)
2. [Prerequisites](#prerequisites)
3. [Environment Setup](#environment-setup)
4. [Database Configuration](#database-configuration)
5. [Initial Project Bootstrapping](#initial-project-bootstrapping)
6. [Install and Run Packages](#install-and-run-packages)
7. [Environment Variables Reference](#environment-variables-reference)
8. [Accessing Applications](#accessing-applications)
9. [Troubleshooting](#troubleshooting)
10. [Verification Checklist](#verification-checklist)
11. [Conclusion](#conclusion)

## Introduction
This guide helps you set up the Flick project locally. It covers prerequisites, environment configuration, database and cache setup, initial bootstrapping, and running all five packages: server, web, admin, landing, and OCR. You will also learn how to configure environment variables, connect to databases, and verify your installation.

## Prerequisites
- Node.js: The project requires Node.js version 24. Confirm your version via:
  ```bash
  node --version
  ```
- Package manager: pnpm is configured as the workspace package manager. Install it globally if needed:
  ```bash
  npm install -g pnpm
  ```
- Operating system: macOS, Linux, or Windows (WSL recommended for Windows).
- Git: To clone and manage the repository.

**Section sources**
- [package.json](file://package.json#L7-L9)

## Environment Setup
1. Clone the repository and navigate to the project root.
2. Install workspace dependencies:
   ```bash
   pnpm install
   ```
3. Bootstrap the monorepo using Turborepo tasks:
   ```bash
   pnpm dev
   ```
   This runs all packages in development mode concurrently.

**Section sources**
- [pnpm-workspace.yaml](file://pnpm-workspace.yaml#L1-L7)
- [turbo.json](file://turbo.json#L15-L18)
- [package.json](file://package.json#L10-L16)

## Database Configuration
The server package uses PostgreSQL and Redis. You can run both with Docker Compose included in the server infrastructure.

### Option A: Use Docker Compose (Recommended for local development)
1. Start the stack:
   ```bash
   cd server
   pnpm db:up
   ```
   This starts:
   - PostgreSQL service
   - Adminer (database browser) on port 8080
   - Redis service

2. Verify services:
   - PostgreSQL: Port 5432 exposed.
   - Redis: Port 6379 exposed.
   - Adminer: Open http://localhost:8080 in your browser.

3. Stop the stack when done:
   ```bash
   pnpm db:down
   ```

**Section sources**
- [server/infra/docker-compose.yml](file://server/infra/docker-compose.yml#L1-L49)

### Option B: Use Local PostgreSQL and Redis
- PostgreSQL: Ensure a local instance is running and accessible. Set DATABASE_URL accordingly.
- Redis: Ensure a local Redis instance is running and accessible. Set REDIS_URL accordingly.

## Initial Project Bootstrapping
After starting the database stack, initialize the database schema and seed data.

1. From the server package, run migrations:
   ```bash
   cd server
   pnpm db:migrate
   ```
   Migrations are defined under the server’s migration directory and use Drizzle ORM.

2. Seed the database (optional):
   ```bash
   pnpm seed
   ```
   This script creates initial data for development.

3. Create an admin user (optional):
   ```bash
   pnpm scripts:create-admin
   ```
   Follow prompts to set credentials.

Notes:
- Drizzle configuration reads DATABASE_URL from environment variables.
- The server expects a valid PostgreSQL connection URL and a Redis connection URL.

**Section sources**
- [server/package.json](file://server/package.json#L14-L18)
- [server/drizzle.config.ts](file://server/drizzle.config.ts#L1-L14)
- [server/src/config/env.ts](file://server/src/config/env.ts#L11-L12)

## Install and Run Packages
The project is a pnpm workspace with five packages plus a shared package. You can run them individually or all at once.

### Run All Packages Together
```bash
cd /path/to/project/root
pnpm dev
```
This concurrently starts:
- server (Express backend)
- web (Next.js frontend)
- admin (React admin panel)
- landing (Next.js marketing site)
- ocr (OCR microservice)

### Run Individual Packages
- Server
  ```bash
  cd server
  pnpm dev
  ```
- Web
  ```bash
  cd web
  pnpm dev
  ```
- Admin
  ```bash
  cd admin
  pnpm dev
  ```
- Landing
  ```bash
  cd landing
  pnpm dev
  ```
- OCR
  ```bash
  cd ocr
  pnpm dev
  ```

**Section sources**
- [pnpm-workspace.yaml](file://pnpm-workspace.yaml#L1-L7)
- [turbo.json](file://turbo.json#L15-L18)
- [server/package.json](file://server/package.json#L7-L11)
- [web/package.json](file://web/package.json)
- [admin/package.json](file://admin/package.json)
- [landing/package.json](file://landing/package.json#L5-L10)
- [ocr/package.json](file://ocr/package.json)

## Environment Variables Reference
Configure environment variables per package as described below.

### Server (.env)
Copy the sample file and fill in values:
```bash
cp server/.env.sample server/.env
```
Key variables:
- PORT, HOST, NODE_ENV
- ACCESS_CONTROL_ORIGINS, SERVER_BASE_URI
- DATABASE_URL (PostgreSQL)
- REDIS_URL, CACHE_DRIVER, CACHE_TTL
- ACCESS_TOKEN_TTL, REFRESH_TOKEN_TTL
- ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET (minimum 32 characters each)
- GOOGLE_OAUTH_CLIENT_ID, GOOGLE_OAUTH_CLIENT_SECRET
- MAIL_PROVIDER, MAILTRAP_TOKEN, GMAIL_APP_USER, GMAIL_APP_PASS
- HMAC_SECRET, EMAIL_ENCRYPTION_KEY, EMAIL_SECRET
- COOKIE_DOMAIN
- BETTER_AUTH_SECRET, BETTER_AUTH_URL
- CLOUDINARY_* (optional)

Validation:
- The server validates environment variables using Zod. Ensure secrets meet minimum length requirements.

**Section sources**
- [server/.env.sample](file://server/.env.sample#L1-L46)
- [server/src/config/env.ts](file://server/src/config/env.ts#L4-L39)

### Admin (.env)
Set base URLs for API and socket connections:
- VITE_SERVER_URI
- VITE_SERVER_API_URL
- VITE_BASE_URL

**Section sources**
- [admin/.env](file://admin/.env#L1-L3)
- [admin/src/config/env.ts](file://admin/src/config/env.ts#L1-L5)

### Web (.env.local)
Public client-side variables:
- NEXT_PUBLIC_SERVER_URI
- NEXT_PUBLIC_SERVER_API_ENDPOINT
- NEXT_PUBLIC_OCR_SERVER_API_ENDPOINT
- NEXT_PUBLIC_BASE_URL
- NEXT_PUBLIC_GOOGLE_OAUTH_ID

**Section sources**
- [web/.env.local](file://web/.env.local#L1-L8)

### Landing (Next.js)
- Uses Next.js 16.1.6. No explicit environment variables are required for basic dev.

**Section sources**
- [landing/package.json](file://landing/package.json#L1-L37)

### OCR (.env)
- PORT, ENVIRONMENT, HTTP_SECURE_OPTION, ACCESS_CONTROL_ORIGIN

**Section sources**
- [ocr/.env](file://ocr/.env#L1-L4)

## Accessing Applications
- Server: http://localhost:8000
- Web (Next.js): http://localhost:3000
- Admin (Vite): http://localhost:5173
- Landing (Next.js): http://localhost:3000/_next
- OCR: http://localhost:8003

Notes:
- The admin and web apps communicate with the server via the API endpoints defined in their environment files.
- The landing app is a separate Next.js app; it does not require a database connection for basic development.

**Section sources**
- [admin/.env](file://admin/.env#L1-L3)
- [web/.env.local](file://web/.env.local#L3-L5)
- [ocr/.env](file://ocr/.env#L1-L4)

## Troubleshooting
Common setup issues and resolutions:

- Node version mismatch
  - Symptom: Errors during install or runtime.
  - Fix: Use Node.js 24 as required by the project configuration.

- PostgreSQL connection refused
  - Symptom: Migration or startup errors indicating unable to connect.
  - Fix: Ensure Docker Compose is running or your local PostgreSQL is reachable. Verify DATABASE_URL.

- Redis connection refused
  - Symptom: Cache-related errors or server failing to start.
  - Fix: Ensure Redis is running on the configured REDIS_URL.

- CORS errors in admin/web
  - Symptom: API requests blocked by CORS.
  - Fix: Update ACCESS_CONTROL_ORIGINS in server .env to include your frontend origins.

- Missing secrets in server
  - Symptom: Validation errors on startup.
  - Fix: Provide secrets meeting minimum length requirements (e.g., 32+ characters) for ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET, EMAIL_ENCRYPTION_KEY, EMAIL_SECRET, HMAC_SECRET.

- OAuth login issues
  - Symptom: Google OAuth redirects fail.
  - Fix: Set GOOGLE_OAUTH_CLIENT_ID and GOOGLE_OAUTH_CLIENT_SECRET in server .env.

- Adminer not loading
  - Symptom: Cannot access Adminer on port 8080.
  - Fix: Ensure PostgreSQL service is healthy and mapped to port 5432.

**Section sources**
- [server/src/config/env.ts](file://server/src/config/env.ts#L17-L39)
- [server/.env.sample](file://server/.env.sample#L17-L20)
- [server/infra/docker-compose.yml](file://server/infra/docker-compose.yml#L1-L49)

## Verification Checklist
- Node.js 24 is installed.
- pnpm workspace installed and dependencies resolved.
- Docker Compose stack is running (or local PostgreSQL/Redis reachable).
- Database migrations applied.
- Admin and web environment variables configured.
- All packages start without errors:
  - server, web, admin, landing, ocr.

Optional:
- Seed data loaded.
- Admin user created.

## Conclusion
You now have the Flick project running locally with all five packages and supporting services. Use the environment variables and database configuration outlined here to tailor the setup to your needs. Refer to the troubleshooting section if you encounter issues, and consult the package-specific configuration files for advanced customization.