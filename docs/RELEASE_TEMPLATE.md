# Release Notes Format Template

When creating a new release (via GitHub Releases or CHANGELOG), follow this standard template.

## Title

The title must strictly be the semantic version number.
**Format**: `vX.X.X`
**Example**: `v1.1.0`

## Content Format

```markdown
### 🚀 What's New

A brief 1-2 sentence summary covering the main theme of this release. What phase or major milestone does this wrap up?

### ✨ Features

- **[Feature Component Name]**: Description of the new feature or capability added. _(e.g., **OpenAPI & Swagger UI**: Fully integrated @fastify/swagger.)_
- **[Another Feature]**: What value does this bring to the user?

### 🐛 Bug Fixes & Edge Cases Squashed

- **[Component Name]**: Description of the defect and how it was fixed. _(e.g., **maxClicks Edge Case**: Fixed a critical bug where links configured with `maxClicks=1` would fail to redirect.)_
- **[Another Fix]**: What was the impact of the bug?

### 🛠 Refactoring & Chores

- **[Improvement Area]**: Details about internal code quality improvements or technical debt reduction. _(e.g., **Zero Magic Strings**: Centralized all environment variables...)_
- **[Dependencies]**: Note any major dependency bumps if relevant.

### 🧪 Validation & Stability Highlights

- Briefly mention test coverage, build success metrics, or structural integrity proofs to instill confidence in the release.
  _(e.g., 100% strict TypeScript compilation across the monorepo workspace. 19/19 Unit Tests passing flawlessly.)_

---

**Full Changelog**: https://github.com/thanhnam2811/tiny-link/commits/vX.X.X
```
