// src/components/common/ChunkLoadErrorHandler.tsx
"use client";

import { useEffect } from "react";

// Utility to detect if an error relates to failing to load a chunk
function isChunkLoadError(error: unknown): boolean {
  if (!error) return false;
  const err = error as { name?: string; message?: string };
  return (
    err.name === "ChunkLoadError" ||
    (typeof err.message === "string" &&
      /Loading chunk [\w-]+ failed/.test(err.message))
  );
}

export function ChunkLoadErrorHandler() {
  useEffect(() => {
    const handleChunkLoadError = (event: PromiseRejectionEvent) => {
      const error = event.reason;

      if (isChunkLoadError(error)) {
        const retried = sessionStorage.getItem("chunk-load-error-retried");
        if (!retried) {
          sessionStorage.setItem("chunk-load-error-retried", "true");
          window.location.reload();
        } else {
          sessionStorage.removeItem("chunk-load-error-retried");
        }
      }
    };

    window.addEventListener("unhandledrejection", handleChunkLoadError);

    // Cleanup the event listener on component unmount
    return () => {
      window.removeEventListener("unhandledrejection", handleChunkLoadError);
    };
  }, []);

  return null; // This component does not render anything
}
