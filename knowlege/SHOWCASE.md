# SHOWCASE.md — Work / Portfolio Grid System
## Visual DNA + Interaction Spec for AI

> Feed this alongside DESIGN.md. DESIGN.md governs typography, color, and grid.
> This file governs **the work section only**: layout, media behavior, transitions,
> hover-play, and fullscreen. When these two conflict, SHOWCASE.md wins for the
> work/portfolio page; DESIGN.md wins everywhere else.

---

## 🧠 Core Philosophy (Read First)

The portfolio is NOT a résumé with screenshots.
The portfolio is a **curated exhibition**. The work is the hero. Everything else
— nav, labels, type — steps back. The client should feel like they walked into
a gallery, not opened a PDF.

**Rule:** The first thing a visitor sees must be work. Not a name. Not a title.
Not "Hi, I'm [Name], a designer who…" — the work speaks first. Text follows.

**Reference sites absorbed into this spec:**
- Setna.aero — content hierarchy, inner page structure, stat callouts, footer
- Oxford University site — editorial section labeling, image grid density
- Khazar University — event-card grid, large typographic section titles bleeding
  beyond the layout column, vertical marquee labels on the side

---

## 🏗 Page: `/work` — The Showcase Grid

### Layout Model: Editorial Index

```
┌────────────────────────────────────────────────────────┐
│  [WORK]  ← oversized section title, right half bleeds  │
│           off-screen (Khazar reference)                 │
├────────────────────────────────────────────────────────┤
│  Filter row:  All · Branding · Motion · UI/UX · 3D     │
├─────────────┬──────────────────────┬───────────────────┤
│  PROJECT 01 │    PROJECT 02        │  PROJECT 03       │
│  [media]    │    [media — tall]    │  [media]          │
│  Title      │    Title             │  Title            │
│  Tag · Year │    Tag · Year        │  Tag · Year       │
├─────────────┴──────────────────────┴───────────────────┤
│  PROJECT 04 — FEATURED (full-width)                     │
│  [media — wide, aspect 16:9]                            │
│  Title                    Tag · Year     →              │
├────────────────────────────────────────────────────────┤
│  PROJECT 05 │  PROJECT 06  │  PROJECT 07  │ PROJECT 08  │
│  (small)    │  (small)     │  (small)     │ (small)     │
└────────────────────────────────────────────────────────┘
```

### Grid Rhythm Rules

- **Asymmetric grid** — do NOT use a uniform 3-col or 4-col card grid.
  Vary column spans: 1-col, 2-col, full-width. This is what makes it feel
  editorial rather than an e-commerce catalog.
- Every 4th–5th item should be full-width (featured). Alternating rhythm:
  `[sm, lg] → [full] → [sm, sm, sm] → [lg, sm] → [full]`
- Gutters: 16px between items, 0px between the grid edge and viewport edge
  (grid bleeds to window edge — no container padding on the grid itself).
  Page heading and filter bar have standard 48px side padding.
- Aspect ratios:
  - Small card: `4:3`
  - Large card: `3:2`
  - Full-width: `21:9` or `16:6`
  - Tall card (portrait): `3:4` — use for identity/branding work

### Setna Inner Page Patterns (apply to project detail page)

From crawling setna.aero/parts and setna.aero/mro:

- **Hero: text left, image right** — title occupies left ~55%, full-bleed image
  fills right ~45%, no gap, image clips at page edge
- **Stat callouts** — pull 2–3 numbers from the project (e.g. "8 weeks",
  "3 deliverables", "2M impressions") and display them in the same bold
  large-number style Setna uses: number in 72–96px bold, label beneath in
  12px uppercase. Place these between the hero and the body content.
- **Section titles** use Setna's pattern: small label above ("CLIENT" /
  "DELIVERABLES" / "PROCESS"), then h2 in standard size — never decorative.
- **Content alternates** left-right: text left → image right, then image left →
  text right. Never two text blocks side by side.
- **News/update list pattern** (from setna.aero/news): use this for listing
  process steps or phases. Category tag (pill) · date or phase number · h3
  title. Thin 1px rule between each. No cards.
