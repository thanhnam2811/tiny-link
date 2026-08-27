# 📋 Ticket Engineering Standard (TES) — TinyLink Monorepo

This document defines the unified Ticket Engineering Standard for the TinyLink monorepo. Every bug, task, security vulnerability, refactor, and enhancement ticket must follow this specification to align with the **Plan-First, Code-Later** and **Definition of Done (DoD)** rules established in `CLAUDE.md`.

---

## 1. Priority & Severity Matrix

| Priority | Level | Definition | SLA / Resolution Window |
| :--- | :---: | :--- | :--- |
| **P0 - Critical** | 🔴 | Severe security vulnerability (account takeover, data leak, auth bypass), production outage, or broken core runtime. | Immediate Fix (Day 1 / Hotfix) |
| **P1 - High** | 🟠 | Critical business logic bug, broken CI/CD pipeline, SSRF/data corruption risk, or broken primary feature. | Current Sprint (1–3 days) |
| **P2 - Medium** | 🟡 | Non-blocking feature defect, performance degradation, missing i18n, or architectural tech debt. | Next Sprint (1–2 weeks) |
| **P3 - Low** | 🟢 | UI/UX micro-interactions, theme inconsistencies, dead code cleanup, or minor config refactoring. | Backlog / Routine Maintenance |

---

## 2. Directory Hierarchy & Filename Conventions

All ticket files reside under `docs/tickets/<domain>/` organized into domain subdirectories:

```
docs/tickets/
├── README.md                      # Master Tracker
├── security/                      # Security & Auth vulnerabilities
├── backend/                       # Fastify API, Prisma DB, Redis
├── frontend/                      # Client App (Port 3000)
├── admin/                         # Admin Dashboard (Port 3002)
├── devops/                        # Docker, CI/CD, Deployment
└── quality-arch/                  # TypeScript, Linting, Architecture
```

### Filename Format (Automatic Priority Sorting)

Filenames must follow the pattern:
```
<Priority>_<TicketID>_<short-descriptive-slug>.md
```

Examples:
- `security/P0_TL-SEC-01_fix-identity-spoofing-proxy.md`
- `admin/P0_TL-ADM-01_fix-admin-route-protection-middleware.md`
- `security/P1_TL-SEC-02_prevent-ssrf-metadata-scraper.md`
- `backend/P1_TL-BE-04_analytics-queue-poison-pill.md`
- `frontend/P2_TL-FE-05_implement-i18n-next-intl.md`

> **Benefit:** Any file manager, IDE explorer, or terminal listing will automatically order tickets from highest priority (`P0_`) to lowest (`P3_`).

---

## 3. Standard Ticket Template

Every ticket must use the following Markdown structure:

```markdown
# [ID] Concise Title Describing the Defect or Feature

**Status:** ⏳ Open  
**Ticket ID:** `TL-XXX-NN`  

- **Type:** `Bug` | `Security Vulnerability` | `Tech Debt` | `Feature` | `DevOps`
- **Priority:** `P0 - Critical` | `P1 - High` | `P2 - Medium` | `P3 - Low`
- **Component:** `@tiny-link/server` | `@tiny-link/client` | `@tiny-link/admin` | `@tiny-link/db` | `@tiny-link/shared` | `root/ci-cd`
- **Affected Files:**
  - `path/to/file.ts:line_start-line_end`

#### 1. 📌 Context & Problem
{Brief summary of the current behavior and what is failing}

#### 2. 🔍 Root Cause Analysis (RCA)
{Technical breakdown explaining why the bug occurs, including faulty code snippets}

#### 3. 💥 Impact
{Security, performance, user experience, or reliability risks if left unresolved}

#### 4. 🛠️ Proposed Solution & Technical Steps
{Step-by-step fix guide, code diff, or architecture modification}

#### 5. 📋 Acceptance Criteria (AC)
- [ ] AC1: ...
- [ ] AC2: ...

#### 6. ✅ Definition of Done (DoD) & Verification Plan
- [ ] **Type Safety:** `tsc` passes without errors or warnings.
- [ ] **Linting:** `pnpm lint` passes with 0 errors.
- [ ] **Testing:** Unit/Integration test added or updated; `pnpm test` passes 100%.
- [ ] **Log Verification:** No unhandled exceptions, memory leaks, or abnormal warnings.
- [ ] **Documentation:** Updated `docs/lessons.md` or relevant inline comments.

---
*Back to [Ticket Index](../README.md)*
```
