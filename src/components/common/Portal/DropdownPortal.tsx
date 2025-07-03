// src/components/common/Portal/DropdownPortal.tsx
// Fixed version without infinite re-render loop

"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { Portal } from "./Portal";

interface DropdownPortalProps {
  children: React.ReactNode;
  isOpen: boolean;
  onClose: () => void;
  triggerRef: React.RefObject<
    HTMLElement | HTMLButtonElement | HTMLDivElement | null
  >;
  className?: string;
  offset?: number;
}

export function DropdownPortal({
  children,
  isOpen,
  onClose,
  triggerRef,
  className = "",
  offset = 4,
}: DropdownPortalProps) {
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0 });
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Memoize the update function to prevent infinite loops
  const updatePosition = useCallback(() => {
    if (!isOpen || !triggerRef.current) return;

    const triggerElement = triggerRef.current;
    const rect = triggerElement.getBoundingClientRect();

    // Ensure we have valid rect values
    if (rect.width === 0 || rect.height === 0) {
      console.warn("⚠️ Button has zero dimensions");
      return;
    }

    // Simple bottom-left positioning
    const scrollTop =
      window.pageYOffset || document.documentElement.scrollTop || 0;
    const scrollLeft =
      window.pageXOffset || document.documentElement.scrollLeft || 0;

    const newPosition = {
      top: rect.bottom + scrollTop + offset,
      left: rect.left + scrollLeft,
      width: rect.width,
    };

    console.log("✅ Setting position:", newPosition);
    setPosition(newPosition);
  }, [isOpen, offset]); // Removed triggerRef from dependencies to prevent loops

  // Update position when dropdown opens
  useEffect(() => {
    if (isOpen) {
      // Small delay to ensure button is rendered
      const timer = setTimeout(() => {
        updatePosition();
      }, 0);

      return () => clearTimeout(timer);
    }
  }, [isOpen, updatePosition]);

  // Handle scroll and resize
  useEffect(() => {
    if (!isOpen) return;

    const handleUpdate = () => updatePosition();

    window.addEventListener("scroll", handleUpdate, { passive: true });
    window.addEventListener("resize", handleUpdate, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleUpdate);
      window.removeEventListener("resize", handleUpdate);
    };
  }, [isOpen, updatePosition]);

  // Handle click outside and escape
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;

      if (
        !triggerRef.current?.contains(target) &&
        !dropdownRef.current?.contains(target)
      ) {
        onClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose, triggerRef]);

  if (!isOpen) return null;

  return (
    <Portal>
      <div
        ref={dropdownRef}
        className={`fixed z-[9999] ${className}`}
        style={{
          top: position.top,
          left: position.left,
          width: position.width,
        }}
      >
        {children}
      </div>
    </Portal>
  );
}

export default DropdownPortal;
