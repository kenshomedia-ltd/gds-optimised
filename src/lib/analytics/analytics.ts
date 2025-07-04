// src/lib/analytics.ts

// Inline type declarations for Swetrix
declare global {
  interface Window {
    swetrix?: {
      init(projectId: string, options?: Record<string, unknown>): void;
      trackViews(): void;
      pageview(options?: { payload?: Record<string, unknown> }): void;
      track(
        event: string,
        options?: { payload?: Record<string, unknown> }
      ): void;
      trackErrors(options?: Record<string, unknown>): void;
    };
  }
}

/**
 * Analytics utility for Swetrix integration
 */
export class Analytics {
  private isClient = typeof window !== "undefined";

  /**
   * Check if Swetrix is loaded and available
   */
  private isSwetrixAvailable(): boolean {
    return this.isClient && typeof window.swetrix !== "undefined";
  }

  /**
   * Track a custom page view
   */
  trackPageView(
    path?: string,
    metadata?: Record<string, string | number | boolean | null>
  ) {
    if (!this.isSwetrixAvailable()) return;

    try {
      window.swetrix?.pageview({
        payload: {
          pg: path,
          meta: metadata,
        },
      });
    } catch (error) {
      console.warn("Failed to track page view:", error);
    }
  }

  /**
   * Track a custom event
   */
  trackEvent(
    eventName: string,
    metadata?: Record<string, string | number | boolean | null>
  ) {
    if (!this.isSwetrixAvailable()) return;

    try {
      window.swetrix?.track(eventName, {
        payload: {
          ev: eventName,
          meta: metadata,
        },
      });
    } catch (error) {
      console.warn("Failed to track event:", error);
    }
  }

  /**
   * Track casino review view
   */
  trackCasinoReview(casinoName: string, casinoId: string | number) {
    this.trackEvent("casino_review_view", {
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
    this.trackEvent("game_interaction", {
      game_id: gameId.toString(),
      game_name: gameName,
      action,
    });
  }

  /**
   * Track search usage
   */
  trackSearch(query: string, resultsCount: number) {
    this.trackEvent("search", {
      query,
      results_count: resultsCount,
    });
  }

  /**
   * Track bonus claim
   */
  trackBonusClaim(casinoName: string, bonusType: string) {
    this.trackEvent("bonus_claim", {
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
