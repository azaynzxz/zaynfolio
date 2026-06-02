  import gsap from 'gsap';
  import { ScrollTrigger } from 'gsap/ScrollTrigger';
  gsap.registerPlugin(ScrollTrigger);

  const cells = document.querySelectorAll<HTMLElement>('.gallery-cell');

  // ── Hover-to-Play Video ──────────────────────────────
  const hoverVideos = document.querySelectorAll<HTMLVideoElement>('[data-hover-video]');
  hoverVideos.forEach(video => {
    const cell = video.closest('.gallery-cell');
    if (!cell) return;

    cell.addEventListener('mouseenter', () => {
      video.play().catch(() => {});
    });

    cell.addEventListener('mouseleave', () => {
      video.pause();
      video.currentTime = 0;
    });
  });

  // ── Lightbox ─────────────────────────────────────────
  const lightbox = document.getElementById('lightbox')!;
  const lbMedia = document.getElementById('lb-media')!;
  const lbPlayerWrapper = document.getElementById('lb-custom-player-wrapper')!;
  const lbPlayer = document.getElementById('lb-custom-player')!;
  const lbPlayerVideo = lbPlayer?.querySelector('[data-video]') as HTMLVideoElement;
  const lbImg = document.getElementById('lb-custom-img') as HTMLImageElement;
  const lbCaption = document.getElementById('lb-caption')!;
  const lbClose = document.getElementById('lb-close')!;
  const lbBackdrop = document.getElementById('lb-backdrop')!;
  const lbPrev = document.getElementById('lb-prev')!;
  const lbNext = document.getElementById('lb-next')!;

  let visibleCellsList: HTMLElement[] = [];
  let currentLbIndex = 0;

  function getVisibleCells(): HTMLElement[] {
    return Array.from(document.querySelectorAll<HTMLElement>('.gallery-cell'));
  }

  function openLightbox(index: number) {
    visibleCellsList = getVisibleCells();
    currentLbIndex = index;
    showLightboxItem(currentLbIndex);
    lightbox.classList.add('lightbox--active');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function showLightboxItem(index: number) {
    const cell = visibleCellsList[index];
    if (!cell) return;

    const video = cell.querySelector<HTMLVideoElement>('.cell-video');
    const img = cell.querySelector<HTMLImageElement>('.cell-img');

    if (video) {
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
    } else if (img) {
      lbPlayerWrapper.style.display = 'none';
      if (lbPlayerVideo) lbPlayerVideo.pause();
      
      lbImg.style.display = 'block';
      lbImg.src = img.src;
      lbImg.alt = img.alt;
    }

    const title = cell.querySelector('.cell-title')?.textContent || '';
    const platform = cell.querySelector('.cell-platform')?.textContent || '';
    lbCaption.textContent = `${title} · ${platform}`;
  }

  function closeLightbox() {
    lightbox.classList.remove('lightbox--active');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (lbPlayerVideo) {
      lbPlayerVideo.pause();
    }
  }

  function navigateLb(dir: number) {
    currentLbIndex = (currentLbIndex + dir + visibleCellsList.length) % visibleCellsList.length;
    gsap.to(lbMedia, {
      opacity: 0, duration: 0.15, onComplete: () => {
        showLightboxItem(currentLbIndex);
        gsap.to(lbMedia, { opacity: 1, duration: 0.2 });
      }
    });
  }

  // Cell click → open lightbox
  cells.forEach((cell, i) => {
    cell.addEventListener('click', () => {
      const visibleList = getVisibleCells();
      const idx = visibleList.indexOf(cell);
      if (idx >= 0) openLightbox(idx);
    });
  });

  lbClose.addEventListener('click', closeLightbox);
  lbBackdrop.addEventListener('click', closeLightbox);
  lbPrev.addEventListener('click', () => navigateLb(-1));
  lbNext.addEventListener('click', () => navigateLb(1));

  // Keyboard nav
  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('lightbox--active')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') navigateLb(-1);
    if (e.key === 'ArrowRight') navigateLb(1);
  });

  // ── Entry Animation ──────────────────────────────────
  // Title slides up
  gsap.set('.gallery-title', { y: '100%' });
  gsap.to('.gallery-title', { y: '0%', duration: 0.8, ease: 'power4.out' });

  // Stagger each category section as it scrolls into view
  document.querySelectorAll('.gallery-grid-section').forEach(section => {
    const gridCells = section.querySelectorAll('.gallery-cell');
    gsap.set(gridCells, { opacity: 0, y: 16 });

    gsap.to(gridCells, {
      opacity: 1,
      y: 0,
      duration: 0.4,
      stagger: 0.035,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: section,
        start: 'top 85%',
        once: true
      }
    });
  });
