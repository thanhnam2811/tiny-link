---
description: Release Workflow Process
---

# Release Workflow

This workflow executes a safe monorepo version bump and creates a Git Tag. The final GitHub release **MUST** adhere to the Title and Content structure defined in `docs/RELEASE_TEMPLATE.md`.

## 1. Automated Testing (Mandatory Gate)

Ensure that all monorepo test suites pass fully before executing a release bypass. If tests fail, abort the workflow immediately.

```bash
pnpm test
```

## 2. Bump Workspace Packages Silently

Set the new version explicitly for all sub-packages without triggering NPM's workspace locking errors.

```bash
node scripts/bump-version.mjs 1.4.0 # UPDATE THIS TO TARGET VERSION
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

## 5. Auto-Draft GitHub Release

Use the GitHub CLI (`gh`) to automatically create a drafted release including the markdown template contents so the user only has to review and publish it on GitHub.

First, write the structured release notes to a temporary file (e.g., `/tmp/release_notes.md`), then execute the `gh release create` command.

```bash
gh release create <tag> --draft --title "<tag>" --notes-file /tmp/release_notes.md
```

Note: Make sure the generated `release_notes.md` strictly adheres to the `docs/RELEASE_TEMPLATE.md` structure:

- `### 🚀 What's New`
- `### ✨ Features`
- `### 🐛 Bug Fixes & Edge Cases Squashed`
- `### 🛠 Refactoring & Chores`
- `### 🧪 Validation & Stability Highlights`
- `---` followed by `**Full Changelog**: https://github.com/thanhnam2811/tiny-link/commits/vX.X.X`
