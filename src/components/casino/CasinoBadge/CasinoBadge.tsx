// src/components/casino/CasinoBadge/CasinoBadge.tsx
"use client";

import { cn } from "@/lib/utils/cn";

interface CasinoBadgeProps {
  text: string;
  type: "exclusive" | "new";
  className?: string;
}

/**
 * CasinoBadge Component
 *
 * Features:
 * - Different styles for exclusive and new badges
 * - Rotated positioning for corner placement
 * - Consistent with design system
 */
export function CasinoBadge({ text, type, className }: CasinoBadgeProps) {
  const badgeClasses = {
    exclusive: "exclusive-badge",
    new: "new-casino-badge",
  };

  return (
    <span
      className={cn(
        "z-10 rotate-45 absolute",
        "text-white text-xs px-[36.4px] uppercase",
        "top-[25px] -right-[40px]",
        badgeClasses[type],
        className
      )}
    >
      {text}
    </span>
  );
}
