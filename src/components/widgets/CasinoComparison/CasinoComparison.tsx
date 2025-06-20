// src/components/widgets/CasinoComparison/CasinoComparison.tsx

import Link from "next/link";
import { Image } from "@/components/common/Image";
import { StarRatingDisplay } from "@/components/ui/StarRating";
import { Button } from "@/components/ui";
import { Collapsible } from "@/components/ui/Collapsible";
import { cn } from "@/lib/utils/cn";
import {
  formatWelcomeBonus,
  formatNoDepositBonus,
  getCasinoBadge,
} from "@/lib/utils/casino";
import type { CasinoData } from "@/types/casino.types";

interface CasinoComparisonProps {
  casinos: CasinoData[];
  translations: Record<string, string>;
  className?: string;
}

/**
 * CasinoComparison Component
 *
 * Server-side rendered casino comparison widget
 * Displays up to 3 casinos side by side with bonus information
 *
 * Features:
 * - Position badges for top casinos
 * - Welcome and no deposit bonuses
 * - Responsive layout
 * - Collapsible terms on mobile
 */
export function CasinoComparison({
  casinos,
  translations,
  className,
}: CasinoComparisonProps) {
  // Only show first 3 casinos
  const displayCasinos = casinos.slice(0, 3);

  // Helper to get badge gradient based on position
  const getBadgeGradient = (position: number) => {
    switch (position) {
      case 0:
        return "from-[#FFD700] to-[#FFA500]"; // Gold
      case 1:
        return "from-[#C0C0C0] to-[#808080]"; // Silver
      case 2:
        return "from-[#CD7F32] to-[#8B4513]"; // Bronze
      default:
        return "";
    }
  };

  return (
    <div
      className={cn("grid grid-cols-1 md:grid-cols-3 gap-4 my-8", className)}
    >
      {displayCasinos.map((casino, index) => {
        const badgeGradient = getBadgeGradient(index);
        const noDepositData = formatNoDepositBonus(casino, translations);

        return (
          <div
            key={casino.id}
            className="flex flex-col border-2 border-grey-300 rounded-lg overflow-hidden"
          >
            <CasinoCard
              casino={casino}
              position={index}
              badgeGradient={badgeGradient}
              noDepositData={noDepositData}
              translations={translations}
            />
          </div>
        );
      })}
    </div>
  );
}

// Separate component to keep the main component clean
interface CasinoCardProps {
  casino: CasinoData;
  position: number;
  badgeGradient: string;
  noDepositData: { bonus: string | null; terms: string | null };
  translations: Record<string, string>;
}

function CasinoCard({
  casino,
  position,
  badgeGradient,
  noDepositData,
  translations,
}: CasinoCardProps) {
  // Use the getCasinoBadge utility to determine badge
  const badge = getCasinoBadge(casino, translations);

  return (
    <>
      {/* Casino Header with Image */}
      <div className="relative bg-grey-100 p-4">
        {/* Exclusive/New badge */}
        {badge && (
          <span
            className={cn(
              "absolute top-2 right-2 px-2 py-1 text-xs font-bold text-white rounded z-10",
              badge.type === "exclusive" ? "bg-primary" : "bg-success"
            )}
          >
            {badge.text}
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
            count={casino.ratingCount}
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
          title={casino.bonusSection?.termsConditions || undefined}
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
          {noDepositData.bonus || "-"}
        </Link>

        {/* Desktop no deposit wagering info */}
        <span
          className="hidden md:flex items-center cursor-help text-xs text-grey-500 underline"
          title={noDepositData.terms || undefined}
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
            content={noDepositData.terms || ""}
            containerClass="w-full mt-2"
            labelClass="text-sm items-center text-grey-500"
          />
        </div>
      </div>

      {/* CTA Section */}
      <div className="flex flex-col border-t border-grey-300 bg-white items-center justify-center h-full px-3 py-6">
        <div className="h-full w-full flex flex-col justify-end items-center sm:justify-center">
          <Button
            variant="default"
            href={casino.casinoBonus.bonusUrl}
            className="w-full max-w-[200px] uppercase"
            rel="sponsored"
            target="_blank"
          >
            {translations.playCasino || "GIOCA AL CASINÒ"}
          </Button>
          <span className="text-xs text-grey-500 mt-2 text-center">
            {translations.termsConditions || "*Si applicano T&C"}
          </span>
        </div>
      </div>
    </>
  );
}
