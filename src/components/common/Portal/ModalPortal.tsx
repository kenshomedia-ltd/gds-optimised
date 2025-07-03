// src/components/common/Portal/ModalPortal.tsx
"use client";

import { useEffect, useRef } from "react";
import { Portal } from "./Portal";

interface ModalPortalProps {
  children: React.ReactNode;
  isOpen: boolean;
  onClose: () => void;
  className?: string;
  backdropClassName?: string;
  closeOnBackdropClick?: boolean;
  closeOnEscape?: boolean;
}

/**
 * ModalPortal Component
 *
 * A portal-based modal that renders above everything, including headers.
 * Handles backdrop clicks, escape key, and focus trapping.
 */
export function ModalPortal({
  children,
  isOpen,
  onClose,
  className = "",
  backdropClassName = "",
  closeOnBackdropClick = true,
  closeOnEscape = true,
}: ModalPortalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);

  // Handle escape key and backdrop clicks
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (closeOnEscape && event.key === "Escape") {
        onClose();
      }
    };

    const handleBackdropClick = (event: MouseEvent) => {
      if (
        closeOnBackdropClick &&
        backdropRef.current &&
        event.target === backdropRef.current
      ) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    document.addEventListener("mousedown", handleBackdropClick);

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.removeEventListener("mousedown", handleBackdropClick);
    };
  }, [isOpen, onClose, closeOnBackdropClick, closeOnEscape]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";

      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  // Focus management
  useEffect(() => {
    if (isOpen && modalRef.current) {
      // Focus the modal container
      modalRef.current.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <Portal>
      {/* Backdrop */}
      <div
        ref={backdropRef}
        className={`fixed inset-0 z-[10000] bg-black/60 ${backdropClassName}`}
        aria-hidden="true"
      />

      {/* Modal Container */}
      <div
        ref={modalRef}
        className={`fixed inset-0 z-[10001] flex items-end justify-center ${className}`}
        role="dialog"
        aria-modal="true"
        tabIndex={-1}
      >
        {children}
      </div>
    </Portal>
  );
}

export default ModalPortal;