- **Footer CTA** — bottom of every project detail page has a simple 2-col row:
  left: "Next project →", right: "Back to Work ↑". Full-width 1px rule above.

---

## 🎬 Media Behavior — Hover-to-Play Spec

This is the most critical interaction. Get this exactly right.

### The Rule
- Media files (GIF, MP4, WebM) are **static by default**
- On hover: video plays, sound stays muted always
- On mouse-leave: video pauses AND rewinds to frame 0
- NO autoplay, NO controls visible during hover-play
- The poster frame (first frame or a designated thumbnail) is always shown
  when not hovered

### Implementation — MP4/WebM (preferred over GIF for quality + file size)

```html
<!-- Each project card -->
<div class="project-card" data-index="01">
  <div class="media-wrap">
    <img class="poster" src="/work/project-01-poster.jpg" alt="Project 01">
    <video
      class="project-video"
      src="/work/project-01.mp4"
      muted
      playsinline
      preload="none"       ← critical: don't preload all videos on page load
      loop
    ></video>
  </div>
  <div class="card-meta">
    <span class="card-index">01</span>
    <h3 class="card-title">Project Name</h3>
    <div class="card-tags">
      <span class="tag">Branding</span>
      <span class="tag">2024</span>
    </div>
  </div>
</div>
```

```javascript
// GSAP-powered hover-to-play
document.querySelectorAll('.project-card').forEach(card => {
  const video = card.querySelector('.project-video');
  const poster = card.querySelector('.poster');

  card.addEventListener('mouseenter', () => {
    if (!video) return;
    poster.style.opacity = '0';          // fade out poster
    video.style.opacity = '1';
    video.play();

    // Scale up card media slightly — Swiss restraint: max 1.03
    gsap.to(card.querySelector('.media-wrap'), {
      scale: 1.03,
      duration: 0.5,
      ease: 'power2.out'
    });
  });

  card.addEventListener('mouseleave', () => {
    if (!video) return;
    video.pause();
    video.currentTime = 0;
    poster.style.opacity = '1';

    gsap.to(card.querySelector('.media-wrap'), {
      scale: 1,
      duration: 0.4,
      ease: 'power2.inOut'
    });
  });
});
```

### Poster Frame Strategy
- Always export a hand-picked poster frame, not frame 0 (which is often black)
- Poster should be a compositionally strong still that hints at the motion
- Poster is a `<img>` tag layered above the `<video>` using `position: absolute`
- CSS: both poster and video fill the media-wrap; poster fades out on hover

### Performance — Critical Rules
- `preload="none"` on ALL videos — only load when hovered
- Use WebM with MP4 fallback: `<source src="x.webm"> <source src="x.mp4">`
- Keep video files under 8MB per card; 3–4 seconds is enough for a preview
- Compress with HandBrake or ffmpeg: `ffmpeg -i input.mp4 -vcodec libx264
  -crf 28 -preset slow -movflags +faststart output.mp4`
- Use `loading="lazy"` on poster `<img>` tags
- For the fullscreen modal, load the full-quality version only when opened

---

## ⬛ Fullscreen Modal — Animated Transition Spec

### Behavior

1. User clicks anywhere on a project card
2. The card's media rectangle **expands** to fill the screen — it does NOT
   fade in from black. The actual card element transforms into fullscreen.
3. While expanding: project title slides in from bottom-left
4. Close button (×) fades in top-right after expansion completes
5. Content below the fullscreen media (description, stats, next steps) scrolls
   up beneath the pinned video
6. On close: reverse — media collapses back to its card position (FLIP animation)

### GSAP FLIP Animation (the correct technique)

