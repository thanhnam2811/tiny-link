# [TL-SEC-07] Tighten Vercel Preview CORS Origin Regex & Add Helmet Headers

**Status:** ⏳ Open  
**Ticket ID:** `TL-SEC-07`  

- **Component:** `@tiny-link/server`
- **Files:** `packages/server/src/index.ts:47-50`
- **RCA:** `^${vercelProjectName}.*\\.vercel\\.app$` permits arbitrary third-party Vercel preview domains; missing standard security headers.
- **Fix:** Update regex to `^${vercelProjectName}(-[a-z0-9-]+)?\\.vercel\\.app$` and register `@fastify/helmet`.

---

---
*Back to [Ticket Index](../README.md)*
