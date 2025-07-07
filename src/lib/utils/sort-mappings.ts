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
 * Reverse mapping from Strapi sort parameters to display values
 * Used to convert API responses back to UI-friendly format
 */
const REVERSE_SORT_MAPPINGS: Record<string, string> = {
  "createdAt:desc": "Newest",
  "views:desc": "Most Popular",
  "views:desc,ratingAvg:desc": "Most Popular", // Handle combined sorts
  "ratingAvg:desc": "Top Rated",
  "title:asc": "Alphabetical",
  "title:desc": "Reverse Alphabetical",
  "createdAt:asc": "Oldest",
  "updatedAt:desc": "Recently Updated",
};

/**
 * Alternative human-readable formats that might come from CMS
 * Maps various possible CMS values to our standard GAME_SORT_OPTIONS
 */
const CMS_SORT_ALIASES: Record<string, string> = {
  // Standard formats
  Newest: "Newest",
  "Most Popular": "Most Popular",
  "Top Rated": "Top Rated",
  Alphabetical: "Alphabetical",

  // Alternative CMS formats
  Popular: "Most Popular",
  Rating: "Top Rated",
  New: "Newest",
  Latest: "Newest",
  "Best Rated": "Top Rated",
  "Highest Rated": "Top Rated",
  "A-Z": "Alphabetical",
  Alphabetic: "Alphabetical",

  // Italian variants (if needed)
  nuove: "Newest",
  giocati: "Most Popular",
  votate: "Top Rated",
  az: "Alphabetical",
  za: "Reverse Alphabetical",

  // Any Strapi format that might leak through
  "createdAt:desc": "Newest",
  "views:desc": "Most Popular",
  "ratingAvg:desc": "Top Rated",
  "title:asc": "Alphabetical",
};

/**
 * Get Strapi sort parameter from display value
 * @param sortKey - The display value from CMS
 * @param defaultSort - Default sort to use if key not found
 * @returns Strapi sort parameter
 */
export function getStrapiSort(
  sortKey: string | undefined,
  defaultSort: string = "views:desc"
): string {
  if (!sortKey) return defaultSort;

  return SORT_MAPPINGS[sortKey as SortKey] || defaultSort;
}

// Create a type for valid game sort values
type ValidGameSortValue = (typeof GAME_SORT_OPTIONS)[number]["value"];

/**
 * Type guard to check if a string is a valid game sort value
 */
function isValidGameSortValue(value: string): value is ValidGameSortValue {
  return GAME_SORT_OPTIONS.some((option) => option.value === value);
}

/**
 * Convert any sort value to the standard GameFilters format
 * This handles various input formats:
 * - Human-readable from CMS ("Most Popular", "Popular", etc.)
 * - Strapi sort parameters ("views:desc", etc.)
 * - Alternative naming conventions
 *
 * @param sortValue - The sort value in any format
 * @param defaultSort - Default to return if no match found
 * @returns Standard GameFilters format (matches GAME_SORT_OPTIONS values)
 */
export function normalizeGameSort(
  sortValue: string | undefined,
  defaultSort: string = "Most Popular"
): string {
  if (!sortValue) return defaultSort;

  // First, check if it's already in the correct format
  if (isValidGameSortValue(sortValue)) {
    return sortValue;
  }

  // Check CMS aliases
  if (CMS_SORT_ALIASES[sortValue]) {
    return CMS_SORT_ALIASES[sortValue];
  }

  // Check reverse mapping from Strapi format
  if (REVERSE_SORT_MAPPINGS[sortValue]) {
    return REVERSE_SORT_MAPPINGS[sortValue];
  }

  // Try case-insensitive matching
  const lowerValue = sortValue.toLowerCase();
  for (const [alias, standard] of Object.entries(CMS_SORT_ALIASES)) {
    if (alias.toLowerCase() === lowerValue) {
      return standard;
    }
  }

  // If no match found, return default
  console.warn(
    `Unknown sort value: "${sortValue}", using default: "${defaultSort}"`
  );
  return defaultSort;
}

/**
 * Parse multiple sort options
 * @param sortKeys - Array of sort keys or comma-separated string
 * @param defaultSort - Default sort to use
 * @returns Array of Strapi sort parameters
 */
export function getMultipleSorts(
  sortKeys: string | string[] | undefined,
  defaultSort: string = "views:desc"
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



