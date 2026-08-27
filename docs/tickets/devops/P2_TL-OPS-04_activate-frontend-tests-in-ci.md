# [TL-OPS-04] Activate Frontend Test Suite in Package Scripts and CI

**Status:** ✅ Done  
**Ticket ID:** `TL-OPS-04`

- **Component:** `@tiny-link/client`
- **Files:** `packages/client/package.json`, `.github/workflows/pipeline.yml`
- **RCA:** Client tests exist but `package.json` lacks `"test": "vitest run"`, bypassing `pnpm test`.
- **Fix:** Add `test` script and ensure CI runs all workspace test suites.

#### 📋 Acceptance Criteria (AC)

- [x] Add `"test": "vitest run"` to `packages/client/package.json`.
- [x] Update `.github/workflows/pipeline.yml` to run `pnpm test` across the monorepo workspace.

#### ✅ Definition of Done (DoD)

- [x] `pnpm test` triggers test suites in all packages (`server`, `admin`, `client`) and passes cleanly.

---

---

_Back to [Ticket Index](../README.md)_
