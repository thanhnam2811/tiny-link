# 🗺 TinyLink Development Roadmap

This project is divided into 7 phases, moving from core building blocks to production-level optimization and frontend expansion.

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

### ⚫ Phase 7: Admin Dashboard (NextJS/ReactJS)

_Goal: Build a dedicated dashboard for system administration and detailed analytics._

- [ ] **Project Setup**: Initialize an `admin` package (NextJS or static React) inside the monorepo workspace.
- [ ] **Authentication**: Implement secure admin login (JWT/Session).
- [ ] **Dashboard Overview**:
    - [ ] Total links created, total clicks across the system.
    - [ ] System health metrics (if available).
- [ ] **Link Management**:
    - [ ] Table view of all links with search, sort, and pagination.
    - [ ] Ability to disable/delete malicious or reported links.
- [ ] **Detailed Analytics**:
    - [ ] Visual charts for click trends over time (using Chart.js or Recharts).
    - [ ] Geographic distribution of clicks (re-using Geo-Analytics data from Phase 4).
    - [ ] Operating system & browser statistics.
