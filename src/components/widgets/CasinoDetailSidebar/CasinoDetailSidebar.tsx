// src/components/widgets/CasinoDetailSidebar/CasinoDetailSidebar.tsx

import Link from "next/link";
import { Image } from "@/components/common/Image";
import { StarRatingDisplay } from "@/components/ui/StarRating";
import { Collapsible } from "@/components/ui/Collapsible";
import { Button } from "@/components/ui";
import type { CasinoPageData } from "@/types/casino-page.types";

interface CasinoDetailSidebarProps {
  casino: CasinoPageData;
  translations: Record<string, string>;
}

/**
 * CasinoDetailSidebar Widget Component
 *
 * Sticky sidebar widget for casino detail pages showing the current casino information
 * Features:
 * - Sticky positioning on desktop
 * - Casino image and ratings
 * - Bonus information
 * - Terms and conditions collapsible
 * - CTA button
 */
export function CasinoDetailSidebar({
  casino,
  translations,
}: CasinoDetailSidebarProps) {
  // Clean terms and conditions
  const termsAndConditionsCleaned =
    casino.termsAndConditions?.copy?.replace(/(<([^>]+)>)/gi, "") || "";

  return (
    <div className="bg-white flex flex-col p-3 rounded sticky top-20">
      {/* Casino Image */}
      <div>
        <Link
          href={casino.casinoBonus?.bonusUrl || "#"}
          className="block rounded border border-transparent"
          rel="sponsored"
          target="_blank"
        >
          <Image
            src={casino.images?.url || ""}
            alt={casino.title}
            width={330}
            height={150}
            className="w-full rounded"
          />
        </Link>
      </div>

      {/* Rating - Using StarRatingDisplay for read-only display */}
      <div className="mt-2 flex items-center justify-center">
        <StarRatingDisplay
          rating={casino.ratingAvg || 0}
          count={casino.ratingCount || 0}
          showValue={true}
          showCount={true}
          valuePosition="bottom"
          size="md"
        />
      </div>

      {/* Link to reviews */}
      <div className="flex justify-center">
        <a className="mt-1 text-xs italic underline" href="#casino-review">
          {translations.userComments || "User Comments"}
        </a>
      </div>

      {/* Bonus Details */}
      <div className="flex flex-col my-5">
        {/* Welcome Bonus */}
        <div className="flex items-center mb-3">
          <svg className="w-6 h-6 mr-2" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.16-1.46-3.27-3.4h1.96c.1.93.66 1.64 2.08 1.64 1.96 0 2.37-.79 2.37-1.54 0-1.06-.92-1.63-2.49-2.05-2.19-.58-3.6-1.34-3.6-3.35 0-1.74 1.55-3.01 3.21-3.4V4h2.67v1.95c1.86.45 2.79 1.86 2.85 3.39H14.3c-.05-1.11-.64-1.87-2.22-1.87-1.5 0-2.4.68-2.4 1.64 0 .84.65 1.39 2.67 1.91s4.18 1.39 4.18 3.91c-.01 1.83-1.38 2.83-3.12 3.15z" />
          </svg>
          <span className="font-semibold text-sm">
            {translations.welcomeBonus || "Welcome Bonus"}
          </span>
        </div>
        <p className="text-lg font-bold text-primary text-center">
          {casino.bonusSection?.bonusAmount
            ? `${casino.bonusSection.bonusAmount}€`
            : "-"}
        </p>
        {casino.bonusSection?.freeSpin && (
          <p className="text-sm text-gray-600 text-center">
            + {casino.bonusSection.freeSpin} Free Spins
          </p>
        )}

        {/* No Deposit Bonus */}
        {casino.noDepositSection?.bonusAmount && (
          <>
            <div className="flex items-center mb-3 mt-5">
              <svg
                className="w-6 h-6 mr-2"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11h-4v4h-2v-4H7v-2h4V7h2v4h4v2z" />
              </svg>
              <span className="font-semibold text-sm">
                {translations.noDepositBonus || "No Deposit Bonus"}
              </span>
            </div>
            <p className="text-lg font-bold text-secondary text-center">
              {casino.noDepositSection.bonusAmount}€
            </p>
          </>
        )}

        {/* Free Spins Section */}
        {casino.freeSpinsSection?.bonusAmount && (
          <>
            <div className="flex items-center mb-3 mt-5">
              <svg
                className="w-6 h-6 mr-2"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 2l2.09 6.26L22 9l-6 5.16L17.18 22 12 18.18 6.82 22 8 14.16 2 9l7.91-.74z" />
              </svg>
              <span className="font-semibold text-sm">
                {translations.freeSpins || "Free Spins"}
              </span>
            </div>
            <p className="text-lg font-bold text-accent-100 text-center">
              {casino.freeSpinsSection.bonusAmount} FS
            </p>
          </>
        )}
      </div>

      {/* Terms and Conditions */}
      {termsAndConditionsCleaned && (
        <div className="mb-5">
          <Collapsible
            id="sidebar-terms"
            label={translations.termsConditions || "Terms & Conditions"}
            content={termsAndConditionsCleaned}
            containerClass="w-full"
            labelClass="text-sm font-semibold"
          />
        </div>
      )}

      {/* CTA Button */}
      <div className="mt-auto">
        <Button
          variant="default"
          href={casino.casinoBonus?.bonusUrl || "#"}
          className="w-full uppercase"
          size="lg"
          rel="sponsored"
          target="_blank"
        >
          {translations.playNow || "PLAY NOW"}
        </Button>
        <p className="text-xs text-gray-500 text-center mt-2">
          {translations.termsApply || "T&C Apply"}
        </p>
      </div>
    </div>
  );
}

/**
 * CasinoDetailMobileFooter Component
 *
 * Sticky footer for mobile devices with CTA
 */
export function CasinoDetailMobileFooter({
  casino,
  translations,
}: CasinoDetailSidebarProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-40 md:hidden">
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1">
          <p className="text-sm font-semibold text-gray-900">
            {casino.bonusSection?.bonusAmount
              ? `${casino.bonusSection.bonusAmount}€ ${
                  translations.bonus || "Bonus"
                }`
              : casino.title}
          </p>
          <p className="text-xs text-gray-500">
            {translations.termsApply || "T&C Apply"}
          </p>
        </div>
        <Button
          variant="default"
          href={casino.casinoBonus?.bonusUrl || "#"}
          size="sm"
          className="uppercase"
          rel="sponsored"
          target="_blank"
        >
          {translations.playNow || "PLAY NOW"}
        </Button>
      </div>
    </div>
  );
}
