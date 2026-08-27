# [TL-SEC-06] Sanitize CSV Export against Spreadsheet Formula Injection

**Status:** ✅ Done  
**Ticket ID:** `TL-SEC-06`

- **Component:** `@tiny-link/server`
- **Files:** `packages/server/src/modules/link/csv.util.ts:12-17`
- **RCA:** Fields starting with `=`, `+`, `-`, `@` execute arbitrary formulas when opened in Excel/Sheets.
- **Fix:** Prefix formula trigger characters with a single quote `'`.

#### 📋 Acceptance Criteria (AC)

- [x] Formula trigger characters (`=`, `+`, `-`, `@`, `\t`, `\r`) are sanitized by prepending a single quote `'`.
- [x] Standard CSV quoting and escaping for commas, quotes, and newlines are preserved.

#### ✅ Definition of Done (DoD)

- [x] Unit test suite in `csv.util.test.ts` passes with 100% assertions.

---

---

_Back to [Ticket Index](../README.md)_
