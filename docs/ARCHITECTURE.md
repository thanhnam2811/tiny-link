# TinyLink — Kiến trúc tổng quan

> URL shortener full-stack, monorepo — nhanh, có track, deploy được trên free-tier infrastructure.

---

## 1. Tổng quan Monorepo

| Package             | Vai trò                                            | Tech                             |
| ------------------- | -------------------------------------------------- | -------------------------------- |
| `@tiny-link/shared` | Types, schemas (Zod/TypeBox), constants dùng chung | TypeScript, TypeBox              |
| `@tiny-link/db`     | Prisma schema + generated client                   | Prisma 7, PostgreSQL             |
| `@tiny-link/server` | Backend API chính                                  | Fastify 5, Redis, JWT            |
| `@tiny-link/client` | Public app + User dashboard                        | Next.js 16, Auth.js, Tailwind v4 |
| `@tiny-link/admin`  | Admin dashboard riêng                              | Next.js 16, Recharts             |

**Toolchain:** pnpm 10 workspaces, TypeScript 5, ESLint 9, Prettier, Vitest, tsup.

---

## 2. Luồng request chính (Click Flow)

```
User hits /:code
  → Edge Middleware (Next.js): detect bot/inject headers
    → Nếu bot: trả OpenGraph metadata, không redirect
    → Nếu human:
      → Fastify check Redis cache → DB fallback
      → 302 redirect gửi ngay lập tức
      → Click event push vào in-memory queue
      → Worker batch-insert vào PostgreSQL mỗi 30s
```

---

## 3. Chi tiết từng Package

### 3.1 `@tiny-link/shared`

- **`constants.ts`**: HTTP status codes, rate limit config, TTL, error messages.
- **`schemas.ts`**: TypeBox schemas cho API request/response (`CreateLinkBody`, `LinkResponse`, `LinkPreview`, `VerifyPassword`, admin schemas...).
- **`version.ts`**: App version string.

### 3.2 `@tiny-link/db`

- **Prisma schema**: 5 models — `Link`, `Click`, `User`, `Account`, `Session`, `VerificationToken`.
- **`Link`**: `originalUrl`, `shortCode` (unique), `redirectType` (301/302), `passwordHash`, `maxClicks`, `expiresAt`, `clicksCount`, `metaTitle/Description/Image`, `userId`, `guestId`.
- **`Click`**: `linkId`, `ipAddress`, `userAgent`, `country`, `city`, `clickedAt` — indexed on `(linkId, clickedAt)`.
- **`User`**: OAuth user từ Auth.js, có `role` field (user/admin).
- **Prisma adapter**: Dùng `@prisma/adapter-pg` với `pg.Pool` cho kết nối.

### 3.3 `@tiny-link/server`

- **Framework**: Fastify 5 + TypeBox type provider.
- **Plugins**: CORS, Redis (`@fastify/redis`), Rate Limit (Redis-backed), JWT, Swagger, Static.
- **Modules**:
    - `api.routes.ts` — Master router: `/api/links`, `/api/stats`, `/api/admin`.
    - `link/` — `LinkRepository` (DB), `LinkService` (business logic), `LinkController` (handlers).
        - Create: hỗ trợ custom code, retry nếu collision, hash password bằng argon2.
        - Redirect: cache Redis → DB fallback, sentinel values chống cache penetration.
        - Metadata scraper: fire-and-forst scrape OpenGraph từ URL gốc bằng cheerio.
    - `analytics/` — `AnalyticsManager`: in-memory queue, batch insert mỗi 30s, aggregation, geo-lookup (geoip-lite).
    - `admin/` — Login (JWT), stats, links CRUD, analytics timeline/os/browser/country.
- **Middleware**: `internal-auth.middleware` — M2M auth giữa Next.js client và Fastify server.
- **Error handling**: `AppError` class, global error handler, not-found handler.
- **Singleton pattern**: `Promise coalescing` (singleflight) tránh cache stampede.

### 3.4 `@tiny-link/client`

- **Framework**: Next.js 16 (App Router) + React 19.
- **Routing**:
    - `middleware.ts` — 2 lớp: next-intl localization + shadow routing (`/abc` → `/r/abc`).
    - `proxy.ts` — Auth.js middleware: bảo vệ dashboard, bot detection, inject `x-is-bot` header.
