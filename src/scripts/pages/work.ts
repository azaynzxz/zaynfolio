import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
gsap.registerPlugin(ScrollTrigger);

function initWork() {
  const tabs = document.querySelectorAll<HTMLButtonElement>('.listing-filter__tab');
  if (!tabs.length) return; // Only run on work listing page!

  // ── Title slide-up entrance (Gallery-style) ────────
  gsap.fromTo('.work-big-title', { y: '100%', autoAlpha: 0 }, { y: '0%', autoAlpha: 1, duration: 0.8, ease: 'power4.out' });

  // ── Filter logic ──────────────────────────────────
  const rows = document.querySelectorAll<HTMLElement>('.listing-row');
  const countEl = document.getElementById('project-count');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('listing-filter__tab--active'));
      tab.classList.add('listing-filter__tab--active');
      const filter = tab.dataset.filter;
      let visible = 0;

      rows.forEach((row) => {
        const cats: string[] = JSON.parse(row.dataset.categories || '[]');
        const show = filter === 'all' || cats.includes(filter || '');
        if (show) {
          row.style.display = '';
          visible++;
          gsap.fromTo(row, { autoAlpha: 0, y: 14 }, {
            autoAlpha: 1, y: 0, duration: 0.4,
            ease: 'power3.out', delay: visible * 0.04
          });
        } else {
          gsap.to(row, {
            autoAlpha: 0, duration: 0.2, ease: 'power2.in',
            onComplete: () => { row.style.display = 'none'; }
          });
        }
      });

      if (countEl) {
        const n = filter === 'all' ? rows.length : visible;
        countEl.textContent = `${n} project${n !== 1 ? 's' : ''}`;
      }
    });
  });

  // ── Stagger entrance: featured cards ──────────────
  const cards = gsap.utils.toArray<HTMLElement>('.event-card');
  if (cards.length) {
    gsap.fromTo(cards, 
      { autoAlpha: 0, y: 30 },
      { autoAlpha: 1, y: 0, duration: 0.6, stagger: 0.1, ease: 'power3.out', delay: 0.15 }
    );
  }

  // ── Stagger entrance: listing rows ────────────────
  const listRows = gsap.utils.toArray<HTMLElement>('.listing-row');
  if (listRows.length) {
    gsap.fromTo(listRows, 
      { autoAlpha: 0, y: 20 },
      { autoAlpha: 1, y: 0, duration: 0.5, stagger: 0.04, ease: 'power3.out', delay: 0.3 }
    );
  }

  // ── Hover: listing rows ───────────────────────────
  rows.forEach(row => {
    row.addEventListener('mouseenter', () => {
      gsap.to(row.querySelector('.listing-row__thumb img, .listing-row__thumb video'), {
        scale: 1.06, duration: 0.5, ease: 'power2.out'
      });
    });
    row.addEventListener('mouseleave', () => {
      gsap.to(row.querySelector('.listing-row__thumb img, .listing-row__thumb video'), {
        scale: 1, duration: 0.4, ease: 'power2.inOut'
      });
    });
  });

  // ── Hover: featured cards ─────────────────────────
  cards.forEach(card => {
    const img = card.querySelector('.event-card__thumb-strip img, .event-card__thumb-strip video');
    const arrow = card.querySelector('.arrow');
    card.addEventListener('mouseenter', () => {
      if (img) gsap.to(img, { scale: 1.04, duration: 0.5, ease: 'power2.out' });
      if (arrow) gsap.to(arrow, { x: 4, duration: 0.3, ease: 'power2.out' });
    });
    card.addEventListener('mouseleave', () => {
      if (img) gsap.to(img, { scale: 1, duration: 0.4, ease: 'power2.inOut' });
      if (arrow) gsap.to(arrow, { x: 0, duration: 0.3, ease: 'power2.inOut' });
    });
  });

  // ── Fullscreen Lightbox Modal ──────────────────────
  const workModal = document.getElementById('work-modal')!;
  const wmBackdrop = document.getElementById('wm-backdrop')!;
  const wmClose = document.getElementById('wm-close')!;
  const wmMedia = document.getElementById('wm-media')!;
  const wmIndex = document.getElementById('wm-index')!;
  const wmTitle = document.getElementById('wm-title')!;
  const wmClient = document.getElementById('wm-client')!;
  const wmRole = document.getElementById('wm-role')!;
  const wmYear = document.getElementById('wm-year')!;
  const wmDesc = document.getElementById('wm-desc')!;

  // Custom Media Elements
  const wmPlayerWrapper = document.getElementById('wm-custom-player-wrapper')!;
  const wmPlayer = document.getElementById('wm-custom-player')!;
  const wmPlayerVideo = wmPlayer.querySelector('[data-video]') as HTMLVideoElement;
  const wmImg = document.getElementById('wm-custom-img') as HTMLImageElement;

  const projectsList = JSON.parse(document.getElementById('projects-data')?.dataset.projects || '[]');

  function openProjectModal(projectId: string, pushState = true) {
    const project = projectsList.find((p: any) => p.id === projectId);
    if (!project) return;

    // Populate media
    if (project.preview) {
      wmImg.style.display = 'none';
      wmPlayerWrapper.style.display = 'flex';
      
      // Reset player UI state
      wmPlayerVideo.pause();
      wmPlayerVideo.currentTime = 0;
      
      wmPlayerVideo.src = project.previewWebm || project.preview;
      if (project.poster) {
        wmPlayerVideo.poster = project.poster;
      }
      wmPlayerVideo.load();
      
      // Handle layout orientation for vertical videos
      wmPlayerVideo.addEventListener('loadedmetadata', () => {
        if (wmPlayerVideo.videoHeight > wmPlayerVideo.videoWidth) {
          workModal.classList.add('work-modal--vertical-layout');
        } else {
          workModal.classList.remove('work-modal--vertical-layout');
        }
      }, { once: true });
      
      // Try autoplaying new video
      wmPlayerVideo.play().catch(console.error);

    } else {
      wmPlayerWrapper.style.display = 'none';
      wmPlayerVideo.pause(); // pause any playing video
      wmImg.style.display = 'block';

      // Handle layout orientation for vertical images
      wmImg.onload = () => {
        if (wmImg.naturalHeight > wmImg.naturalWidth) {
          workModal.classList.add('work-modal--vertical-layout');
        } else {
          workModal.classList.remove('work-modal--vertical-layout');
        }
      };

      wmImg.src = project.poster;
      wmImg.alt = project.title;
    }

    // Populate details
    wmIndex.textContent = project.id;
    wmTitle.textContent = project.title;
    wmClient.textContent = project.client;
    wmRole.textContent = project.role;
    wmYear.textContent = project.year.toString();
    wmDesc.textContent = project.description;

    if (pushState) {
      window.history.pushState({ modal: true }, '', `?project=${projectId}`);
    }

    // Activate Modal
    workModal.classList.add('work-modal--active');
    workModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleWorkModalKeyDown);
  }

  function closeProjectModal(pushState = true) {
    workModal.classList.remove('work-modal--active');
    workModal.classList.remove('work-modal--vertical-layout');
    workModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    
    // Stop video instead of clearing innerHTML
    if (wmPlayerVideo) {
      wmPlayerVideo.pause();
    }
    
    if (pushState) {
      history.pushState(null, '', window.location.pathname);
    }
    document.removeEventListener('keydown', handleWorkModalKeyDown);
  }

  function handleWorkModalKeyDown(e: KeyboardEvent) {
    if (e.key === 'Escape' && workModal.classList.contains('work-modal--active')) {
      closeProjectModal(true);
    }
  }

  // ── Redirect Modal ──────────────────────────────────
  const redirectModal = document.getElementById('redirect-modal')!;
  const rmBackdrop = document.getElementById('rm-backdrop')!;
  const rmCancel = document.getElementById('rm-cancel')!;
  const rmGo = document.getElementById('rm-go') as HTMLAnchorElement;
  const rmDesc = document.getElementById('rm-desc')!;

  function openRedirectModal(url: string, desc: string) {
    rmGo.href = url;
    rmDesc.textContent = desc;
    redirectModal.setAttribute('aria-hidden', 'false');
    redirectModal.classList.add('redirect-modal--active');
  }

  function closeRedirectModal() {
    redirectModal.setAttribute('aria-hidden', 'true');
    redirectModal.classList.remove('redirect-modal--active');
  }

  rmBackdrop.addEventListener('click', closeRedirectModal);
  rmCancel.addEventListener('click', closeRedirectModal);
  rmGo.addEventListener('click', closeRedirectModal);

  // Bind event listeners to card & list row links
  document.querySelectorAll<HTMLAnchorElement>('[data-id]').forEach(link => {
    link.addEventListener('click', (e) => {
      const projectId = link.dataset.id;
      const href = link.getAttribute('href');
      
      if (href && href.startsWith('/gallery')) return;
      
      e.preventDefault();
      
      if (projectId === '06') {
        openRedirectModal('https://idcardlampung.com', 'idcardlampung.com — E-Commerce platform for ID Card Lampung');
        return;
      }
      if (projectId === '12') {
        openRedirectModal('https://github.com/azaynzxz/after-effects-expression-panel', 'GitHub Repository — Automated Design Workflow System (After Effects Expression Panel)');
        return;
      }

      if (projectId) openProjectModal(projectId, true);
    });
  });

  wmClose.addEventListener('click', () => closeProjectModal());
  wmBackdrop.addEventListener('click', () => closeProjectModal());

  // Handle back button
  function handlePopState() {
    const urlParams = new URLSearchParams(window.location.search);
    const projectIdParam = urlParams.get('project');
    if (projectIdParam) {
      openProjectModal(projectIdParam, false);
    } else {
      closeProjectModal(false);
    }
  }
  window.addEventListener('popstate', handlePopState);

  // Check URL on load
  function checkUrlParams() {
    const urlParams = new URLSearchParams(window.location.search);
    const projectIdParam = urlParams.get('project');
    if (projectIdParam) {
      setTimeout(() => openProjectModal(projectIdParam, false), 50);
    }
  }
  
  checkUrlParams();

  // Cleanup listeners on navigation
  document.addEventListener('astro:before-preparation', () => {
    window.removeEventListener('popstate', handlePopState);
    document.removeEventListener('keydown', handleWorkModalKeyDown);
  }, { once: true });
}

document.addEventListener('astro:page-load', initWork);