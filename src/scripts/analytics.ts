// Core Analytics & User Behavior Engine for Zaynfolio
// Integrates with Google Analytics 4 (gtag.js) and Astro ClientRouter

export interface UtmParams {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  gclid?: string;
  fbclid?: string;
  referrer?: string;
  landing_page?: string;
}

declare global {
  interface Window {
    dataLayer: any[];
    gtag?: (...args: any[]) => void;
  }
}

const STORAGE_KEY_SESSION = 'zaynfolio_utm_session';
const STORAGE_KEY_FIRST_TOUCH = 'zaynfolio_utm_first';

// -------------------------------------------------------------
// UTM Capture & Persistence
// -------------------------------------------------------------
export function captureAndPersistUtm(): UtmParams {
  if (typeof window === 'undefined') return {};

  const urlParams = new URLSearchParams(window.location.search);
  const utmSource = urlParams.get('utm_source');
  const utmMedium = urlParams.get('utm_medium');
  const utmCampaign = urlParams.get('utm_campaign');
  const utmTerm = urlParams.get('utm_term');
  const utmContent = urlParams.get('utm_content');
  const gclid = urlParams.get('gclid');
  const fbclid = urlParams.get('fbclid');

  const hasCampaignParams = Boolean(
    utmSource || utmMedium || utmCampaign || utmTerm || utmContent || gclid || fbclid
  );

  if (hasCampaignParams) {
    const currentParams: UtmParams = {
      utm_source: utmSource || undefined,
      utm_medium: utmMedium || undefined,
      utm_campaign: utmCampaign || undefined,
      utm_term: utmTerm || undefined,
      utm_content: utmContent || undefined,
      gclid: gclid || undefined,
      fbclid: fbclid || undefined,
      referrer: document.referrer || undefined,
      landing_page: window.location.pathname,
    };

    try {
      sessionStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(currentParams));
      if (!localStorage.getItem(STORAGE_KEY_FIRST_TOUCH)) {
        localStorage.setItem(STORAGE_KEY_FIRST_TOUCH, JSON.stringify(currentParams));
      }
    } catch {
      // Storage access may be blocked by user settings
    }

    return currentParams;
  }

  // Fallback to active session or first-touch
  try {
    const session = sessionStorage.getItem(STORAGE_KEY_SESSION);
    if (session) return JSON.parse(session);
    const firstTouch = localStorage.getItem(STORAGE_KEY_FIRST_TOUCH);
    if (firstTouch) return JSON.parse(firstTouch);
  } catch {
    // Ignore storage parse errors
  }

  return {};
}

export function getStoredUtm(): UtmParams {
  if (typeof window === 'undefined') return {};
  try {
    const session = sessionStorage.getItem(STORAGE_KEY_SESSION);
    if (session) return JSON.parse(session);
    const first = localStorage.getItem(STORAGE_KEY_FIRST_TOUCH);
    if (first) return JSON.parse(first);
  } catch {
    // Ignore storage errors
  }
  return {};
}

// -------------------------------------------------------------
// Safe gtag.js Dispatcher
// -------------------------------------------------------------
export function trackEvent(eventName: string, params: Record<string, any> = {}): void {
  if (typeof window === 'undefined') return;

  const utmData = getStoredUtm();
  const enrichedParams = {
    ...utmData,
    page_path: window.location.pathname,
    page_title: document.title,
    timestamp: new Date().toISOString(),
    ...params,
  };

  window.dataLayer = window.dataLayer || [];
  // Push to dataLayer for Google Tag Manager triggers
  window.dataLayer.push({
    event: eventName,
    ...enrichedParams,
  });

  // Also call gtag for Google Analytics 4 direct streaming
  if (typeof window.gtag === 'function') {
    window.gtag('event', eventName, enrichedParams);
  }
}

// -------------------------------------------------------------
// Active Dwell Time & Attention Engine
// -------------------------------------------------------------
class AttentionTracker {
  private activeSeconds = 0;
  private intervalId: number | null = null;
  private isVisible = true;
  private reportedHeartbeats = new Set<number>();
  private readonly heartbeats = [15, 30, 60, 120, 300];
  private maxScrollPercent = 0;
  private reportedScrollMilestones = new Set<number>();
  private scrollHandler: (() => void) | null = null;
  private visibilityHandler: (() => void) | null = null;

  public start(): void {
    this.reset();
    this.isVisible = document.visibilityState === 'visible';

    this.intervalId = window.setInterval(() => {
      if (this.isVisible) {
        this.activeSeconds += 1;
        this.checkHeartbeats();
      }
    }, 1000);

    this.visibilityHandler = () => {
      this.isVisible = document.visibilityState === 'visible';
    };
    document.addEventListener('visibilitychange', this.visibilityHandler);

    this.setupScrollDepth();
  }

