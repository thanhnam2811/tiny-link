# TinyLink — Kiến trúc tổng quan

> URL shortener full-stack, monorepo — nhanh, có track, deploy được trên free-tier infrastructure.

---

## 1. Tổng quan Monorepo

| Package             | Vai trò                                            | Tech                           |
| ------------------- | -------------------------------------------------- | ------------------------------ |
| `@tiny-link/shared` | Types, schemas (Zod/TypeBox), constants dùng chung | TypeScript, TypeBox            |
| `@tiny-link/db`     | Prisma schema + generated client                   | Prisma 7, PostgreSQL           |
| `@tiny-link/server` | Backend API chính                                  | Fastify 5, Redis, JWT          |
| `@tiny-link/client` | Public app + User dashboard                        | Next.js 16, Auth0, Tailwind v4 |
| `@tiny-link/admin`  | Admin dashboard riêng                              | Next.js 16, Recharts           |

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

- **Prisma schema**: 3 models — `Link`, `Click`, `User`.
- **`Link`**: `originalUrl`, `shortCode` (unique), `redirectType` (301/302), `passwordHash`, `maxClicks`, `expiresAt`, `clicksCount`, `metaTitle/Description/Image`, `userId`, `guestId`.
- **`Click`**: `linkId`, `ipAddress`, `userAgent`, `country`, `city`, `clickedAt` — indexed on `(linkId, clickedAt)`.
- **`User`**: identity đồng bộ từ Auth0 (`id` = Auth0 `sub`), có `role` field (user/admin).
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
    - `proxy.ts` — Auth0 middleware: bảo vệ dashboard, bot detection, inject `x-is-bot` header.
- **Pages**:
    - `/` (landing) — Form tạo link, feature showcase, Framer Motion animations.
    - `/dashboard` — User quản lý link cá nhân (search, delete, pagination).
    - `/stats/[code]` — Chi tiết analytics cho từng link.
    - `/r/[code]` — Redirect page: track click → redirect, hoặc password prompt.
- **Auth**: Auth0 (Google + GitHub Social Connections via `@auth0/nextjs-auth0`), stateless encrypted-cookie session.
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

| Component | Công nghệ                                          |
| --------- | --------------------------------------------------- |
| Database  | PostgreSQL 17 (Docker)                             |
| Cache     | Redis 7 (50mb max, allkeys-lru)                    |
| Container | Docker Compose (3 services)                        |
| Deploy    | Self-hosted VPS (Docker, always-on, no cold start) |

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

| Component      | Platform            | Plan | Lý do chọn                                                    |
| -------------- | -------------------- | ---- | -------------------------------------------------------------- |
| **Server**     | **Self-hosted VPS**  | -    | Docker, always-on (không cold start), full control tài nguyên |
| **PostgreSQL** | **Neon**              | Free | Serverless, Prisma-native, auto-pause                          |
| **Redis**      | **Upstash**           | Free | 256MB, global replication, hỗ trợ cả REST lẫn TCP (`rediss://`) |
| **Client**     | **Vercel**            | Free | Next.js native, ISR, middleware                                |
| **Admin**      | **Vercel**            | Free | Next.js native, ISR, middleware                                |

### Ghi chú về VPS + Cloudflare Tunnel

VPS chạy sau NAT (không có inbound port công khai), nên không expose port trực tiếp. Traffic public đi qua **Cloudflare Tunnel** (outbound-only từ VPS) — cả HTTP (API) lẫn SSH (deploy) đều đi qua tunnel này, không mở port 22/3001 ra internet.

Vì server always-on trên VPS (không sleep như free-tier PaaS), **không cần** cơ chế keep-alive/ping định kỳ.

> **Tại sao không dùng Render/Koyeb?** Free tier PaaS đều có giới hạn (sleep sau X phút, hoặc gói free bị loại bỏ — Koyeb bỏ free tier sau khi Mistral AI mua lại). VPS tự quản cho toàn quyền kiểm soát, không giới hạn giờ chạy.

> **Tại sao không tự host Postgres/Redis trên VPS?** VPS cấu hình thấp (1 vCPU/1.7GB RAM) — Neon và Upstash serverless, miễn phí, không tốn RAM/CPU của VPS, để dành tài nguyên cho app server.

---

### 7.1 Server → Self-hosted VPS (Docker + Cloudflare Tunnel)