```javascript
import { Flip } from 'gsap/Flip';
gsap.registerPlugin(Flip);

function openProject(card) {
  const mediaWrap = card.querySelector('.media-wrap');
  const video = card.querySelector('.project-video');

  // 1. Capture the "before" state
  const state = Flip.getState(mediaWrap);

  // 2. Move the element to the fullscreen container
  document.querySelector('#fullscreen-stage').appendChild(mediaWrap);
  mediaWrap.classList.add('is-fullscreen');  // CSS: position fixed, inset 0

  // 3. Animate from old position to new position
  Flip.from(state, {
    duration: 0.7,
    ease: 'power3.inOut',
    onComplete: () => {
      video.play();
      // Animate in the detail content
      gsap.from('.project-detail', {
        y: 40,
        opacity: 0,
        duration: 0.5,
        stagger: 0.08
      });
    }
  });

  // 4. Overlay backdrop fades in
  gsap.to('#modal-backdrop', { opacity: 1, duration: 0.4 });
}

function closeProject(card) {
  const mediaWrap = document.querySelector('.media-wrap.is-fullscreen');
  const state = Flip.getState(mediaWrap);

  mediaWrap.classList.remove('is-fullscreen');
  card.querySelector('.media-wrap-slot').appendChild(mediaWrap);

  Flip.from(state, {
    duration: 0.6,
    ease: 'power3.inOut'
  });

  gsap.to('#modal-backdrop', { opacity: 0, duration: 0.3 });
}
```

### Fullscreen Detail Layout (inside the modal)

```
┌─────────────────────────────────────────────────────────┐
│  [VIDEO — fullscreen, top 55vh, pinned]                  │
│                                             [×] close    │
├─────────────────────────────────────────────────────────┤
│  scrollable zone below                                   │
│                                                          │
│  01                    Project Title                     │
│  ─────────────────────────────────────────────────────  │
│                                                          │
│  CLIENT          ROLE              YEAR                  │
│  Name            UI Designer       2024                  │
│                                                          │
│  ─────────────────────────────────────────────────────  │
│                                                          │
│  [stat]  [stat]  [stat]   ← large numbers, Setna-style  │
│                                                          │
│  ─────────────────────────────────────────────────────  │
│                                                          │
│  About the project — 2–3 paragraphs max.                 │
│  Process images (alternating layout, Setna inner page)   │
│                                                          │
│  ─────────────────────────────────────────────────────  │
│  ← Previous project          Next project →              │
└─────────────────────────────────────────────────────────┘
```

### CSS for fullscreen state

```css
.media-wrap {
  position: relative;
  overflow: hidden;
  border-radius: 0;            /* Swiss: always 0 */
  transition: none;            /* GSAP handles all transitions */
}

.media-wrap.is-fullscreen {
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 55vh;                /* top portion — content scrolls below */
  z-index: 200;
  object-fit: cover;
}

#modal-backdrop {
  position: fixed;
  inset: 0;
  background: var(--bg);
  z-index: 199;
  opacity: 0;
  pointer-events: none;
}

#modal-backdrop.active {
  pointer-events: all;
}
```

---

## 🏷 Project Card Anatomy

Every card has these exact fields. No more, no less.

```
┌──────────────────────────────┐
│                              │
│   [POSTER IMAGE / VIDEO]     │  ← media-wrap, fills card width
│                              │
│  ─────────────────────────── │  ← 1px rule (--rule color)
│  01  Project Title      ↗    │  ← index left, arrow right
│      Branding · 2024         │  ← category tag · year
└──────────────────────────────┘
```

- Index number: `01`, `02`… — small, muted, left-aligned
- Title: 15–17px, weight 700, no ellipsis — truncate at 2 lines max
- Category: 11px uppercase, `--muted` color
- Year: same row as category, separated by `·`
- Arrow `↗`: appears only on hover, slides in from `translate(−4px, 4px)`
  to `(0, 0)` — signals "click to open"
- NO description text on the card — that lives only in the fullscreen detail

---

## 🔠 Typography in Showcase Context

Inherits from DESIGN.md. Additions specific to the work grid:

- **Page title "Work"** — render this at 15–20vw font-size, weight 900,
  positioned so the right edge bleeds off-screen by ~30% (Khazar reference).
  It is decoration AND wayfinding. Color: `var(--fg)` at 6% opacity so it
  does not compete with the actual work thumbnails.
- **Filter tabs** — 12px, uppercase, tracking 0.06em. Active tab: solid
  bottom border 2px `var(--fg)`. No pill backgrounds, no filled states.
- **Project count** — show total after filter: "12 projects" in 11px muted
  text, right-aligned in the same row as filter tabs.

