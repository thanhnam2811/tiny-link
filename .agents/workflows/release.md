---
description: Release Workflow Process
---

# Release Workflow

This workflow executes a safe monorepo version bump and creates a Git Tag. The final GitHub release **MUST** adhere to the Title and Content structure defined in `docs/RELEASE_TEMPLATE.md`.

## 1. Bump Workspace Packages Silently

Set the new version explicitly for all sub-packages without triggering NPM's workspace locking errors.

```bash
node scripts/bump-version.mjs 1.3.0 # UPDATE THIS TO TARGET VERSION
```

## 2. Stage Changes

```bash
git add .
```

## 3. Bump Root & Tag

Bump the external root to auto-generate the single Git Commit and Git Tag.

```bash
npm version <patch|minor|major> --force -m "chore(release): v%s"
```

## 4. Push to Trigger CI/CD

```bash
git push --follow-tags
```

## 5. Write GitHub Release Notes (Follow Template Strict Requirement)

When publishing the drafted release on GitHub, you **MUST** format it based on `docs/RELEASE_TEMPLATE.md`.
No extra styling or missing sections are allowed.

**Title**: MUST strictly be the semantic version number (e.g., `v1.3.0`)

**Content**: MUST replicate this structure:

```markdown
### 🚀 What's New

A brief 1-2 sentence summary covering the main theme of this release. What phase or major milestone does this wrap up?

### ✨ Features

- **[Feature Component Name]**: Description of the new feature or capability added. _(e.g., **OpenAPI & Swagger UI**: Fully integrated @fastify/swagger.)_
- **[Another Feature]**: What value does this bring to the user?

### 🐛 Bug Fixes & Edge Cases Squashed

- **[Component Name]**: Description of the defect and how it was fixed. _(e.g., **maxClicks Edge Case**: Fixed a critical bug where links configured with maxClicks=1 would fail to redirect.)_
- **[Another Fix]**: What was the impact of the bug?

### 🛠 Refactoring & Chores

- **[Improvement Area]**: Details about internal code quality improvements or technical debt reduction. _(e.g., **Zero Magic Strings**: Centralized all environment variables...)_
- **[Dependencies]**: Note any major dependency bumps if relevant.

### 🧪 Validation & Stability Highlights

- Briefly mention test coverage, build success metrics, or structural integrity proofs to instill confidence in the release. _(e.g., 100% strict TypeScript compilation across the monorepo workspace. 19/19 Unit Tests passing flawlessly.)_

---

**Full Changelog**: https://github.com/thanhnam2811/tiny-link/commits/vX.X.X
```
