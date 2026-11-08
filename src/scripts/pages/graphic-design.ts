import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
gsap.registerPlugin(ScrollTrigger);

function initGraphicDesign() {
  const container = document.getElementById('graphic-design-hub');
  if (!container || (container as any)._initialized) return;
  (container as any)._initialized = true;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ── Entrance Animations ──
  // Astro View Transitions handle page cross-fading seamlessly.
  // We avoid setting opacity:0 on above-the-fold content to eliminate page refresh flashing.

  // ── Gallery Items & Lightbox ─────────────────────────────
  const cells = container.querySelectorAll<HTMLElement>('.gallery-cell');

  // Prime video elements for instant poster playback
  container.querySelectorAll<HTMLVideoElement>('.cell-video').forEach((video) => {
    video.muted = true;
    if (video.readyState < 2) {
      video.load();
    }
  });

  // Video hover preview
  container.querySelectorAll<HTMLVideoElement>('[data-hover-video]').forEach((video) => {
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

  // Category section triggers
  if (!reduceMotion) {
    container.querySelectorAll('.gallery-grid-section').forEach((section) => {
      const gridCells = section.querySelectorAll('.gallery-cell');
      gsap.from(gridCells, {
        opacity: 0,
        y: 16,
        duration: 0.35,
        stagger: 0.03,
        ease: 'power2.out',
        clearProps: 'all',
        scrollTrigger: {
          trigger: section,
          start: 'top 88%',
          once: true
        }
      });
    });
  }

  // Cleanup on Astro page transition
  document.addEventListener('astro:before-preparation', () => {
    closeLightbox();
  }, { once: true });
}

document.addEventListener('astro:page-load', initGraphicDesign);
