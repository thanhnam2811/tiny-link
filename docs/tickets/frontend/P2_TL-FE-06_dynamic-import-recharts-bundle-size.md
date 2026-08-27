# [TL-FE-06] Dynamic Import Recharts to Reduce Initial Bundle Size

**Status:** ⏳ Open  
**Ticket ID:** `TL-FE-06`  

- **Component:** `@tiny-link/client` & `@tiny-link/admin`
- **Files:** `packages/client/src/app/stats/[code]/StatsDashboard.tsx`, `packages/admin/components/analytics-charts.tsx`
- **RCA:** Static `recharts` imports inflate initial chunk size by ~450KB.
- **Fix:** Use `next/dynamic` with `ssr: false` and Skeleton placeholder.

---

---
*Back to [Ticket Index](../README.md)*
