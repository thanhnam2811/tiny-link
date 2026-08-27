# [TL-OPS-05] Block Server Startup on Dangerous Secret Defaults in Production

**Status:** ⏳ Open  
**Ticket ID:** `TL-OPS-05`  

- **Component:** `@tiny-link/server`
- **Files:** `packages/server/src/shared/env.ts`
- **RCA:** `getEnv` logs a warning instead of throwing an error when test default credentials (`admin123`) run in production.
- **Fix:** Throw an error on dangerous defaults when `NODE_ENV === 'production'`.

---

---
*Back to [Ticket Index](../README.md)*
