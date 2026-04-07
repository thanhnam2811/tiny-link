# 🗺 TinyLink Development Roadmap

This project is divided into 12 phases, moving from core building blocks to production-level optimization and frontend expansion.

---

### 🟢 Phase 1: MVP (The Engine)

_Goal: Complete the basic shortening and redirection flow._

- [x] Initialize project with **Fastify** and **TypeScript**.
- [x] Design Database Schema (Postgres): `links` and `clicks` tables.
- [x] API: `POST /api/links` (Link creation with collision handling).
- [x] API: `GET /:code` (Simple 302 Redirect).
- [x] API: `GET /api/stats/:code` (Raw stats from DB).

### 🟡 Phase 2: Reliability & Performance (The Middle-level Touch)

_Goal: Ensure system stability and data integrity._

- [x] Implement **Memory Queue**: Temporary storage for click events.
- [x] Implement **Batch Insert**: Automatically flush data from Queue to DB periodically.
- [x] Integrate **Rate Limiter**: Use `fastify-rate-limit` with Redis store for distributed limiting.
- [x] Implement **Redis Caching**: Negative caching, Promise Coalescing, Ghost Click protection.
- [x] **Error Handling**: Professional handling for expired or non-existent links.

### 🔵 Phase 3: DevOps & Deployment (The Nomad Way)

_Goal: Deploy to the cloud with $0 cost._

- [x] Dockerize the application (Multi-stage build for minimal image size).
- [x] Setup **GitHub Actions**: Automated Linting, Testing, and Image Building.
- [x] Deploy to **Render**.
- [x] Setup **Health-check** and **JSON Logging** (Pino) for remote debugging.

### 🟣 Phase 4: Enhancements (The Extra Miles)

_Goal: Add "cool" features to stand out in your portfolio._

- [x] **Self-destruct links**: Links that expire after N clicks or X time.
- [x] **Password Protection**: Require a password to access specific links.
- [x] **Geo-analytics**: Parse IP addresses for Country/City data (using lightweight libs or free APIs).
- [x] **Simple Dashboard**: A minimal static HTML/JS page for link management and click charts (Chart.js).

### 🟠 Phase 5: Code Refactoring & Optimization

_Goal: Improve code quality, maintainability, and design patterns._

- [x] Remove magic strings and numbers across the codebase.
- [x] Optimize and standardize design patterns.
- [x] Improve general code structure and readability.
- [x] **API Documentation**: Integrate Swagger / OpenAPI for auto-generated, visually appealing API docs.

### 🔴 Phase 6: Client Application (NextJS/ReactJS)

_Goal: Build a modern, user-facing application for creating and managing short links._

- [x] **Project Setup**: Initialize a `client` package (NextJS or ReactJS + Vite) inside the monorepo workspace. Share `types` and validation schemas between backend and frontend.
- [x] **UI/UX Foundation**: Setup TailwindCSS (or similar) and a component library (e.g., shadcn/ui or Radix).
- [x] **Core Pages**:
    - [x] Landing Page (Hero section, value proposition).
    - [x] Main input form to paste long URLs and get short URLs.
- [x] **Features (Guest)**: Create basic short links without an account.
- [ ] **Features (Authenticated - Optional later)**: Login/Register, view history of generated links.
- [x] **API Integration**: Connect to the Fastify backend for link creation and status checks.

### ⚫ Phase 7: Hybrid Rendering & Traffic Routing

_Goal: Intelligently route traffic between static metadata for bots and an interactive Next.js application for real users to maximize social previews and monetization._

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

### ⚪ Phase 8: Admin Dashboard (NextJS/ReactJS)

_Goal: Build a dedicated dashboard for system administration and detailed analytics._

- [x] **Project Setup**: Initialize an `admin` package (NextJS or static React) inside the monorepo workspace.
- [x] **Authentication**: Implement secure admin login (JWT/Session).
- [x] **Dashboard Overview**:
    - [x] Total links created, total clicks across the system.
    - [ ] System health metrics (if available).
- [x] **Link Management**:
    - [x] Table view of all links with search, sort, and pagination.
    - [x] Ability to disable/delete malicious or reported links.