  private checkHeartbeats(): void {
    for (const milestone of this.heartbeats) {
      if (this.activeSeconds >= milestone && !this.reportedHeartbeats.has(milestone)) {
        this.reportedHeartbeats.add(milestone);
        trackEvent('page_attention_heartbeat', {
          seconds_active: milestone,
          milestone: `${milestone}s`,
        });
      }
    }
  }

  private setupScrollDepth(): void {
    const scrollMilestones = [25, 50, 75, 90];

    this.scrollHandler = () => {
      const scrollY = window.scrollY || window.pageYOffset;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight <= 0) return;

      const currentPercent = Math.min(100, Math.round((scrollY / docHeight) * 100));
      if (currentPercent > this.maxScrollPercent) {
        this.maxScrollPercent = currentPercent;
      }

      for (const milestone of scrollMilestones) {
        if (currentPercent >= milestone && !this.reportedScrollMilestones.has(milestone)) {
          this.reportedScrollMilestones.add(milestone);
          trackEvent('scroll_depth', {
            percent: milestone,
            milestone: `${milestone}%`,
          });
        }
      }
    };

    window.addEventListener('scroll', this.scrollHandler, { passive: true });
    // Run once initially in case of short pages
    this.scrollHandler();
  }

  public flushAndStop(): void {
    if (this.activeSeconds >= 3) {
      trackEvent('page_dwell_summary', {
        total_active_seconds: this.activeSeconds,
        max_scroll_percent: this.maxScrollPercent,
      });
    }

    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    if (this.visibilityHandler) {
      document.removeEventListener('visibilitychange', this.visibilityHandler);
      this.visibilityHandler = null;
    }
    if (this.scrollHandler) {
      window.removeEventListener('scroll', this.scrollHandler);
      this.scrollHandler = null;
    }
  }

  private reset(): void {
    this.activeSeconds = 0;
    this.reportedHeartbeats.clear();
    this.reportedScrollMilestones.clear();
    this.maxScrollPercent = 0;
  }
}

let activeTracker: AttentionTracker | null = null;

// -------------------------------------------------------------
// Video Analytics Manager
// -------------------------------------------------------------
export interface VideoMeta {
  videoId?: string;
  videoTitle: string;
  videoFormat?: 'horizontal' | 'vertical';
  duration?: number;
}

export class VideoAnalytics {
  private reportedMilestones = new Set<number>();
  private watchSeconds = 0;
  private watchTimer: number | null = null;
  private isStarted = false;
  private meta: VideoMeta;

  constructor(meta: VideoMeta) {
    this.meta = meta;
  }

  public onPlay(): void {
    if (!this.isStarted) {
      this.isStarted = true;
      trackEvent('video_start', {
        video_id: this.meta.videoId || 'unknown',
        video_title: this.meta.videoTitle,
        video_format: this.meta.videoFormat || 'unknown',
        duration_seconds: Math.round(this.meta.duration || 0),
      });
    }

    if (this.watchTimer === null) {
      this.watchTimer = window.setInterval(() => {
        this.watchSeconds += 1;
      }, 1000);
    }
  }

  public onTimeUpdate(currentTime: number, duration: number): void {
    if (!duration || isNaN(duration)) return;
    const progress = (currentTime / duration) * 100;
    const milestones = [25, 50, 75];

    for (const milestone of milestones) {
      if (progress >= milestone && !this.reportedMilestones.has(milestone)) {
        this.reportedMilestones.add(milestone);
        trackEvent('video_progress', {
          video_id: this.meta.videoId || 'unknown',
          video_title: this.meta.videoTitle,
          milestone: `${milestone}%`,
          progress_percent: milestone,
          current_time_seconds: Math.round(currentTime),
        });
      }
    }
  }

  public onPause(): void {
    this.stopWatchTimer();
    this.flushWatchTime();
  }

  public onEnded(): void {
    this.stopWatchTimer();
    trackEvent('video_complete', {
      video_id: this.meta.videoId || 'unknown',
      video_title: this.meta.videoTitle,
      total_duration_seconds: Math.round(this.meta.duration || 0),
      total_watched_seconds: this.watchSeconds,
    });
  }

  public flushWatchTime(): void {
    if (this.watchSeconds >= 2) {
      trackEvent('video_watch_time', {
        video_id: this.meta.videoId || 'unknown',
        video_title: this.meta.videoTitle,
        watch_time_seconds: this.watchSeconds,
        duration_seconds: Math.round(this.meta.duration || 0),
      });
    }
  }

  public cleanup(): void {
    this.stopWatchTimer();
    this.flushWatchTime();
  }

  private stopWatchTimer(): void {
    if (this.watchTimer !== null) {
      clearInterval(this.watchTimer);
      this.watchTimer = null;
    }
  }
}

// -------------------------------------------------------------
// Interactive Flipbook Analytics
// -------------------------------------------------------------
export function trackFlipbookOpen(title: string, totalPages: number): void {
  trackEvent('flipbook_open', {
    book_title: title,
    total_pages: totalPages,
  });
}

