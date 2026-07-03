### 🔴 Phase 6: Client Application (NextJS/ReactJS)

**Status:** 🚧 Mostly done — 1 item deferred to Phase 9

#### 🎯 Goal

Build a modern, user-facing application for creating and managing short links.

#### 📋 Checklist

- [x] **Project Setup**: Initialize a `client` package (NextJS or ReactJS + Vite) inside the monorepo workspace. Share `types` and validation schemas between backend and frontend.
- [x] **UI/UX Foundation**: Setup TailwindCSS (or similar) and a component library (e.g., shadcn/ui or Radix).
- [x] **Core Pages**:
    - [x] Landing Page (Hero section, value proposition).
    - [x] Main input form to paste long URLs and get short URLs.
- [x] **Features (Guest)**: Create basic short links without an account.
- [ ] **Features (Authenticated - Optional later)**: Login/Register, view history of generated links. _(Superseded by [Phase 9](phase-9_private-accounts.md).)_
- [x] **API Integration**: Connect to the Fastify backend for link creation and status checks.

#### ✅ Definition of Done

- [x] All checklist items above (excluding the deferred authenticated-features item) are complete and merged to `main`.
- [x] The landing page's creation form successfully creates a link end-to-end against the live Fastify API.
- [x] `pnpm build` succeeds for `client` after `shared` and `db` are built first (see build-order gotcha in root `CLAUDE.md`).
- [x] No console errors/warnings in the browser on the landing page and guest-creation flow.

#### 🔗 Dependencies

Builds on the API surface delivered in [Phase 1](phase-1_mvp.md).
