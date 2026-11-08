import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
gsap.registerPlugin(ScrollTrigger);

function initGraphicDesign() {
  const container = document.getElementById('graphic-design-hub');
  if (!container) return;

  // ── Failsafe to ensure elements are never stuck hidden ──
  function ensureVisibility() {
    document.querySelectorAll<HTMLElement>('.event-card, .reveal, .reveal-line, .graphic-design-title, .work-big-title, .work-lead, .cell-img').forEach((el) => {
      el.style.visibility = 'visible';
    });
  }
  setTimeout(ensureVisibility, 300);

  // ── Entrance Animations ─────────────────────────────────
  // Title slide-up
  const title = container.querySelector('.graphic-design-title, .work-big-title');
  if (title) {
    gsap.fromTo(title, 
      { y: 24, autoAlpha: 0 }, 
      { y: 0, autoAlpha: 1, duration: 0.7, ease: 'power3.out' }
    );
  }

  // Brandbook cards entrance
  const cards = gsap.utils.toArray<HTMLElement>('.event-card');
  if (cards.length) {
    gsap.fromTo(cards, 
      { autoAlpha: 0, y: 24 }, 
      { 
        autoAlpha: 1, 
        y: 0, 
        duration: 0.5, 
        stagger: 0.07, 
        ease: 'power3.out',
        delay: 0.1,
        onComplete: ensureVisibility
      }
    );

    // Hover effect on brandbook cards
    cards.forEach((card) => {
      const img = card.querySelector<HTMLElement>('.event-card__thumb-strip img');
      const arrow = card.querySelector<HTMLElement>('.arrow');
      card.addEventListener('mouseenter', () => {
        if (img) gsap.to(img, { scale: 1.04, duration: 0.4, ease: 'power2.out' });
        if (arrow) gsap.to(arrow, { x: 4, duration: 0.25, ease: 'power2.out' });
      });
      card.addEventListener('mouseleave', () => {
        if (img) gsap.to(img, { scale: 1, duration: 0.35, ease: 'power2.inOut' });
        if (arrow) gsap.to(arrow, { x: 0, duration: 0.25, ease: 'power2.inOut' });
      });
    });
  }

  // Reveal texts and dividers
  const reveals = gsap.utils.toArray<HTMLElement>('.reveal');
  if (reveals.length) {
    gsap.fromTo(reveals, 
      { autoAlpha: 0, y: 14 }, 
      { autoAlpha: 1, y: 0, duration: 0.45, stagger: 0.05, ease: 'power2.out' }
    );
  }
  const lines = gsap.utils.toArray<HTMLElement>('.reveal-line');
  if (lines.length) {
    gsap.fromTo(lines, 
      { scaleX: 0, transformOrigin: 'left center' }, 
      { scaleX: 1, duration: 0.6, ease: 'power3.out' }
    );
  }

  // ── Gallery Items & Lightbox ─────────────────────────────
  const cells = document.querySelectorAll<HTMLElement>('.gallery-cell');

  // Prime video elements
  document.querySelectorAll<HTMLVideoElement>('.cell-video').forEach((video) => {
    video.muted = true;
    if (video.readyState < 2) {
      video.load();
    }
  });

  // Video hover preview
  document.querySelectorAll<HTMLVideoElement>('[data-hover-video]').forEach((video) => {
    const cell = video.closest('.gallery-cell');
    if (!cell) return;
    cell.addEventListener('mouseenter', () => { video.play().catch(() => {}); });
    cell.addEventListener('mouseleave', () => { video.pause(); video.currentTime = 0; });
  });

  // Lightbox elements
  const lightbox = document.getElementById('lightbox');
  const lbMedia = document.getElementById('lb-media');
  const lbPlayerWrapper = document.getElementById('lb-custom-player-wrapper');
  const lbPlayer = document.getElementById('lb-custom-player');
  const lbPlayerVideo = lbPlayer?.querySelector('[data-video]') as HTMLVideoElement | null;
  const lbImg = document.getElementById('lb-custom-img') as HTMLImageElement | null;
  const lbCaption = document.getElementById('lb-caption');
  const lbClose = document.getElementById('lb-close');
  const lbBackdrop = document.getElementById('lb-backdrop');
  const lbPrev = document.getElementById('lb-prev');
  const lbNext = document.getElementById('lb-next');

  let currentLbIndex = 0;

  function getVisibleCells(): HTMLElement[] {
    return Array.from(document.querySelectorAll<HTMLElement>('.gallery-cell'));
  }

  function openLightbox(index: number) {
    if (!lightbox) return;
    const visibleList = getVisibleCells();
    currentLbIndex = index;
    showLightboxItem(currentLbIndex, visibleList);
    lightbox.classList.add('lightbox--active');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleKeyDown);
  }

  function showLightboxItem(index: number, visibleList: HTMLElement[]) {
    const cell = visibleList[index];
    if (!cell || !lbCaption) return;

    const video = cell.querySelector<HTMLVideoElement>('.cell-video');
    const img = cell.querySelector<HTMLImageElement>('.cell-img');

    if (video && lbPlayerWrapper && lbImg) {
      lbImg.style.display = 'none';
      lbPlayerWrapper.style.display = 'flex';
      if (lbPlayerVideo) {
        lbPlayerVideo.pause();
        lbPlayerVideo.currentTime = 0;
        lbPlayerVideo.src = video.src;
        lbPlayerVideo.poster = video.poster;
        lbPlayerVideo.load();
        lbPlayerVideo.play().catch(() => {});
      }
    } else if (img && lbImg && lbPlayerWrapper) {
      lbPlayerWrapper.style.display = 'none';
      if (lbPlayerVideo) lbPlayerVideo.pause();
      lbImg.style.display = 'block';
      lbImg.src = img.src;
      lbImg.alt = img.alt;
    }

    const cellTitle = cell.querySelector('.cell-title')?.textContent || '';
    const platform = cell.querySelector('.cell-platform')?.textContent || '';
    lbCaption.textContent = `${cellTitle} · ${platform}`;
  }

  function closeLightbox() {
    if (!lightbox) return;
    lightbox.classList.remove('lightbox--active');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (lbPlayerVideo) lbPlayerVideo.pause();
    document.removeEventListener('keydown', handleKeyDown);
  }

  function navigateLb(dir: number) {
    const visibleList = getVisibleCells();
    if (!visibleList.length || !lbMedia) return;
    currentLbIndex = (currentLbIndex + dir + visibleList.length) % visibleList.length;
    gsap.to(lbMedia, {
      opacity: 0, 
      duration: 0.15, 
      onComplete: () => {
        showLightboxItem(currentLbIndex, visibleList);
        gsap.to(lbMedia, { opacity: 1, duration: 0.2 });
      }
    });
  }

  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') navigateLb(-1);
    if (e.key === 'ArrowRight') navigateLb(1);
  }

  cells.forEach((cell) => {
    cell.addEventListener('click', () => {
      const visibleList = getVisibleCells();
      const idx = visibleList.indexOf(cell);
      if (idx >= 0) openLightbox(idx);
    });
  });

  lbClose?.addEventListener('click', closeLightbox);
  lbBackdrop?.addEventListener('click', closeLightbox);
  lbPrev?.addEventListener('click', () => navigateLb(-1));
  lbNext?.addEventListener('click', () => navigateLb(1));

  // Category section scrolls
  document.querySelectorAll('.gallery-grid-section').forEach((section) => {
    const gridCells = section.querySelectorAll('.gallery-cell');
    gsap.fromTo(gridCells, 
      { autoAlpha: 0, y: 16 }, 
      {
        autoAlpha: 1,
        y: 0,
        duration: 0.4,
        stagger: 0.035,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: section,
          start: 'top 85%',
          once: true
        }
      }
    );
  });
}

document.addEventListener('astro:page-load', initGraphicDesign);
initGraphicDesign();
