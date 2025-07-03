// src/components/common/Portal/FullscreenPortal.tsx
"use client";

import { useEffect } from "react";
import { Portal } from "./Portal";

interface FullscreenPortalProps {
  children: React.ReactNode;
  isOpen: boolean;
  onClose?: () => void;
  className?: string;
}

/**
 * FullscreenPortal Component
 *
 * Renders children in a fullscreen portal that appears above everything.
 * Perfect for iOS fullscreen without hiding components or CSS shenanigans.
 */
export function FullscreenPortal({
  children,
  isOpen,
  onClose,
  className = "",
}: FullscreenPortalProps) {
  // Handle escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && onClose) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  // Lock body scroll when fullscreen is active
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";

      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <Portal>
      <div
        className={`fixed inset-0 z-[10000] bg-black ${className}`}
        style={{
          width: "100vw",
          height: "100vh",
          // Ensure it covers everything on iOS
          WebkitTransform: "translate3d(0, 0, 0)",
          transform: "translate3d(0, 0, 0)",
        }}
      >
        {children}
      </div>
    </Portal>
  );
}

export default FullscreenPortal;
