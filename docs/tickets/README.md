# 🎫 TinyLink Engineering Tickets Hub

This directory organizes all engineering tickets into domain-specific subdirectories. File names are prefixed with their priority (`P0_`, `P1_`, `P2_`, `P3_`) so that file trees in any IDE or terminal automatically order tickets by urgency.

---

## 📌 Master Ticket Tracker

| Ticket ID                                                                                | Title                                                                                                                                              | Domain Subdirectory | Priority |           Type           | Status  |
| :--------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------- | :------------------ | :------: | :----------------------: | :-----: |
| [`TL-SEC-01`](./security/P0_TL-SEC-01_fix-identity-spoofing-proxy.md)                    | [Fix Identity Spoofing & Header Injection in Client BFF API Proxy](./security/P0_TL-SEC-01_fix-identity-spoofing-proxy.md)                         | `security/`         | 🔴 `P0`  | `Security Vulnerability` | ✅ Done |
| [`TL-ADM-01`](./admin/P0_TL-ADM-01_fix-admin-route-protection-middleware.md)             | [Fix Admin Route Protection & Export Middleware per Next.js Standard](./admin/P0_TL-ADM-01_fix-admin-route-protection-middleware.md)               | `admin/`            | 🔴 `P0`  | `Security Vulnerability` | ✅ Done |
| [`TL-SEC-02`](./security/P1_TL-SEC-02_prevent-ssrf-metadata-scraper.md)                  | [Prevent Server-Side Request Forgery (SSRF) in Metadata Scraper](./security/P1_TL-SEC-02_prevent-ssrf-metadata-scraper.md)                         | `security/`         | 🟠 `P1`  | `Security Vulnerability` | ✅ Done |
| [`TL-SEC-03`](./security/P1_TL-SEC-03_admin-jwt-expiry-rate-limit.md)                    | [Enforce Admin JWT Expiry, Login Rate Limiting & Constant-Time Auth](./security/P1_TL-SEC-03_admin-jwt-expiry-rate-limit.md)                       | `security/`         | 🟠 `P1`  | `Security Vulnerability` | ✅ Done |
| [`TL-BE-04`](./backend/P1_TL-BE-04_analytics-queue-poison-pill.md)                       | [Fix Analytics Queue Poison Pill & Batch Rollback Loop on Deleted Links](./backend/P1_TL-BE-04_analytics-queue-poison-pill.md)                     | `backend/`          | 🟠 `P1`  |          `Bug`           | ✅ Done |
| [`TL-FE-02`](./frontend/P1_TL-FE-02_inject-m2m-api-key-rsc-fetcher.md)                   | [Inject M2M Internal API Key in Server-Side RSC Fetcher](./frontend/P1_TL-FE-02_inject-m2m-api-key-rsc-fetcher.md)                                 | `frontend/`         | 🟠 `P1`  |          `Bug`           | ✅ Done |
| [`TL-ADM-03`](./admin/P1_TL-ADM-03_remove-hardcoded-localhost-links-table.md)            | [Remove Hardcoded Localhost URLs in Admin Links Table](./admin/P1_TL-ADM-03_remove-hardcoded-localhost-links-table.md)                             | `admin/`            | 🟠 `P1`  |          `Bug`           | ✅ Done |
| [`TL-ADM-04`](./admin/P1_TL-ADM-04_responsive-mobile-navigation-admin.md)                | [Implement Responsive Mobile Navigation for Admin Dashboard](./admin/P1_TL-ADM-04_responsive-mobile-navigation-admin.md)                           | `admin/`            | 🟠 `P1`  |      `Enhancement`       | ✅ Done |
| [`TL-OPS-01`](./devops/P1_TL-OPS-01_workspace-nextjs-build-gate-ci.md)                   | [Add Full Workspace Next.js Build Gate to CI Pipeline](./devops/P1_TL-OPS-01_workspace-nextjs-build-gate-ci.md)                                    | `devops/`           | 🟠 `P1`  |         `DevOps`         | ✅ Done |
| [`TL-OPS-02`](./devops/P1_TL-OPS-02_automate-prisma-client-prebuild.md)                  | [Automate Prisma Client Generation in `@tiny-link/db` Build Script](./devops/P1_TL-OPS-02_automate-prisma-client-prebuild.md)                      | `devops/`           | 🟠 `P1`  |         `DevOps`         | ✅ Done |
| [`TL-OPS-03`](./devops/P1_TL-OPS-03_post-deploy-health-verification-ci.md)               | [Add Post-Deployment Health Verification in GitHub Actions Deploy Step](./devops/P1_TL-OPS-03_post-deploy-health-verification-ci.md)               | `devops/`           | 🟠 `P1`  |         `DevOps`         | ✅ Done |
| [`TL-QA-01`](./quality-arch/P1_TL-QA-01_fix-explicit-any-upgrade-eslint.md)              | [Fix Explicit `: any` in `admin.routes` and Upgrade ESLint Rule to Error](./quality-arch/P1_TL-QA-01_fix-explicit-any-upgrade-eslint.md)           | `quality-arch/`     | 🟠 `P1`  |   `Quality Assurance`    | ✅ Done |
| [`TL-QA-02`](./quality-arch/P1_TL-QA-02_harmonize-custom-alias-form-regex.md)            | [Harmonize Custom Alias Form Validation Regex between Client and Shared](./quality-arch/P1_TL-QA-02_harmonize-custom-alias-form-regex.md)          | `quality-arch/`     | 🟠 `P1`  |          `Bug`           | ✅ Done |
| [`TL-BE-05`](./backend/P2_TL-BE-05_invalidate-redis-cache-admin-actions.md)              | [Invalidate Redis Cache on Admin Link Status Update and Deletion](./backend/P2_TL-BE-05_invalidate-redis-cache-admin-actions.md)                   | `backend/`          | 🟡 `P2`  |          `Bug`           | ✅ Done |
| [`TL-SEC-06`](./security/P2_TL-SEC-06_sanitize-csv-formula-injection.md)                 | [Sanitize CSV Export against Spreadsheet Formula Injection](./security/P2_TL-SEC-06_sanitize-csv-formula-injection.md)                             | `security/`         | 🟡 `P2`  | `Security Vulnerability` | ⏳ Open |
| [`TL-SEC-07`](./security/P2_TL-SEC-07_tighten-cors-regex-helmet-headers.md)              | [Tighten Vercel Preview CORS Origin Regex & Add Helmet Security Headers](./security/P2_TL-SEC-07_tighten-cors-regex-helmet-headers.md)             | `security/`         | 🟡 `P2`  | `Security Vulnerability` | ⏳ Open |
| [`TL-FE-05`](./frontend/P2_TL-FE-05_implement-i18n-next-intl.md)                         | [Implement Internationalization (`next-intl`) for Client App](./frontend/P2_TL-FE-05_implement-i18n-next-intl.md)                                  | `frontend/`         | 🟡 `P2`  |        `Feature`         | ⏳ Open |
| [`TL-FE-06`](./frontend/P2_TL-FE-06_dynamic-import-recharts-bundle-size.md)              | [Dynamic Import Recharts to Reduce Initial Bundle Size](./frontend/P2_TL-FE-06_dynamic-import-recharts-bundle-size.md)                             | `frontend/`         | 🟡 `P2`  |      `Performance`       | ⏳ Open |
| [`TL-OPS-04`](./devops/P2_TL-OPS-04_activate-frontend-tests-in-ci.md)                    | [Activate Frontend Test Suite in Package Scripts and CI](./devops/P2_TL-OPS-04_activate-frontend-tests-in-ci.md)                                   | `devops/`           | 🟡 `P2`  |         `DevOps`         | ⏳ Open |
| [`TL-OPS-05`](./devops/P2_TL-OPS-05_block-server-startup-dangerous-defaults.md)          | [Block Server Startup on Dangerous Secret Defaults in Production](./devops/P2_TL-OPS-05_block-server-startup-dangerous-defaults.md)                | `devops/`           | 🟡 `P2`  |        `Security`        | ⏳ Open |
| [`TL-ARCH-03`](./quality-arch/P2_TL-ARCH-03_remove-phantom-db-dependency-admin.md)       | [Remove Phantom Dependency `@tiny-link/db` from `@tiny-link/admin`](./quality-arch/P2_TL-ARCH-03_remove-phantom-db-dependency-admin.md)            | `quality-arch/`     | 🟡 `P2`  |       `Tech Debt`        | ⏳ Open |
| [`TL-ARCH-04`](./quality-arch/P2_TL-ARCH-04_refactor-admin-routes-controller-service.md) | [Refactor `admin.routes` Monolith to Controller-Service-Repository](./quality-arch/P2_TL-ARCH-04_refactor-admin-routes-controller-service.md)      | `quality-arch/`     | 🟡 `P2`  |       `Tech Debt`        | ⏳ Open |
| [`TL-BE-08`](./backend/P3_TL-BE-08_optimize-prisma-indexes-postgres-pool.md)             | [Optimize Prisma Indexes & Configure Postgres Connection Pool](./backend/P3_TL-BE-08_optimize-prisma-indexes-postgres-pool.md)                     | `backend/`          | 🟢 `P3`  |      `Performance`       | ⏳ Open |
| [`TL-UI-07`](./frontend/P3_TL-UI-07_clean-guest-cookie-remove-redirect-lag.md)           | [Clean Guest ID Cookie After Claim & Remove Artificial 800ms Redirect Lag](./frontend/P3_TL-UI-07_clean-guest-cookie-remove-redirect-lag.md)       | `frontend/`         | 🟢 `P3`  |           `UX`           | ⏳ Open |
| [`TL-OPS-06`](./devops/P3_TL-OPS-06_add-admin-env-example-lint-staged.md)                | [Add Missing `admin/.env.example` & Root Lint-Staged Monorepo Coverage](./devops/P3_TL-OPS-06_add-admin-env-example-lint-staged.md)                | `devops/`           | 🟢 `P3`  |   `Quality Assurance`    | ⏳ Open |
| [`TL-QA-05`](./quality-arch/P3_TL-QA-05_standardize-tsconfig-hierarchy-project-refs.md)  | [Standardize TypeScript Configuration Hierarchy and Project References](./quality-arch/P3_TL-QA-05_standardize-tsconfig-hierarchy-project-refs.md) | `quality-arch/`     | 🟢 `P3`  |   `Quality Assurance`    | ⏳ Open |

