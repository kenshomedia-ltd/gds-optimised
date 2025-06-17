// src/components/ui/QuicklinksCollapsible/QuicklinksCollapsible.tsx
"use client";

import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faMinus,
} from "@awesome.me/kit-0e07a43543/icons/duotone/light";
import { cn } from "@/lib/utils/cn";
import type {
  QuicklinksCollapsibleProps,
  ExtractedHeading,
} from "@/types/quicklinks.types";
import { QuicklinksCollapsibleSkeleton } from "./QuicklinksCollapsibleSkeleton";

/**
 * QuicklinksCollapsible Component
 *
 * Features:
 * - Automatically extracts H2 headings from the page
 * - Smooth scroll navigation to sections
 * - Default open state
 * - Plus/Minus icons for open/close states
 * - Accessible with ARIA attributes
 * - Mobile-optimized
 */
export function QuicklinksCollapsible({
  id = "quicklinks",
  label = "Link Rapidi",
  containerClass,
  labelClass,
  contentClass,
  defaultOpen = true,
}: QuicklinksCollapsibleProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [headings, setHeadings] = useState<ExtractedHeading[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Extract all H2 headings from the main content area only
    const extractHeadings = () => {
      const mainContent = document.querySelector("main");
      if (!mainContent) return;

      const allH2s = mainContent.querySelectorAll("h2");
      const h2List: ExtractedHeading[] = [];

      allH2s.forEach((h2) => {
        // Generate an ID if the heading doesn't have one
        if (!h2.id) {
          const generatedId =
            h2.textContent
              ?.toLowerCase()
              .replace(/[^a-z0-9]+/g, "-")
              .replace(/(^-|-$)/g, "") || `heading-${h2List.length}`;
          h2.id = generatedId;
        }

        h2List.push({
          text: h2.textContent || "",
          id: h2.id,
        });
      });

      setHeadings(h2List);
      setIsLoading(false);
    };

    // Extract headings immediately
    extractHeadings();

    // Also observe for dynamic content changes
    const observer = new MutationObserver(() => {
      extractHeadings();
    });

    const mainContent = document.querySelector("section.main");
    if (mainContent) {
      observer.observe(mainContent, {
        childList: true,
        subtree: true,
      });
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  const handleScrollToSection = (headingId: string) => {
    const element = document.getElementById(headingId);
    if (element) {
      const offset = 80; // Offset for fixed header
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  // Show skeleton while loading
  if (isLoading) {
    return <QuicklinksCollapsibleSkeleton containerClass={containerClass} />;
  }

  // Don't render if no headings found
  if (headings.length === 0) {
    return null;
  }

  return (
    <div className={cn("w-full bg-white rounded-lg", containerClass)}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center justify-between w-full text-left p-4",
          "text-white bg-table-header-bkg transition-colors",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary",
          isOpen ? "rounded-t-lg" : "rounded-lg",
          labelClass
        )}
        aria-expanded={isOpen}
        aria-controls={id}
      >
        <span className="text-lg font-semibold">{label}</span>
        <FontAwesomeIcon
          icon={isOpen ? faMinus : faPlus}
          className="w-5 h-5 text-white"
        />
      </button>

      <div
        id={id}
        className={cn(
          "overflow-hidden transition-all duration-300",
          isOpen ? "max-h-[600px]" : "max-h-0"
        )}
      >
        <nav
          className={cn("px-4 pb-4", contentClass)}
          aria-label="Quick navigation links"
        >
          <ul className="grid grid-cols-2 gap-x-6 gap-y-2">
            {headings.map((heading, index) => {
              // Calculate which column the item should be in
              const midpoint = Math.ceil(headings.length / 2);
              const column = index < midpoint ? 0 : 1;
              const rowIndex = index < midpoint ? index : index - midpoint;

              return (
                <li
                  key={heading.id}
                  className="col-span-1"
                  style={{
                    gridColumn: column + 1,
                    gridRow: rowIndex + 1,
                  }}
                >
                  <button
                    onClick={() => handleScrollToSection(heading.id)}
                    className={cn(
                      "w-full text-left text-md text-body-text hover:text-grey-500",
                      "hover:underline transition-colors py-1.5 px-2 rounded",
                      "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    )}
                    aria-label={`Navigate to ${heading.text}`}
                  >
                    {heading.text}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </div>
  );
}
