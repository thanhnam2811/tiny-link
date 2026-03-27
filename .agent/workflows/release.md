# Release Workflow (2-Branch Model)

This workflow ensures that code is fully verified in the **Staging/Preview** environment before being promoted to **Production**.

## 1. Feature Development & Integration

- All features and fixes start on a dedicated branch (e.g., `feature/xyz`).
- Once complete, create a Pull Request to the `develop` branch.
- Merge the PR into `develop`.

## 2. Staging Verification (Mandatory Gate)

- Merging to `develop` automatically triggers a deployment to the **Staging/Preview** environment via GitHub Actions (`deploy_preview`).
- **Wait** for the deployment to finish and verify the changes on the Staging URL.
- Test critical paths: Login, Linking, Analytics, etc.

## 3. Promotion to Production (Release)

Once Staging is verified as stable:

### A. Merge Develop to Main

Create a Pull Request from `develop` to `main` and merge it. This ensures `main` always matches the verified `develop` state.

### B. Automated Testing

Run the test suite one last time locally to ensure workspace integrity.

```bash
pnpm test
```

### C. Version Bump & Tagging

Execute the version bump script and create a Git Tag. This triggers the `deploy_production` job in GitHub Actions.

```bash
# 1. Bump workspace packages
node scripts/bump-version.mjs <version>

# 2. Stage changes
git add .

# 3. Bump root version & create tag
npm version <patch|minor|major> --force -m "chore(release): v%s"

# 4. Push to main with tags
git push origin main --follow-tags
```

## 4. Auto-Draft GitHub Release

Use the GitHub CLI (`gh`) to create a drafted release for final review.

```bash
gh release create <tag> --draft --title "<tag>" --notes-file /tmp/release_notes.md
```

Follow the structure in `docs/RELEASE_TEMPLATE.md` for the release notes.

- `### 🚀 What's New`
- `### ✨ Features`
- `### 🐛 Bug Fixes`
- `---`
- `**Full Changelog**: https://github.com/thanhnam2811/tiny-link/commits/vX.X.X`
