# [TL-FE-05] Implement Internationalization (`next-intl`) for Client App

**Status:** ✅ Done  
**Ticket ID:** `TL-FE-05`

- **Component:** `@tiny-link/client`
- **Files:** `packages/client/package.json`, `packages/client/src/messages/*.json`
- **RCA:** Architecture specifies `next-intl (en/vi)` but strings are hardcoded in English and `next-intl` is uninstalled.
- **Fix:** Install `next-intl`, extract copy into `messages/en.json` and `messages/vi.json`, and wrap client with provider.

#### 📋 Acceptance Criteria (AC)

- [x] Integrate `next-intl` plugin in `next.config.ts` and request config in `src/i18n/request.ts`.
- [x] Provide complete English (`messages/en.json`) and Vietnamese (`messages/vi.json`) translation catalogs.
- [x] Add accessible `LocaleToggle` component in navigation header with cookie-based persistence.

#### ✅ Definition of Done (DoD)

- [x] Client tests in `LocaleToggle.test.tsx` pass and `next build` compiles successfully.

---

---

_Back to [Ticket Index](../README.md)_
