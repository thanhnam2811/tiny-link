### ⚫ Phase 7: Hybrid Rendering & Traffic Routing

**Status:** ✅ Done

#### 🎯 Goal

Intelligently route traffic between static metadata for bots and an interactive Next.js application for real users, to maximize social previews and monetization.

#### 📋 Checklist

- [x] **Next.js Edge Middleware**: Implement middleware to intercept short link requests, analyzing the `User-Agent` header natively at the Edge.
- [x] **Bot Traffic Flow (Social Previews)**:
    - [x] Identify crawler signatures (Facebook, Zalo, Discord, Twitter, Googlebot, etc).
    - [x] Execute accelerated server-to-server metadata fetches directly against Fastify without starting a React lifecycle.
    - [x] Return a barebones, JS-free HTML response injecting purely OpenGraph (`<meta property="og:...">`) tag content.
- [x] **Human Traffic Flow (Interactive & Monetization)**:
    - [x] Allow React/Next.js to render the full Application client.
    - [x] Implement an Interstitial Ads screen accompanied by a forced countdown timer (e.g., 5 seconds) before redirection.
    - [x] Incorporate interactive Challenge Forms strictly on the client (e.g., password challenges, robot captchas).
    - [x] Dispatch background analytics telemetry (Timezone, Device Resolution, User Interaction) silently before final redirection logic activates (`window.location.href`).

#### ✅ Definition of Done

- [x] All checklist items above are complete and merged to `main`.
- [x] A spoofed crawler User-Agent (e.g. Facebook/Twitter bot) receives JS-free OG HTML, not a client redirect.
- [x] A normal browser User-Agent receives the full Next.js app, with the countdown and password-challenge flow working client-side.
- [x] Analytics telemetry is dispatched before `window.location.href` fires (verified via network tab).

#### 🔗 Dependencies

Requires the Next.js client shell from [Phase 6](phase-6_client-application.md).
