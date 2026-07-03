### 🟢 Phase 9: Private Accounts & User Dashboard

**Status:** ✅ Done

#### 🎯 Goal

Allow regular users to log in easily and manage their own shortened links (SaaS evolution).

#### 📋 Checklist

- [x] **Database & Authentication (OAuth First)**:
    - [x] Setup `Auth.js` (NextAuth) with Google/GitHub providers. _(Later migrated to Auth0 — see recent `feature/client-auth0-migration` PR.)_
    - [x] Create `User`/`Session` models and link-user relations.
- [x] **Feature: Claim Guest Links (UX Premium)**:
    - [x] Implement server-side and client-side auto-claiming of orphan links upon login.
- [x] **User Dashboard (Frontend `client` package)**:
    - [x] Private dashboard with CRUD operations (List, Search, Delete).
    - [x] Secure BFF Proxy for session-aware link management.

#### ✅ Definition of Done

- [x] All checklist items above are complete and merged to `main`.
- [x] OAuth login (via Auth0) creates or links a `User` row keyed on the external `sub` identifier.
- [x] Guest-created links (tracked via the `tiny_link_guest_id` cookie) are auto-claimed on first login.
- [x] Dashboard CRUD operations are scoped to the current session's own links, enforced server-side (not just hidden in the UI).
- [x] The BFF proxy attaches `INTERNAL_API_KEY` server-side only — it is never exposed to the browser.

#### 🔗 Dependencies

Builds on the guest-creation flow from [Phase 6](phase-6_client-application.md).
