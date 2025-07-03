// src/components/common/Portal/Portal.tsx
"use client";

import { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";

interface PortalProps {
  children: React.ReactNode;
  containerId?: string;
  className?: string;
}

/**
 * Portal Component
 *
 * Renders children outside the normal component tree to avoid z-index stacking issues.
 * Handles SSR properly and ensures clean DOM management.
 *
 * @param children - React nodes to render in the portal
 * @param containerId - ID of the container element (defaults to "portal-root")
 * @param className - Optional CSS classes to apply to the portal container
 */
export function Portal({
  children,
  containerId = "portal-root",
  className = "",
}: PortalProps) {
  const [mounted, setMounted] = useState(false);
  const [container, setContainer] = useState<HTMLElement | null>(null);
  const containerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    // Find existing container or create new one
    let portalContainer = document.getElementById(containerId);

    if (!portalContainer) {
      portalContainer = document.createElement("div");
      portalContainer.id = containerId;

      // Add default styles to ensure proper stacking
      portalContainer.style.position = "relative";
      portalContainer.style.zIndex = "9999";

      // Add custom className if provided
      if (className) {
        portalContainer.className = className;
      }

      document.body.appendChild(portalContainer);
    } else if (className && !portalContainer.className.includes(className)) {
      // Add className to existing container if not already present
      portalContainer.className =
        `${portalContainer.className} ${className}`.trim();
    }

    containerRef.current = portalContainer;
    setContainer(portalContainer);
    setMounted(true);

    // Cleanup function
    return () => {
      setMounted(false);

      // Only remove the container if we created it and it's empty
      if (
        containerRef.current &&
        containerRef.current.id === containerId &&
        containerRef.current.children.length === 0 &&
        containerRef.current.parentNode
      ) {
        containerRef.current.parentNode.removeChild(containerRef.current);
      }
    };
  }, [containerId, className]);

  // Don't render anything during SSR or before mount
  if (!mounted || !container) {
    return null;
  }

  return createPortal(children, container);
}

export default Portal;
