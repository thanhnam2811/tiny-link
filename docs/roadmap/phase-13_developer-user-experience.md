### 🟠 Phase 13: Developer & User Experience

**Status:** ⏳ Not Started

#### 🎯 Goal

Round out day-to-day usability for end users and downstream developers — quick-shorten convenience, campaign tooling, proactive notifications, and a more flexible query layer on top of the Phase 12 API.

#### 📋 Checklist

- [ ] **Browser Extension**:
    - [ ] One-click shorten from the current tab (Chrome/Firefox), authenticated against the user's account.
- [ ] **UTM Builder**:
    - [ ] Helper UI to append/manage UTM params before shortening a link (from the Dashboard's create form).
- [ ] **Link Expiration Notifications**:
    - [ ] Email the link owner before and when a self-destruct link expires (needs an email provider, e.g. Resend).
- [ ] **GraphQL API layer**:
    - [ ] Add alongside REST if third-party integrations need more flexible querying than the Phase 12 Public API provides.

#### ✅ Definition of Done

- [ ] All checklist items above are complete and merged to `main`.
- [ ] The browser extension creates a link from the active tab's URL and it appears in the user's Dashboard immediately after.
- [ ] The UTM Builder produces a correctly-encoded URL that matches what was entered before shortening.
- [ ] A test self-destruct link triggers both a pre-expiry warning email and an at-expiry email to the owner.
- [ ] The GraphQL layer resolves the same authorization rules as the REST API (no cross-account data leakage) — verified with a query attempting to access another account's links.

#### 🔗 Dependencies

Builds on the user dashboard from [Phase 6](phase-6_client-application.md), self-destruct links from [Phase 4](phase-4_enhancements.md), and the Public API from [Phase 12](phase-12_platform-infra.md).
