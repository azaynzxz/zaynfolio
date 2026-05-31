# Deployment Guide — Cloudflare Workers
## Portfolio · Swiss Rationalist Stack

---

> **Note:** Cloudflare Pages was deprecated April 2025.
> This guide uses **Cloudflare Workers + Static Assets** — the current recommended path.

---

## Prerequisites

```bash
node  -v   # 18+
npm   -v   # 9+

npm install -g wrangler       # install globally
wrangler --version            # should print 3.x or 4.x
wrangler login                # opens browser → authorize in dashboard
```

---

## Project Structure

```
your-portfolio/
├── wrangler.toml             ← deploy config (this file)
├── DESIGN.md                 ← visual system (feed to AI)
├── DEPLOY.md                 ← you are here
│
├── public/                   ← static files (vanilla) OR
├── dist/                     ← build output  (Astro / Vite)
│   ├── index.html
│   ├── _headers              ← cache + security headers
│   └── _redirects            ← URL redirects (optional)
│
└── src/                      ← source files (if using Astro)
    ├── pages/
    │   ├── index.astro
    │   ├── work/
    │   ├── about.astro
    │   ├── cv.astro
    │   └── contact.astro
    └── components/
```

---

## Stack Options

### Option A — Vanilla HTML/CSS/JS (simplest)

No build step. Edit files directly in `public/`.

```toml
# wrangler.toml — change assets dir
[assets]
directory = "./public"
```

Deploy:
```bash
wrangler deploy
```

---

### Option B — Astro (recommended for portfolio)

Astro ships zero JS by default — perfect for this aesthetic.

```bash
npm create astro@latest your-portfolio -- --template minimal
cd your-portfolio
npm install
```

Build + deploy:
```bash
npm run build          # outputs to dist/
wrangler deploy        # reads wrangler.toml → uploads dist/
```

---

### Option C — Vite (if you want React components)

```bash
npm create vite@latest your-portfolio -- --template react
cd your-portfolio
npm install
```

```bash
npm run build          # outputs to dist/
wrangler deploy
```

---

## Deploy Commands

```bash
# ── First deploy (creates the Worker on Cloudflare) ──────────────
wrangler deploy

# ── Preview / staging deploy ─────────────────────────────────────
wrangler deploy --env preview

# ── Production deploy ────────────────────────────────────────────
wrangler deploy --env production

# ── Local dev server (hot reload, mirrors prod behavior) ─────────
wrangler dev

# ── Tail live logs from the edge ─────────────────────────────────
wrangler tail

# ── List all deployments ─────────────────────────────────────────
wrangler deployments list

# ── Roll back to previous version ────────────────────────────────
wrangler rollback
```

Your site will be live at:
```
https://your-name-portfolio.YOUR_SUBDOMAIN.workers.dev
```

---

## Custom Domain

```bash
# 1. Add your domain in Cloudflare dashboard → Workers & Pages → your-worker → Settings → Domains
# 2. OR via CLI:
wrangler custom-domains add yourname.com --name your-name-portfolio
```

SSL is automatic. No config needed.

---

## `_headers` File

Create `public/_headers` (Astro copies it to `dist/` automatically):

```
# ── HTML — always fresh ──────────────────────────────────────────
/*.html
  Cache-Control: public, max-age=0, must-revalidate

# ── JS / CSS / Fonts — cache forever (use hashed filenames) ──────
/_astro/*
  Cache-Control: public, max-age=31536000, immutable

/assets/*
  Cache-Control: public, max-age=31536000, immutable

# ── Security headers ─────────────────────────────────────────────
/*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=()
```

---

## `_redirects` File (optional)

```
# Old URL → New URL   [status]
/resume          /cv              301
/portfolio       /work            301
/hire-me         /contact         301
```

---

## Environment Variables / Secrets

```bash
# Set a secret (e.g. email service API key for contact form)
wrangler secret put RESEND_API_KEY

# For non-secret env vars, add to wrangler.toml:
# [vars]
# CONTACT_EMAIL = "yourname@email.com"
```

---

## GitHub Actions — Auto-deploy on Push

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Cloudflare Workers

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build

      - name: Deploy to Cloudflare Workers
        run: npx wrangler deploy --env production
        env:
          CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
```

Get your API token: Cloudflare Dashboard → My Profile → API Tokens → Create Token → `Edit Cloudflare Workers` template.

Add it to GitHub: Repo → Settings → Secrets → `CLOUDFLARE_API_TOKEN`.

---

## GSAP + Lenis in Astro

```bash
npm install gsap @studio-freight/lenis
```

In your base layout (`src/layouts/Base.astro`):

```astro
---
// Base.astro
---
<html>
  <head>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;700;900&display=swap" rel="stylesheet" />
  </head>
  <body>
    <slot />
    <script>
      import gsap from 'gsap';
      import ScrollTrigger from 'gsap/ScrollTrigger';
      import Lenis from '@studio-freight/lenis';

      gsap.registerPlugin(ScrollTrigger);

      // Smooth scroll
      const lenis = new Lenis();
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add((time) => lenis.raf(time * 1000));
      gsap.ticker.lagSmoothing(0);
    </script>
  </body>
</html>
```

---

## Quick Reference — CLI Cheatsheet

| Task                    | Command                                    |
|-------------------------|--------------------------------------------|
| Login                   | `wrangler login`                           |
| Local dev               | `wrangler dev`                             |
| Deploy (default)        | `wrangler deploy`                          |
| Deploy (production)     | `wrangler deploy --env production`         |
| Deploy (preview)        | `wrangler deploy --env preview`            |
| View live logs          | `wrangler tail`                            |
| List deployments        | `wrangler deployments list`                |
| Rollback                | `wrangler rollback`                        |
| Add secret              | `wrangler secret put SECRET_NAME`          |
| Add custom domain       | `wrangler custom-domains add yourdomain.com` |

---

## Troubleshooting

**`dist/` not found on deploy**
→ Run your build step first: `npm run build`

**Assets not updating after deploy**
→ Cloudflare caches at edge. Hard refresh: `Ctrl+Shift+R` or wait ~30s.
→ For instant cache purge: Dashboard → Caching → Purge Everything.

**`wrangler login` not working in WSL/headless**
→ Use API token instead: `export CLOUDFLARE_API_TOKEN=your_token_here`

**`not_found_handling` showing wrong 404**
→ Make sure `404.html` exists in your `dist/` root.
→ For Astro: create `src/pages/404.astro`.

---

*Stack: Cloudflare Workers · Wrangler 4.x · Astro or Vanilla · GSAP 3 · Lenis*
*Docs: https://developers.cloudflare.com/workers/static-assets/*
