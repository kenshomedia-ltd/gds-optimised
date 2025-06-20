// src/components/widgets/CasinoComparison/CasinoComparison.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { Image } from "@/components/common/Image";
import { StarRatingDisplay } from "@/components/ui/StarRating";
import { Button } from "@/components/ui";
import { Collapsible } from "@/components/ui/Collapsible";
import { cn } from "@/lib/utils/cn";
import { formatWelcomeBonus, formatNoDepositBonus } from "@/lib/utils/casino";
import type { CasinoData } from "@/types/casino.types";

interface CasinoComparisonProps {
  casinos: CasinoData[];
  translations: Record<string, string>;
  className?: string;
}

/**
 * CasinoComparison Widget Component
 *
 * Displays a comparison table of up to 3 casinos
 * Features:
 * - Responsive grid layout
 * - Badge indicators for top 3 positions
 * - Bonus information display
 * - Mobile-optimized collapsibles
 * - Progressive enhancement
 */
export function CasinoComparison({
  casinos,
  translations,
  className,
}: CasinoComparisonProps) {
  if (!casinos || casinos.length === 0) {
    return null;
  }

  // Limit to first 3 casinos for comparison
  const comparisonCasinos = casinos.slice(0, 3);

  // Badge colors for positions
  const badgeGradients = [
    "from-[#ffd976] to-[#ffbb38]", // Gold
    "from-[#dbe5ef] to-[#b1bbc6]", // Silver
    "from-[#de7d45] to-[#9b4e22]", // Bronze
  ];

  return (
    <div className={cn("rounded-[6px]", className)}>
      {/* Header */}
      <div className="text-center px-3 py-[11px] bg-table-header-bkg rounded-tr-[6px] rounded-tl-[6px] md:text-start">
        <span className="text-[20px] leading-[24px] font-bold text-white">
          {translations.casinoTableHeading || "Confronta i Casino"}
        </span>
      </div>

      {/* Comparison Grid */}
      <div className="p-3 rounded-br-[6px] rounded-bl-[6px] bg-grey-100 gap-y-3 md:flex md:gap-y-0 md:gap-x-3">
        {comparisonCasinos.map((casino, index) => (
          <CasinoComparisonItem
            key={casino.id}
            casino={casino}
            position={index}
            badgeGradient={badgeGradients[index]}
            translations={translations}
          />
        ))}
      </div>
    </div>
  );
}

interface CasinoComparisonItemProps {
  casino: CasinoData;
  position: number;
  badgeGradient: string;
  translations: Record<string, string>;
}