- **Pages**:
    - `/` (landing) — Form tạo link, feature showcase, Framer Motion animations.
    - `/dashboard` — User quản lý link cá nhân (search, delete, pagination).
    - `/stats/[code]` — Chi tiết analytics cho từng link.
    - `/r/[code]` — Redirect page: track click → redirect, hoặc password prompt.
- **Auth**: Auth.js v5 beta (Google + GitHub OAuth), Prisma adapter, JWT session.
- **Guest→User Claim**: Khi sign in, tự động gọi API claim các link đã tạo khi chưa đăng nhập.
- **i18n**: next-intl với 2 locale `en`, `vi`, locale prefix strategy `as-needed`.
- **UI Components**: shadcn/ui + Base UI, glassmorphism, Framer Motion, Lenis scroll, dark/light theme.
- **State**: Guest ID lưu trong cookie `tiny_link_guest_id` (1 năm).

### 3.5 `@tiny-link/admin`

- **Framework**: Next.js 16 riêng, port 3002.
- **Auth**: JWT token, lưu trong cookie `admin_token`.
- **Pages**:
    - `/login` — Form nhập admin password → nhận JWT.
    - `/` (dashboard) — Thống kê tổng quan: total links, clicks, biểu đồ timeline, OS, browser, country.
    - `/links` — Quản lý tất cả link (pagination, search, sort, deactivate/activate).
- **Charts**: Recharts — AreaChart (timeline), BarChart (OS/browser), PieChart (country).

---

## 4. Infrastructure

> **Local development** — Docker Compose. Xem section 7 cho production stack.

| Component | Công nghệ                             |
| --------- | ------------------------------------- |
| Database  | PostgreSQL 17 (Docker)                |
| Cache     | Redis 7 (50mb max, allkeys-lru)       |
| Container | Docker Compose (3 services)           |
| Deploy    | Render (server, preview + production) |

### Docker services:

- `postgres`: healthcheck với `pg_isready`
- `redis`: OOM protection (50mb, allkeys-lru)
- `app`: Fastify server port 3001, healthcheck `/api/healthz`

### Build (Docker multi-stage):

1. Copy package.json → install deps (cached)
2. Copy source → generate Prisma client
3. Build shared → db → server
4. `pnpm deploy --prod` → production image nhẹ

---

## 5. Security

- **M2M auth**: `x-internal-key` header giữa client và server.
- **Admin JWT**: Server ký JWT cho admin login.
- **Rate limiting**: Redis-backed, riêng cho global, create link, verify password.
- **Password**: Argon2 hash cho link password.
- **Env validation**: `getEnv()` throw error nếu thiếu biến môi trường trong production, kiểm tra dangerous defaults.

---

## 6. Performance patterns

- **Redis cache**: TTL 1h cho link data, 1 phút cho not-found sentinel.
- **Singleflight**: Promise coalescing tránh cache stampede.
- **Memory queue**: Click events gom batch insert 30s, tránh áp lực DB.
- **Metadata scraper**: Fire-and-forget, không block response.
- **Shadow routing**: Next.js rewrite để giữ URL đẹp.

---

## 7. Deployment (Free Tier Stack)

### Stack kiến nghị (2026)

| Component      | Platform    | Plan | Lý do chọn                                       |
| -------------- | ----------- | ---- | ------------------------------------------------ |
| **Server**     | **Render**  | Free | Docker hosting, 512MB RAM, auto-deploy từ GitHub |
| **PostgreSQL** | **Neon**    | Free | Serverless, Prisma-native, auto-pause            |
| **Redis**      | **Upstash** | Free | 256MB, global replication, REST API              |
| **Client**     | **Vercel**  | Free | Next.js native, ISR, middleware                  |
| **Admin**      | **Vercel**  | Free | Next.js native, ISR, middleware                  |

### Lưu ý về Render free tier

Render free web service có một hạn chế: **sleep sau 15 phút không hoạt động**. Khi có request mới, Render mất 30-60s để cold-start lại container.

**Giải pháp**: Một GitHub Action (`keep-alive.yml`) tự động ping `/api/healthz` mỗi 5 phút để giữ server luôn warm. Render free tier có 750 giờ/tháng — nếu chạy 24/7 (~744h) là vừa đủ.