- [x] **Detailed Analytics**:
    - [x] Visual charts for click trends over time (using Chart.js or Recharts).
    - [x] Geographic distribution of clicks (re-using Geo-Analytics data from Phase 4).
    - [x] Operating system & browser statistics.

---

### 🟢 Phase 9: Private Accounts & User Dashboard

_Goal: Allow regular users to log in easily and manage their own shortened links (SaaS evolution)._

- [x] **Database & Authentication (OAuth First)**:
    - [x] Setup `Auth.js` (NextAuth) with Google/GitHub providers.
    - [x] Create `User`/`Session` models and link-user relations.
- [x] **Feature: Claim Guest Links (UX Premium)**:
    - [x] Implement server-side and client-side auto-claiming of orphan links upon login.
- [x] **User Dashboard (Frontend `client` package)**:
    - [x] Private dashboard with CRUD operations (List, Search, Delete).
    - [x] Secure BFF Proxy for session-aware link management.

### ✅ Phase 10: UI/UX Premium (The Last Mile)

_Goal: Elevate the platform to a world-class standard with professional aesthetics and seamless interactions._

- [x] **Visual Identity & Design System**:
    - [x] Implement **HSL-based dynamic color palettes** (Dark/Light/System) using Tailwind CSS v4 logic.
    - [x] Integrate **Glassmorphism + Minimalist** effects (`.glass-card`, `.glass-subtle`, `.gradient-mesh`) for cards, modals, and navigation.
    - [x] Setup modern typography (Inter/Outfit pairing) with fluid scaling.
- [x] **Enhanced Interactions**:
    - [x] **Framer Motion**: Add entrance animations, hover transforms, stagger, and layout transitions.
    - [x] **Micro-animations**: Animated copy-to-clipboard (Copy → Copied!), success checkmark spring, Sparkles icon.
    - [x] **Smooth Scrolling**: Integrate Lenis via `SmoothScrollProvider` for a premium feel.
- [x] **Resilience & Fallbacks (The "No Broken Flows" Rule)**:
    - [x] **Custom 404 (Not Found)**: Animated glass-card 404 page.
    - [x] **Custom Error boundaries**: `error.tsx` with auto-retry and Home button.
    - [x] **Skeleton Loading**: Skeleton screens for `loading.tsx`, Dashboard, and Analytics.
- [x] **Page-Specific Polish**:
    - [x] **Landing Page**: Gradient-mesh hero, bento-grid feature section, glass-card form, staggered animations.
    - [x] **Dashboard**: Empty-state illustration, `AnimatePresence` link cards, skeleton loading.
    - [x] **Analytics**: Bento metric cards, area gradient Recharts, interactive tooltips, glass password unlock.

### 🔵 Phase 11: Client-side Internationalization (i18n) [COMPLETED]

_Goal: Expand the reach and professional appeal of the platform with multi-language support._

- [x] **Project Setup**: Integrate `next-intl` (recommended) or `react-i18next` for type-safe translations and locale routing.
- [x] **Content Decoupling**: Extract all hardcoded strings into standardized JSON translation files (EN, VI).
- [x] **Interactive Switcher**: Implement a minimalist, glassmorphic language switcher component.
- [x] **SEO & Metadata**: Ensure dynamic locale-aware metadata (`html lang`, `og:locale`) for all pages.
- [x] **Persistence**: Remember user language preferences via cookies or LocalStorage.

### 🟣 Phase 12: Applied AI Integration (The Smart System)

_Goal: Learn practical, cost-effective AI deployment (OpenAI/Gemini) inside a modern backend architecture._

- [ ] **AI-Assisted User Experience**:
    - [ ] **Smart Short Codes**: AI-powered streaming suggestions.
    - [ ] **Auto-Generated Meta Tags**: Background workers updating OG tags via LLM analysis.
- [ ] **AI for System Security & Insights**:
    - [ ] **Malicious Content Detection**: Multi-tier cost-optimized LLM scoring.
    - [ ] **Traffic Anomaly Insights**: Conversational summaries of click surges in Admin UI.
