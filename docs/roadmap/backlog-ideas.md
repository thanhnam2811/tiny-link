# 💡 Backlog: Unscheduled Ideas

Ideas that haven't been assigned to a phase yet. When one is ready to be worked on, promote it into a new phase file using the template in [README.md](README.md#phase-template) and remove it from here.

---

## AI & Intelligence

_(Demoted from the former "Phase 11" — not started, no committed timeline.)_

- [ ] **Smart Short Codes**: AI-powered streaming suggestions for custom short codes as the user types.
- [ ] **Auto-Generated Meta Tags**: Background worker uses an LLM to fill in missing OG title/description when the metadata scraper (see `docs/ARCHITECTURE.md` §3.3) can't find them on the source page.
- [ ] **Malicious Content Detection**: Multi-tier, cost-optimized LLM scoring pipeline to flag phishing/malware links before they go live.
- [ ] **Traffic Anomaly Insights**: Conversational summaries of click surges/drops surfaced in the Admin dashboard.

## Growth & Monetization

> QR Code Generation and Bulk Link Import/Export were promoted to [Phase 11](phase-11_growth-power-features.md).

- [ ] **Custom/Vanity Domains**: domain ownership verification (DNS TXT/CNAME challenge), wildcard TLS/certificate handling, and redirect resolution matching `(domain, code)` pairs. Demoted back from Phase 11 — needs ongoing per-domain DNS/certificate infrastructure and ideally a billing model to cover the cost, which isn't a good fit for a free side project. Revisit if/when **Paid Tier / Billing** below is picked up.
- [ ] **Paid Tier / Billing**: gate custom domains, higher rate limits, and longer link retention behind a subscription (e.g. Stripe). Natural precursor for Custom/Vanity Domains above.

## Platform & Infra

> Public API + API Keys, Admin System Health Metrics, Webhooks, and Multi-region Redis were promoted to [Phase 12](phase-12_platform-infra.md).

## Developer & User Experience

> Browser Extension, UTM Builder, Link Expiration Notifications, and GraphQL API layer were promoted to [Phase 13](phase-13_developer-user-experience.md).
