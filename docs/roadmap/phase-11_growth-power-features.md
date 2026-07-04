### 🟢 Phase 11: Growth & Power-User Features

**Status:** ✅ Done

#### 🎯 Goal

Add power-user and growth-oriented features on top of the existing link model and user dashboard — features that increase retention and unlock marketing/campaign use-cases, without requiring a full platform/API rework.

#### 📋 Checklist

- [x] **QR Code Generation**:
    - [x] Generate a QR code per short link (server-side or client-side library).
    - [x] Downloadable as PNG/SVG from the Dashboard and Stats pages.
- [x] **Bulk Link Import/Export**:
    - [x] CSV upload to batch-create links (validate rows, skip/report malformed entries, reuse existing collision handling).
    - [x] CSV export of the current user's links from the Dashboard.

#### ✅ Definition of Done

- [x] All checklist items above are complete and merged to `main`.
- [ ] A generated QR code scans correctly (verified with a real device/reader) and resolves to the same URL as the text short link.
- [x] CSV import creates only valid links (malformed rows are rejected with a clear per-row error, not a silent partial failure); CSV export downloads a file matching the dashboard's current link set.
- [x] Existing default-domain redirect flow (`GET /:code`) has no regressions — confirmed via the Vitest suite plus a manual smoke test.

#### 🔗 Dependencies

Builds on the link model from [Phase 1](phase-1_mvp.md), the user dashboard from [Phase 6](phase-6_client-application.md), and per-user scoping from [Phase 9](phase-9_private-accounts.md) (bulk ops should be scoped to the owning account).

#### 📎 Related backlog idea

**Custom/Vanity Domains** and **Paid Tier / Billing** (both in [backlog-ideas.md](backlog-ideas.md)) were demoted from this phase — see the backlog entry for why.
