# [TL-SEC-06] Sanitize CSV Export against Spreadsheet Formula Injection

**Status:** ⏳ Open  
**Ticket ID:** `TL-SEC-06`  

- **Component:** `@tiny-link/server`
- **Files:** `packages/server/src/modules/link/csv.util.ts:12-17`
- **RCA:** Fields starting with `=`, `+`, `-`, `@` execute arbitrary formulas when opened in Excel/Sheets.
- **Fix:** Prefix formula trigger characters with a single quote `'`.

---

---
*Back to [Ticket Index](../README.md)*
