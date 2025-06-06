// src/components/layout/Footer/FooterImages.tsx
import Link from "next/link";
import { LazyImage } from "@/components/common/Image";
import type { FooterImageItem } from "@/types/strapi.types";

interface FooterImagesProps {
  images: FooterImageItem[];
  className?: string;
}

/**
 * Footer Images Component
 *
 * Features:
 * - Renders compliance/partner logos
 * - Lazy loads images for performance
 * - Handles both linked and non-linked images
 * - Responsive layout with proper spacing
 * - Optimized image sizing
 */
export function FooterImages({ images, className = "" }: FooterImagesProps) {
  return (
    <div
      className={`flex flex-wrap gap-y-5 justify-center space-x-10 md:justify-end ${className}`}
      role="list"
      aria-label="Partner and compliance logos"
    >
      {images.map((img) => {
        const imageElement = (
          <LazyImage
            src={img.image.url}
            alt={`${img.imageName} logo`}
            width={img.image.width}
            height={40}
            className="gambling-logos h-10 w-auto object-contain"
            quality={90}
            unoptimized={img.image.url.endsWith(".svg")}
            threshold={0.5}
            rootMargin="100px"
          />
        );

        return (
          <div key={img.id} role="listitem">
            {img.imageLink ? (
              <Link
                href={`${img.imageLink}/`}
                className="inline-block hover:opacity-80 transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 rounded"
                aria-label={`Visit ${img.imageName}`}
                prefetch={false}
              >
                {imageElement}
              </Link>
            ) : (
              imageElement
            )}
          </div>
        );
      })}
    </div>
  );
}