---

## 🎞 Vertical Marquee Label (Side Element)

From the Khazar University reference — the rotated repeating label on the right
edge of the page ("khazar university website.").

Adapt for portfolio:

```
[your name] · [your name] · [your name] ·
```

- Position: `fixed`, right edge, `writing-mode: vertical-rl`,
  `text-orientation: mixed`
- Font: 10px uppercase, `--muted` color
- Slow animation: `animation: marquee-vertical 20s linear infinite`
- Appears ONLY on the `/work` page, disappears elsewhere
- Fades out when the fullscreen modal is open

```css
.side-marquee {
  position: fixed;
  right: 12px;
  top: 0;
  height: 100vh;
  writing-mode: vertical-rl;
  font-size: 10px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--muted);
  overflow: hidden;
  pointer-events: none;
  z-index: 10;
}

@keyframes marquee-vertical {
  from { transform: translateY(0); }
  to   { transform: translateY(-50%); }
}
```

---

## 📁 File & Folder Convention (tell the AI)

```
src/
├── pages/
│   ├── work/
│   │   ├── index.astro          ← the grid page
│   │   └── [slug].astro         ← project detail (if using full pages)
│   └── ...
│
├── data/
│   └── projects.json            ← single source of truth for all projects
│
└── assets/
    └── work/
        ├── project-01/
        │   ├── poster.jpg       ← hand-picked still
        │   ├── preview.mp4      ← compressed, ≤8MB, 3–4s loop
        │   ├── preview.webm     ← same content, WebM for smaller size
        │   └── detail-01.jpg    ← full-quality images for modal
        └── project-02/
            └── ...
```

### `projects.json` Schema

```json
[
  {
    "id": "01",
    "slug": "project-slug",
    "title": "Project Title",
    "client": "Client Name",
    "category": ["Branding", "Motion"],
    "year": 2024,
    "role": "Art Director",
    "duration": "6 weeks",
    "poster": "/assets/work/project-01/poster.jpg",
    "preview": "/assets/work/project-01/preview.mp4",
    "previewWebm": "/assets/work/project-01/preview.webm",
    "featured": true,
    "stats": [
      { "value": "6", "unit": "weeks", "label": "Project duration" },
      { "value": "3", "unit": "deliverables", "label": "Final outputs" }
    ],
    "description": "2–3 paragraph project description here.",
    "images": [
      "/assets/work/project-01/detail-01.jpg",
      "/assets/work/project-01/detail-02.jpg"
    ]
  }
]
```

---

## ✅ Checklist — What to Build First (tell the AI)

Give the AI this exact priority order:

1. `projects.json` with placeholder data (3 featured, 5 standard entries)
2. The work grid page — asymmetric layout, poster images only (no video yet)
3. Hover state: pointer cursor, arrow appears, scale 1.03
4. Add `<video>` tags with `preload="none"` and hover-to-play JS
5. Fullscreen modal: GSAP FLIP expand from card → fullscreen
6. Fullscreen detail content: stats, description, image alternating layout
7. Close animation: FLIP collapse back to card
8. Side marquee label
9. Filter tabs with animated count update
10. Page title "Work" at 15vw, bleeds off-screen

---

## ❌ Anti-patterns — Work Section

- NO lightbox libraries (PhotoSwipe, GLightbox) — build the FLIP transition custom
- NO image carousels or sliders inside the fullscreen modal
- NO "View Project" button overlaid on the thumbnail — the whole card is clickable
- NO loading skeleton UI — use a poster image, it's instant
- NO caption text visible on the grid — only in fullscreen detail
- NO rating stars, like counts, or view counts
- NO "Featured" badge overlaid on cards — use layout size to signal importance
- NO hover color overlay tint on thumbnails (e.g. blue tint on hover) — this
  is cheap; use the media reveal instead
- NO card shadows on hover — use scale 1.03 only

---

*Feed this file to AI as: "This is SHOWCASE.md. It defines the work grid,
media behavior, hover-to-play, fullscreen transition, and project data schema
for my portfolio. Use it together with DESIGN.md. Build the work section
following this spec exactly."*
