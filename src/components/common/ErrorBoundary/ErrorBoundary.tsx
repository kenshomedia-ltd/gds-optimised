// src/components/common/ErrorBoundary/ErrorBoundary.tsx
"use client";

import { useEffect } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils/cn";
import { ErrorBoundary as ReactErrorBoundary } from "react-error-boundary";

// Helper to detect ChunkLoadError cases
function isChunkLoadError(error: unknown): boolean {
  if (!error) return false;
  const err = error as { name?: string; message?: string };
  return (
    err.name === "ChunkLoadError" ||
    (typeof err.message === "string" &&
      /Loading chunk [\w-]+ failed/.test(err.message))
  );
}

// Define the interface that react-error-boundary expects
interface FallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

interface ErrorBoundaryProps {
  error: Error & { digest?: string };
  reset: () => void;
  className?: string;
}

/**
 * ErrorBoundary Component (for Next.js error.tsx files)
 *
 * Features:
 * - User-friendly error display
 * - Reset functionality
 * - Error logging in development
 * - Accessible error messages
 * - Responsive design
 */
export function ErrorBoundary({ error, reset, className }: ErrorBoundaryProps) {
  useEffect(() => {
    // Log the error to an error reporting service
    if (process.env.NODE_ENV === "production") {
      // You can integrate with services like Sentry, LogRocket, etc.
      console.error("Error boundary caught:", error);
    }
  }, [error]);

  return (
    <div
      className={cn(
        "min-h-[50vh] flex items-center justify-center p-4",
        className
      )}
      role="alert"
      aria-live="assertive"
    >
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-lg p-6 text-center">
          {/* Error Icon */}
          <div className="w-16 h-16 mx-auto mb-4 text-red-500">
            <svg
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              className="w-full h-full"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>

          {/* Error Message */}
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Oops! Something went wrong
          </h2>

          <p className="text-gray-600 mb-6">
            We&apos;re sorry, but something unexpected happened. Please try
            again.
          </p>

          {/* Development Error Details */}
          {process.env.NODE_ENV === "development" && (
            <details className="mb-6 text-left">
              <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                Error details (development only)
              </summary>
              <pre className="mt-2 p-3 bg-gray-100 rounded text-xs overflow-auto">
                {error.message}
                {error.stack && (
                  <>
                    {"\n\n"}
                    {error.stack}
                  </>
                )}
              </pre>
            </details>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 justify-center">
            <button
              onClick={reset}
              className={cn(
                "px-6 py-2 rounded-lg font-medium",
                "bg-blue-600 text-white",
                "hover:bg-blue-700",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2",
                "transition-colors"
              )}
            >
              Try Again
            </button>

            <Link
              href="/it/"
              className={cn(
                "inline-block px-6 py-2 rounded-lg font-medium",
                "bg-gray-200 text-gray-900",
                "hover:bg-gray-300",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2",
                "transition-colors"
              )}
            >
              Go Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Fallback component that matches react-error-boundary's FallbackProps interface
 */
export function ErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  useEffect(() => {
    // Log the error to an error reporting service
    if (process.env.NODE_ENV === "production") {
      // You can integrate with services like Sentry, LogRocket, etc.
      console.error("Error boundary caught:", error);
    }
  }, [error]);

  return (
    <div
      className="min-h-[50vh] flex items-center justify-center p-4"
      role="alert"
      aria-live="assertive"
    >
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-lg p-6 text-center">
          {/* Error Icon */}
          <div className="w-16 h-16 mx-auto mb-4 text-red-500">
            <svg
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              className="w-full h-full"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>

          {/* Error Message */}
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Oops! Something went wrong
          </h2>

          <p className="text-gray-600 mb-6">
            We&apos;re sorry, but something unexpected happened. Please try
            again.
          </p>

          {/* Development Error Details */}
          {process.env.NODE_ENV === "development" && (
            <details className="mb-6 text-left">
              <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                Error details (development only)
              </summary>
              <pre className="mt-2 p-3 bg-gray-100 rounded text-xs overflow-auto">
                {error.message}
                {error.stack && (
                  <>
                    {"\n\n"}
                    {error.stack}
                  </>
                )}
              </pre>
            </details>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 justify-center">
            <button
              onClick={resetErrorBoundary}
              className={cn(
                "px-6 py-2 rounded-lg font-medium",
                "bg-blue-600 text-white",
                "hover:bg-blue-700",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2",
                "transition-colors"
              )}
            >
              Try Again
            </button>

            <Link
              href="/it/"
              className={cn(
                "inline-block px-6 py-2 rounded-lg font-medium",
                "bg-gray-200 text-gray-900",
                "hover:bg-gray-300",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2",
                "transition-colors"
              )}
            >
              Go Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Global Error Boundary for root layout (for global-error.tsx)
 */
export function GlobalErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50">
        <ErrorBoundary error={error} reset={reset} />
      </body>
    </html>
  );
}

/**
 * Wrapper component that provides react-error-boundary functionality
 * Use this in your layout.tsx instead of the direct ErrorBoundary
 */
export function ClientErrorBoundary({
  children,
}: {
  children: React.ReactNode;
}) {
  const handleError = (error: Error, errorInfo: React.ErrorInfo) => {
    if (isChunkLoadError(error)) {
      const retried = sessionStorage.getItem("chunk-load-error-retried");
      if (!retried) {
        sessionStorage.setItem("chunk-load-error-retried", "true");
        window.location.reload();
        return;
      } else {
        sessionStorage.removeItem("chunk-load-error-retried");
      }
    }

    console.error("Error boundary caught error:", error, errorInfo);
    // Optional: Send to error reporting service
    // Example: Sentry.captureException(error, { contexts: { errorInfo } });
  };

  return (
    <ReactErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={handleError}
      onReset={() => {
        // Optional: Clear any error state or reload the page
        window.location.reload();
      }}
    >
      {children}
    </ReactErrorBoundary>
  );
}