---

## 🗂️ Browse by Domain Subdirectory

### 🔒 [security/](./security/)

- [`P0_TL-SEC-01_fix-identity-spoofing-proxy.md`](./security/P0_TL-SEC-01_fix-identity-spoofing-proxy.md)
- [`P1_TL-SEC-02_prevent-ssrf-metadata-scraper.md`](./security/P1_TL-SEC-02_prevent-ssrf-metadata-scraper.md)
- [`P1_TL-SEC-03_admin-jwt-expiry-rate-limit.md`](./security/P1_TL-SEC-03_admin-jwt-expiry-rate-limit.md)
- [`P2_TL-SEC-06_sanitize-csv-formula-injection.md`](./security/P2_TL-SEC-06_sanitize-csv-formula-injection.md)
- [`P2_TL-SEC-07_tighten-cors-regex-helmet-headers.md`](./security/P2_TL-SEC-07_tighten-cors-regex-helmet-headers.md)

### ⚙️ [backend/](./backend/)

- [`P1_TL-BE-04_analytics-queue-poison-pill.md`](./backend/P1_TL-BE-04_analytics-queue-poison-pill.md)
- [`P2_TL-BE-05_invalidate-redis-cache-admin-actions.md`](./backend/P2_TL-BE-05_invalidate-redis-cache-admin-actions.md)
- [`P3_TL-BE-08_optimize-prisma-indexes-postgres-pool.md`](./backend/P3_TL-BE-08_optimize-prisma-indexes-postgres-pool.md)

