# 🗺 TinyLink Development Roadmap

Phase status is split into one file per phase for easier tracking. Each file follows the same structure (see [Phase template](#phase-template) below).

| Phase | Name                                                                   | Status                                      |
| ----- | ---------------------------------------------------------------------- | ------------------------------------------- |
| 1     | [MVP (The Engine)](phase-1_mvp.md)                                     | ✅ Done                                     |
| 2     | [Reliability & Performance](phase-2_reliability-performance.md)        | ✅ Done                                     |
| 3     | [DevOps & Deployment](phase-3_devops-deployment.md)                    | ✅ Done                                     |
| 4     | [Enhancements](phase-4_enhancements.md)                                | ✅ Done                                     |
| 5     | [Code Refactoring & Optimization](phase-5_refactoring-optimization.md) | ✅ Done                                     |
| 6     | [Client Application](phase-6_client-application.md)                    | 🚧 Mostly done (1 item deferred to Phase 9) |
| 7     | [Hybrid Rendering & Traffic Routing](phase-7_hybrid-rendering.md)      | ✅ Done                                     |
| 8     | [Admin Dashboard](phase-8_admin-dashboard.md)                          | 🚧 Mostly done (1 item deferred to backlog) |
| 9     | [Private Accounts & User Dashboard](phase-9_private-accounts.md)       | ✅ Done                                     |
| 10    | [UI/UX Premium](phase-10_ui-ux-premium.md)                             | ✅ Done                                     |
| 11    | [Growth & Power-User Features](phase-11_growth-power-features.md)      | ✅ Done                                     |
| 12    | [Platform & Infra](phase-12_platform-infra.md)                         | 🚧 In Progress (Stage 1 done)               |
| 13    | [Developer & User Experience](phase-13_developer-user-experience.md)   | ⏳ Not Started                              |

Ideas not yet scheduled into a phase — including AI Integration ideas and a future billing/paid-tier phase — live in [backlog-ideas.md](backlog-ideas.md).

---

## Phase template

Each phase file follows a standard structure, adapted from common phase-gate / Definition-of-Done practice (see also the project-wide DoD in root `CLAUDE.md` §4):

- **Status** — one of ✅ Done, 🚧 In Progress / Mostly Done, ⏳ Not Started.
- **🎯 Goal** — the single outcome the phase exists to deliver. If a checklist item doesn't serve the goal, it belongs in a different phase or the backlog.
- **📋 Checklist** — the concrete, checkable deliverables. This is the "what."
- **✅ Definition of Done** — the "how do we know it's actually done" criteria: what was verified (build passes, manual/automated test, log check), not just "code was written." Mirrors the project's global DoD: test-driven validation, log verification, code quality.
- **🔗 Dependencies** _(optional)_ — only included when the phase meaningfully builds on another phase's output, to make build/verification order obvious.

New phases should follow this same shape:

```markdown
### {emoji} Phase N: {Title}

**Status:** ⏳ Not Started

#### 🎯 Goal

{one or two sentences: the outcome this phase delivers}

#### 📋 Checklist

- [ ] ...

#### ✅ Definition of Done

- [ ] All checklist items above are complete and merged to `main`.
- [ ] {phase-specific verification — what was tested/observed to prove it works}

#### 🔗 Dependencies

{only if relevant}
```
