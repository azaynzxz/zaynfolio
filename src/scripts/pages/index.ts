  import gsap from 'gsap';
  import { ScrollTrigger } from 'gsap/ScrollTrigger';
  gsap.registerPlugin(ScrollTrigger);

  // ── Hover: peek cards ───────────────────────────────────
  const peekCards = document.querySelectorAll<HTMLElement>('.peek-card');
  peekCards.forEach(card => {
    const img = card.querySelector<HTMLElement>('.peek-card__thumb img');
    const arrow = card.querySelector<HTMLElement>('.arrow');

    card.addEventListener('mouseenter', () => {
      if (img) gsap.to(img, { scale: 1.04, duration: 0.5, ease: 'power2.out' });
      if (arrow) gsap.to(arrow, { x: 4, duration: 0.3, ease: 'power2.out' });
    });

    card.addEventListener('mouseleave', () => {
      if (img) gsap.to(img, { scale: 1, duration: 0.4, ease: 'power2.inOut' });
      if (arrow) gsap.to(arrow, { x: 0, duration: 0.3, ease: 'power2.inOut' });
    });
  });

  // ── Stagger entrance for peek cards ─────────────────────
  const cards = gsap.utils.toArray<HTMLElement>('.peek-card');
  if (cards.length) {
    gsap.fromTo(cards, 
      { autoAlpha: 0, y: 30 },
      {
        autoAlpha: 1, y: 0, duration: 0.6, stagger: 0.1,
        ease: 'power3.out',
        scrollTrigger: { trigger: '.peek__grid', start: 'top 85%', once: true }
      }
    );
  }

  // ── Scroll to Work ──────────────────────────────────────
  const scrollBtn = document.getElementById('scroll-to-work');
  scrollBtn?.addEventListener('click', () => {
    const target = document.getElementById('work-peek');
    if (target) {
      window.scrollTo({
        top: target.offsetTop - 64, // offset for nav
        behavior: 'smooth'
      });
    }
  });
