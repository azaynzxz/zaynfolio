# GALLERY.md — Social Media & Feed Design Showcase
## Layout Spec: Neirovision Grid × Swiss Rationalist Branding

> Feed this alongside DESIGN.md and SHOWCASE.md.
> DESIGN.md = brand tokens, typography, color.
> SHOWCASE.md = hover-to-play video, fullscreen FLIP transition.
> GALLERY.md = THIS FILE — governs the `/gallery` page only:
> the dense image grid, meta row above each thumbnail, and
> category page title treatment.

---

## 🧠 What This Page Is For

This is a dedicated section for **social media design, feed layouts, content
systems, carousel decks, story templates, and brand identity applied to
digital channels.** It is NOT the same as the main work grid (`/work`).

The distinction matters to the AI:
- `/work` = case studies, long-form projects, hover-to-play video
- `/gallery` = dense visual library — rapid-fire, image-heavy, editorial grid
  closer to a magazine spread or an art exhibition catalog

The client scans this page to get an immediate impression of visual range,
taste level, and output volume. Speed of comprehension is the UX goal.
Make every thumbnail count; earn every row.

---

## 📐 Reference Image Analysis — Neirovision "Exhibitions" Layout

The reference shows a white-background page with these exact characteristics:

### Page Title Treatment
- The word **"EXHIBITIONS"** is set at approximately **18–22vw font-size**,
  weight 900, tracking **-0.04em to -0.05em** (very tight)
- It fills the full width of the content area — typography IS the layout
- Three decorative diamond/chevron glyphs (▲▲) appear above the title at
  equal intervals — these align with the column grid below
- The title sits directly above the grid with **zero gap** — the first row of
  thumbnails begins immediately, no padding between title bottom and grid top

### Grid Structure
- **6 columns**, equal width, no horizontal gutters between columns
  (images touch edge-to-edge)
- **2 rows** visible before scroll, each row ~280–320px tall
- Item metadata sits **above** the thumbnail (not below):
  - Line 1: Project title — 11–12px, weight 700, uppercase or sentence case
  - Line 2: Short description — 10–11px, weight 400, `--muted` color,
    2 lines max, no truncation ellipsis
  - Line 3: Price/tag — 10px, muted — adapt this to: **platform tag**
    (e.g. "Instagram · 2024" or "Reels · 9:16")
- Meta block height is fixed at ~72px regardless of content — overflow hidden
- Thin **1px vertical rules** between columns (color: `--rule` from DESIGN.md)
- Thin **1px horizontal rule** between meta block and thumbnail
- NO outer border on individual cells — the grid IS the structure

### Visual Adaptation to Our Brand

The Neirovision reference uses a serif display font with decorative elements.
**We strip all of that** and replace with our Swiss system:

| Neirovision element          | Our adaptation                              |
|------------------------------|---------------------------------------------|
| Serif display font           | DM Sans 900, tracking -0.04em               |
| Diamond glyphs ▲▲            | Section index numbers `01 02 03` in grid    |
| Dark/dramatic tone           | `--bg: #F9F8F6` (light), `--fg: #0D0D0D`   |
| Price tag below meta         | Platform tag: "IG · Feed" / "TikTok · 9:16"|
| Decorative borders           | 1px `--rule` lines only                     |
| Mixed serif/sans hierarchy   | Single typeface, weight variation only      |

---

## 🏗 Full Page Layout Spec

```
┌─────────────────────────────────────────────────────────────────┐
│  NAV (from DESIGN.md — "Gallery" underlined as active)          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  02 — Social & Feed        [filter row]          24 pieces      │
│                                                                  │
│  GALLERY                                                         │
│  ← full-width, 18vw, weight 900, -0.04em tracking ──────────▶  │
│  (right edge bleeds ~10% off viewport, same as SHOWCASE.md)     │
│                                                                  │
├──────────┬──────────┬──────────┬──────────┬──────────┬──────────┤
│ META 01  │ META 02  │ META 03  │ META 04  │ META 05  │ META 06  │
│ ─────── │ ─────── │ ─────── │ ─────── │ ─────── │ ─────── │
│ [img]   │ [img]   │ [img]   │ [img]   │ [img]   │ [img]   │
├──────────┼──────────┼──────────┼──────────┼──────────┼──────────┤
│ META 07  │ META 08  │ META 09  │ META 10  │ META 11  │ META 12  │
│ ─────── │ ─────── │ ─────── │ ─────── │ ─────── │ ─────── │
│ [img]   │ [img]   │ [img]   │ [img]   │ [img]   │ [img]   │
├──────────┼──────────┼──────────┼──────────┼──────────┼──────────┤
│ (rows continue...)                                               │
└─────────────────────────────────────────────────────────────────┘
```

