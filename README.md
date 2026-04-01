# TinyLink

> A production-grade URL shortener built as a full-stack monorepo — fast, trackable, and deployable on free-tier infrastructure.

[![CI/CD](https://github.com/thanhnam2811/tiny-link/actions/workflows/pipeline.yml/badge.svg)](https://github.com/thanhnam2811/tiny-link/actions)
![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![Fastify](https://img.shields.io/badge/Fastify-5-black?logo=fastify)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38bdf8?logo=tailwindcss)

---

## ✨ Features

- **Blazing-fast redirects** — 302/307 redirects served via Redis cache, near-zero latency
- **Click analytics** — IP, User-Agent, referrer, geo-location (country/city), time series
- **Password-protected links** — optional password lock on both redirect and analytics
- **Link expiration** — set TTL per link
- **QR code generation** — built-in QR for every short link
- **Guest → user link claiming** — create links as a guest, claim them on sign-in
- **OAuth authentication** — Google & GitHub via Auth.js v5
- **User dashboard** — manage, search, and delete your links
- **Admin dashboard** — full system analytics, link management, geo distribution charts
- **Bot detection & edge middleware** — filter bots at the edge, inject OpenGraph metadata
- **Rate limiting** — Redis-backed, prevents spam and brute-force
- **Memory queue + batch insert** — click events buffered in-memory, flushed to DB in batches
- **Glassmorphism + Minimalist UI** — Framer Motion animations, Lenis smooth scroll, dark/light/system theme
- **Resilience pages** — custom 404, error boundary, skeleton loading screens

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────┐
│                  Client (Next.js)           │
│  Landing │ Dashboard │ Stats │ Admin        │
│  BFF Proxy ──────────────────────────────►  │
└─────────────────┬───────────────────────────┘
                  │ HTTP (Internal API Key)
┌─────────────────▼───────────────────────────┐
│              Server (Fastify)               │
│  /api/links  │  /api/analytics  │  /api/auth│
│              │                  │           │
│  ┌─────────────────────────────────────┐   │
│  │  Memory Queue → Batch DB Insert     │   │
│  └─────────────────────────────────────┘   │
└────────────┬──────────────┬────────────────┘
             │              │
     ┌───────▼──────┐  ┌───▼──────┐
     │  PostgreSQL  │  │   Redis  │
     │  (Prisma)    │  │  Cache   │
     └──────────────┘  └──────────┘
```

**Click flow:**

1. User hits `/:code` → Edge Middleware checks for bots
2. Fastify checks Redis cache → DB fallback
3. 302 redirect sent immediately
4. Click event pushed to in-memory queue
5. Background worker batch-inserts to PostgreSQL every few seconds

---

## 📦 Monorepo Structure

```
tiny-link/
├── packages/
│   ├── server/     # Fastify API — core shortening, analytics, auth
│   ├── client/     # Next.js — public app, user dashboard, stats
│   ├── admin/      # Next.js — admin dashboard, system analytics
│   ├── db/         # Prisma schema + generated client (shared)
│   └── shared/     # TypeScript types, Zod/TypeBox schemas
├── docs/           # ROADMAP, release templates, agent workflows
├── scripts/        # Version bumping, utilities
├── docker-compose.yml
└── .github/workflows/pipeline.yml
```

---

## 🛠 Tech Stack

| Layer                  | Technology                                                  |
| ---------------------- | ----------------------------------------------------------- |
| **Frontend**           | Next.js 16, React 19, Tailwind CSS v4, Framer Motion, Lenis |
| **Backend**            | Fastify 5, Node.js 24, Pino logging                         |
| **Database**           | PostgreSQL 17 + Prisma 7 ORM                                |
| **Cache / Rate Limit** | Redis 7 + ioredis                                           |
| **Auth**               | Auth.js (NextAuth) v5 beta — Google & GitHub OAuth          |
| **Charts**             | Recharts                                                    |
| **UI Components**      | shadcn/ui, Base UI                                          |
| **Validation**         | Zod (client), TypeBox (server)                              |
| **Testing**            | Vitest + React Testing Library                              |
| **DevOps**             | Docker, GitHub Actions, Render                              |
| **Package Manager**    | pnpm 10 workspaces                                          |

---

## 🚀 Quick Start

### Prerequisites

- Node.js ≥ 20
- pnpm ≥ 10
- Docker & Docker Compose

### 1. Clone & install

```bash
git clone https://github.com/thanhnam2811/tiny-link.git
cd tiny-link
pnpm install
```

### 2. Configure environment

```bash
# Server
cp packages/server/.env.example packages/server/.env

# Client
cp packages/client/.env.example packages/client/.env
```

Fill in the required values (see [Environment Variables](#-environment-variables)).

### 3. Start infrastructure

```bash
pnpm docker:up        # starts PostgreSQL + Redis
```

### 4. Migrate database

```bash
cd packages/db
npx prisma migrate deploy
# or for development:
npx prisma db push
```

### 5. Run in development

```bash
pnpm dev              # starts all packages in parallel
```

| Service            | URL                                 |
| ------------------ | ----------------------------------- |
| Client             | http://localhost:3000               |
| Server             | http://localhost:3001               |
| Admin              | http://localhost:3002               |
| API Docs (Swagger) | http://localhost:3001/documentation |

---

## 🐳 Docker (Production)

```bash
# Build & run everything
pnpm docker:build
docker compose up

# Or just start DB + Redis, run app locally
pnpm docker:up
pnpm dev
```

The `docker-compose.yml` includes:

- **PostgreSQL 17** (port 5432, persistent volume)
- **Redis 7** (port 6379, 50MB LRU eviction)
- **App** (Fastify server, port 3001, multi-stage build)

---

## 🔐 Environment Variables

### Server (`packages/server/.env`)

| Variable           | Description                           | Required |
| ------------------ | ------------------------------------- | -------- |
| `DATABASE_URL`     | PostgreSQL connection string          | ✅       |
| `REDIS_URL`        | Redis connection string               | ✅       |
| `CLIENT_URL`       | Frontend URL for CORS                 | ✅       |
| `INTERNAL_API_KEY` | Shared secret for client→server calls | ✅       |
| `JWT_SECRET`       | JWT signing secret                    | ✅       |
| `ADMIN_PASSWORD`   | Admin dashboard password              | ✅       |

### Client (`packages/client/.env`)

| Variable             | Description                              | Required |
| -------------------- | ---------------------------------------- | -------- |
| `AUTH_SECRET`        | NextAuth secret                          | ✅       |
| `AUTH_URL`           | Public URL of the client app             | ✅       |
| `AUTH_GOOGLE_ID`     | Google OAuth client ID                   | OAuth    |
| `AUTH_GOOGLE_SECRET` | Google OAuth client secret               | OAuth    |
| `AUTH_GITHUB_ID`     | GitHub OAuth client ID                   | OAuth    |
| `AUTH_GITHUB_SECRET` | GitHub OAuth client secret               | OAuth    |
| `DATABASE_URL`       | PostgreSQL URL (for Prisma Auth adapter) | ✅       |
| `INTERNAL_API_URL`   | Fastify server base URL                  | ✅       |
| `INTERNAL_API_KEY`   | Shared secret matching server            | ✅       |

---

## 🔧 Scripts

```bash
pnpm dev          # Start all packages in parallel (development)
pnpm build        # Clean + build shared → db → all packages
pnpm lint         # ESLint across all packages
pnpm test         # Vitest across all packages
pnpm format       # Prettier format

pnpm docker:up    # Start PostgreSQL + Redis
pnpm docker:down  # Stop all Docker services
pnpm docker:build # Build Docker image
```

---

## 🚢 CI/CD Pipeline

GitHub Actions pipeline (`.github/workflows/pipeline.yml`) — 4 stages:

```
PR / push to develop or main
    │
    ▼
1. Lint & Test ──────── ESLint + Vitest (Node 24)
    │
    ▼
2. Docker Build ──────── Multi-stage image → GHCR
    │                    tags: staging | latest | vX.Y.Z
    ▼
3. DB Migration ──────── prisma migrate deploy
    │                    staging (develop) | production (main)
    ▼
4. Deploy ────────────── Render staging | Render production
```

---

## 📊 Analytics

Each short link tracks:

- **Total clicks** with time-series (last 7 days)
- **Geographic distribution** — country-level via geoip-lite
- **Referrer breakdown**
- **User-Agent parsing** (browser/device/OS)

Analytics are accessible via:

- `/stats/:code` — public stats page (password-protected if set)
- Admin dashboard — aggregate system-wide stats

---

## 🔒 Security

- Rate limiting on all API endpoints (Redis-backed, per-IP)
- Argon2 password hashing for link passwords
- JWT authentication between services
- `INTERNAL_API_KEY` header for client→server requests
- Bot detection at Next.js edge middleware
- Non-root Docker user (`nodeuser`)

---

## 📝 Development Guide

### Branch strategy

| Branch                 | Purpose             | Environment              |
| ---------------------- | ------------------- | ------------------------ |
| `feature/*` or `fix/*` | Feature development | Local                    |
| `develop`              | Integration branch  | Staging (auto-deploy)    |
| `main`                 | Production          | Production (auto-deploy) |

### Database changes

```bash
# Create a new migration
cd packages/db
npx prisma migrate dev --name your_migration_name

# Apply migrations (CI/production)
npx prisma migrate deploy

# Quick schema sync (dev only)
npx prisma db push
```

### Build order

Workspace packages must be built in order:

```bash
pnpm --filter @tiny-link/shared run build
pnpm --filter @tiny-link/db run build
# then client/server/admin
```

---

## 📄 License

MIT
