# [TL-OPS-04] Activate Frontend Test Suite in Package Scripts and CI

**Status:** ⏳ Open  
**Ticket ID:** `TL-OPS-04`  

- **Component:** `@tiny-link/client`
- **Files:** `packages/client/package.json`, `.github/workflows/pipeline.yml`
- **RCA:** Client tests exist but `package.json` lacks `"test": "vitest run"`, bypassing `pnpm test`.
- **Fix:** Add `test` script and ensure CI runs all workspace test suites.

---

---
*Back to [Ticket Index](../README.md)*
