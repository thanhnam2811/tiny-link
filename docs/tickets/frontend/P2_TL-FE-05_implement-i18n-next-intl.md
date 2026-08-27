# [TL-FE-05] Implement Internationalization (`next-intl`) for Client App

**Status:** ⏳ Open  
**Ticket ID:** `TL-FE-05`  

- **Component:** `@tiny-link/client`
- **Files:** `packages/client/package.json`, `packages/client/src/messages/*.json`
- **RCA:** Architecture specifies `next-intl (en/vi)` but strings are hardcoded in English and `next-intl` is uninstalled.
- **Fix:** Install `next-intl`, extract copy into `messages/en.json` and `messages/vi.json`, and wrap client with provider.

---

---
*Back to [Ticket Index](../README.md)*
