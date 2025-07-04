// src/types/swetrix.d.ts

interface SwetrixPageviewPayload {
  pg?: string;
  lc?: string;
  meta?: Record<string, string | number | boolean | null>;
}

interface SwetrixEventPayload {
  ev: string;
  unique?: boolean;
  meta?: Record<string, string | number | boolean | null>;
}

interface SwetrixErrorTrackingOptions {
  sampleRate?: number;
  callback?: (error: Error) => Record<string, string | number | boolean | null>;
}

interface SwetrixOptions {
  apiUrl?: string;
  trackViews?: boolean;
  dev?: boolean;
  debug?: boolean;
  respectDNT?: boolean;
  ignoreHash?: boolean;
  heartbeatOnBackground?: boolean;
}

interface SwetrixInstance {
  init(projectId: string, options?: SwetrixOptions): void;
  trackViews(): void;
  pageview(options?: { payload?: SwetrixPageviewPayload }): void;
  track(event: string, options?: { payload?: SwetrixEventPayload }): void;
  trackErrors(options?: SwetrixErrorTrackingOptions): void;
}

declare global {
  interface Window {
    swetrix: SwetrixInstance;
  }

  const swetrix: SwetrixInstance;
}
