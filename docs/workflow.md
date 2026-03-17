# 🛠️ Development Workflow

This document provides a detailed guide for the Development, Testing, and Preview workflows of the `tiny-link` project. The project utilizes a **Hybrid Development** model, combining the infrastructure power of Docker with the flexibility of a local environment.

---

## 1. 🚀 Development Workflow

The daily coding workflow strictly separates **Infrastructure** from **Application Code** to maximize hot-reload speed.

### Step 1: Start Background Infrastructure (Backend Services)

All databases (PostgreSQL) and cache dependencies (Redis) run in the background via Docker Compose.

```bash
# Start background infrastructure (run in the root directory)
pnpm docker:up
```

### Step 2: Start Development Server (Hot-reload)

Once the infrastructure is ready, start the Fastify Server directly in the local environment. In this mode, any changes to `.ts` files are applied immediately (under 1 second).

```bash
# Start the server with hot-reload enabled
pnpm server:dev
```

### Step 3: Working with Database Schema (Prisma)

When changing the table structure (modifying `packages/server/prisma/schema.prisma`):

1. Sync the new structure to the background database running on Docker:
    ```bash
    pnpm server:db:push
    ```
2. Open the visual Database administration tool in the browser (similar to Excel) to inspect or input data:
    ```bash
    pnpm server:db:studio
    ```

### Step 4: Shutdown (Cleanup)

At the end of the working session, clean up the infrastructure containers to free up RAM:

```bash
pnpm docker:down
```

---

## 2. 🧪 Testing Workflow

The project uses `vitest` with a separate `.env.test` configuration to prevent affecting real data.

### Running Unit/Integration Tests

The system automatically pushes the schema to a virtual DB before running test suites:

```bash
# Run all test suites once in the server package
cd packages/server
pnpm test

# Or run in watch mode while writing tests
pnpm test:watch
```

---

## 3. 🌐 Build and Preview Workflow

Unlike Development, when you want to Preview/Stage, you need to package the entire project into a Docker Image identical to Production to verify stability and startup scripts (like `entrypoint.sh`).

### Step 1: Clear Caches (Clean State)

Ensure no leftover artifacts from previous builds:

```bash
pnpm clean:all
```

### Step 2: Build & Run Full Docker Stack

This command builds the Application Image via a multi-stage `Dockerfile`, generating the optimized `dist/` build, and links it with PostgreSQL & Redis.

```bash
docker compose up -d --build
```

### Step 3: Database Migrations (Pre-flight Checks)

When the Production Container starts, the `entrypoint.sh` script **must** use `migrate deploy` instead of `db push` to ensure maximum data safety.
If you recently created new columns/tables during the Dev phase, ensure you generate an SQL Migration file (this step usually runs automatically on CI/CD, but locally you must generate it manually and push it to Git):

```bash
pnpm --filter @tiny-link/server exec prisma migrate dev --name <feature_name>
```

> **🔥 Note:** On this Docker Preview platform, all access to the application routes through port `3000` using compiled code (production/dist build), no longer utilizing `.ts` hot-reload. The speed experience in this step will be 100% identical to real users.
