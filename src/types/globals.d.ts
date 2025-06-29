// src/types/globals.d.ts
export {};

declare global {
  interface Document {
    webkitFullscreenElement?: Element;
    webkitExitFullscreen?: () => Promise<void>;
  }

  interface HTMLDivElement {
    webkitRequestFullscreen?: () => Promise<void>;
  }
}
