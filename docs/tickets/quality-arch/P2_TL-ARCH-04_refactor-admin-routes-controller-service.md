# [TL-ARCH-04] Refactor `admin.routes` Monolith to Controller-Service-Repository

**Status:** ⏳ Open  
**Ticket ID:** `TL-ARCH-04`  

- **Component:** `@tiny-link/server`
- **Files:** `packages/server/src/modules/admin/admin.routes.ts`
- **RCA:** Monolithic 400-line route handler file directly executing database queries.
- **Fix:** Decompose into `admin.controller.ts`, `admin.service.ts`, `admin.repository.ts`, `admin.routes.ts`.

---

## 🟢 PRIORITY P3 — LOW TICKETS (POLISH & HYGIENE)

---

---
*Back to [Ticket Index](../README.md)*
