// src/components/ui/Skeleton/Skeleton.tsx
"use client";

import { cn } from "@/lib/utils/cn";

interface SkeletonProps {
  className?: string;
  children?: React.ReactNode;
}

/**
 * Skeleton Component
 *
 * A loading placeholder component with pulse animation
 */
export function Skeleton({ className, children }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-gray-200 dark:bg-gray-700",
        className
      )}
      aria-label="Loading..."
    >
      {children}
    </div>
  );
}

/**
 * SkeletonText Component
 *
 * For text-specific loading states
 */
export function SkeletonText({
  lines = 3,
  className,
}: {
  lines?: number;
  className?: string;
}) {
  return (
    <div className={cn("space-y-2", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} className={cn("h-4", i === lines - 1 && "w-3/4")} />
      ))}
    </div>
  );
}