function CasinoComparisonItem({
  casino,
  position,
  badgeGradient,
  translations,
}: CasinoComparisonItemProps) {
  const isNew =
    casino.createdAt &&
    new Date().getTime() - new Date(casino.createdAt).getTime() <
      14 * 24 * 60 * 60 * 1000;

  return (
    <div className="flex flex-col basis-1 md:basis-1/3 mb-4 md:mb-0">
      {/* Casino Logo Section */}
      <div className="h-full px-3 py-2 bg-white rounded-tl-lg relative overflow-hidden">
        {/* Badge for new or exclusive casinos */}
        {(casino.Badges || isNew) && (
          <span
            className={cn(
              "z-10 rotate-45 absolute text-white text-xs px-[36.4px] uppercase top-[25px] -right-[40px]",
              casino.Badges ? "bg-primary" : "bg-success"
            )}
          >
            {casino.Badges ? translations.exclusive : translations.newCasino}
          </span>
        )}

        {/* Position badge */}
        {position <= 2 && (
          <span
            className={cn(
              "w-[28px] h-6 absolute flex justify-center items-center p-[2px] top-0 left-[18px]",
              "rounded-bl rounded-br text-white text-sm font-bold",
              `bg-gradient-to-b ${badgeGradient}`
            )}
          >
            #{position + 1}
          </span>
        )}

        {/* Casino image link */}
        <Link
          href={casino.casinoBonus.bonusUrl}
          className={cn(
            "block rounded border",
            position <= 2
              ? `bg-gradient-to-b ${badgeGradient}`
              : "border-transparent"
          )}
          rel="sponsored"
          target="_blank"
        >
          <Image
            src={casino.images.url}
            alt={casino.title}
            width={230}
            height={90}
            className="w-full rounded min-h-[89.6px] object-contain"
            loading="lazy"
          />
        </Link>
      </div>

      {/* Ratings Section */}
      <div className="flex flex-col items-center bg-white justify-center pb-3">
        <div className="py-2">
          <StarRatingDisplay
            rating={casino.ratingAvg}
            totalReviews={casino.ratingCount}
            showCount={true}
            size="sm"
          />
        </div>
        <div className="flex items-center">
          <Link
            href={`/casino/recensione/${casino.slug}/`}
            className="flex text-[14px] space-x-2 text-grey-500 hover:text-primary transition-colors"
          >
            <span className="underline">
              {translations.review || "Recensione"}
            </span>
            <svg className="w-[14px] h-[14px] fill-current" viewBox="0 0 24 24">
              <path d="M9.29 15.88L13.17 12 9.29 8.12a.996.996 0 111.41-1.41l4.59 4.59a.996.996 0 010 1.41l-4.59 4.59a.996.996 0 01-1.41-1.41z" />
            </svg>
          </Link>
        </div>
      </div>

      {/* Welcome Bonus Section */}
      <div className="flex flex-col border-t border-grey-300 bg-white items-center justify-center h-full px-3 py-6">
        <div className="text-[#7C838D] text-center text-sm leading-[18px] font-bold">
          {translations.casinoTableHeadingBonus || "Bonus di Benvenuto"}
        </div>
        <Link
          href={casino.casinoBonus.bonusUrl}
          className="flex underline text-center font-bold my-4 text-primary hover:text-primary-hover transition-colors"
          rel="sponsored"
          target="_blank"
        >
          {formatWelcomeBonus(casino, translations.reloadBonus)}
        </Link>

        {/* Desktop wagering info */}
        <span
          className="hidden md:flex items-center cursor-help text-xs text-grey-500 underline"
          title={casino.bonusSection?.termsConditions}
        >
          {translations.wageringRequirement || "Requisiti di puntata"}
          <svg className="w-3 h-3 ml-1 fill-grey-500" viewBox="0 0 16 16">
            <path d="M8 0a8 8 0 100 16A8 8 0 008 0zm1 12H7v-2h2v2zm0-3H7V4h2v5z" />
          </svg>
        </span>

        {/* Mobile wagering collapsible */}
        <div className="w-full md:hidden">
          <Collapsible
            id={`welcomeBonus${casino.id}`}
            label={translations.wageringRequirement || "Requisiti di puntata"}
            content={casino.bonusSection?.termsConditions || ""}
            containerClass="w-full mt-2"
            labelClass="text-sm items-center text-grey-500"
          />
        </div>
      </div>

      {/* No Deposit Bonus Section */}
      <div className="flex flex-col border-t border-grey-300 bg-gradient-to-r from-secondary/20 via-white/30 via-[percentage:30%_70%] to-secondary/20 items-center justify-center h-full px-3 py-6">
        <div className="text-[#7C838D] text-center text-sm leading-[18px] font-bold">
          {translations.withoutDeposit || "Senza Deposito"}
        </div>
        <Link
          href={casino.casinoBonus.bonusUrl}
          className="flex underline text-center font-bold my-4 text-primary hover:text-primary-hover transition-colors"
          rel="sponsored"
          target="_blank"
        >
          {formatNoDepositBonus(casino, translations).bonus || "-"}
        </Link>

        {/* Desktop no deposit wagering info */}
        <span
          className="hidden md:flex items-center cursor-help text-xs text-grey-500 underline"
          title={formatNoDepositBonus(casino, translations).terms}
        >
          {translations.wageringRequirement || "Requisiti di puntata"}
          <svg className="w-3 h-3 ml-1 fill-grey-500" viewBox="0 0 16 16">
            <path d="M8 0a8 8 0 100 16A8 8 0 008 0zm1 12H7v-2h2v2zm0-3H7V4h2v5z" />
          </svg>
        </span>

        {/* Mobile no deposit collapsible */}
        <div className="w-full md:hidden">
          <Collapsible
            id={`noDepositBonus${casino.id}`}
            label={translations.wageringRequirement || "Requisiti di puntata"}
            content={formatNoDepositBonus(casino, translations).terms || ""}
            containerClass="w-full mt-2"
            labelClass="text-sm items-center text-grey-500"
          />
        </div>
      </div>

      {/* CTA Section */}
      <div className="flex flex-col border-t border-grey-300 bg-white items-center justify-center h-full px-3 py-6">
        <div className="h-full w-full flex flex-col justify-end items-center sm:justify-center">
          {/* Bonus code if available */}
          {casino.casinoBonus.bonusCode && (
            <div className="mb-[7px] text-[#212529] text-[14px] font-bold">
              {translations.bonusCode || "Codice Bonus"}
            </div>
          )}

          {/* CTA Button */}
          <Button
            variant="link"
            href={casino.casinoBonus.bonusUrl}
            rel="sponsored"
            target="_blank"
            className="w-full mb-[7px] uppercase font-extrabold"
            size="lg"
          >
            {casino.casinoBonus.bonusCode ||
              translations.visitSite ||
              "VISITA IL SITO"}
          </Button>

          {/* Desktop terms info */}
          <span
            className="hidden md:flex items-center cursor-help text-xs text-grey-500 underline"
            title={casino.termsAndConditions?.copy}
          >
            {translations.termsConditions || "Termini e Condizioni"}
            <svg className="w-3 h-3 ml-1 fill-grey-500" viewBox="0 0 16 16">
              <path d="M8 0a8 8 0 100 16A8 8 0 008 0zm1 12H7v-2h2v2zm0-3H7V4h2v5z" />
            </svg>
          </span>

          {/* Mobile terms collapsible */}
          <div className="w-full md:hidden">
            <Collapsible
              id={`terms${casino.id}`}
              label={translations.termsConditions || "Termini e Condizioni"}
              content={casino.termsAndConditions?.copy || ""}
              containerClass="w-full mt-2"
              labelClass="text-sm items-center text-grey-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
