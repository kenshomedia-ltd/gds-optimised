// src/components/ui/StarRating/StarRatingProgressive.tsx
"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { StarRatingServer } from "./StarRatingServer";
import type { ComponentProps } from "react";

// Lazy load the interactive component
const StarRatingClient = dynamic(
  () => import("./StarRating").then((mod) => ({ default: mod.StarRating })),
  {
    ssr: false,
    loading: () => null, // Don't show loading state, server version is already visible
  }
);

type StarRatingProps = ComponentProps<typeof StarRatingClient>;

/**
 * StarRatingProgressive Component
 *
 * Progressive enhancement wrapper that:
 * 1. Renders server-side version immediately
 * 2. Hydrates with interactive version when JS loads
 * 3. Works without JavaScript
 */
export function StarRatingProgressive(props: StarRatingProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // For readonly mode, always use server version for better performance
  if (props.readonly) {
    return (
      <StarRatingServer
        rating={props.initialRating || 0}
        maxRating={props.maxRating}
        size={props.size}
        showValue={props.showValue}
        className={props.className}
      />
    );
  }

  // For interactive mode, show server version first, then hydrate
  if (!isClient) {
    return (
      <StarRatingServer
        rating={props.initialRating || 0}
        maxRating={props.maxRating}
        size={props.size}
        showValue={props.showValue}
        className={props.className}
      />
    );
  }

  return <StarRatingClient {...props} />;
}
