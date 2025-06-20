// src/components/widgets/ProsConsWidget/ProsConsWidget.tsx
"use client";

import { cn } from "@/lib/utils/cn";
import type { StrapiImage } from "@/types/strapi.types";

// Support both game page and casino page formats
interface ProsConsWidgetProps {
  proscons: {
    id?: number;
    heading?: string;
    pros?: Array<string | { id?: number; list: string }>;
    cons?: Array<string | { id?: number; list: string }>;
    proImage?: StrapiImage;
    conImage?: StrapiImage;
  };
  className?: string;
}

/**
 * ProsConsWidget Component
 *
 * Displays pros and cons in a two-column layout
 * Features:
 * - Clean visual separation between pros and cons
 * - Responsive grid layout
 * - Color-coded sections
 * - Handles both string and object formats (for compatibility with both game and casino pages)
 */
export function ProsConsWidget({ proscons, className }: ProsConsWidgetProps) {
  if (!proscons || (!proscons.pros?.length && !proscons.cons?.length)) {
    return null;
  }

  // Helper function to get the text from either string or object format
  const getItemText = (
    item: string | { id?: number; list: string }
  ): string => {
    if (typeof item === "string") {
      return item;
    }
    return item.list;
  };

  return (
    <section
      className={cn(
        "opacity-0 animate-[fadeIn_0.6s_ease-out_500ms_forwards]",
        className
      )}
      style={{ animationDelay: "500ms" }}
    >
      {proscons.heading && (
        <h2 className="text-2xl md:text-3xl font-bold text-heading-text text-center mb-6">
          {proscons.heading}
        </h2>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {/* Pros */}
        {proscons.pros && proscons.pros.length > 0 && (
          <div className="bg-green-50 rounded-lg p-6">
            <h3 className="text-xl font-bold text-green-800 mb-4 flex items-center">
              <svg
                className="w-6 h-6 mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              Pros
            </h3>
            <ul className="space-y-3">
              {proscons.pros.map((pro, index) => (
                <li key={index} className="flex items-start text-green-700">
                  <span className="mr-2 mt-1 flex-shrink-0">•</span>
                  <span>{getItemText(pro)}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Cons */}
        {proscons.cons && proscons.cons.length > 0 && (
          <div className="bg-red-50 rounded-lg p-6">
            <h3 className="text-xl font-bold text-red-800 mb-4 flex items-center">
              <svg
                className="w-6 h-6 mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              Cons
            </h3>
            <ul className="space-y-3">
              {proscons.cons.map((con, index) => (
                <li key={index} className="flex items-start text-red-700">
                  <span className="mr-2 mt-1 flex-shrink-0">•</span>
                  <span>{getItemText(con)}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}
