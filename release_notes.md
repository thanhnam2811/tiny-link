### 🚀 What's New

v1.5.2: Production Stabilization Hotfix. This release resolves critical regressions in the Auth flow, Docker deployment, and CI/CD pipelines identified post-v1.5.0.

### 🐛 Bug Fixes & Stabilization

- **Auth.js v5 MissingSecret**: Explicitly mapped `AUTH_SECRET` in the configuration to resolve crashes on Vercel's standalone output.
- **Docker Prisma Binary**: Moved `prisma` to production dependencies and updated the `Dockerfile` to include the schema folder, unblocking containerized deployments.
- **CI/CD Pathing**: Optimized GitHub Actions workspace filters to correctly target `@tiny-link/db` for database migrations.
- **Dashboard Type Safety**: Synchronized `LinkResponseSchema` and the Frontend `DashboardLink` interface to resolve TypeScript build failures.

### 🛠 Refactoring

- **Database Prebuild**: Added a `prebuild` hook to `@tiny-link/db` to ensure the Prisma Client is automatically generated before compilation.

---

**Full Changelog**: https://github.com/thanhnam2811/tiny-link/compare/v1.5.1...v1.5.2
