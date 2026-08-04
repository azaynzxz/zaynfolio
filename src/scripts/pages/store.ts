import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
gsap.registerPlugin(ScrollTrigger);

function initStore() {
  const cells = document.querySelectorAll<HTMLElement>('.store-cell');
  if (!cells.length) return;

  // ── Category Dropdown ──────────────────────────────────────────
  const dropdown      = document.getElementById('store-dropdown');
  const trigger       = document.getElementById('store-dropdown-trigger');
  const menu          = document.getElementById('store-dropdown-menu');
  const dropdownLabel = document.getElementById('store-dropdown-label');
  const sections      = document.querySelectorAll<HTMLElement>('.store-grid-section');
  const countEl       = document.getElementById('store-count');

  let activeCategory = 'all';

  function setCategory(slug: string, label: string) {
    activeCategory = slug;
    if (dropdownLabel) dropdownLabel.textContent = label;

    menu?.querySelectorAll<HTMLElement>('.store-dropdown__item').forEach((item) => {
      const active = item.dataset.slug === slug;
      item.classList.toggle('store-dropdown__item--active', active);
      item.setAttribute('aria-selected', String(active));
    });

    sections.forEach((section) => {
      const cat = section.dataset.category;
      section.hidden = slug !== 'all' && cat !== slug;
    });

    applySearch(searchInput?.value || '');
    closeDropdown();
  }

  function openDropdown() {
    menu?.classList.add('store-dropdown__menu--open');
    trigger?.setAttribute('aria-expanded', 'true');
  }

  function closeDropdown() {
    menu?.classList.remove('store-dropdown__menu--open');
    trigger?.setAttribute('aria-expanded', 'false');
  }

  trigger?.addEventListener('click', (e) => {
    e.stopPropagation();
    menu?.classList.contains('store-dropdown__menu--open') ? closeDropdown() : openDropdown();
  });

  menu?.querySelectorAll<HTMLElement>('.store-dropdown__item').forEach((item) => {
    item.addEventListener('click', () =>
      setCategory(item.dataset.slug || 'all', item.textContent?.trim() || 'All Categories')
    );
  });

  document.addEventListener('click', (e) => {
    if (dropdown && !dropdown.contains(e.target as Node)) closeDropdown();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeDropdown();
      closeSheet();
    }
  });

  // ── Search ─────────────────────────────────────────────────────
  const searchWrapper = document.getElementById('store-search-wrapper');
  const searchToggle  = document.getElementById('store-search-toggle');
  const searchField   = document.getElementById('store-search-field');
  const searchInput   = document.getElementById('store-search-input') as HTMLInputElement | null;
  const searchClear   = document.getElementById('store-search-clear');

  function applySearch(query: string) {
    const q = query.trim().toLowerCase();
    let totalVisible = 0;

    sections.forEach((section) => {
      if (activeCategory !== 'all' && section.dataset.category !== activeCategory) {
        section.hidden = true;
        return;
      }

      const sectionCells = section.querySelectorAll<HTMLElement>('.store-cell');
      let visible = 0;

      sectionCells.forEach((cell) => {
        const titleMatch = (cell.dataset.titleSearch || '').includes(q);
        const descMatch  = (cell.dataset.descSearch  || '').includes(q);
        const show = !q || titleMatch || descMatch;
        cell.hidden = !show;
        if (show) visible++;
      });

      section.hidden = visible === 0;
      totalVisible += visible;

      const badge = section.querySelector<HTMLElement>('.store-category-count');
      if (badge) {
        const total = Number(badge.dataset.total || sectionCells.length);
        badge.textContent = q ? `${visible} / ${total} products` : `${total} products`;
      }
    });

    if (countEl) countEl.textContent = `${totalVisible} product${totalVisible !== 1 ? 's' : ''}`;

    const noResults = document.getElementById('store-no-results');
    if (noResults) noResults.hidden = totalVisible > 0;

    if (searchClear) searchClear.hidden = !q;
  }

  searchToggle?.addEventListener('click', () => {
    const isOpen = searchWrapper?.classList.contains('store-search--open');
    if (isOpen) {
      searchWrapper?.classList.remove('store-search--open');
      searchToggle.setAttribute('aria-expanded', 'false');
      if (searchInput) searchInput.value = '';
      applySearch('');
    } else {
      searchWrapper?.classList.add('store-search--open');
      searchToggle.setAttribute('aria-expanded', 'true');
      // small delay to let the width transition play before focusing
      setTimeout(() => searchInput?.focus(), 50);
    }
  });

  searchInput?.addEventListener('input', () => applySearch(searchInput.value));

  searchClear?.addEventListener('click', () => {
    if (searchInput) searchInput.value = '';
    searchInput?.focus();
    applySearch('');
  });

  // ── Bottom Sheet ───────────────────────────────────────────────
  const sheet         = document.getElementById('product-sheet');
  const backdrop      = document.getElementById('sheet-backdrop');
  const sheetClose    = document.getElementById('sheet-close');
  const sheetCategory = document.getElementById('sheet-category');
  const sheetTitle    = document.getElementById('sheet-title');
  const sheetDesc     = document.getElementById('sheet-desc');
  const sheetFeatures = document.getElementById('sheet-features');
  const sheetPrice    = document.getElementById('sheet-price');
  const sheetImg      = document.getElementById('sheet-img') as HTMLImageElement | null;
  const sheetSlug     = document.getElementById('sheet-slug');
  const sheetPermalink = document.getElementById('sheet-permalink') as HTMLAnchorElement | null;
  const sheetBuy      = document.getElementById('sheet-buy') as HTMLButtonElement | null;
  const sheetShare    = document.getElementById('sheet-share');
  const sheetCopyBtn  = document.getElementById('sheet-copy-btn');

  function openSheet(cell: HTMLElement) {
    const title       = cell.dataset.title    || '';
    const desc        = cell.dataset.desc     || '';
    const price       = cell.dataset.price    || '';
    const category    = cell.dataset.category || '';
    const poster      = cell.dataset.poster   || '';
    const slug        = cell.dataset.slug     || '';
    const checkout    = cell.dataset.checkoutLink || '';
    const features: string[] = JSON.parse(cell.dataset.features || '[]');

    const shareUrl = `https://zaynfolio.com/store/${slug}`;

    // Populate
    if (sheetCategory) sheetCategory.textContent = category;
    if (sheetTitle)    sheetTitle.textContent    = title;
    if (sheetDesc)     sheetDesc.textContent     = desc;
    if (sheetPrice)    sheetPrice.textContent    = price;
    if (sheetSlug)     sheetSlug.textContent     = slug;
    if (sheetImg)    { sheetImg.src = poster; sheetImg.alt = title; }
    if (sheetPermalink) {
      sheetPermalink.href = `/store/${slug}`;
    }
    if (sheetBuy) sheetBuy.dataset.checkoutLink = checkout;

    // Features list
    if (sheetFeatures) {
      sheetFeatures.innerHTML = features
        .map(f => `<li class="sheet__feature-item"><span class="sheet__feature-dot" aria-hidden="true">—</span>${f}</li>`)
        .join('');
    }



    // Show
    sheet?.classList.add('sheet--open');
    sheet?.setAttribute('aria-hidden', 'false');
    backdrop?.classList.add('sheet-backdrop--active');
    document.body.style.overflow = 'hidden';
  }

  function closeSheet() {
    sheet?.classList.remove('sheet--open');
    sheet?.setAttribute('aria-hidden', 'true');
    backdrop?.classList.remove('sheet-backdrop--active');
    document.body.style.overflow = '';
  }

  cells.forEach((cell) => {
    cell.addEventListener('click', () => openSheet(cell));
  });

  sheetClose?.addEventListener('click', closeSheet);
  backdrop?.addEventListener('click', closeSheet);

  // ── Direct Checkout ────────────────────────────────────────────
  sheetBuy?.addEventListener('click', () => {
    const url = sheetBuy.dataset.checkoutLink || '';
    if (url) {
      const originalText = sheetBuy.innerHTML;
      sheetBuy.textContent = 'Redirecting...';
      sheetBuy.style.opacity = '0.7';
      sheetBuy.style.pointerEvents = 'none';
      
      setTimeout(() => {
        window.open(url, '_blank', 'noopener,noreferrer');
        // Reset state
        setTimeout(() => {
          sheetBuy.innerHTML = originalText;
          sheetBuy.style.opacity = '';
          sheetBuy.style.pointerEvents = '';
          closeSheet();
        }, 500);
      }, 400);
    }
  });

  // ── Sheet Share ────────────────────────────────────────────────
  sheetShare?.addEventListener('click', async () => {
    const url   = `https://zaynfolio.com/store/${sheetSlug?.textContent || ''}`;
    const title = sheetTitle?.textContent || document.title;

    if (navigator.share) {
      try {
        await navigator.share({ title, url });
      } catch { /* cancelled */ }
    }
  });

  sheetCopyBtn?.addEventListener('click', async () => {
    const url = `https://zaynfolio.com/store/${sheetSlug?.textContent || ''}`;
    try {
      await navigator.clipboard.writeText(url);
      const orig = sheetCopyBtn.innerHTML;
      sheetCopyBtn.innerHTML = '<span style="font-size:10px">COPIED!</span>';
      setTimeout(() => { if (sheetCopyBtn) sheetCopyBtn.innerHTML = orig; }, 2000);
    } catch {
      // fallback
    }
  });

  // ── Entry Animations ───────────────────────────────────────────
  document.querySelectorAll('.store-grid-section').forEach(section => {
    const gridCells = section.querySelectorAll('.store-cell');
    gsap.fromTo(gridCells, { autoAlpha: 0, y: 14 }, {
      autoAlpha: 1, y: 0,
      duration: 0.35,
      stagger: 0.03,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: section,
        start: 'top 88%',
        once: true
      }
    });
  });
}

document.addEventListener('astro:page-load', initStore);
