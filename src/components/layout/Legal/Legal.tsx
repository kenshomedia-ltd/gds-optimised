// src/components/layout/Legal/Legal.tsx
"use client";

import { Image } from "@/components/common/Image";
import type { LegalProps } from "./legal.types";

/**
 * Legal bar component that displays legal text and compliance icons
 *
 * Features:
 * - Responsive container with proper padding
 * - Optimized SVG loading with embedding for better performance
 * - Accessibility compliant with proper ARIA labels
 * - Tailwind v4 syntax
 *
 * @param {LegalProps} props - Component props
 * @returns {JSX.Element} Legal bar component
 */
export function Legal({ legalText, className }: LegalProps) {
  return (
    <div
      className={`bg-legal-bkg ${className || ""}`}
      role="complementary"
      aria-label="Legal information"
    >
      <div className="xl:container mx-auto flex items-center justify-end text-legal-text h-[35px] py-[5px] text-[10px] px-2">
        {/* Legal text with proper spacing */}
        <span className="mr-2 leading-tight">{legalText}</span>

        {/* Compliance icons with optimized loading */}
        <div
          className="flex items-center gap-[2px]"
          aria-label="Compliance certifications"
        >
          <Image
            src="/icons/logo-timone.svg"
            alt="Logo Timone - Regulatory compliance"
            width={40}
            height={25}
            className="inline-block"
            embedSvg={true}
            svgProps={{
              role: "img",
              "aria-hidden": "false",
            }}
          />

          <Image
            src="/icons/logo-adm.svg"
            alt="ADM - Agenzia delle Dogane e dei Monopoli certification"
            width={60}
            height={25}
            className="inline-block"
            embedSvg={true}
            svgProps={{
              role: "img",
              "aria-hidden": "false",
            }}
          />

          <Image
            src="/icons/plus-18.svg"
            alt="18+ Age restriction - Gambling is prohibited for minors"
            width={40}
            height={22}
            className="inline-block"
            embedSvg={true}
            svgProps={{
              role: "img",
              "aria-hidden": "false",
            }}
          />
        </div>
      </div>
    </div>
  );
}
