# [TL-OPS-05] Block Server Startup on Dangerous Secret Defaults in Production

**Status:** ✅ Done  
**Ticket ID:** `TL-OPS-05`

- **Component:** `@tiny-link/server`
- **Files:** `packages/server/src/shared/env.ts`
- **RCA:** `getEnv` logs a warning instead of throwing an error when test default credentials (`admin123`) run in production.
- **Fix:** Throw an error on dangerous defaults when `NODE_ENV === 'production'`.

#### 📋 Acceptance Criteria (AC)

- [x] Throw critical error in `getEnv` when required environment variables are missing in production.
- [x] Throw critical error in `getEnv` when dangerous default values (`admin123`, `super-secret-key-for-admin-jwt`, `secret`, `test-internal-key`, `INTERNAL_AUTH.TEST_KEY`) are present in production.
- [x] Preserve permissive fallback behavior for development and test environments.

#### ✅ Definition of Done (DoD)

- [x] Unit test suite in `packages/server/test/shared/env.test.ts` passes with 100% coverage.

---

---

_Back to [Ticket Index](../README.md)_
