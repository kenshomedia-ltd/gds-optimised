// src/components/casino/CasinoHero/CasinoHero.tsx
"use client";

// import { useState } from "react";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCoins,
  faSackDollar,
  faGift,
} from "@awesome.me/kit-0e07a43543/icons/duotone/light";
import { Image } from "@/components/common/Image";
import { Button } from "@/components/ui/Button";
import { StarRatingInteractive } from "@/components/ui/StarRating/StarRatingInteractive";
import { TimeDate } from "@/components/common/TimeDate";
import { HeaderAuthor } from "@/components/common/HeaderAuthor";
import { Collapsible } from "@/components/ui/Collapsible";
import { CasinoFeaturesTable } from "./CasinoFeaturesTable";
import { CasinoGeneralInfoTable } from "./CasinoGeneralInfoTable";
import { CasinoTestimonial } from "./CasinoTestimonial";
import { CasinoPaymentSoftware } from "./CasinoPaymentSoftware";
import type { CasinoPageData } from "@/types/casino-page.types";
import { BonusSection } from "@/types/casino.types";

interface CasinoHeroProps {
  casino: CasinoPageData;
  translations: Record<string, string>;
}

export function CasinoHero({ casino, translations }: CasinoHeroProps) {
  // Process terms and conditions
  const termsAndConditionsCleaned =
    casino.termsAndConditions?.copy?.replace(/(<([^>]+)>)/gi, "") || "";

  // Format bonus amounts - properly typed parameter
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
    <div className="casino-hero-section bg-gradient-to-b from-background-900 via-background-700 to-background-500 rounded-b-3xl pb-3">
      <div className="container mx-auto px-4">
        {/* Header with title and date */}
        <div className="py-8 text-white">
          <h1 className="font-bold leading-tight tracking-tight text-white capitalize">
            {casino.heading || casino.title}
          </h1>
          <div className="md:flex items-center gap-2">
            <TimeDate timeDate={casino.updatedAt || casino.createdAt || ""} />
            {casino.author && <HeaderAuthor author={casino.author} />}
          </div>
        </div>

        {/* Main content grid */}
        <div className="grid md:grid-cols-4 gap-5 pb-12">
          {/* Casino details card - add overflow-x-hidden to prevent horizontal scroll */}
          <div className="bg-white flex flex-col p-3 rounded relative z-10 overflow-x-hidden">
            {/* Casino image */}
            <Link
              href={casino.casinoBonus?.bonusUrl || "#"}
              className="block rounded border border-transparent hover:border-primary transition-colors"
              rel="sponsored"
              target="_blank"
            >
              <Image
                src={casino.images?.url || ""}
                className="w-full rounded"
                alt={casino.title}
                width={330}
                height={150}
              />
            </Link>

            {/* Rating */}
            <div className="mt-4 flex flex-col items-center justify-center">
              <StarRatingInteractive
                documentId={String(casino.id)}
                slug={casino.slug}
                initialRating={casino.ratingAvg}
                initialCount={casino.ratingCount}
                size="md"
                ratingType="casinos"
                itemTitle={casino.title}
                showCount={true}
                translations={translations}
              />
              <a
                href="#casino-review"
                className="mt-1 text-xs italic underline text-gray-600 hover:text-primary transition-colors"
              >
                {translations.userComments || "User Comments"}
              </a>
            </div>

            {/* Bonus sections */}
            <div className="flex flex-col my-5 space-y-4">
              {/* Welcome bonus */}
              <div className="flex items-center">
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

              {/* Bonus details table - add table-layout fixed and proper width constraints */}
              <table className="w-full text-sm table-fixed">
                <tbody>
                  {/* Reload bonus */}
                  <tr className="border-b-0">
                    <td className="py-2 w-[60%]">
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
                    <td className="py-2 text-right w-[40%]">
                      <div className="font-bold text-primary break-all">
                        {reloadBonus || "-"}
                      </div>
                    </td>
                  </tr>

                  {/* No deposit bonus */}
                  <tr className="border-b-0">
                    <td className="py-2 w-[60%]">
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
                    <td className="py-2 text-right w-[40%]">
                      <div className="font-bold text-primary break-all">
                        {noDepositBonus || "-"}
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* CTA Button */}
            <div className="mb-5">
              <Button
                href={casino.casinoBonus?.bonusUrl || "#"}
                className="bg-misc hover:bg-misc-hover py-3 px-4 rounded transition-colors"
                target="_blank"
                rel="sponsored"
              >
                {translations.accessWebsite || "Access Website"}
              </Button>
            </div>

            {/* Terms and conditions */}
            <Collapsible
              id="termsConditions"
              label={translations.termsConditions || "Terms & Conditions"}
              content={termsAndConditionsCleaned}
              containerClass="mt-1"
              labelClass="ml-3 font-bold text-base cursor-pointer"
              contentClass="text-xs text-gray-600"
              defaultOpen={true}
            />
          </div>

          {/* Casino summary */}
          <div className="md:col-span-3">
            <CasinoSummary casino={casino} translations={translations} />
          </div>
        </div>
      </div>
    </div>
  );
}

// Separate component for the summary section
function CasinoSummary({
  casino,
  translations,
}: {
  casino: CasinoPageData;
  translations: Record<string, string>;
}) {
  return (
    <div className="casino-summary-wrapper bg-white/30 backdrop-blur-[6px] shadow-[0px_0px_12px_rgba(63,230,252,0.6)] border border-white/30 rounded p-3">
      {/* Features and General Info Grid */}
      <div className="grid md:grid-cols-2 gap-3 mb-5">
        {/* Features Table */}
        <CasinoFeaturesTable
          features={casino.casinoFeatures}
          translations={translations}
        />

        {/* General Info Table */}
        <CasinoGeneralInfoTable
          generalInfo={casino.casinoGeneralInfo}
          translations={translations}
        />
      </div>

      {/* Testimonial Section */}
      <CasinoTestimonial casino={casino} translations={translations} />

      {/* Payment and Software Section */}
      <CasinoPaymentSoftware casino={casino} translations={translations} />
    </div>
  );
}
