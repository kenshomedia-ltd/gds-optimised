// src/components/common/ChunkLoadErrorHandler.tsx
"use client";

import { useEffect } from "react";

export function ChunkLoadErrorHandler() {
  useEffect(() => {
    const handleChunkLoadError = (event: PromiseRejectionEvent) => {
      // The 'reason' property is often an Error object
      const error = event.reason;

      // Check if it's a ChunkLoadError
      if (error && error.name === "ChunkLoadError") {
        // Reload the page to get the latest version
        window.location.reload();
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
