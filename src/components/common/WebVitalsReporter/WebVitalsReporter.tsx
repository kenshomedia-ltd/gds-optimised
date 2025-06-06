// src/components/common/WebVitalsReporter/WebVitalsReporter.tsx
"use client";

import { useEffect } from "react";
import { onCLS, onFID, onFCP, onLCP, onTTFB, onINP } from "web-vitals";

interface WebVitalsMetric {
  name: string;
  value: number;
  rating: "good" | "needs-improvement" | "poor";
  delta: number;
  id: string;
}

/**
 * WebVitalsReporter Component
 *
 * Features:
 * - Reports Core Web Vitals metrics
 * - Can send to analytics endpoint
 * - Development mode console logging
 * - Performance budget alerts
 */
export function WebVitalsReporter() {
  useEffect(() => {
    const reportWebVital = (metric: WebVitalsMetric) => {
      // Performance budgets
      const budgets = {
        CLS: { good: 0.1, poor: 0.25 },
        FID: { good: 100, poor: 300 },
        FCP: { good: 1800, poor: 3000 },
        LCP: { good: 2500, poor: 4000 },
        TTFB: { good: 800, poor: 1800 },
        INP: { good: 200, poor: 500 },
      };

      const budget = budgets[metric.name as keyof typeof budgets];

      // Determine rating
      let rating: "good" | "needs-improvement" | "poor";
      if (metric.value <= budget.good) {
        rating = "good";
      } else if (metric.value <= budget.poor) {
        rating = "needs-improvement";
      } else {
        rating = "poor";
      }

      const reportData = {
        ...metric,
        rating,
        timestamp: Date.now(),
        url: window.location.href,
        userAgent: navigator.userAgent,
        connection: (navigator as any).connection?.effectiveType || "unknown",
      };

      // Log in development
      if (process.env.NODE_ENV === "development") {
        console.log(`[Web Vitals] ${metric.name}:`, {
          value: metric.value,
          rating,
          delta: metric.delta,
        });
      }

      // Send to analytics endpoint
      if (process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT) {
        fetch(process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(reportData),
        }).catch((error) => {
          console.error("Failed to report web vital:", error);
        });
      }

      // Alert on poor performance
      if (rating === "poor" && process.env.NODE_ENV === "development") {
        console.warn(
          `⚠️ Poor ${metric.name} detected: ${metric.value}ms (threshold: ${budget.poor}ms)`
        );
      }
    };

    // Register all metrics
    onCLS(reportWebVital);
    onFID(reportWebVital);
    onFCP(reportWebVital);
    onLCP(reportWebVital);
    onTTFB(reportWebVital);
    onINP(reportWebVital);
  }, []);

  return null;
}
