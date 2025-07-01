// src/lib/utils/index.ts

// Class name utilities
export { cn } from "./cn";

// Image utilities (enhanced with basePath support)
export {
  isSvgUrl,
  isExternalUrl,
  buildImageUrl,
  isLocalImage,
  generateBlurDataURL,
  imageLoader,
  getBasePath,
  withBasePath,
  normalizeImageSrc,
} from "./image";

// SEO utilities
export {
  generateMetadata,
  generateJsonLd,
  generateBreadcrumbJsonLd,
  cleanDescription,
} from "./seo";

// Type conversion utilities (primary location)
export {
  customPageBlockToBlockComponent,
  customPageBlocksToBlockComponents,
  blockComponentToCustomPageBlock,
  blockComponentsToCustomPageBlocks,
  homepageBlockToBlockComponent,
  homepageBlocksToBlockComponents,
  isValidBlockComponent,
  toBlockComponent,
  toBlockComponents,
} from "./type-conversions";

// Block type utilities (excluding duplicates)
export {
  mapCustomPageBlockToBlockData,
  mapCustomPageBlocksToBlockData,
  mapHomepageBlockToBlockData,
  mapHomepageBlocksToBlockData,
  mapBlockToBlockData,
  getBlockCategory,
  filterBlocksByType,
  groupBlocksByType,
  isCustomPageBlock,
  isHomepageBlock,
  toBlockData,
} from "./block-type-utils";

// Accessibility utilities
export {
  generateId,
  announce,
  trapFocus,
  prefersReducedMotion,
  getContrastRatio,
  SkipToContent,
} from "./accessibility";

// Casino utilities
export {
  formatWelcomeBonus,
  formatNoDepositBonus,
  isNewCasino,
  getCasinoBadge,
} from "./casino";

// Sort mapping utilities
export {
  SORT_MAPPINGS,
  GAME_SORT_OPTIONS,
  CASINO_SORT_OPTIONS,
  BONUS_TYPE_OPTIONS,
  CONDITION_OPTIONS,
  BONUS_AMOUNT_OPTIONS,
  WAGERING_OPTIONS,
  getStrapiSort,
  getMultipleSorts,
  normalizeGameSort,
} from "./sort-mappings";

// Re-export types
export type { SortKey } from "./sort-mappings";