### Page-level spacing

```css
.gallery-page {
  padding: 0;                /* grid bleeds edge to edge */
}

.gallery-header {
  padding: 48px 48px 0;     /* standard side padding for heading + filter */
}

.gallery-title {
  font-size: clamp(64px, 18vw, 220px);
  font-weight: 900;
  letter-spacing: -0.04em;
  line-height: 0.88;
  color: var(--fg);
  white-space: nowrap;
  overflow: visible;          /* intentional bleed */
  margin-bottom: 0;           /* grid sits directly below, no gap */
}
```

---

## 🔲 Grid Cell Anatomy

Each cell = meta block (top) + rule + image (bottom).
Cell width = `calc(100vw / 6)` — no gutters.

```
┌────────────────────────┐
│  Campaign Title        │  ← 11px, weight 700, --fg
│  Brand identity for    │  ← 10px, weight 400, --muted
│  a Jakarta café        │
│  IG · Feed · 2024      │  ← 10px, --muted, platform tag
├────────────────────────┤  ← 1px solid --rule
│                        │
│   [IMAGE / GIF / MP4]  │  ← square 1:1 or portrait 4:5
│                        │
└────────────────────────┘
```

### Meta block rules
- Fixed height: **72px** — do NOT let it grow. If text overflows, clip it.
- Padding: `10px 10px 8px` — tight, intentional
- Background: `var(--bg)` — same as page, no separate treatment
- Title: 11px / `font-weight: 700` / `color: var(--fg)` / 1 line, truncate
- Description: 10px / `font-weight: 400` / `color: var(--muted)` / 2 lines max
- Platform tag: 10px / `color: var(--muted)` / format: `Platform · Ratio · Year`

### Image block rules
- Aspect ratio: **1:1 square** default for feed content
  - Override to `4:5` for portrait/story format pieces
  - Override to `16:9` for YouTube thumbnails or banner work
- `object-fit: cover` — always
- `display: block` — no inline spacing gaps
- NO border-radius (DESIGN.md rule)
- NO shadow

### Vertical rules between columns
```css
.gallery-cell {
  border-right: 1px solid var(--rule);
}
.gallery-cell:last-child {
  border-right: none;
}
```

### Horizontal rules between rows
```css
.gallery-row {
  border-bottom: 1px solid var(--rule);
}
```

---

## 🎬 Hover Behavior

Inherits from SHOWCASE.md hover-to-play spec. Additions for this grid:

### Static images (JPG/PNG)
- Default: image at 100% opacity
- Hover: **two things happen simultaneously**:
  1. Image scales to `1.04` (slightly more than SHOWCASE.md's 1.03 because
     cells are smaller and the effect needs to read at this scale)
  2. Meta block background shifts from `var(--bg)` to `var(--accent)` —
     the coral/salmon from DESIGN.md — meta text inverts to white
- Duration: 0.25s ease-out
- overflow: hidden on the cell — scale clips to cell boundary

```javascript
// GSAP hover for static cells
document.querySelectorAll('.gallery-cell').forEach(cell => {
  const img = cell.querySelector('img');
  const meta = cell.querySelector('.cell-meta');

  cell.addEventListener('mouseenter', () => {
    gsap.to(img, { scale: 1.04, duration: 0.25, ease: 'power2.out' });
    gsap.to(meta, {
      backgroundColor: 'var(--accent)',
      color: '#FFFFFF',
      duration: 0.2
    });
    cell.querySelectorAll('.meta-muted').forEach(el => {
      gsap.to(el, { color: 'rgba(255,255,255,0.7)', duration: 0.2 });
    });
  });

  cell.addEventListener('mouseleave', () => {
    gsap.to(img, { scale: 1, duration: 0.3, ease: 'power2.inOut' });
    gsap.to(meta, {
      backgroundColor: 'var(--bg)',
      color: 'var(--fg)',
      duration: 0.2
    });
    cell.querySelectorAll('.meta-muted').forEach(el => {
      gsap.to(el, { color: 'var(--muted)', duration: 0.2 });
    });
  });
});
```

### Animated cells (GIF / MP4)
- Same meta block color shift as above
- Video: `preload="none"`, plays on hover, pauses + rewinds on leave
- See SHOWCASE.md §Media Behavior for full implementation

