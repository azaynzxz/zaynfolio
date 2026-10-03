import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
gsap.registerPlugin(ScrollTrigger);

// ══════════════════════════════════════════════════════════════
//  HOMEPAGE
//  Hero: fanned project deck (hover-to-play, click-to-open modal)
//  Peek: featured cards hover + entrance
// ══════════════════════════════════════════════════════════════

const prefersReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const canHover = () =>
  window.matchMedia('(hover: hover) and (pointer: fine)').matches;

type CardData = {
  id?: string;
  slug?: string;
  title?: string;
  client?: string;
  year?: string;
  full?: string;
  poster?: string;
};

function initHero(signal: AbortSignal): () => void {
  const hero = document.getElementById('hero');
  const deck = document.getElementById('hero-deck');
  if (!hero || !deck) return () => {};

  const track = deck.querySelector<HTMLElement>('.hero-deck__track')!;
  const allCards = Array.from(deck.querySelectorAll<HTMLButtonElement>('.hero-card'));
  const lines = Array.from(hero.querySelectorAll<HTMLElement>('.hero__line-inner'));
  const fades = Array.from(hero.querySelectorAll<HTMLElement>('[data-hero-fade]'));
  const reduce = prefersReducedMotion();

  // ── Entrance (Text & fades only, cards stay static in arch layout) ──
  let intro: gsap.core.Timeline | null = null;
  if (!reduce) {
    intro = gsap.timeline({ defaults: { ease: 'power3.out' } });
    intro
      .fromTo(fades[0] ?? [], { autoAlpha: 0, y: 8 }, { autoAlpha: 1, y: 0, duration: 0.5 }, 0)
      .fromTo(lines, { yPercent: 110 }, { yPercent: 0, duration: 0.8, stagger: 0.08, ease: 'power4.out' }, 0.05)
      .fromTo(fades.slice(1), { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: 0.5, stagger: 0.08 }, 0.25);
  } else {
    gsap.set(fades, { autoAlpha: 1, y: 0 });
    gsap.set(lines, { yPercent: 0 });
  }

  // ── Video thumbnail & hover playback ─────────────────────
  function primeCardVideo(card: HTMLButtonElement) {
    const video = card.querySelector<HTMLVideoElement>('.hero-card__video');
    if (!video) return;
    // Eagerly prime the video element to frame 0.001s so thumbnail renders immediately
    if (video.readyState < 2) {
      video.load();
    }
  }

  function playCardVideo(card: HTMLButtonElement) {
    const video = card.querySelector<HTMLVideoElement>('.hero-card__video');
    if (!video) return;
    card.classList.add('is-playing');
    video.muted = true;
    video.play().catch(() => {
      // Autoplay or loading fallback
    });
  }

  function stopCardVideo(card: HTMLButtonElement) {
    const video = card.querySelector<HTMLVideoElement>('.hero-card__video');
    card.classList.remove('is-playing');
    if (!video) return;
    video.pause();
    video.currentTime = 0.001;
  }

  allCards.forEach((card) => {
    primeCardVideo(card);

    // Hover: purely toggle video playback. CSS handles the 3D lift in-place.
    card.addEventListener('mouseenter', () => {
      if (canHover()) {
        playCardVideo(card);
      }
    }, { signal });

    card.addEventListener('mouseleave', () => {
      if (canHover()) {
        stopCardVideo(card);
      }
    }, { signal });

    // Focus / blur for keyboard accessibility
    card.addEventListener('focus', () => playCardVideo(card), { signal });
    card.addEventListener('blur', () => stopCardVideo(card), { signal });

    // Click: open modal
    card.addEventListener('click', () => {
      openModal(card.dataset as CardData, card);
    }, { signal });
  });

  // ── Modal (Authentic Swiss Rationalist Lightbox) ─────────
  const modal = document.getElementById('hero-modal');
  const wmContainer = document.getElementById('wm-container');
  const closeBtn = document.getElementById('wm-close') as HTMLButtonElement | null;
  const wmIndex = document.getElementById('wm-index');
  const wmTitle = document.getElementById('wm-title');
  const wmClient = document.getElementById('wm-client');
  const wmRole = document.getElementById('wm-role');
  const wmYear = document.getElementById('wm-year');
  const wmDesc = document.getElementById('wm-desc');
  const wmLink = document.getElementById('wm-link') as HTMLAnchorElement | null;
  const playerVideo = document
    .getElementById('hero-modal-player')
    ?.querySelector<HTMLVideoElement>('[data-video]');

  modal?.setAttribute('data-lenis-prevent', '');

  let lastTrigger: HTMLElement | null = null;
  const isOpen = () => modal?.classList.contains('work-modal--active') ?? false;

  function openModal(data: CardData & { role?: string; desc?: string }, trigger: HTMLElement) {
    if (!modal || !playerVideo || !data.full) return;

    lastTrigger = trigger;

    if (wmIndex) wmIndex.textContent = data.id ?? '';
    if (wmTitle) wmTitle.textContent = data.title ?? '';
    if (wmClient) wmClient.textContent = data.client ?? '';
    if (wmRole) wmRole.textContent = data.role ?? 'Lead Motion Designer';
    if (wmYear) wmYear.textContent = data.year ?? '';
    if (wmDesc) wmDesc.textContent = data.desc ?? '';
    if (wmLink) wmLink.href = data.slug ? `/work/${data.slug}` : '/work';

    playerVideo.pause();
    playerVideo.currentTime = 0;
    playerVideo.src = data.full;
    if (data.poster) {
      playerVideo.poster = data.poster;
    } else {
      playerVideo.removeAttribute('poster');
    }
    playerVideo.muted = false;
    playerVideo.load();

    // Check vertical aspect ratio
    playerVideo.addEventListener('loadedmetadata', () => {
      if (playerVideo.videoHeight > playerVideo.videoWidth) {
        modal.classList.add('work-modal--vertical-layout');
      } else {
        modal.classList.remove('work-modal--vertical-layout');
      }
    }, { once: true });

    playerVideo.play().catch(() => {
      // Autoplay with audio might require user gesture on the player controls
    });

    modal.classList.add('work-modal--active');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    closeBtn?.focus({ preventScroll: true });
  }

  function closeModal() {
    if (!modal || !isOpen()) return;

    playerVideo?.pause();
    modal.classList.remove('work-modal--active');
    modal.classList.remove('work-modal--vertical-layout');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';

    if (playerVideo) {
      playerVideo.removeAttribute('src');
      playerVideo.load();
    }

    lastTrigger?.focus({ preventScroll: true });
    lastTrigger = null;
  }

  modal?.querySelectorAll('[data-hero-modal-close]').forEach((el) =>
    el.addEventListener('click', closeModal, { signal }),
  );

  document.addEventListener('keydown', (e) => {
    if (!isOpen() || !wmContainer) return;
    if (e.key === 'Escape') {
      e.preventDefault();
      closeModal();
      return;
    }
    if (e.key === 'Tab') {
      const focusables = Array.from(
        wmContainer.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), video, [tabindex]:not([tabindex="-1"])'),
      ).filter((el) => el.offsetParent !== null);
      if (!focusables.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }, { signal });

  // ── Showreel CTA ──────────────────────────────────────────
  const reelBtn = document.getElementById('hero-showreel-btn');
  reelBtn?.addEventListener('click', () => {
    openModal(reelBtn.dataset as CardData, reelBtn);
  }, { signal });

  // ── Cleanup ───────────────────────────────────────────────
  return () => {
    intro?.kill();
    closeModal();
    document.body.style.overflow = '';
    allCards.forEach((c) => c.querySelector('video')?.pause());
    gsap.killTweensOf([...allCards, track]);
  };
}

function initHome() {
  if (!document.getElementById('hero')) return;

  const controller = new AbortController();
  const cleanupHero = initHero(controller.signal);

  document.addEventListener('astro:before-preparation', () => {
    cleanupHero();
    controller.abort();
  }, { once: true });
}

document.addEventListener('astro:page-load', initHome);

