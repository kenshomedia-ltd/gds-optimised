// src/lib/utils/accessibility.ts

/**
 * Accessibility utility functions
 */

/**
 * Generate unique IDs for ARIA relationships
 */
export function generateId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Announce content to screen readers
 */
export function announce(
  message: string,
  priority: "polite" | "assertive" = "polite"
): void {
  const announcer = document.createElement("div");
  announcer.setAttribute("aria-live", priority);
  announcer.setAttribute("aria-atomic", "true");
  announcer.setAttribute("class", "sr-only");

  document.body.appendChild(announcer);
  announcer.textContent = message;

  setTimeout(() => {
    document.body.removeChild(announcer);
  }, 1000);
}

/**
 * Trap focus within an element
 */
export function trapFocus(element: HTMLElement): () => void {
  const focusableElements = element.querySelectorAll<HTMLElement>(
    'a[href], button, textarea, input[type="text"], input[type="radio"], input[type="checkbox"], select, [tabindex]:not([tabindex="-1"])'
  );

  const firstFocusableElement = focusableElements[0];
  const lastFocusableElement = focusableElements[focusableElements.length - 1];

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key !== "Tab") return;

    if (e.shiftKey) {
      if (document.activeElement === firstFocusableElement) {
        lastFocusableElement.focus();
        e.preventDefault();
      }
    } else {
      if (document.activeElement === lastFocusableElement) {
        firstFocusableElement.focus();
        e.preventDefault();
      }
    }
  };

  element.addEventListener("keydown", handleKeyDown);
  firstFocusableElement?.focus();

  return () => {
    element.removeEventListener("keydown", handleKeyDown);
  };
}

/**
 * Check if user prefers reduced motion
 */
export function prefersReducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Get contrast ratio between two colors
 */
export function getContrastRatio(color1: string, color2: string): number {
  // Convert hex to RGB
  const getRGB = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : null;
  };

  const getLuminance = (rgb: { r: number; g: number; b: number }) => {
    const [r, g, b] = [rgb.r, rgb.g, rgb.b].map((val) => {
      val = val / 255;
      return val <= 0.03928
        ? val / 12.92
        : Math.pow((val + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };

  const rgb1 = getRGB(color1);
  const rgb2 = getRGB(color2);

  if (!rgb1 || !rgb2) return 0;

  const lum1 = getLuminance(rgb1);
  const lum2 = getLuminance(rgb2);

  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);

  return (brightest + 0.05) / (darkest + 0.05);
}

/**
 * Skip to main content link component
 */
export const SkipToContent = () => `
  <a 
    href="#main-content" 
    class="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-white focus:rounded"
  >
    Skip to main content
  </a>
`;
