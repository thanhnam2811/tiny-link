### 🟢 Phase 1: MVP (The Engine)

**Status:** ✅ Done

#### 🎯 Goal

Complete the basic shortening and redirection flow — a user can submit a long URL and reliably get redirected via a short code.

#### 📋 Checklist

- [x] Initialize project with **Fastify** and **TypeScript**.
- [x] Design Database Schema (Postgres): `links` and `clicks` tables.
- [x] API: `POST /api/links` (Link creation with collision handling).
- [x] API: `GET /:code` (Simple 302 Redirect).
- [x] API: `GET /api/stats/:code` (Raw stats from DB).

#### ✅ Definition of Done

- [x] All checklist items above are complete and merged to `main`.
- [x] `POST /api/links` returns a working short code; `GET /:code` performs a verified 302 redirect to the original URL.
- [x] Short-code collision retries deterministically instead of failing the request.
- [x] Manual/API smoke test of the create → redirect → stats loop passes end to end.
