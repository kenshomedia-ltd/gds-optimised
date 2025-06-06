// src/components/casino/CasinoRow/CasinoRow.tsx
"use client";

import Link from "next/link";
import { Image } from "@/components/common/Image";
import { CasinoBadge } from "../CasinoBadge/CasinoBadge";
import { CasinoRating } from "../CasinoRating/CasinoRating";
import { Collapsible } from "@/components/ui/Collapsible/Collapsible";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleInfo } from "@awesome.me/kit-0e07a43543/icons/duotone/light";
import type { CasinoRowProps } from "@/types/casino.types";
import {
  formatWelcomeBonus,
  formatNoDepositBonus,
  getCasinoBadge,
} from "@/lib/utils/casino";
import { cn } from "@/lib/utils/cn";

/**
 * CasinoRow Component
 *
 * Features:
 * - Responsive layout (mobile card / desktop row)
 * - Position badges for top 3
 * - Bonus information with collapsible terms
 * - Optimized image loading
 */
export function CasinoRow({
  casino,
  index,
  translations = {},
}: CasinoRowProps) {
  const badge = getCasinoBadge(casino, translations);
  const noDepositBonus = formatNoDepositBonus(casino, translations);
  const welcomeBonus = formatWelcomeBonus(casino, translations.reloadBonus);

  // Position badge styles
  const positionStyles = {
    0: "casino-logo__first",
    1: "casino-logo__second",
    2: "casino-logo__third",
  };

  return (
    <tr className="flex flex-wrap md:table-row border-[12px] border-casino-table-tr-border bg-white">
      {/* Casino Logo Cell */}
      <td className="casino-logo w-1/2 md:w-[210px] md:max-w-[210px] relative overflow-hidden">
        {badge && <CasinoBadge text={badge.text} type={badge.type} />}

        <div
          className={cn(
            "h-full flex items-center px-3 py-2 bg-white rounded-tl-lg md:rounded-bl-lg relative max-w-[368px]",
            positionStyles[index as keyof typeof positionStyles]
          )}
        >
          {/* Position badge */}
          {index <= 2 && (
            <span
              className={cn(
                "casino-logo__tag w-[28px] h-6 absolute flex justify-center items-center",
                "p-[2px] top-0 left-[18px] rounded-bl rounded-br",
                "text-white text-sm font-bold bg-gradient-to-b"
              )}
            >
              #{index + 1}
            </span>
          )}

          <Link
            href={casino.casinoBonus.bonusUrl}
            className="block rounded border"
            rel="sponsored"
            target="_blank"
          >
            <Image
              src={casino.images.url}
              alt={casino.title}
              width={206}
              height={88}
              className="w-full rounded"
              priority={index < 3}
            />
          </Link>
        </div>
      </td>

      {/* Rating Cell */}
      <td className="text-center w-1/2 md:w-auto">
        <div className="px-3 py-3 flex h-full flex-col items-center justify-center bg-white rounded-tr-lg md:rounded-tr-none">
          <CasinoRating
            ratingAvg={casino.ratingAvg}
            ratingCount={casino.ratingCount}
            casinoSlug={casino.slug}
            casinoTitle={casino.title}
            translations={translations}
            showVotes={true}
          />
        </div>
      </td>

      {/* Welcome Bonus Cell */}
      <td className="w-full md:w-auto bg-white">
        <div className="flex flex-col items-center justify-center h-full px-3 py-3">
          <div className="text-[#7C838D] text-center text-sm leading-[18px] font-bold mb-2 md:hidden">
            {translations.casinoTableHeadingBonus}
          </div>

          <Link
            href={casino.casinoBonus.bonusUrl}
            className="flex underline text-center font-lato hover:text-primary transition-colors"
            rel="sponsored"
            target="_blank"
          >
            <span dangerouslySetInnerHTML={{ __html: welcomeBonus }} />
          </Link>

          {/* Desktop terms tooltip */}
          <span
            className="hidden md:flex items-center cursor-pointer text-xs text-grey-500 underline mr-[7px]"
            title={casino.bonusSection?.termsConditions}
            data-tooltip-placement="left"
          >
            {translations.wageringRequirement}
            <FontAwesomeIcon
              icon={faCircleInfo}
              className="w-3 h-3 fill-text-grey-500 ml-1"
            />
          </span>

          {/* Mobile collapsible terms */}
          <div className="w-full">
            <Collapsible
              id={`welcomeBonus${index}`}
              label={
                translations.wageringRequirement || "Wagering Requirements"
              }
              containerClass="w-full md:hidden mt-2"
              labelClass="text-sm items-center text-grey-500"
              content={casino.bonusSection?.termsConditions}
            />
          </div>
        </div>
      </td>

      {/* No Deposit Bonus Cell */}
      <td className="w-full md:w-auto bg-gradient-to-r from-no-deposit-gradient/20 via-white/30 via-[percentage:30%_70%] to-no-deposit-gradient/20">
        <div className="flex flex-col items-center justify-center h-full px-3 py-3">
          <div className="text-[#7C838D] text-center text-sm leading-[18px] font-bold mb-2 md:hidden">
            {translations.withoutDeposit}
          </div>

          {noDepositBonus.bonus ? (
            <>
              <Link
                href={casino.casinoBonus.bonusUrl}
                className="flex underline text-center font-lato hover:text-primary transition-colors"
                rel="sponsored"
                target="_blank"
              >
                <span
                  dangerouslySetInnerHTML={{ __html: noDepositBonus.bonus }}
                />
              </Link>

              {/* Desktop terms tooltip */}
              <span
                className="hidden md:flex items-center cursor-pointer text-xs text-grey-500 underline mr-[7px]"
                title={noDepositBonus.terms || undefined}
                data-tooltip-placement="left"
              >
                {translations.wageringRequirement}
                <FontAwesomeIcon
                  icon={faCircleInfo}
                  className="w-3 h-3 fill-text-grey-500 ml-1"
                />
              </span>

              {/* Mobile collapsible terms */}
              <div className="w-full">
                <Collapsible
                  id={`noDepositBonus${index}`}
                  label={
                    translations.wageringRequirement || "Wagering Requirements"
                  }
                  containerClass="w-full md:hidden mt-2"
                  labelClass="text-sm items-center text-grey-500"
                  content={noDepositBonus.terms}
                />
              </div>
            </>
          ) : (
            <span>-</span>
          )}
        </div>
      </td>

      {/* Register/Action Cell */}
      <td className="w-full !border-l-0 md:w-auto">
        <div className="h-full py-3 bg-white rounded-tr-none rounded-br-lg rounded-bl-lg md:rounded-tr-lg md:rounded-bl-none">
          <div className="h-full px-3 flex flex-col justify-end items-center sm:justify-center">
            {casino.casinoBonus.bonusCode && (
              <div className="mb-[7px] text-[#212529] text-[14px] font-bold">
                {translations.bonusCode}
              </div>
            )}

            {casino.casinoBonus.bonusUrl && (
              <Link
                href={casino.casinoBonus.bonusUrl}
                className="btn btn-misc uppercase text-white w-full mb-[7px] font-extrabold"
                rel="sponsored"
                target="_blank"
              >
                {casino.casinoBonus.bonusCode || translations.visitSite}
              </Link>
            )}

            {/* Desktop terms tooltip */}
            <span
              className="hidden md:flex items-center cursor-pointer text-xs text-grey-500 underline mr-[7px]"
              title={casino.termsAndConditions?.copy}
              dangerouslySetInnerHTML={{
                __html: `${translations.termsConditions} <svg class="w-3 h-3 fill-grey-500 ml-1" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>`,
              }}
            />

            {/* Mobile collapsible terms */}
            <div className="w-full">
              <Collapsible
                id={`bonus${index}`}
                label={translations.termsConditions || "Terms & Conditions"}
                containerClass="w-full md:hidden mt-2"
                labelClass="text-sm items-center text-grey-500"
                content={casino.termsAndConditions?.copy}
              />
            </div>
          </div>
        </div>
      </td>
    </tr>
  );
}
