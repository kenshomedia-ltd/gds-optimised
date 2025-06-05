// src/components/common/BackToTop/BackToTop.tsx
"use client";

import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowUp } from "@awesome.me/kit-0e07a43543/icons/duotone/light";

/**
 * BackToTop Component
 *
 * Features:
 * - Shows after scrolling 300px
 * - Smooth scroll animation
 * - Throttled scroll detection
 * - Accessible with keyboard
 */
export function BackToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    let scrollTimeout: number;

    const toggleVisibility = () => {
      const shouldShow = window.scrollY > 300;
      if (shouldShow !== isVisible) {
        setIsVisible(shouldShow);
      }
    };

    const handleScroll = () => {
      if (!scrollTimeout) {
        scrollTimeout = requestAnimationFrame(() => {
          toggleVisibility();
          scrollTimeout = 0;
        }) as unknown as number;
      }
    };

    // Initial check
    toggleVisibility();

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (scrollTimeout) {
        cancelAnimationFrame(scrollTimeout);
      }
    };
  }, [isVisible]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <button
      onClick={scrollToTop}
      className={`
        fixed bottom-4 right-4 z-40 w-12 h-12
        bg-primary text-white rounded-full shadow-lg
        transition-all duration-300 hover:shadow-xl hover:scale-110
        focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2
        ${
          isVisible
            ? "opacity-100 visible translate-y-0"
            : "opacity-0 invisible translate-y-2"
        }
      `}
      aria-label="Back to top"
    >
      <FontAwesomeIcon icon={faArrowUp} className="h-6 w-6 mx-auto" />
    </button>
  );
}
