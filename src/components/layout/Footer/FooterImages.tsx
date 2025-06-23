// src/components/layout/Footer/FooterImages.tsx
import Link from "next/link";
import { Image } from "@/components/common/Image";
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
 * - Progressive loading for performance
 * - Handles both linked and non-linked images
 * - Responsive layout with proper spacing
 * - Optimized image sizing
 * - Built-in lazy loading with intersection observer
 */
export function FooterImages({ images, className = "" }: FooterImagesProps) {
  return (
    <div
      className={`flex flex-wrap items-center gap-x-8 gap-y-5 justify-center md:justify-end ${className}`}
      role="list"
      aria-label="Partner and compliance logos"
    >
      {images.map((img) => {
        // Calculate proportional width based on the 40px height
        const aspectRatio = img.image.width / img.image.height;
        const calculatedWidth = Math.round(40 * aspectRatio);

        const imageElement = (
          <div
            className="relative h-10"
            style={{ width: `${calculatedWidth}px` }}
          >
            <Image
              src={img.image.url}
              alt={`${img.imageName} logo`}
              width={calculatedWidth}
              height={40}
              className="object-contain"
              quality={90}
              unoptimized={img.image.url.endsWith(".svg")}
              // Enable progressive loading with similar settings to LazyImage
              progressive={true}
              threshold={0.5}
              rootMargin="100px"
              // Keep loading lazy for non-critical footer images
              loading="lazy"
              priority={false}
              // Ensure the image fills its container properly
              style={{ width: "100%", height: "100%", objectFit: "contain" }}
            />
          </div>
        );

        return (
          <div key={img.id} role="listitem" className="flex items-center">
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
