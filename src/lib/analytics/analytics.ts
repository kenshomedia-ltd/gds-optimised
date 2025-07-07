// src/lib/analytics/analytics.ts

// Type declarations for the global gtag function
declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

// Google Analytics measurement ID exposed at build time
const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || '';

/**
 * Analytics utility for Google Analytics integration
 */
export class Analytics {
  private isClient = typeof window !== 'undefined';

  /**
   * Check if gtag is loaded and available
   */
  private isGtagAvailable(): boolean {
    return this.isClient && typeof window.gtag !== 'undefined';
  }

  /**
   * Track a page view
   */
  trackPageView(
    path?: string,
    metadata?: Record<string, string | number | boolean | null>
  ) {
    if (!this.isGtagAvailable() || !GA_MEASUREMENT_ID) return;

    try {
      window.gtag?.('config', GA_MEASUREMENT_ID, {
        page_path: path,
        ...metadata,
      });
    } catch (error) {
      console.warn('Failed to track page view:', error);
    }
  }

  /**
   * Track a custom event
   */
  trackEvent(
    eventName: string,
    metadata?: Record<string, string | number | boolean | null>
  ) {
    if (!this.isGtagAvailable()) return;

    try {
      window.gtag?.('event', eventName, metadata || {});
    } catch (error) {
      console.warn('Failed to track event:', error);
    }
  }

  /**
   * Track casino review view
   */
  trackCasinoReview(casinoName: string, casinoId: string | number) {
    this.trackEvent('casino_review_view', {
      casino_name: casinoName,
      casino_id: casinoId.toString(),
    });
  }

  /**
   * Track game interaction
   */
  trackGameInteraction(
    gameId: string | number,
    gameName: string,
    action: string
  ) {
    this.trackEvent('game_interaction', {
      game_id: gameId.toString(),
      game_name: gameName,
      action,
    });
  }

  /**
   * Track search usage
   */
  trackSearch(query: string, resultsCount: number) {
    this.trackEvent('search', {
      query,
      results_count: resultsCount,
    });
  }

  /**
   * Track bonus claim
   */
  trackBonusClaim(casinoName: string, bonusType: string) {
    this.trackEvent('bonus_claim', {
      casino_name: casinoName,
      bonus_type: bonusType,
    });
  }
}

// Create singleton instance
export const analytics = new Analytics();

// React hook for analytics (optional)
export function useAnalytics() {
  return analytics;
}
