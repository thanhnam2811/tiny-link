# [TL-OPS-03] Add Post-Deployment Health Verification in GitHub Actions

**Status:** ✅ Done  
**Ticket ID:** `TL-OPS-03`

- **Type:** `DevOps`
- **Priority:** `P1 - High`
- **Component:** `root/ci-cd`
- **Affected Files:**
    - `.github/workflows/pipeline.yml:125-135`

#### 1. 📌 Context & Problem

Pushing commits to `main` triggers SSH deployment to the VPS host.

#### 2. 🔍 Root Cause Analysis (RCA)

Pipeline terminates immediately after `docker compose up -d` without verifying container health status.

#### 3. 💥 Impact

If the new container enters a crash loop (e.g. invalid env or failed migration), GitHub Actions falsely reports a successful release.

#### 4. 🛠️ Proposed Solution & Technical Steps

Add a healthcheck verification step via SSH:

```yaml
- name: Verify Container Health
  run: |
      ssh vps-deploy "cd /root/apps/tiny-link && \
        docker compose -f docker-compose.prod.yml exec -T app wget -q -O - http://localhost:3001/api/healthz || exit 1"
```

#### 5. 📋 Acceptance Criteria (AC)

- [x] Failed healthcheck marks the workflow as failed and alerts the team.

#### 6. ✅ Definition of Done (DoD) & Verification Plan

- [x] Verify pipeline syntax.

---

---

_Back to [Ticket Index](../README.md)_
