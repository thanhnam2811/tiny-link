# [TL-FE-06] Dynamic Import Recharts to Reduce Initial Bundle Size

**Status:** ✅ Done  
**Ticket ID:** `TL-FE-06`

- **Component:** `@tiny-link/client` & `@tiny-link/admin`
- **Files:** `packages/client/src/app/stats/[code]/StatsDashboard.tsx`, `packages/admin/components/analytics-charts.tsx`
- **RCA:** Static `recharts` imports inflate initial chunk size by ~450KB.
- **Fix:** Use `next/dynamic` with `ssr: false` and Skeleton placeholder.

#### 📋 Acceptance Criteria (AC)

- [x] Dynamically load Recharts components via `next/dynamic` with `ssr: false` in both Client stats and Admin analytics.
- [x] Provide skeleton placeholder loaders with exact geometry to prevent Cumulative Layout Shift (CLS).

#### ✅ Definition of Done (DoD)

- [x] Zero static import leakage of Recharts in entry bundles; all packages build cleanly with `pnpm build`.

---

---

_Back to [Ticket Index](../README.md)_
