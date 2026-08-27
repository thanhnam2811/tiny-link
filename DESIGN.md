---
name: TinyLink Design System
description: Modern, clean, high-performance UI system for TinyLink (Zinc + Emerald / Indigo accents)
colors:
    primary: '#18181b'
    primary-hover: '#27272a'
    accent: '#10b981'
    accent-hover: '#059669'
    background: '#ffffff'
    surface: '#f4f4f5'
    text-primary: '#09090b'
    text-secondary: '#71717a'
    border: '#e4e4e7'
    danger: '#ef4444'
typography:
    headline:
        fontFamily: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif
        fontSize: 32px
        fontWeight: 700
        lineHeight: 1.2
    body:
        fontFamily: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif
        fontSize: 14px
        fontWeight: 400
        lineHeight: 1.5
rounded:
    sm: 6px
    md: 8px
    lg: 12px
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

TinyLink uses a minimalist, modern, precision-engineered aesthetic built on Tailwind CSS (Zinc neutrals, crisp borders, refined emerald & neutral accents).

## Colors

- **Neutral Base:** Zinc scales (`zinc-900` / `zinc-950` for dark themes, `white` / `zinc-50` for light themes).
- **Accents:** Emerald (`emerald-500` / `emerald-600`) for active status, badges, and positive actions.
- **Borders & Dividers:** Subtle `zinc-200` (light) / `zinc-800` (dark).

## Typography

Clean sans-serif (`Inter`, system fallbacks) with high readability and tabular figures for numbers.

## Do's and Don'ts

- **DO:** Use standard responsive Tailwind classes and tokens.
- **DO:** Dynamic base URLs instead of hardcoded hostnames.
- **DON'T:** Use generic purple gradients or hardcoded localhost URLs.
