# Flick

**Flick** is an anonymous campus discussion platform designed for verified college communities.
It enables students to share posts, participate in discussions, and interact with their campus network while maintaining anonymity.

The platform is built with a focus on **scalable backend architecture, moderation safety, and operational visibility**, combining automated content moderation, multi-layer caching, and audit logging to support real-world community management.

---

## Why Flick Exists

Many anonymous platforms fail due to **lack of accountability and moderation**.
Flick addresses this by balancing **privacy with enforceable identity**:

* Users authenticate with **verified college email domains**
* Content remains **anonymous to other users**
* Moderators retain the ability to **enforce rules and prevent abuse**

This approach enables open discussions while maintaining platform integrity.

---

## Platform Highlights

* **Anonymous Campus Communities**
  Students interact without revealing identities while still being verified members of their college.

* **Moderation Infrastructure**
  Multi-layer moderation pipeline combining rule-based filtering and machine learning toxicity detection.

* **Multi-Layer Caching Architecture**
  Redis and in-memory caching reduce database load and improve response latency.

* **Operational Observability**
  Audit logs, request tracing, and structured logging provide transparency for administrative actions.

* **Admin Moderation Dashboard**
  Moderators can review reports, block users, manage banned keywords, and monitor platform activity.

---

## System Overview

Flick is implemented as a **modular monolith within a pnpm monorepo**, enabling clear domain separation while keeping operational complexity low.

### Monorepo Structure

```
apps/
  server/     Backend API
  web/        Next.js web client
  admin/      Moderation dashboard
  landing/    Marketing website

packages/
  shared/     Shared types and utilities
```

### Backend Architecture

```
HTTP Routes
   ↓
Controllers
   ↓
Services
   ↓
Repositories
   ↓
PostgreSQL
```

Supporting infrastructure:

* Authentication service
* Moderation pipeline
* Multi-layer caching
* Notification system
* Audit logging
* Rate limiting

---

## Architecture Principles

Flick was designed around several core engineering principles:

**Moderation First**
Anonymous platforms require strong safeguards to prevent abuse.

**Operational Transparency**
Administrative actions are logged through a centralized audit system.

**Performance Through Caching**
Frequently accessed data is served through layered caching strategies.

**Maintainable Architecture**
A modular monolith allows rapid development without microservice overhead.

---

## Key Features

### Anonymous College Communities

* Users register using **verified college email domains**
* Posts and comments remain **anonymous to other users**
* Platform moderation still maintains accountability

---

### Content Moderation System

* **Automated moderation** using Google Perspective API
* **Rule-based filtering** with banned words and pattern matching
* User **reporting system** for inappropriate content
* Admin dashboard to block users or remove content

---

### Campus Discussion Platform

* Topic-based posts (confession, question, event, announcement)
* Comment threads with voting
* College and branch-based communities

---

### Observability and Admin Control

* **Audit logging** for administrative actions
* Server logs and request tracking
* Analytics endpoints for platform monitoring

---

### Notification Infrastructure

* Database-backed notification system
* Notification aggregation to reduce spam
* Infrastructure prepared for real-time delivery

---

## Core Systems

### Authentication

* College email verification
* OTP verification during signup
* Multi-session authentication
* Disposable email blocking

---

### Moderation Pipeline

Content passes through multiple checks:

1. Banned word filtering
2. Pattern matching
3. Perspective API toxicity detection
4. Spam detection
5. User reports

Admins can remove content or block users.

---

### Multi-Layer Caching

Two levels of caching are used to reduce database load.

```
L1 Cache → NodeCache (in-memory)
L2 Cache → Redis
Primary Storage → PostgreSQL
```

This improves response times for frequently accessed content.

---

### Audit Logging

All critical administrative actions are recorded:

* Content removal
* User blocking
* Moderation actions

Audit logs include:

* actor
* target entity
* timestamp
* request metadata

---

## Database

PostgreSQL with Drizzle ORM.

Key entities:

* users
* posts
* comments
* votes
* notifications
* colleges
* branches
* reports
* audit logs

Indexes are used for filtering, sorting, and pagination.

---

## Security

Flick includes multiple security protections:

* HTTP security headers (Helmet)
* Rate limiting for API and authentication endpoints
* Zod request validation
* Disposable email blocking
* Encrypted sensitive fields

---

## Tech Stack

### Backend

* Node.js / Bun
* Express
* PostgreSQL
* Drizzle ORM
* Redis
* Socket.io

### Frontend

* Next.js
* React
* TypeScript

### Infrastructure

* Docker
* pnpm workspace
* Turbo monorepo

### Security & Moderation

* better-auth
* Google Perspective API
* Zod validation
* Helmet
* Rate limiting

---

## Local Development

### Requirements

* Node.js or Bun
* Docker
* pnpm

---

### Start Infrastructure

```bash
docker compose up -d
```

Starts:

* PostgreSQL
* Redis

---

### Install Dependencies

```bash
pnpm install
```

---

### Run Development Servers

```bash
pnpm dev
```

---

## Admin Dashboard

The admin dashboard allows moderators to:

* Review reported content
* Ban users
* Manage banned words
* Monitor analytics
* Manage colleges and branches

---

## Screenshots

*(Add screenshots here)*

* User feed
* Post discussion page
* Admin moderation dashboard
* Analytics view

---

## Future Work

* Real-time notification delivery
* Feed ranking algorithms
* Full-text search
* Notification fan-out system
* Advanced moderation tooling

---

## License

MIT
