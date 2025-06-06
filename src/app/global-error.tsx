// src/app/global-error.tsx
"use client";

import { GlobalErrorBoundary } from "@/components/common/ErrorBoundary/ErrorBoundary";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <GlobalErrorBoundary error={error} reset={reset} />;
}
