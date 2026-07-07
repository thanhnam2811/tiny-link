### 🔵 Phase 3: DevOps & Deployment (The Nomad Way)

**Status:** ✅ Done

#### 🎯 Goal

Deploy to the cloud with $0 cost, with an automated pipeline instead of manual pushes.

#### 📋 Checklist

- [x] Dockerize the application (Multi-stage build for minimal image size).
- [x] Setup **GitHub Actions**: Automated Linting, Testing, and Image Building.
- [x] Deploy to **Render**. _(superseded — migrated to a self-hosted VPS, see below)_
- [x] Setup **Health-check** and **JSON Logging** (Pino) for remote debugging.
- [x] Migrate deploy target from Render to a **self-hosted VPS** (Docker + Cloudflare Tunnel for SSH/HTTP, no cold start, no free-tier hour limits).

#### ✅ Definition of Done

- [x] All checklist items above are complete and merged to `main`.
- [x] Docker multi-stage build produces a minimal production image that starts cleanly and passes `/api/healthz`.
- [x] GitHub Actions run lint + test + build on every PR and block merge on failure.
- [x] Deployed instance is reachable on the VPS (behind Cloudflare Tunnel) and auto-deploys from `main` on push (build → push to GHCR → SSH pull & restart).
- [x] Pino JSON logs are inspectable via `docker logs`/`journalctl` on the VPS with no unhandled exceptions during startup or steady state.