> **Tại sao không dùng Koyeb?** Koyeb từng có free tier (always-on Docker, không sleep) nhưng đã bị loại bỏ sau khi Mistral AI mua lại. Hiện chỉ còn gói Pro $29/tháng.

> **Tại sao không dùng Render PostgreSQL/Redis?** Render free DBs hết hạn sau 90 ngày. Neon và Upstash là serverless, không hết hạn, tích hợp Prisma tốt.

---

### 7.1 Server → Render (Docker)

- **File**: `render.yaml` (root)
- **Runtime**: `docker` — dùng lại multi-stage `Dockerfile` có sẵn
- **Plan**: `free` (512MB RAM, 0.1 vCPU) — sleep sau 15 phút (được GitHub Action giữ warm)
- **Port**: `3001`, health check tại `/api/healthz`
- **Region**: `oregon`
- **Auto-deploy**: Từ branch `main` — push code tự động deploy
- **Env vars cần set dạng `sync: false`** (set trong Render Dashboard sau deploy):
    - `DATABASE_URL` — connection string từ Neon
    - `REDIS_URL` — connection string từ Upstash (định dạng `rediss://`)
    - `JWT_SECRET` — secret ký admin JWT
    - `ADMIN_PASSWORD` — mật khẩu dashboard admin
    - `INTERNAL_API_KEY` — key M2M giữa client/server

### 7.2 PostgreSQL → Neon (Serverless)

- **Connection string**: `postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require`
- **Tạo database**:
    1. Vào https://console.neon.tech → Create project
    2. Copy connection string → dán vào `DATABASE_URL` trong Render Dashboard
- **Migrate data** (nếu có data cũ):
    1. Dump từ Render PostgreSQL: `pg_dump <OLD_DATABASE_URL> > dump.sql`
    2. Restore lên Neon: `psql <NEON_DATABASE_URL> < dump.sql`
- **Apply schema**: `pnpm --filter @tiny-link/db exec prisma migrate deploy`
- **Lưu ý**: Neon auto-pause sau 5 phút không hoạt động. Có thể disable trong Dashboard nếu muốn always-on.

### 7.3 Redis → Upstash (Serverless)

- **Connection string**: `rediss://default:password@us1-xxx.upstash.io:6379` (TLS)
- **Tạo database**:
    1. Vào https://console.upstash.com → Create database
    2. Chọn region gần Render (VD: `us-east-1` hoặc `us-west-1`)
    3. Copy connection string → dán vào `REDIS_URL` trong Render Dashboard
- **Free tier**: 256MB, 10k commands/ngày — đủ cho rate limiting + cache + analytics queue

### 7.4 Client → Vercel (unchanged)

- **File**: `packages/client/vercel.json`
- **Framework**: Next.js (auto-detect)
- **Root**: `packages/client`
- **Build order**: `@tiny-link/shared` → `@tiny-link/db` → `@tiny-link/client`
- **Required env vars** (set trong Vercel Dashboard):
    - `AUTH_SECRET`, `AUTH_URL`
    - `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`
    - `AUTH_GITHUB_ID`, `AUTH_GITHUB_SECRET`
    - `DATABASE_URL` (dùng connection string từ **Neon**)
    - `INTERNAL_API_URL` (URL của **Render** server service, VD: `https://tiny-link-server.onrender.com`)
    - `INTERNAL_API_KEY` (phải khớp với Render)

### 7.5 Admin → Vercel (unchanged)

- **File**: `packages/admin/vercel.json`
- **Framework**: Next.js (auto-detect)
- **Root**: `packages/admin`
- **Build order**: `@tiny-link/shared` → `@tiny-link/db` → `@tiny-link/admin`
- **Required env vars**:
    - `INTERNAL_API_URL` (URL của **Render** server service)

### 7.6 Luồng deploy

```mermaid
graph LR
    A[Push to main] --> B{Vercel auto-deploy}
    A --> C{Render auto-deploy}
    B --> D[Client: tiny-link-client.vercel.app]
    B --> E[Admin: tiny-link-admin.vercel.app]
    C --> F[Server: tiny-link-server.onrender.com]
    D -- "/api/proxy" --> F
    E -- "INTERNAL_API_URL" --> F
```
