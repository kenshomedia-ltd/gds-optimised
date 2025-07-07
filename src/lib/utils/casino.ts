// src/lib/utils/casino.ts

import type { CasinoData } from "@/types/casino.types";

/**
 * Format welcome bonus display
 */
export function formatWelcomeBonus(
  casino: CasinoData,
  reloadBonusText?: string
): string {
  const bonusSection = casino.bonusSection;
  const casinoBonus = casino.casinoBonus;

  if (!bonusSection && !casinoBonus) return "-";

  let bonusText = "";

  // Handle bonus amount
  if (bonusSection?.bonusAmount) {
    bonusText = `${bonusSection.bonusAmount}€ ${reloadBonusText}`;
  }

  // Handle cashback
  if (bonusSection?.cashBack) {
    bonusText = bonusSection.cashBack;
  }

  // Handle free spins
  if (bonusSection?.freeSpin) {
    bonusText = bonusText
      ? `${bonusText} + ${bonusSection.freeSpin} FS`
      : `${bonusSection.freeSpin} FS`;
  }

  // Use label if no specific bonus data
  if (!bonusText && casinoBonus?.bonusLabel) {
    bonusText = casinoBonus.bonusLabel;
  }

  return bonusText || reloadBonusText || "-";
}

/**
 * Format no deposit bonus display
 */
export function formatNoDepositBonus(
  casino: CasinoData,
  translations: { withoutDeposit?: string; freeSpins?: string } = {}
): { bonus: string | null; terms: string | null } {
  const noDeposit = casino.noDepositSection;
  const freeSpins = casino.freeSpinsSection;

  let bonusText = "";
  let termsText = "";

  // Handle no deposit bonus
  if (noDeposit?.bonusAmount) {
    bonusText = `${noDeposit.bonusAmount}€`;
    termsText = noDeposit.termsConditions || "";
  }

  // Handle free spins
  if (freeSpins?.bonusAmount) {
    const fsText = `${freeSpins.bonusAmount} ${
      translations.freeSpins || "Free Spins"
    }`;
    bonusText = bonusText ? `${bonusText} + ${fsText}` : fsText;

    if (freeSpins.termsConditions) {
      termsText = termsText
        ? `${termsText}. ${freeSpins.termsConditions}`
        : freeSpins.termsConditions;
    }
  }

  return {
    bonus: bonusText || null,
    terms: termsText || null,
  };
}

/**
 * Calculate days since creation for "new" badge
 */
export function isNewCasino(
  createdAt?: string,
  daysThreshold: number = 14
): boolean {
  if (!createdAt) return false;

  const createdDate = new Date(createdAt);
  const daysDiff = Math.floor(
    (Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  return daysDiff <= daysThreshold;
}

/**
 * Get casino badge info
 */
export function getCasinoBadge(
  casino: CasinoData,
  translations: Record<string, string> = {}
): { text: string; type: "exclusive" | "new" } | null {
  if (casino.Badges) {
    return {
      text: translations.exclusive || "EXCLUSIVE",
      type: "exclusive",
    };
  }

  if (isNewCasino(casino.createdAt)) {
    return {
      text: translations.newCasino || "NEW CASINO",
      type: "new",
    };
  }

  return null;
}

/** Mapping of CMS casino filter slugs to internal bonusKey values */
const CASINO_FILTER_ALIASES: Record<string, string> = {
  "bonus di benvenuto": "bonusSection",
  "welcome bonus": "bonusSection",
  welcome: "bonusSection",
  "senza deposito": "noDepositSection",
  "no deposit": "noDepositSection",
  "giri gratis": "freeSpinsSection",
  "free spins": "freeSpinsSection",
};

/**
 * Normalize casino filter slug from CMS to a bonusKey value
 */
export function normalizeCasinoFilter(
  filter: string | undefined,
  defaultFilter: string = "bonusSection"
): string {
  if (!filter) return defaultFilter;

  const normalized = filter.trim().toLowerCase();

  if (CASINO_FILTER_ALIASES[normalized]) {
    return CASINO_FILTER_ALIASES[normalized];
  }

  // Partial match support
  for (const [alias, value] of Object.entries(CASINO_FILTER_ALIASES)) {
    if (normalized.includes(alias.toLowerCase())) {
      return value;
    }
  }

  return defaultFilter;
}
