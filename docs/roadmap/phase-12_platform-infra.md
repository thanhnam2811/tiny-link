### 🔵 Phase 12: Platform & Infra

**Status:** ⏳ Not Started

#### 🎯 Goal

Turn TinyLink into a platform other systems can integrate with, and harden the infrastructure for traffic beyond a single free-tier region — building on the vanity domains from [Phase 11](phase-11_growth-power-features.md), which become more valuable once third parties can create links programmatically.

#### 📋 Checklist

- [ ] **Public API + API Keys**:
    - [ ] Issue per-account API keys, separate from the internal `INTERNAL_API_KEY` M2M channel used by `client`/`admin`.
    - [ ] Per-key rate limiting (Redis-backed, reusing the Phase 2 rate-limiter pattern).
    - [ ] Public-facing API docs (extend the existing Swagger/OpenAPI setup from Phase 5).
- [ ] **Admin System Health Metrics**:
    - [ ] Surface Redis and Postgres connection health in the Admin dashboard.
    - [ ] Surface click-queue depth and memory usage (the in-memory queue from Phase 2).
- [ ] **Webhooks**:
    - [ ] Notify a user-configured URL on link events (click threshold reached, link expired/self-destructed).
    - [ ] Signed payloads + retry-with-backoff for failed deliveries.
- [ ] **Multi-region Redis / read replicas**:
    - [ ] Evaluate read-replica or multi-region caching once redirect latency from a single Upstash region becomes a measured bottleneck.

#### ✅ Definition of Done

- [ ] All checklist items above are complete and merged to `main`.
- [ ] A third-party API key can create/list/delete links without access to any other account's data, and is rate-limited independently of the internal M2M channel.
- [ ] Admin dashboard health panel reflects real Redis/Postgres/queue state (verified by inducing a disconnect or queue backlog in a test environment).
- [ ] A registered webhook fires on the configured event with a verifiable signature, and a failed delivery retries instead of silently dropping.
- [ ] No regressions to existing internal M2M auth (`client`/`admin` → `server`) or the public redirect flow — confirmed via the Vitest suite plus a manual smoke test.

#### 🔗 Dependencies

Builds on the rate-limiting infrastructure from [Phase 2](phase-2_reliability-performance.md), the API docs from [Phase 5](phase-5_refactoring-optimization.md), the Admin dashboard from [Phase 8](phase-8_admin-dashboard.md), and the vanity domains from [Phase 11](phase-11_growth-power-features.md).
