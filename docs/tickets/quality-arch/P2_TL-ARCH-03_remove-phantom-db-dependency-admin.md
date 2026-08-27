# [TL-ARCH-03] Remove Phantom Dependency `@tiny-link/db` from `@tiny-link/admin`

**Status:** ✅ Done  
**Ticket ID:** `TL-ARCH-03`

- **Component:** `@tiny-link/admin`
- **Files:** `packages/admin/package.json:13`, `packages/admin/vercel.json:5`
- **RCA:** Admin never queries Prisma directly (uses Fastify REST API), but declares `@tiny-link/db`.
- **Fix:** Remove dependency and simplify Vercel build script.

#### 📋 Acceptance Criteria (AC)

- [x] Remove `@tiny-link/db` from `packages/admin/package.json`.
- [x] Remove `@tiny-link/db` build step from `packages/admin/vercel.json`.

#### ✅ Definition of Done (DoD)

- [x] Admin package builds and runs all tests without database dependency.

---

---

_Back to [Ticket Index](../README.md)_
