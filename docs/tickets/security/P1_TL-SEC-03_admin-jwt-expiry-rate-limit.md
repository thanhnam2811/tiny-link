# [TL-SEC-03] Enforce Admin JWT Expiry, Login Rate Limiting & Constant-Time Auth

**Status:** ⏳ Open  
**Ticket ID:** `TL-SEC-03`  


- **Type:** `Security Vulnerability`
- **Priority:** `P1 - High`
- **Component:** `@tiny-link/server`
- **Affected Files:**
  - `packages/server/src/modules/admin/admin.routes.ts:33-61`

#### 1. 📌 Context & Problem
The `/api/admin/login` endpoint issues admin credentials for system configuration.

#### 2. 🔍 Root Cause Analysis (RCA)
- `server.jwt.sign({ role: 'admin' })` lacks `expiresIn` (infinite token lifespan).
- `password !== adminPassword` uses string comparison vulnerable to timing side-channels.
- Missing endpoint-specific rate limiting against password brute-forcing.

#### 3. 💥 Impact
Stolen admin tokens never expire; attackers can mount timing attacks and brute-force passwords.

#### 4. 🛠️ Proposed Solution & Technical Steps
- Add `expiresIn: '8h'`.
- Register `@fastify/rate-limit` rule on login (`max: 5, timeWindow: 60000`).
- Use `crypto.timingSafeEqual` with buffer padding for password validation.

#### 5. 📋 Acceptance Criteria (AC)
- [ ] Issued JWT includes `exp` claim set to 8 hours.
- [ ] >5 failed attempts per minute trigger `429 Too Many Requests`.

#### 6. ✅ Definition of Done (DoD) & Verification Plan
- [ ] Update `packages/server/tests/admin.test.ts`.
- [ ] `pnpm test` passes.

---

---
*Back to [Ticket Index](../README.md)*
