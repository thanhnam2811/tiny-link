# [TL-ARCH-03] Remove Phantom Dependency `@tiny-link/db` from `@tiny-link/admin`

**Status:** ⏳ Open  
**Ticket ID:** `TL-ARCH-03`  

- **Component:** `@tiny-link/admin`
- **Files:** `packages/admin/package.json:13`, `packages/admin/vercel.json:5`
- **RCA:** Admin never queries Prisma directly (uses Fastify REST API), but declares `@tiny-link/db`.
- **Fix:** Remove dependency and simplify Vercel build script.

---

---
*Back to [Ticket Index](../README.md)*
