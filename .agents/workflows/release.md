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