---

## ⬛ Click → Lightbox (Gallery-specific, simpler than SHOWCASE.md FLIP)

The gallery modal is **simpler** than the work detail modal. No scrollable
content below — just the full image/video + minimal caption. This is a
visual medium, not a case study.

### Behavior
1. Click cell → image expands to center of screen (GSAP FLIP from cell)
2. Background: `var(--fg)` (#0D0D0D) fades in — dark backdrop for image focus
3. Image sits centered, max 90vh tall, max 80vw wide — maintains aspect ratio
4. Caption appears beneath: title · platform · year (same meta, white on dark)
5. Left/right arrow keys + on-screen chevrons navigate between items
6. ESC or click backdrop → FLIP collapse back to cell

```javascript
// Simplified FLIP for gallery (no detail content below)
import { Flip } from 'gsap/Flip';
gsap.registerPlugin(Flip);

function openLightbox(cell) {
  const img = cell.querySelector('img, video');
  const state = Flip.getState(img);

  const lightbox = document.querySelector('#lightbox');
  lightbox.querySelector('.lb-media').appendChild(img);
  img.classList.add('lb-active');

  Flip.from(state, {
    duration: 0.55,
    ease: 'power3.inOut',
  });

  gsap.to('#lb-backdrop', { opacity: 1, duration: 0.3 });
  gsap.from('#lb-caption', { y: 12, opacity: 0, duration: 0.4, delay: 0.4 });
}
```

### Lightbox layout
```
┌─────────────────────────────────────────┐  ← #lb-backdrop, bg: --fg
│                                     [×] │
│                                         │
│         ┌─────────────────────┐         │
│         │                     │         │
│         │   IMAGE / VIDEO     │         │
│         │   max 90vh / 80vw   │         │
│         │                     │         │
│         └─────────────────────┘         │
│                                         │
│    [←]  Campaign Title · IG · 2024  [→] │
│                                         │
└─────────────────────────────────────────┘
```

---

## 🔽 Filter Row

Sits between the section label and the giant page title.
Categories for social media work:

```
All · Instagram · Reels · Stories · TikTok · YouTube · Branding · Motion
```

Rules (same as SHOWCASE.md filter tabs):
- 12px, uppercase, tracking 0.06em
- Active: 2px solid bottom border, `var(--fg)` color
- Inactive: `var(--muted)` color
- Right side of same row: item count — "24 pieces" in 11px muted
- On filter: grid re-renders with GSAP `stagger` fade-in on newly visible cells

```javascript
// Filter with GSAP re-entrance
function filterGallery(category) {
  const cells = document.querySelectorAll('.gallery-cell');

  // Fade out all
  gsap.to(cells, { opacity: 0, scale: 0.97, duration: 0.2, stagger: 0.01 });

  setTimeout(() => {
    cells.forEach(cell => {
      const match = category === 'all' || cell.dataset.category === category;
      cell.style.display = match ? 'block' : 'none';
    });

    // Fade in matching
    const visible = document.querySelectorAll('.gallery-cell:not([style*="none"])');
    gsap.fromTo(visible,
      { opacity: 0, y: 8 },
      { opacity: 1, y: 0, duration: 0.3, stagger: 0.025, ease: 'power2.out' }
    );

    // Update count
    document.querySelector('.item-count').textContent = `${visible.length} pieces`;
  }, 220);
}
```

---

## 📁 Data Schema for Gallery Items

```json
[
  {
    "id": "g01",
    "title": "Campaign Title",
    "description": "Short description, 2 lines max",
    "client": "Client or Brand Name",
    "platform": "Instagram",
    "format": "Feed · 1:1",
    "year": 2024,
    "category": "instagram",
    "aspectRatio": "1:1",
    "poster": "/assets/gallery/g01-poster.jpg",
    "preview": "/assets/gallery/g01-preview.mp4",
    "previewWebm": "/assets/gallery/g01-preview.webm",
    "isAnimated": true
  },
  {
    "id": "g02",
    "title": "Story Series",
    "description": "Swipe-through template system",
    "client": "Fashion Brand",
    "platform": "Stories",
    "format": "Stories · 9:16",
    "year": 2024,
    "category": "stories",
    "aspectRatio": "9:16",
    "poster": "/assets/gallery/g02-poster.jpg",
    "preview": null,
    "isAnimated": false
  }
]
```

---

## 🔠 Typography — Gallery-Specific Additions

These extend DESIGN.md without overriding it:

### Page title "GALLERY" or "SOCIAL WORK"
```css
.gallery-title {
  font-family: var(--font);
  font-size: clamp(64px, 18vw, 220px);
  font-weight: 900;
  letter-spacing: -0.04em;    /* tighter than main DESIGN.md headings */
  line-height: 0.88;
  text-transform: uppercase;
  color: var(--fg);
  white-space: nowrap;
  overflow: visible;
  width: 100%;
}
```

### Section label above title (matches DESIGN.md section labels)
```
02 — Social & Feed Design
```
- 11px, tracking 0.08em, uppercase, `--muted` color
- `::after` pseudo-element: 32px wide, 1px tall, `--muted` background
- Same pattern as all section labels across the site

### Cell meta text
```css
.cell-title    { font-size: 11px; font-weight: 700; color: var(--fg); }
.cell-desc     { font-size: 10px; font-weight: 400; color: var(--muted); }
.cell-platform { font-size: 10px; font-weight: 400; color: var(--muted); }
```

---

## 🎞 Page Entry Animation (GSAP)

Mirrors the contact section entry from the earlier build, adapted for the grid:

```javascript
const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

tl
  // 1. Grid vertical rules draw down
  .to('.col-rule', {
    scaleY: 1,
    duration: 1.0,
    stagger: 0.06,
    transformOrigin: 'top',
    ease: 'power2.inOut'
  })
  // 2. Section label fades in
  .to('.section-label', { opacity: 1, duration: 0.4 }, '-=0.5')
  // 3. Title slides up from clip
  .to('.gallery-title', {
    y: '0%',
    duration: 0.8,
    ease: 'power4.out'
  }, '-=0.3')
  // 4. Filter row
  .to('.filter-row', { opacity: 1, y: 0, duration: 0.4 }, '-=0.2')
  // 5. Grid cells stagger in — row by row
  .to('.gallery-cell', {
    opacity: 1,
    y: 0,
    duration: 0.4,
    stagger: {
      amount: 0.6,
      grid: [Infinity, 6],  // 6 columns
      from: 'start'
    }
  }, '-=0.1');
```

Initial CSS state for cells before animation:
```css
.gallery-cell {
  opacity: 0;
  transform: translateY(16px);
}
```

---

## ✅ Build Checklist (Priority Order)

1. `gallery.json` — populate with real social media work (use placeholder data first)
2. Gallery page skeleton — title, section label, filter row, item count
3. 6-column grid — no gutters, 1px rules, meta-above-image cell structure
4. Static images working at correct aspect ratios
5. Hover: image scale + meta background → `--accent` coral
6. `preload="none"` video cells with hover-to-play
7. Filter tabs with animated re-entrance
8. Lightbox: FLIP expand → dark backdrop → caption → nav arrows
9. Lightbox: keyboard navigation (←→ arrows, ESC to close)
10. Page entry animation (grid lines → title → cells stagger in)

---

## ❌ Anti-patterns — Gallery Page

- NO masonry layout (Pinterest grid) — this is editorial, not discovery
- NO infinite scroll — show all, let the filter do the work
- NO image captions visible on the grid — meta block only, caption in lightbox
- NO hover text overlay ("View Project") on thumbnails — the meta block is above
- NO colored cell backgrounds to differentiate categories — use filter + layout
- NO loading spinners — poster images are instant; lazy-load below the fold
- NO fullscreen detail case study scroll (that's SHOWCASE.md's job for `/work`)
- NO sidebar category nav — filter row at the top is sufficient
- NO "Load more" button — all items visible, filtered in/out with GSAP

---

## 🔗 Integration with Other Pages

- Nav link "Gallery" → `/gallery` (add to nav in DESIGN.md nav spec)
- From `/work` project detail, a "Related social posts" section can link here:
  display 3 cells in the same 6-col style as a mini-strip
- From `/gallery` lightbox, "See full project →" can link to `/work/[slug]`
  if a corresponding case study exists — add `"workSlug": "project-slug"` to
  the gallery data schema

---

*Feed this to AI as: "This is GALLERY.md. It defines the social media /
feed design gallery page for my portfolio — the dense 6-column image grid,
meta-above-thumbnail layout, hover behavior, lightbox, and filter system.
Use it alongside DESIGN.md for brand tokens and SHOWCASE.md for video
hover-to-play implementation. Build the gallery page following this spec."*
