// src/components/layout/Footer/FooterServer.tsx
import Link from "next/link";
import { Image } from "@/components/common/Image";
import type { FooterProps } from "@/types/footer.types";

/**
 * Server-side Footer Component
 *
 * Features:
 * - No client-side JavaScript for initial render
 * - Optimized for Core Web Vitals
 * - Static copyright year (updated via revalidation)
 * - Direct HTML rendering for content
 *
 * Use this version in layouts for better performance
 */
export function FooterServer({
  footerContent,
  footerImages,
  footerNavigation,
  footerNavigations,
  translations,
  className = "",
}: FooterProps) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "";
  const copyright = translations.copyright || "All rights reserved";
  const currentYear = new Date().getFullYear();

  return (
    <footer
      className={`bg-footer-bkg pt-4 text-footer-text mt-5 content-auto ${className}`}
      aria-labelledby="footer-heading"
    >
      <h2 id="footer-heading" className="sr-only">
        Footer
      </h2>

      <div className="mx-auto xl:container px-2 py-0">
        {/* Footer Navigation Sections */}
        {footerNavigations.length > 0 && (
          <div className="flex flex-wrap mb-6 gap-y-4">
            {footerNavigations.map((nav) => (
              <div key={nav.id} className="w-1/2 md:w-1/4">
                <h3 className="underline mb-3 uppercase font-semibold block text-sm text-footer-quicklink-text">
                  {nav.title}
                </h3>
                {nav.subMenu && nav.subMenu.length > 0 && (
                  <nav aria-label={`${nav.title} navigation`}>
                    <ul className="space-y-1">
                      {nav.subMenu.map((child) => (
                        <li key={child.id}>
                          <Link
                            href={`${child.url}/`}
                            className="text-sm text-footer-quicklink-text hover:underline"
                          >
                            {child.title}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </nav>
                )}
              </div>
            ))}
          </div>
        )}

        {/* About Site Content - Server rendered HTML */}
        <div
          className="about-site place-items-start text-left text-footer-text"
          dangerouslySetInnerHTML={{ __html: footerContent }}
        />

        {/* Partner/Compliance Images */}
        {footerImages.length > 0 && (
          <div className="mt-10 mb-4 flex flex-wrap gap-y-5 justify-center space-x-10 md:justify-end">
            {footerImages.map((img) => {
              const imageElement = (
                <Image
                  src={img.image.url}
                  alt={`${img.imageName} logo`}
                  width={img.image.width}
                  height={40}
                  className="gambling-logos h-10 w-auto object-contain"
                  quality={90}
                  loading="lazy"
                  unoptimized={img.image.url.endsWith(".svg")}
                />
              );

              return img.imageLink ? (
                <Link
                  key={img.id}
                  href={`${img.imageLink}/`}
                  className="inline-block hover:opacity-80 transition-opacity"
                  aria-label={`Visit ${img.imageName}`}
                >
                  {imageElement}
                </Link>
              ) : (
                <div key={img.id}>{imageElement}</div>
              );
            })}
          </div>
        )}

        {/* Bottom Bar */}
        <div className="pt-6 pb-4 md:flex md:items-center md:justify-between">
          {/* Legal Navigation Links */}
          {footerNavigation.length > 0 && (
            <nav
              className="flex flex-wrap justify-center mb-6 md:mb-0 md:justify-end space-x-6 md:order-2"
              aria-label="Legal navigation"
            >
              {footerNavigation.map((nav) => (
                <Link
                  key={nav.id}
                  href={`${nav.url}/`}
                  className="text-right text-sm text-footer-quicklink-text hover:underline"
                >
                  {nav.title}
                </Link>
              ))}
            </nav>
          )}

          {/* Copyright Text */}
          <p className="flex m-0 justify-center text-center md:text-left text-sm text-gray-500 md:order-1">
            <span className="shrink-0">&copy; 2011-{currentYear} </span>
            <span>
              {siteUrl} | {copyright}
            </span>
          </p>
        </div>
      </div>
    </footer>
  );
}
