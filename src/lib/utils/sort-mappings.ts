// src/lib/utils/sort-mappings.ts
/**
 * Centralized sort mappings for Strapi queries
 * Maps frontend display values to Strapi sort parameters
 */
export const SORT_MAPPINGS = {
  // Game/Content sorting
  Newest: "createdAt:desc",
  "Most Popular": "views:desc",
  "Top Rated": "ratingAvg:desc",
  "Top Rated Author": "authorRatings:desc",
  "Top Rated Users": "ratingAvg:desc",
  "Most Viewed": "views:desc",

  // Additional common sort options
  Oldest: "createdAt:asc",
  Alphabetical: "title:asc",
  "Reverse Alphabetical": "title:desc",
  "Recently Updated": "updatedAt:desc",

  // Casino specific
  "Highest Bonus": "bonusAmount:desc",

  // Blog specific
  "Most Commented": "commentsCount:desc",

  // Game specific
  nuove: "createdAt:desc",
  az: "title:asc",
  za: "title:desc",
  giocati: "views:desc",
  votate: "ratingAvg:desc",
} as const;

export type SortKey = keyof typeof SORT_MAPPINGS;

/**
 * Game-specific sort options for UI dropdowns
 * Each option has a value (key) and a label for display
 */
export const GAME_SORT_OPTIONS = [
  { value: "Newest", label: "filtersNew" },
  { value: "Most Popular", label: "filtersPopular" },
  { value: "Top Rated", label: "filtersRating" },
  { value: "Alphabetical", label: "filtersAZ" },
] as const;

/**
 * Get Strapi sort parameter from display value
 * @param sortKey - The display value from CMS
 * @param defaultSort - Default sort to use if key not found
 * @returns Strapi sort parameter
 */
export function getStrapiSort(
  sortKey: string | undefined,
  defaultSort: string = "createdAt:desc"
): string {
  if (!sortKey) return defaultSort;

  return SORT_MAPPINGS[sortKey as SortKey] || defaultSort;
}

/**
 * Parse multiple sort options
 * @param sortKeys - Array of sort keys or comma-separated string
 * @param defaultSort - Default sort to use
 * @returns Array of Strapi sort parameters
 */
export function getMultipleSorts(
  sortKeys: string | string[] | undefined,
  defaultSort: string = "createdAt:desc"
): string[] {
  if (!sortKeys) return [defaultSort];

  const keys = Array.isArray(sortKeys)
    ? sortKeys
    : sortKeys.split(",").map((s) => s.trim());

  return (
    (keys
      .map((key) => SORT_MAPPINGS[key as SortKey] || null)
      .filter(Boolean) as string[]) || [defaultSort]
  );
}



/**
 * Casino sort options
 */
export const CASINO_SORT_OPTIONS = [
  { value: "ratingAvg:desc", label: "casinoTopRated" },
  { value: "authorRatings:desc", label: "casinoAuthorRatings" },
  { value: "bonusSection.bonusAmount:desc", label: "casinoWelcomeBonus" },
  { value: "title:asc", label: "casinoAlphabetic" },
  { value: "createdAt:desc", label: "casinoPostDate" },
] as const;

/**
 * Bonus type options
 */
export const BONUS_TYPE_OPTIONS = [
  { value: "bonusSection", label: "welcomeBonus" },
  { value: "noDepositSection", label: "withoutDeposit" },
  { value: "freeSpinsSection", label: "freeSpins" },
] as const;

/**
 * Condition options
 */
export const CONDITION_OPTIONS = [
  { value: "After Registration", label: "conditionRegistration" },
  { value: "After Validation", label: "conditionValidateAcct" },
  { value: "After Deposit", label: "conditionDeposit" },
] as const;

/**
 * Bonus amount options
 */
export const BONUS_AMOUNT_OPTIONS = [
  50, 100, 200, 300, 500, 1000, 1500, 2000, 3000, 5000,
];

/**
 * Wagering requirement options
 */
export const WAGERING_OPTIONS = [
  "0x",
  "10x",
  "20x",
  "30x",
  "40x",
  "50x",
  "60x",
];
