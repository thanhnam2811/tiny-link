# [TL-SEC-07] Tighten Vercel Preview CORS Origin Regex & Add Helmet Headers

**Status:** ✅ Done  
**Ticket ID:** `TL-SEC-07`

- **Component:** `@tiny-link/server`
- **Files:** `packages/server/src/index.ts:47-50`
- **RCA:** `^${vercelProjectName}.*\\.vercel\\.app$` permits arbitrary third-party Vercel preview domains; missing standard security headers.
- **Fix:** Update regex to `^${vercelProjectName}(-[a-z0-9-]+)?\\.vercel\\.app$` and register `@fastify/helmet`.

#### 📋 Acceptance Criteria (AC)

- [x] Register `@fastify/helmet` to provide standard security headers (nosniff, SAMEORIGIN, etc.).
- [x] Tighten Vercel CORS preview regex to require hyphenated branch isolation and prevent suffix spoofing.

#### ✅ Definition of Done (DoD)

- [x] Unit test suite in `security-headers.test.ts` passes with 100% assertions.

---

---

_Back to [Ticket Index](../README.md)_
