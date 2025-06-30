// src/types/star-rating.types.ts

/**
 * Star Rating Component Types
 */

/**
 * Translations interface for StarRatingInteractive component
 */
export interface StarRatingTranslations {
  /** Text shown during rating update */
  updating?: string;
  /** Singular form of "rating" */
  rating?: string;
  /** Plural form of "rating" */
  ratings?: string;
  /** Text for "Rate this" action */
  rateThis?: string;
  /** Text for "casino" */
  casino?: string;
  /** Text for "game" */
  game?: string;
  /** Text for "Current average:" */
  currentAverage?: string;
  /** Text for "stars" */
  stars?: string;
  /** Text shown when user has already rated */
  youHaveAlreadyRated?: string;
  /** Error message for failed rating update */
  failedToUpdateRating?: string;
  /** Generic error message */
  anErrorOccurred?: string;
}

/**
 * Common star rating sizes
 */
export type StarRatingSize = "sm" | "md" | "lg";

/**
 * Rating types supported by the system
 */
export type RatingType = "games" | "casinos";

/**
 * Position options for rating value display
 */
export type ValuePosition = "right" | "bottom";

/**
 * Base props for all star rating components
 */
export interface BaseStarRatingProps {
  /** Maximum rating value (usually 5) */
  maxRating?: number;
  /** Initial/current rating value */
  initialRating?: number;
  /** Visual size of the stars */
  size?: StarRatingSize;
  /** Additional CSS classes */
  className?: string;
  /** Whether to show the rating count */
  showCount?: boolean;
  /** Whether to show the numeric rating value */
  showValue?: boolean;
  /** Position of the value display */
  valuePosition?: ValuePosition;
  /** Whether the rating is read-only */
  readonly?: boolean;
  /** Custom ARIA label for accessibility */
  ariaLabel?: string;
}

/**
 * Props for the interactive star rating component
 */
export interface StarRatingInteractiveProps extends BaseStarRatingProps {
  /** Unique document ID for the rated item */
  documentId: string;
  /** Optional slug for path revalidation */
  slug?: string;
  /** Initial count of ratings */
  initialCount?: number;
  /** Type of item being rated */
  ratingType?: RatingType;
  /** Success callback with new average and count */
  onRatingSuccess?: (newAvg: number, newCount: number) => void;
  /** Error callback */
  onRatingError?: (error: string) => void;
  /** Title of the item for better accessibility */
  itemTitle?: string;
  /** Optional translations for internationalization */
  translations?: StarRatingTranslations;
}

/**
 * Props for the display-only star rating component
 */
export interface StarRatingDisplayProps extends BaseStarRatingProps {
  /** Current rating value to display */
  rating: number;
  /** Total number of ratings */
  ratingCount?: number;
}

/**
 * Props for the server-rendered star rating component
 */
export interface StarRatingServerProps extends StarRatingDisplayProps {
  /** Whether to use semantic markup for better SEO */
  useSemantic?: boolean;
}