### 🖥️ [frontend/](./frontend/)

- [`P1_TL-FE-02_inject-m2m-api-key-rsc-fetcher.md`](./frontend/P1_TL-FE-02_inject-m2m-api-key-rsc-fetcher.md)
- [`P2_TL-FE-05_implement-i18n-next-intl.md`](./frontend/P2_TL-FE-05_implement-i18n-next-intl.md)
- [`P2_TL-FE-06_dynamic-import-recharts-bundle-size.md`](./frontend/P2_TL-FE-06_dynamic-import-recharts-bundle-size.md)
- [`P3_TL-UI-07_clean-guest-cookie-remove-redirect-lag.md`](./frontend/P3_TL-UI-07_clean-guest-cookie-remove-redirect-lag.md)

### 🛡️ [admin/](./admin/)

- [`P0_TL-ADM-01_fix-admin-route-protection-middleware.md`](./admin/P0_TL-ADM-01_fix-admin-route-protection-middleware.md)
- [`P1_TL-ADM-03_remove-hardcoded-localhost-links-table.md`](./admin/P1_TL-ADM-03_remove-hardcoded-localhost-links-table.md)
- [`P1_TL-ADM-04_responsive-mobile-navigation-admin.md`](./admin/P1_TL-ADM-04_responsive-mobile-navigation-admin.md)

### 🚀 [devops/](./devops/)

- [`P1_TL-OPS-01_workspace-nextjs-build-gate-ci.md`](./devops/P1_TL-OPS-01_workspace-nextjs-build-gate-ci.md)
- [`P1_TL-OPS-02_automate-prisma-client-prebuild.md`](./devops/P1_TL-OPS-02_automate-prisma-client-prebuild.md)
- [`P1_TL-OPS-03_post-deploy-health-verification-ci.md`](./devops/P1_TL-OPS-03_post-deploy-health-verification-ci.md)
- [`P2_TL-OPS-04_activate-frontend-tests-in-ci.md`](./devops/P2_TL-OPS-04_activate-frontend-tests-in-ci.md)
- [`P2_TL-OPS-05_block-server-startup-dangerous-defaults.md`](./devops/P2_TL-OPS-05_block-server-startup-dangerous-defaults.md)
- [`P3_TL-OPS-06_add-admin-env-example-lint-staged.md`](./devops/P3_TL-OPS-06_add-admin-env-example-lint-staged.md)

### 📐 [quality-arch/](./quality-arch/)

- [`P1_TL-QA-01_fix-explicit-any-upgrade-eslint.md`](./quality-arch/P1_TL-QA-01_fix-explicit-any-upgrade-eslint.md)
- [`P1_TL-QA-02_harmonize-custom-alias-form-regex.md`](./quality-arch/P1_TL-QA-02_harmonize-custom-alias-form-regex.md)
- [`P2_TL-ARCH-03_remove-phantom-db-dependency-admin.md`](./quality-arch/P2_TL-ARCH-03_remove-phantom-db-dependency-admin.md)
- [`P2_TL-ARCH-04_refactor-admin-routes-controller-service.md`](./quality-arch/P2_TL-ARCH-04_refactor-admin-routes-controller-service.md)
- [`P3_TL-QA-05_standardize-tsconfig-hierarchy-project-refs.md`](./quality-arch/P3_TL-QA-05_standardize-tsconfig-hierarchy-project-refs.md)
