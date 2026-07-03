### 🟢 Phase 11: Growth & Power-User Features

**Status:** ⏳ Not Started

#### 🎯 Goal

Add power-user and growth-oriented features on top of the existing link model and user dashboard — features that increase retention and unlock marketing/campaign use-cases, without requiring a full platform/API rework.

#### 📋 Checklist

- [ ] **QR Code Generation**:
    - [ ] Generate a QR code per short link (server-side or client-side library).
    - [ ] Downloadable as PNG/SVG from the Dashboard and Stats pages.
- [ ] **Bulk Link Import/Export**:
    - [ ] CSV upload to batch-create links (validate rows, skip/report malformed entries, reuse existing collision handling).
    - [ ] CSV export of the current user's links from the Dashboard.
- [ ] **Custom/Vanity Domains**:
    - [ ] Domain ownership verification flow (DNS TXT or CNAME challenge).
    - [ ] Wildcard TLS / certificate handling for verified domains.
    - [ ] Redirect resolution updated to match `(domain, code)` pairs, without breaking existing default-domain short codes.

#### ✅ Definition of Done

- [ ] All checklist items above are complete and merged to `main`.
- [ ] A generated QR code scans correctly (verified with a real device/reader) and resolves to the same URL as the text short link.
- [ ] CSV import creates only valid links (malformed rows are rejected with a clear per-row error, not a silent partial failure); CSV export downloads a file matching the dashboard's current link set.
- [ ] Domain verification rejects unverified domains and only activates redirects once DNS ownership is confirmed.
- [ ] Existing default-domain redirect flow (`GET /:code`) has no regressions — confirmed via the Vitest suite plus a manual smoke test.

#### 🔗 Dependencies

Builds on the link model from [Phase 1](phase-1_mvp.md), the user dashboard from [Phase 6](phase-6_client-application.md), and per-user scoping from [Phase 9](phase-9_private-accounts.md) (bulk ops and custom domains should be scoped to the owning account).

#### 📎 Related backlog idea

**Paid Tier / Billing** (still in [backlog-ideas.md](backlog-ideas.md)) is a natural follow-up once custom domains exist — domains and higher import limits are an obvious thing to gate behind a subscription.
