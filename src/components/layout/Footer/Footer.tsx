// src/components/layout/Footer/Footer.tsx
// import Link from "next/link";
import { FooterLinks } from "./FooterLinks";
import { FooterImages } from "./FooterImages";
import { FooterBottom } from "./FooterBottom";
import { FooterContent } from "./FooterContent";
import type { FooterProps } from "@/types/footer.types";

/**
 * Main Footer Component
 *
 * Features:
 * - Responsive layout with proper mobile/desktop breakpoints
 * - Optimized image loading with lazy loading
 * - SEO-friendly with proper semantic HTML
 * - Performance optimized with minimal re-renders
 * - Accessible with proper ARIA labels
 * - Tailwind v4 syntax
 *
 * Structure:
 * 1. Footer navigations (quick links sections)
 * 2. About site content
 * 3. Compliance/partner images
 * 4. Bottom bar with copyright and legal links
 */
export function Footer({
  footerContent,
  footerImages,
  footerNavigation,
  footerNavigations,
  translations,
  className = "",
}: FooterProps) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "";
  const copyright = translations.copyright || "All rights reserved";

  return (
    <footer
      className={`bg-footer-bkg pt-4 text-footer-text mt-5 content-auto ${className}`}
      aria-labelledby="footer-heading"
    >
      {/* Screen reader only heading for accessibility */}
      <h2 id="footer-heading" className="sr-only">
        Footer
      </h2>

      <div className="mx-auto xl:container px-2 py-0">
        {/* Footer Navigation Sections */}
        {footerNavigations.length > 0 && (
          <div className="flex flex-wrap mb-6 gap-y-4">
            {footerNavigations.map((nav) => (
              <FooterLinks
                key={nav.id}
                navigation={nav}
                className="w-1/2 md:w-1/4"
              />
            ))}
          </div>
        )}

        {/* About Site Content */}
        <FooterContent content={footerContent} />

        {/* Partner/Compliance Images */}
        {footerImages.length > 0 && (
          <FooterImages images={footerImages} className="mt-10 mb-4" />
        )}

        {/* Bottom Bar */}
        <FooterBottom
          footerNavigation={footerNavigation}
          copyright={copyright}
          siteUrl={siteUrl}
          className="pt-6 pb-4"
        />
      </div>
    </footer>
  );
}
