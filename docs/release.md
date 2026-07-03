# Release Workflow (Single-Branch Model)

`main` is always deployable. Every merge to `main` is automatically built, migrated, and deployed to production.

## 1. Feature Development

- All features and fixes start on a dedicated branch off `main` (e.g. `feature/xyz`, `fix/abc`).
- Run `pnpm lint`, `pnpm build`, and `pnpm test` locally before opening a PR.

## 2. Pull Request

- Open a Pull Request targeting `main`.
- CI (`.github/workflows/pipeline.yml`) runs lint + tests as a merge gate.

## 3. Merge & Auto-Deploy

- Once checks pass and the PR is approved, merge into `main`.
- The push to `main` triggers the full pipeline: Docker build/publish → `prisma migrate deploy` → Render production deploy hook.
- No manual tagging or staging promotion step is required.

## 4. Rollback

If a deploy introduces a regression, revert the offending commit(s) on `main` and push — the revert goes through the same pipeline and redeploys the previous known-good state.

## 5. Versioning

There are no git tags or GitHub Releases — the deploy history on `main` is the changelog. A single semver, tracked in the root `package.json`, is mirrored across every workspace package's `package.json` purely for human reference (e.g. shown in `/api/healthz` and the API docs via `APP_VERSION`).

- Bump it when a PR ships a user-facing change worth noting: `pnpm version:bump <x.y.z>`.
- This rewrites every `package.json` in the workspace in one shot (uses `scripts/bump-version.mjs`, which discovers packages dynamically — no per-package list to maintain).
- Commit the bump as part of the same PR; no separate release PR or tag step.
