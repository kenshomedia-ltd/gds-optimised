// Fixed DropdownPortal - Uses viewport positioning instead of document positioning

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

  const latestTriggerRef = useRef(triggerRef);
  latestTriggerRef.current = triggerRef;

  const updatePosition = useCallback(() => {
    if (!isOpen || !latestTriggerRef.current?.current) {
      return;
    }

    const triggerElement = latestTriggerRef.current.current;
    const rect = triggerElement.getBoundingClientRect();

    if (rect.width === 0 || rect.height === 0) {
      console.warn("⚠️ Button has zero dimensions");
      return;
    }

    // SOLUTION: Use viewport positioning (don't add scroll offset)
    // This makes the dropdown move with the button as user scrolls
    const newPosition = {
      top: rect.bottom + offset, // No scroll offset added!
      left: rect.left, // No scroll offset added!
      width: rect.width,
    };

    setPosition(newPosition);
  }, [isOpen, offset]);

  // Update position when dropdown opens
  useEffect(() => {
    if (isOpen) {
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
        !latestTriggerRef.current?.current?.contains(target) &&
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
  }, [isOpen, onClose]);

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
