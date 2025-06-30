// src/components/layout/Breadcrumbs/Breadcrumbs.tsx
import Link from "next/link";
import type { BreadcrumbsProps, BreadcrumbsWithLayoutProps } from "@/types/breadcrumbs.types";
import { cn } from "@/lib/utils/cn";
import { 
  normalizeInternalUrl, 
  normalizeStructuredDataUrl, 
  normalizeBreadcrumbItems,
  sanitizeUrl,
  debugUrlNormalization
} from "@/lib/utils/url-normalization";

/**
 * Breadcrumbs Component
 *
 * Features:
 * - Server-side rendering compatible
 * - SEO-optimized with structured data
 * - Accessibility compliant
 * - Advanced URL normalization to prevent double paths
 * - Sanitization of problematic URLs
 * - Debug mode for development
 * - Tailwind V4 syntax
 * - Performance optimized with minimal client-side JavaScript
 */
export function Breadcrumbs({
  items,
  className,
  showHome = false,
}: BreadcrumbsProps) {
  // Normalize and validate breadcrumb items
  const validItems = normalizeBreadcrumbItems(items);

  // Don't render if we have no items and home is not shown
  if (!showHome && validItems.length === 0) {
    return null;
  }

  // Prepare full breadcrumb list including home
  const fullBreadcrumbs = showHome
    ? [{ breadCrumbText: "HOME", breadCrumbUrl: "/" }, ...validItems]
    : validItems;

  // Generate structured data for SEO
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "";
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: fullBreadcrumbs.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.breadCrumbText,
      ...(item.breadCrumbUrl && {
        item: normalizeStructuredDataUrl(item.breadCrumbUrl, siteUrl),
      }),
    })),
  };

  return (
    <>
      {/* Structured data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        suppressHydrationWarning
      />

      {/* Visual breadcrumbs */}
      <nav
        aria-label="Breadcrumb"
        className={cn("w-full bg-legal-bkg", className)}
      >
        <div className="lg:container mx-auto px-5 py-2">
          <ol className="flex flex-wrap items-center gap-x-1 text-xs uppercase leading-3 text-breadcrumb-text">
            {fullBreadcrumbs.map((item, index) => {
              const isLast = index === fullBreadcrumbs.length - 1;
              
              // Sanitize and normalize the URL for internal navigation
              const rawUrl = item.breadCrumbUrl || "";
              const sanitizedUrl = sanitizeUrl(rawUrl);
              const normalizedHref = normalizeInternalUrl(sanitizedUrl);

              // Debug URL normalization in development
              if (process.env.NODE_ENV === "development" && item.breadCrumbUrl) {
                debugUrlNormalization(item.breadCrumbUrl, `Breadcrumb: ${item.breadCrumbText}`);
              }

              return (
                <li
                  key={`${item.breadCrumbText}-${index}`}
                  className="flex items-center text-white"
                >
                  {isLast || !item.breadCrumbUrl ? (
                    // Current page or item without URL
                    <span aria-current="page" className="font-medium">
                      {item.breadCrumbText}
                    </span>
                  ) : (
                    // Linked breadcrumb item
                    <>
                      <Link
                        href={normalizedHref}
                        className="underline transition-opacity hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-breadcrumb-bkg"
                        prefetch={false}
                      >
                        {item.breadCrumbText}
                      </Link>
                      <span
                        className="mx-1 text-breadcrumb-separator"
                        aria-hidden="true"
                      >
                        /
                      </span>
                    </>
                  )}
                </li>
              );
            })}
          </ol>
        </div>
      </nav>
    </>
  );
}

export function BreadcrumbsWithLayout({
  items = [],
  breadcrumbKey,
  layoutBreadcrumbs,
  className,
  showHome = true,
}: BreadcrumbsWithLayoutProps) {
  let finalBreadcrumbs = [...items];

  // Prepend layout breadcrumbs if available and normalize them
  if (breadcrumbKey && layoutBreadcrumbs?.[breadcrumbKey]) {
    const normalizedLayoutBreadcrumbs = normalizeBreadcrumbItems(
      layoutBreadcrumbs[breadcrumbKey]
    );
    finalBreadcrumbs = [
      ...normalizedLayoutBreadcrumbs,
      ...finalBreadcrumbs,
    ];
  }

  // If no breadcrumbs but we have a breadcrumbKey, show home
  if (
    breadcrumbKey &&
    finalBreadcrumbs.length === 0 &&
    !layoutBreadcrumbs?.[breadcrumbKey]
  ) {
    return <Breadcrumbs items={[]} className={className} showHome={true} />;
  }

  // Don't render if no breadcrumbs
  if (finalBreadcrumbs.length === 0 && !showHome) {
    return null;
  }

  return (
    <Breadcrumbs
      items={finalBreadcrumbs}
      className={className}
      showHome={showHome}
    />
  );
}