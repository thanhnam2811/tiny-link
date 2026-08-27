---
name: TinyLink Design System
description: Modern, clean, high-performance UI system for TinyLink (Indigo accent, single radius scale)
colors:
    primary: 'hsl(243 75% 59%)'
    primary-dark: 'hsl(243 85% 67%)'
    background: '#ffffff'
    surface: '#f4f4f5'
    text-primary: '#09090b'
    text-secondary: '#71717a'
    border: '#e4e4e7'
    danger: '#ef4444'
typography:
    headline:
        fontFamily: Outfit, ui-sans-serif, system-ui, sans-serif
        fontSize: 32px
        fontWeight: 700
        lineHeight: 1.2
    body:
        fontFamily: Geist, ui-sans-serif, system-ui, sans-serif
        fontSize: 14px
        fontWeight: 400
        lineHeight: 1.5
radius:
    base: 0.875rem
    sm: 'calc(base * 0.6)'
    md: 'calc(base * 0.8)'
    lg: 'base'
    xl: 'calc(base * 1.4)'
    full: 9999px
spacing:
    xs: 4px
    sm: 8px
    md: 16px
    lg: 24px
    xl: 32px
---

# TinyLink Design System

## Overview

TinyLink uses a single Indigo accent on a neutral zinc-adjacent base, one radius
scale derived from a `0.875rem` base, and one accent per page (taste §4.2/§4.4).
Both `@tiny-link/client` and `@tiny-link/admin` share the same token values —
see `packages/client/src/app/globals.css` and `packages/admin/app/globals.css`
for the source of truth; this file documents intent, the CSS is authoritative.

## Colors

- **Accent:** Indigo (`hsl(243 75% 59%)` light / `hsl(243 85% 67%)` dark) — the
  only accent hue used across both apps. Semantic status colors
  (`--success`, `--warning`, `--destructive`) exist for state (active/inactive,
  errors) but are never used as decorative accents on marketing surfaces.
- **Neutral Base:** Zinc-adjacent grays for background/border/muted tokens.

## Typography

`Geist` for body text, `Outfit` for headings — both via `next/font/google`.

## Radius

One scale, base `0.875rem`, derived via Tailwind's `--radius-sm/md/lg/xl/2xl`
(see `@theme inline` in `globals.css`). Don't use arbitrary `rounded-[Npx]`.

## Do's and Don'ts

- **DO:** Use standard responsive Tailwind classes and tokens.
- **DO:** Use exactly one accent color per page/surface.
- **DO:** Dynamic base URLs instead of hardcoded hostnames.
- **DON'T:** Use generic purple gradients or hardcoded localhost URLs.
- **DON'T:** Introduce a second accent hue (e.g. warning/success) for
  decorative use — those are reserved for status semantics only.
