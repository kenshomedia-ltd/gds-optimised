// src/components/layout/Legal/LegalServer.tsx
import type { LegalProps } from "./legal.types";

/**
 * Server-side Legal component for use in layouts
 *
 * This version is optimized for server rendering and doesn't require client-side JavaScript
 * for the initial render, improving CWV scores.
 *
 * Features:
 * - No client-side JavaScript required
 * - Inline SVGs for immediate rendering
 * - Preload hints for better performance
 *
 * @param {LegalProps} props - Component props
 * @returns {JSX.Element} Legal bar component
 */
export function LegalServer({ legalText, className }: LegalProps) {
  return (
    <>
      {/* Preload SVG assets for faster loading */}
      <link
        rel="preload"
        href="/icons/logo-timone.svg"
        as="image"
        type="image/svg+xml"
      />
      <link
        rel="preload"
        href="/icons/logo-adm.svg"
        as="image"
        type="image/svg+xml"
      />
      <link
        rel="preload"
        href="/icons/plus-18.svg"
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
          <span className="mr-2 leading-tight">{legalText}</span>

          {/* Compliance icons */}
          <div
            className="flex items-center gap-[2px]"
            aria-label="Compliance certifications"
          >
            <img
              src="/icons/logo-timone.svg"
              alt="Logo Timone - Regulatory compliance"
              width={40}
              height={25}
              className="inline-block"
              loading="eager"
              decoding="async"
            />

            <img
              src="/icons/logo-adm.svg"
              alt="ADM - Agenzia delle Dogane e dei Monopoli certification"
              width={60}
              height={25}
              className="inline-block"
              loading="eager"
              decoding="async"
            />

            <img
              src="/icons/plus-18.svg"
              alt="18+ Age restriction - Gambling is prohibited for minors"
              width={40}
              height={22}
              className="inline-block"
              loading="eager"
              decoding="async"
            />
          </div>
        </div>
      </div>
    </>
  );
}