export function trackFlipbookProgress(title: string, pageNum: number, totalPages: number): void {
  const isComplete = pageNum >= totalPages;
  trackEvent('flipbook_page_turn', {
    book_title: title,
    page_number: pageNum,
    total_pages: totalPages,
    is_complete: isComplete,
  });
  if (isComplete) {
    trackEvent('flipbook_read_complete', {
      book_title: title,
      total_pages: totalPages,
    });
  }
}

// -------------------------------------------------------------
// High-Intent Conversion Triggers
// -------------------------------------------------------------
export function trackContactInquiry(channel: 'whatsapp' | 'email' | 'brief', location: string): void {
  trackEvent('contact_inquiry_click', {
    channel,
    location,
  });
}

export function trackEmailCopied(email: string): void {
  trackEvent('contact_email_copied', {
    email_address: email,
  });
}

export function trackStoreBuy(title: string, price: string, checkoutUrl?: string): void {
  trackEvent('store_buy_click', {
    product_title: title,
    price,
    checkout_url: checkoutUrl || 'unknown',
  });
}

export function trackStoreShare(title: string): void {
  trackEvent('store_share_click', {
    product_title: title,
  });
}

export function trackYouTubePlay(id: string, title: string, channel: string, views: string): void {
  trackEvent('youtube_play_click', {
    youtube_id: id,
    episode_title: title,
    channel_name: channel,
    published_views: views,
  });
}

export function trackAvatarModalOpen(): void {
  trackEvent('avatar_modal_open', {
    source: 'navigation_button',
  });
}

// -------------------------------------------------------------
// Global Initializer for Astro ClientRouter
// -------------------------------------------------------------
let isInitialLoad = true;

export function initAnalytics(): void {
  if (typeof window === 'undefined') return;

  // Flush previous tracker if route just switched
  if (activeTracker) {
    activeTracker.flushAndStop();
    activeTracker = null;
  }

  // 1. Capture & persist UTM params
  captureAndPersistUtm();

  // 2. Track virtual page_view on client-side route transitions (prevents duplicate on initial load)
  if (!isInitialLoad) {
    trackEvent('page_view', {
      page_location: window.location.href,
      page_path: window.location.pathname,
      page_title: document.title,
    });
  } else {
    isInitialLoad = false;
  }

  // 3. Start page attention & scroll depth tracker
  activeTracker = new AttentionTracker();
  activeTracker.start();

  // 4. Delegate high-intent clicks across the DOM
  setupEventDelegation();
}

function setupEventDelegation(): void {
  // Use a singleton flag on document to prevent duplicated global click listeners
  if ((document as any)._zaynfolioAnalyticsDelegated) return;
  (document as any)._zaynfolioAnalyticsDelegated = true;

  document.addEventListener('click', (event) => {
    const target = event.target as HTMLElement | null;
    if (!target) return;

    // Contact WhatsApp
    const waLink = target.closest('a[href*="wa.me"]');
    if (waLink) {
      trackContactInquiry('whatsapp', 'contact_card');
      return;
    }

    // Contact Email Click (mailto:)
    const mailtoLink = target.closest('a[href^="mailto:"]');
    if (mailtoLink) {
      trackContactInquiry('email', 'contact_card');
      return;
    }

    // Contact Brief Template
    const briefLink = target.closest('#contact-brief-btn, a[href*="brief"]');
    if (briefLink && window.location.pathname.includes('/contact')) {
      trackContactInquiry('brief', 'contact_card');
      return;
    }

    // Email Copy Button
    const copyEmailBtn = target.closest('#copy-email-btn');
    if (copyEmailBtn) {
      trackEmailCopied('contact@zaynfolio.com');
      return;
    }

    // Avatar Details Button
    const avatarDetailsBtn = target.closest('#nav-avatar-details-btn');
    if (avatarDetailsBtn) {
      trackAvatarModalOpen();
      return;
    }

    // Store Buy Button
    const buyBtn = target.closest('#product-buy-btn') as HTMLElement | null;
    if (buyBtn) {
      const title = buyBtn.dataset.title || 'Unknown Product';
      const price = buyBtn.dataset.price || 'Free';
      const checkoutUrl = buyBtn.dataset.checkoutLink || '';
      trackStoreBuy(title, price, checkoutUrl);
      return;
    }

    // Store Share Button
    const shareBtn = target.closest('#product-share-btn') as HTMLElement | null;
    if (shareBtn) {
      const title = shareBtn.dataset.title || 'Unknown Product';
      trackStoreShare(title);
      return;
    }
  });

  // Flush attention time before route changes or tab closure
  document.addEventListener('astro:before-swap', () => {
    if (activeTracker) {
      activeTracker.flushAndStop();
      activeTracker = null;
    }
  });

  window.addEventListener('pagehide', () => {
    if (activeTracker) {
      activeTracker.flushAndStop();
      activeTracker = null;
    }
  });
}
