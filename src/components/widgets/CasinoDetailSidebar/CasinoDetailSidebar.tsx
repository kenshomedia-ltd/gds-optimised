// src/components/widgets/CasinoDetailSidebar/CasinoDetailSidebar.tsx

import Link from "next/link";
import { Image } from "@/components/common/Image";
import { StarRating } from "@/components/ui/StarRating/StarRating";
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

      {/* Rating */}
      <div className="mt-2 flex items-center justify-center">
        <StarRating
          avgRating={casino.ratingAvg || 0}
          ratingClasses="flex-col"
          ratingCount={casino.ratingCount || 0}
          itemId={String(casino.id)}
          documentId={casino.documentId || ""}
          ratingType="casinos"
          translations={translations}
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
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.16-1.46-3.27-3.4h1.96c.1.93.66 1.64 2.08 1.64 1.96 0 2.37-.79 2.37-1.54 0-1.06-.92-1.63-2.49-2.05-2.19-.58-3.6-1.34-3.6-3.35 0-1.74 1.55-3.01 3.21-3.4V4h2.67v1.95c1.86.45 2.79 1.86 2.85 3.39H14.3c-.05-1.11-.64-1.87-2.22-1.87-1.5 0-2.4.68-2.4 1.64 0 .84.65 1.39 2.67 1.91s4.18 1.39 4.18 3.91c-.01 1.83-1.38 2.83-3.12 3.16z" />
          </svg>
          <div className="flex ml-5 font-bold">
            <Link
              href={casino.casinoBonus?.bonusUrl || "#"}
              className="text-sm underline text-primary hover:text-primary-hover"
              rel="sponsored"
              target="_blank"
            >
              {casino.casinoBonus?.bonusLabel || ""}
            </Link>
          </div>
        </div>

        {/* Bonus Details Table */}
        <table className="w-full text-sm">
          <tbody>
            {/* Reload Bonus */}
            <tr className="border-b border-gray-200">
              <td className="py-2">
                <div className="flex items-center">
                  <svg
                    className="w-5 h-5 mr-2"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z" />
                  </svg>
                  <span className="text-xs">
                    {translations.reloadBonus || "Reload Bonus"}
                  </span>
                </div>
              </td>
              <td className="py-2 text-right font-bold text-primary">
                {casino.bonusSection?.bonusAmount
                  ? `${casino.bonusSection.bonusAmount}€`
                  : "-"}
                {casino.bonusSection?.cashBack && (
                  <>
                    <br />
                    {casino.bonusSection.cashBack}
                  </>
                )}
                {casino.bonusSection?.freeSpin && (
                  <>
                    <br />
                    {casino.bonusSection.freeSpin}
                  </>
                )}
              </td>
            </tr>

            {/* No Deposit Bonus */}
            <tr>
              <td className="py-2">
                <div className="flex items-center">
                  <svg
                    className="w-5 h-5 mr-2"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M21 18v1c0 1.1-.9 2-2 2H5c-1.11 0-2-.9-2-2V5c0-1.1.89-2 2-2h14c1.1 0 2 .9 2 2v1h-9c-1.11 0-2 .9-2 2v8c0 1.1.89 2 2 2h9zm-9-2h10V8H12v8zm4-2.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" />
                  </svg>
                  <span className="text-xs">
                    {translations.withoutDeposit || "No Deposit"}
                  </span>
                </div>
              </td>
              <td className="py-2 text-right font-bold text-primary">
                {casino.noDepositSection?.bonusAmount ? (
                  <>
                    {casino.noDepositSection.bonusAmount}€{" "}
                    {translations.withoutDeposit}
                    {casino.freeSpinsSection?.bonusAmount && (
                      <>
                        <span className="mx-1">+</span>
                        <br />
                        {casino.freeSpinsSection.bonusAmount}{" "}
                        {translations.freeSpins}
                      </>
                    )}
                  </>
                ) : casino.freeSpinsSection?.bonusAmount ? (
                  `${casino.freeSpinsSection.bonusAmount} ${translations.freeSpins}`
                ) : (
                  "-"
                )}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* CTA Button */}
      <div className="mb-5">
        <Button
          variant="link"
          href={casino.casinoBonus?.bonusUrl || "#"}
          rel="sponsored"
          target="_blank"
          className="w-full uppercase"
          size="lg"
        >
          {translations.accessWebsite || "Access Website"}
        </Button>
      </div>

      {/* Terms and Conditions */}
      <Collapsible
        id="termsConditions-sidebar"
        label={translations.termsConditions || "Terms & Conditions"}
        content={termsAndConditionsCleaned}
        containerClass="mt-1"
        labelClass="ml-3 font-bold text-base cursor-pointer"
        contentClass="text-xs text-gray-600"
        defaultOpen={true}
      />
    </div>
  );
}

// Mobile sticky footer version
export function CasinoDetailMobileFooter({
  casino,
  translations,
}: CasinoDetailSidebarProps) {
  return (
    <div className="fixed block md:hidden right-0 bottom-3 h-10 w-full z-[999]">
      <div className="flex justify-between p-2 bg-white shadow-lg">
        <div className="border border-grey-300 rounded-r-lg mr-2">
          <Image
            src={casino.images?.url || ""}
            alt={casino.title}
            width={80}
            height={40}
            className="h-full object-contain"
          />
        </div>
        <Button
          variant="link"
          href={casino.casinoBonus?.bonusUrl || "#"}
          rel="sponsored"
          target="_blank"
          className="w-full uppercase"
        >
          {translations.accessWebsite || "Access Website"}
        </Button>
      </div>
    </div>
  );
}
