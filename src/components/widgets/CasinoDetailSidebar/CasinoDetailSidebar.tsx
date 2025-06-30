// src/components/widgets/CasinoDetailSidebar/CasinoDetailSidebar.tsx

import Link from "next/link";
import { Image } from "@/components/common/Image";
import { StarRatingDisplay } from "@/components/ui/StarRating";
import { Collapsible } from "@/components/ui/Collapsible";
import { Button } from "@/components/ui";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCoins,
  faSackDollar,
  faGift,
} from "@awesome.me/kit-0e07a43543/icons/duotone/solid";
import type { CasinoPageData } from "@/types/casino-page.types";
import type { BonusSection } from "@/types/casino.types";

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

  // Format bonus amounts - same logic as CasinoHero
  const formatBonus = (section: BonusSection | null | undefined) => {
    if (!section) return null;

    const parts = [];
    if (section.bonusAmount) {
      parts.push(`${section.bonusAmount}€`);
    }
    if (section.cashBack) {
      parts.push(section.cashBack);
    }
    if (section.freeSpin) {
      parts.push(section.freeSpin);
    }

    return parts.length > 0 ? parts.join(" + ") : null;
  };

  const formatNoDepositBonus = () => {
    const parts = [];

    if (casino.noDepositSection?.bonusAmount) {
      parts.push(
        `${casino.noDepositSection.bonusAmount}€ ${
          translations.withoutDeposit || "Without Deposit"
        }`
      );
    }

    if (casino.freeSpinsSection?.bonusAmount) {
      parts.push(
        `${casino.freeSpinsSection.bonusAmount} ${
          translations.freeSpins || "Free Spins"
        }`
      );
    }

    return parts.length > 0 ? parts.join(" + ") : null;
  };

  const reloadBonus = formatBonus(casino.bonusSection);
  const noDepositBonus = formatNoDepositBonus();

  return (
    <div className="bg-white flex flex-col p-3 rounded sticky top-20">
      {/* Casino Image - Fixed responsive container */}
      <div className="w-full max-w-full overflow-hidden rounded">
        <Link
          href={casino.casinoBonus?.bonusUrl || "#"}
          className="block border border-transparent hover:border-gray-200 transition-colors duration-200 rounded"
          rel="sponsored"
          target="_blank"
        >
          <div className="relative w-full aspect-[22/10] overflow-hidden rounded">
            <Image
              src={casino.images?.url || ""}
              alt={casino.title}
              width={330}
              height={150}
              className="w-full h-full object-contain"
              sizes="(max-width: 768px) 100vw, 330px"
              quality={90}
              priority={true}
              placeholder="blur"
              responsive={true}
            />
          </div>
        </Link>
      </div>

      {/* Rating - Using StarRatingDisplay for read-only display */}
      <div className="mt-4 flex flex-col items-center">
        <StarRatingDisplay
          rating={casino.ratingAvg || 0}
          size="md"
          showValue={false}
          showCount={false}
        />
        <div className="mt-1 text-sm text-gray-600">
          {casino.ratingAvg.toFixed(1)}/5 • ({casino.ratingCount})
        </div>
        <a className="mt-1 text-xs italic underline" href="#casino-review">
          {translations.userComments || "Commenti degli utenti"}
        </a>
      </div>

      {/* Bonus Details */}
      <div className="flex flex-col my-5">
        {/* Welcome bonus link */}
        <div className="flex items-center mb-4">
          <FontAwesomeIcon
            icon={faCoins}
            className="w-10 h-6 text-primary mr-5 flex-shrink-0"
          />
          <Link
            href={casino.casinoBonus?.bonusUrl || "#"}
            className="text-sm font-bold underline text-blue-600 hover:text-blue-800 transition-colors"
            target="_blank"
            rel="sponsored"
          >
            {casino.casinoBonus?.bonusLabel || translations.welcomeBonus}
          </Link>
        </div>

        {/* Bonus details table - same as CasinoHero */}
        <table className="w-full text-sm">
          <tbody>
            {/* Reload bonus */}
            <tr className="border-b-0">
              <td className="py-2">
                <div className="flex items-center">
                  <FontAwesomeIcon
                    icon={faSackDollar}
                    className="w-10 h-6 text-gray-700 mr-5 flex-shrink-0"
                  />
                  <span className="text-xs uppercase">
                    {translations.reloadBonus || "Reload Bonus"}
                  </span>
                </div>
              </td>
              <td className="py-2 text-right">
                <div className="font-bold text-primary">
                  {reloadBonus || "-"}
                </div>
              </td>
            </tr>

            {/* No deposit bonus */}
            <tr className="border-b-0">
              <td className="py-2">
                <div className="flex items-center">
                  <FontAwesomeIcon
                    icon={faGift}
                    className="w-10 h-6 text-gray-700 mr-5 flex-shrink-0"
                  />
                  <span className="text-xs uppercase">
                    {translations.withoutDeposit || "Without Deposit"}
                  </span>
                </div>
              </td>
              <td className="py-2 text-right">
                <div className="font-bold text-primary">
                  {noDepositBonus || "-"}
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Terms and Conditions */}
      {termsAndConditionsCleaned && (
        <div className="mb-5 border-t pt-5">
          <Collapsible
            id="sidebar-terms"
            label={translations.termsConditions || "Termini e Condizioni"}
            content={termsAndConditionsCleaned}
            containerClass="w-full"
            labelClass="text-sm font-semibold text-gray-700"
            contentClass="text-xs leading-relaxed"
            defaultOpen={true}
          />
        </div>
      )}

      {/* CTA Button */}
      <div className="mt-auto">
        <Button
          variant="default"
          href={casino.casinoBonus?.bonusUrl || "#"}
          className="w-full uppercase bg-misc hover:bg-misc-hover text-white font-bold"
          size="lg"
          rel="sponsored"
          target="_blank"
        >
          {translations.playNow || "ACCEDERE AL SITO"}
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
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900 truncate">
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
          className="uppercase bg-misc hover:bg-misc-hover flex-shrink-0"
          rel="sponsored"
          target="_blank"
        >
          {translations.playNow || "PLAY NOW"}
        </Button>
      </div>
    </div>
  );
}
