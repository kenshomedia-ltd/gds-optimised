// src/components/layout/Legal/LegalServer.tsx
import Image from "next/image";
import { normalizeImageSrc } from "@/lib/utils/image";
import type { LegalProps } from "./legal.types";

/**
 * Server-side Legal component for use in layouts
 *
 * This version is optimized for server rendering and doesn't require client-side JavaScript
 * for the initial render, improving CWV scores.
 *
 * Features:
 * - No client-side JavaScript required
 * - Next.js Image optimization
 * - Preload hints for better performance with proper basePath
 * - Proper basePath handling for all environments
 *
 * @param {LegalProps} props - Component props
 * @returns {JSX.Element} Legal bar component
 */
export function LegalServer({ legalText, className }: LegalProps) {
  // Pre-normalize all image paths to ensure consistent basePath handling
  const iconPaths = {
    timone: normalizeImageSrc("/icons/logo-timone.svg"),
    adm: normalizeImageSrc("/icons/logo-adm.svg"),
    plus18: normalizeImageSrc("/icons/plus-18.svg"),
  };

  return (
    <>
      {/* Preload SVG assets for faster loading with proper basePath */}
      <link
        rel="preload"
        href={iconPaths.timone}
        as="image"
        type="image/svg+xml"
      />
      <link
        rel="preload"
        href={iconPaths.adm}
        as="image"
        type="image/svg+xml"
      />
      <link
        rel="preload"
        href={iconPaths.plus18}
        as="image"
        type="image/svg+xml"
      />

      <div
        className={`bg-legal-bkg ${className || ""}`}
        role="complementary"
        aria-label="Legal information"
      >
        <div className="xl:container mx-auto flex items-center justify-end text-legal-text h-[35px] py-[5px] text-[10px] px-2">
          {/* Legal text with proper spacing */}
          <span className="flex leading-tight justify-end">{legalText}</span>

          {/* Compliance icons using Next.js Image with proper basePath */}
          <div
            className="flex items-center justify-end gap-[2px] min-w-[120px]"
            aria-label="Compliance certifications"
          >
            <Image
              src={iconPaths.timone}
              alt="Logo Timone - Regulatory compliance"
              width={40}
              height={25}
              className="inline-block w-5 h-5 md:w-10 md:h-[25px] object-contain"
              priority
              unoptimized // SVGs don't need optimization
            />

            <Image
              src={iconPaths.adm}
              alt="ADM - Agenzia delle Dogane e dei Monopoli certification"
              width={60}
              height={25}
              className="inline-block w-5 h-5 md:w-10 md:h-[25px] object-contain"
              priority
              unoptimized // SVGs don't need optimization
            />

            <Image
              src={iconPaths.plus18}
              alt="18+ Age restriction - Gambling is prohibited for minors"
              width={25}
              height={25}
              className="inline-block w-5 h-5 md:w-10 md:h-[25px] object-contain"
              priority
              unoptimized // SVGs don't need optimization
            />
          </div>
        </div>
      </div>
    </>
  );
}
