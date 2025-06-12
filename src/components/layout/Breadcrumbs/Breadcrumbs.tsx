// src/components/navigation/Breadcrumbs/Breadcrumbs.tsx
"use client";

import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronRight,
  faHome,
} from "@awesome.me/kit-0e07a43543/icons/duotone/light";
import type { BreadcrumbsProps } from "@/types/breadcrumbs.types";
import { cn } from "@/lib/utils/cn";

/**
 * Breadcrumbs Component
 *
 * Features:
 * - SEO-friendly with structured data
 * - Responsive design
 * - Accessible navigation
 * - Home icon for first item
 */
export function Breadcrumbs({ items, className }: BreadcrumbsProps) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "";

  // Generate structured data for SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: siteUrl,
      },
      ...items.map((item, index) => ({
        "@type": "ListItem",
        position: index + 2,
        name: item.breadCrumbText,
        item: `${siteUrl}${item.breadCrumbUrl}`,
      })),
    ],
  };

  return (
    <>
      {/* Structured data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      {/* Visual breadcrumbs */}
      <nav
        className={cn(
          "flex items-center space-x-2 text-sm text-gray-600",
          "overflow-x-auto whitespace-nowrap py-2",
          className
        )}
        aria-label="Breadcrumb"
      >
        {/* Home link */}
        <Link
          href="/"
          className="inline-flex items-center hover:text-primary transition-colors"
          aria-label="Home"
        >
          <FontAwesomeIcon icon={faHome} className="w-4 h-4" />
        </Link>

        {/* Breadcrumb items */}
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <div key={item.breadCrumbUrl} className="inline-flex items-center">
              <FontAwesomeIcon
                icon={faChevronRight}
                className="w-3 h-3 mx-2 text-gray-400"
                aria-hidden="true"
              />

              {isLast ? (
                <span className="font-medium text-gray-900" aria-current="page">
                  {item.breadCrumbText}
                </span>
              ) : (
                <Link
                  href={item.breadCrumbUrl}
                  className="hover:text-primary transition-colors"
                >
                  {item.breadCrumbText}
                </Link>
              )}
            </div>
          );
        })}
      </nav>
    </>
  );
}
