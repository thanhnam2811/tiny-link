### ⚪ Phase 8: Admin Dashboard (NextJS/ReactJS)

**Status:** 🚧 Mostly done — 1 item deferred to backlog

#### 🎯 Goal

Build a dedicated dashboard for system administration and detailed analytics.

#### 📋 Checklist

- [x] **Project Setup**: Initialize an `admin` package (NextJS or static React) inside the monorepo workspace.
- [x] **Authentication**: Implement secure admin login (JWT/Session).
- [x] **Dashboard Overview**:
    - [x] Total links created, total clicks across the system.
    - [ ] System health metrics (if available). _(Not yet implemented — see [backlog-ideas.md](backlog-ideas.md).)_
- [x] **Link Management**:
    - [x] Table view of all links with search, sort, and pagination.
    - [x] Ability to disable/delete malicious or reported links.
- [x] **Detailed Analytics**:
    - [x] Visual charts for click trends over time (using Chart.js or Recharts).
    - [x] Geographic distribution of clicks (re-using Geo-Analytics data from Phase 4).
    - [x] Operating system & browser statistics.

#### ✅ Definition of Done

- [x] All checklist items above (excluding system health metrics) are complete and merged to `main`.
- [x] Admin login issues a valid JWT; protected admin routes reject requests without it.
- [x] The link table's search/sort/pagination and disable/delete actions work against real data and are reflected in the public redirect flow.
- [x] Timeline/OS/browser/country charts render with real click data and no Recharts console warnings.

#### 🔗 Dependencies

Consumes the click/geo data produced by [Phase 2](phase-2_reliability-performance.md) and [Phase 4](phase-4_enhancements.md).
