---
slug: routing
category: architecture
generatedAt: 2026-01-30T03:22:08.996Z
---

# How does routing work?

## Routing

### Next.js App Router

Routes are defined by the folder structure in `app/`:

- `app/page.tsx` → `/`
- `app/about/page.tsx` → `/about`
- `app/blog/[slug]/page.tsx` → `/blog/:slug`