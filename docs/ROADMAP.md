# 🗺 TinyLink Development Roadmap

This project is divided into 4 phases, moving from core building blocks to production-level optimization.

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
- [ ] Integrate **Rate Limiter**: Use `fastify-rate-limit` to block IP-based spam.
- [ ] **Error Handling**: Professional handling for expired or non-existent links.

### 🔵 Phase 3: DevOps & Deployment (The Nomad Way)

_Goal: Deploy to the cloud with $0 cost._

- [ ] Dockerize the application (Multi-stage build for minimal image size).
- [ ] Setup **GitHub Actions**: Automated Linting, Testing, and Image Building.
- [ ] Deploy to **Fly.io** or **Render**.
- [ ] Setup **Health-check** and **JSON Logging** (Pino) for remote debugging.

### 🟣 Phase 4: Enhancements (The Extra Miles)

_Goal: Add "cool" features to stand out in your portfolio._

- [ ] **Self-destruct links**: Links that expire after N clicks or X time.
- [ ] **Password Protection**: Require a password to access specific links.
- [ ] **Geo-analytics**: Parse IP addresses for Country/City data (using lightweight libs or free APIs).
- [ ] **Simple Dashboard**: A minimal static HTML/JS page for link management and click charts (Chart.js).