- **Files**: `docker-compose.prod.yml` (root, chỉ chạy service `app`), `.env.production.example` (template)
- **Image**: build multi-stage `Dockerfile` có sẵn, push lên **GHCR** (`ghcr.io/thanhnam2811/tiny-link`)
- **Deploy flow**: GitHub Actions build+push image → SSH vào VPS (qua Cloudflare Tunnel + Access Service Token, không cần mở port 22) → `docker compose -f docker-compose.prod.yml pull && up -d`
- **Port**: `3001` trong container, expose ra ngoài qua Cloudflare Tunnel ingress rule (hostname riêng, VD `link-api.namtt.dev`)
- **Auto-deploy**: Từ branch `main` — push code tự động build + deploy
- **Env vars** (set trong `.env.production` trên VPS, không commit vào repo):
    - `DATABASE_URL` — connection string từ Neon
    - `REDIS_URL` — connection string từ Upstash (định dạng `rediss://`, dùng TCP protocol chuẩn chứ không phải REST API)
    - `JWT_SECRET` — secret ký admin JWT
    - `ADMIN_PASSWORD` — mật khẩu dashboard admin
    - `INTERNAL_API_KEY` — key M2M giữa client/server
    - `VERCEL_PROJECT_NAME` — tên project Vercel của client (`tiny-link-client`), dùng để build danh sách CORS origin cho preview deployments
- **GitHub Secrets cần thiết cho pipeline**: `VPS_SSH_PRIVATE_KEY`, `VPS_SSH_USER`, `VPS_SSH_HOSTNAME`, `CF_ACCESS_CLIENT_ID`, `CF_ACCESS_CLIENT_SECRET`, `DATABASE_URL` (cho bước migrate)

### 7.2 PostgreSQL → Neon (Serverless)

- **Connection string**: `postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require`
- **Tạo database**:
    1. Vào https://console.neon.tech → Create project
    2. Copy connection string → dán vào `DATABASE_URL` trong `.env.production` trên VPS + GitHub Secret (cho bước migrate)
- **Migrate data** (nếu có data cũ):
    1. Dump từ DB cũ: `pg_dump <OLD_DATABASE_URL> > dump.sql`
    2. Restore lên Neon: `psql <NEON_DATABASE_URL> < dump.sql`
- **Apply schema**: `pnpm --filter @tiny-link/db exec prisma migrate deploy`
- **Lưu ý**: Neon auto-pause sau 5 phút không hoạt động. Có thể disable trong Dashboard nếu muốn always-on.

### 7.3 Redis → Upstash (Serverless)

- **Connection string**: `rediss://default:password@ap-xxx.upstash.io:6379` (TLS, TCP protocol chuẩn — tương thích trực tiếp với `ioredis`/`@fastify/redis`, không cần đổi code)
- **Tạo database**:
    1. Vào https://console.upstash.com → Create database
    2. Chọn region gần VPS (VPS đặt tại Singapore qua Cloudflare — chọn `ap-southeast-1` hoặc gần nhất)
    3. Copy connection string dạng `rediss://` (không phải REST URL) → dán vào `REDIS_URL` trong `.env.production` trên VPS
- **Free tier**: 256MB, 10k commands/ngày — đủ cho rate limiting + cache + analytics queue

### 7.4 Client → Vercel (unchanged)

- **File**: `packages/client/vercel.json`
- **Framework**: Next.js (auto-detect)
- **Root**: `packages/client`
- **Build order**: `@tiny-link/shared` → `@tiny-link/db` → `@tiny-link/client`
- **Required env vars** (set trong Vercel Dashboard):
    - `AUTH0_SECRET`, `AUTH0_DOMAIN`, `AUTH0_CLIENT_ID`, `AUTH0_CLIENT_SECRET`, `APP_BASE_URL`
    - `DATABASE_URL` (dùng connection string từ **Neon**)
    - `INTERNAL_API_URL` (URL của server trên VPS qua Cloudflare Tunnel, VD: `https://link-api.namtt.dev`)
    - `INTERNAL_API_KEY` (phải khớp với server trên VPS)
    - Auth0 Dashboard: thêm Allowed Callback URL `https://<vercel-domain>/auth/callback` và Allowed Logout URL `https://<vercel-domain>`

### 7.5 Admin → Vercel (unchanged)

- **File**: `packages/admin/vercel.json`
- **Framework**: Next.js (auto-detect)
- **Root**: `packages/admin`
- **Build order**: `@tiny-link/shared` → `@tiny-link/db` → `@tiny-link/admin`
- **Required env vars**:
    - `INTERNAL_API_URL` (URL của server trên VPS qua Cloudflare Tunnel)

### 7.6 Luồng deploy

```mermaid
graph LR
    A[Push to main] --> B{Vercel auto-deploy}
    A --> C{GitHub Actions}
    B --> D[Client: link.namtt.dev]
    B --> E[Admin: tiny-link-admin.vercel.app]
    C --> G[Build + Push image to GHCR]
    G --> H[SSH via Cloudflare Tunnel]
    H --> F[VPS: docker compose pull + up -d]
    D -- "/api/proxy" --> F
    E -- "INTERNAL_API_URL" --> F
```
