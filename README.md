# Blasting Jack — blastingjack.com

Professional sandblasting and surface coating services website for Blasting Jack, Michigan. Built with Astro 5, Tailwind CSS v4, deployed on Vercel.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Astro 5 (static output + SSR API routes) |
| Styling | Tailwind CSS v4 |
| Deployment | Vercel (`@astrojs/vercel` adapter) |
| Email | Resend SDK via Vercel serverless function |
| Analytics | Vercel Analytics |
| Fonts | Open Sans, Plus Jakarta Sans, DM Sans (Google Fonts) |

---

## Project Structure

```
/
├── public/
│   └── favicon.ico / favicon.svg
├── src/
│   ├── assets/images/          # Hero, gallery, slider, partner, video thumb images
│   ├── components/
│   │   ├── Header.astro        # Fixed nav with mobile hamburger menu
│   │   └── Footer.astro
│   ├── content/
│   │   └── blog/               # Markdown blog posts (Astro content collections)
│   ├── layouts/
│   │   └── Layout.astro        # Base HTML layout — accepts title, description, canonical props
│   ├── pages/
│   │   ├── index.astro         # Main landing page (all sections)
│   │   ├── blog/
│   │   │   ├── index.astro     # Blog listing page
│   │   │   └── [...slug].astro # Individual blog post page
│   │   └── api/
│   │       └── contact.ts      # Vercel serverless function — Resend email handler
│   ├── styles/
│   │   └── global.css          # Tailwind theme, animations, component styles
│   └── content.config.ts       # Astro content collection schema (Zod)
├── .env                        # Local env vars (gitignored)
├── astro.config.mjs
├── package.json
└── tsconfig.json
```

---

## Getting Started

```bash
npm install
npm run dev        # http://localhost:4321
```

| Command | Action |
|---|---|
| `npm run dev` | Start local dev server at `localhost:4321` |
| `npm run build` | Build production site to `./dist/` |
| `npm run preview` | Preview production build locally |

---

## Environment Variables

| Variable | Description |
|---|---|
| `RESEND_API_KEY` | Resend API key for contact form email delivery |

**Local:** Create a `.env` file in the project root:
```
RESEND_API_KEY=your_key_here
```

**Production:** Set in Vercel → Project Settings → Environment Variables. Already configured for Production, Preview, and Development via Vercel CLI.

---

## Contact Form

- **Endpoint:** `POST /api/contact` (Vercel serverless function)
- **Provider:** [Resend](https://resend.com)
- **From:** `Blasting Jack <onboarding@resend.dev>`
- **Recipients:** See `src/pages/api/contact.ts`

> **Note:** Currently routing to `kevinmfitz7@gmail.com` only (Resend free tier restriction).
> To enable all four recipient addresses, verify `blastingjack.com` at [resend.com/domains](https://resend.com/domains),
> then uncomment the full `RECIPIENTS` array in `src/pages/api/contact.ts` and change the `from` address to `no-reply@blastingjack.com`.

---

## Blog

Powered by Astro Content Collections. Posts live in `src/content/blog/` as Markdown files.

**Frontmatter schema:**
```yaml
---
title: "Post Title"
description: "Meta description (150-160 chars)"
pubDate: 2025-01-15
author: "Blasting Jack Team"
tags: ["tag1", "tag2"]
draft: false
---
```

To add a new post, create a `.md` file in `src/content/blog/`. The filename becomes the URL slug (e.g. `my-post.md` → `/blog/my-post/`).

---

## Deployment

Connected to GitHub repo [kevinmfitz/blastingjack](https://github.com/kevinmfitz/blastingjack). Vercel auto-deploys on every push to `main`.

Manual deploy:
```bash
vercel --prod
```

---

## Brand

| Token | Value |
|---|---|
| Primary colour | `#6B2813` (dark red) |
| Heading font | Open Sans |
| Body font | Plus Jakarta Sans |
| Nav font | DM Sans |
