// src/components/ui/Collapsible/Collapsible.tsx
"use client";

import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown } from "@awesome.me/kit-0e07a43543/icons/duotone/light";
import { cn } from "@/lib/utils/cn";

interface CollapsibleProps {
  id: string;
  label: string;
  content: string | null;
  containerClass?: string;
  labelClass?: string;
  contentClass?: string;
  defaultOpen?: boolean;
}

/**
 * Collapsible Component
 *
 * Features:
 * - Smooth expand/collapse animation
 * - Accessible with ARIA attributes
 * - Mobile-optimized
 * - Configurable initial state
 */
export function Collapsible({
  id,
  label,
  content,
  containerClass,
  labelClass,
  contentClass,
  defaultOpen = false,
}: CollapsibleProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  if (!content) return null;

  return (
    <div className={cn("w-full", containerClass)}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center justify-between w-full text-left",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary",
          labelClass
        )}
        aria-expanded={isOpen}
        aria-controls={id}
      >
        <span className="underline">{label}</span>
        <FontAwesomeIcon
          icon={faChevronDown}
          className={cn(
            "w-5 h-5 transition-transform duration-200",
            isOpen && "rotate-180"
          )}
        />
      </button>

      <div
        id={id}
        className={cn(
          "overflow-hidden transition-all duration-300",
          isOpen ? "max-h-96 mt-2" : "max-h-0"
        )}
      >
        <div
          className={cn("text-sm text-gray-600", contentClass)}
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </div>
    </div>
  );
}
