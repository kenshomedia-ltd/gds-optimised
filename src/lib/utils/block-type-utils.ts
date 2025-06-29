// src/lib/utils/block-type-utils.ts

import type { BlockComponent } from "@/types/strapi.types";
import type { CustomPageBlock } from "@/types/custom-page.types";
import type { HomepageBlock } from "@/types/homepage.types";
import type { BlockData } from "@/types/dynamic-block.types";

/**
 * Block Type Utilities
 *
 * This file consolidates all block type conversions and utilities
 * for mapping between different block type systems in the application.
 */

// ============================================
// Mapping Functions (for DynamicBlock component)
// ============================================

/**
 * Maps CustomPageBlock to BlockData for DynamicBlock component
 * Used in [...slug]/page.tsx
 */
export function mapCustomPageBlockToBlockData(
  block: CustomPageBlock
): BlockData {
  return block as unknown as BlockData;
}

/**
 * Maps array of CustomPageBlock to BlockData array
 */
export function mapCustomPageBlocksToBlockData(
  blocks: CustomPageBlock[]
): BlockData[] {
  return blocks.map(mapCustomPageBlockToBlockData);
}

/**
 * Maps HomepageBlock to BlockData for DynamicBlock component
 * Used in page.tsx (homepage)
 */
export function mapHomepageBlockToBlockData(block: HomepageBlock): BlockData {
  return block as unknown as BlockData;
}

/**
 * Maps array of HomepageBlock to BlockData array
 */
export function mapHomepageBlocksToBlockData(
  blocks: HomepageBlock[]
): BlockData[] {
  return blocks.map(mapHomepageBlockToBlockData);
}

/**
 * Generic block mapper that handles any block type
 * Useful when block source is dynamic
 */
export function mapBlockToBlockData(
  block: CustomPageBlock | HomepageBlock | BlockComponent
): BlockData {
  return block as unknown as BlockData;
}

// ============================================
// Conversion Functions (with validation)
// ============================================

/**
 * Convert CustomPageBlock to BlockComponent
 * This is safe because CustomPageBlock extends the base BlockComponent interface
 */
export function customPageBlockToBlockComponent(
  block: CustomPageBlock
): BlockComponent {
  return block as BlockComponent;
}

/**
 * Convert array of CustomPageBlock to BlockComponent array
 */
export function customPageBlocksToBlockComponents(
  blocks: CustomPageBlock[]
): BlockComponent[] {
  return blocks as BlockComponent[];
}

/**
 * Convert BlockComponent to CustomPageBlock with type checking
 * Returns null if the component type is not valid for custom pages
 */
export function blockComponentToCustomPageBlock(
  block: BlockComponent
): CustomPageBlock | null {
  // List of valid custom page block components
  const validComponents = [
    "shared.introduction-with-image",
    "shared.single-content",
    "shared.image",
    "games.games-carousel",
    "casinos.casino-list",
    "shared.overview-block",
    "games.new-and-loved-slots",
    "shared.quicklinks",
    "homepage.home-featured-providers",
    "shared.how-to-group",
  ];

  if (validComponents.includes(block.__component)) {
    return block as CustomPageBlock;
  }

  console.warn(
    `Unknown block component type for custom page: ${block.__component}`
  );
  return null;
}

/**
 * Convert HomepageBlock to BlockComponent
 */
export function homepageBlockToBlockComponent(
  block: HomepageBlock
): BlockComponent {
  return block as BlockComponent;
}

// ============================================
// Type Guards and Validators
// ============================================

/**
 * Type guard to check if a block is a valid BlockComponent
 */
export function isValidBlockComponent(block: unknown): block is BlockComponent {
  return (
    typeof block === "object" &&
    block !== null &&
    "id" in block &&
    "__component" in block &&
    typeof (block as BlockComponent).id === "number" &&
    typeof (block as BlockComponent).__component === "string"
  );
}

/**
 * Type guard to check if a block is a CustomPageBlock
 */
export function isCustomPageBlock(
  block: BlockComponent
): block is CustomPageBlock {
  const customPageComponents = [
    "shared.introduction-with-image",
    "shared.single-content",
    "shared.image",
    "games.games-carousel",
    "casinos.casino-list",
    "shared.overview-block",
    "games.new-and-loved-slots",
    "shared.quicklinks",
    "homepage.home-featured-providers",
    "shared.how-to-group",
  ];

  return customPageComponents.includes(block.__component);
}

/**
 * Type guard to check if a block is a HomepageBlock
 */
export function isHomepageBlock(block: BlockComponent): block is HomepageBlock {
  const homepageComponents = [
    "homepage.home-game-list",
    "homepage.home-casino-list",
    "homepage.home-blog-list",
    "homepage.home-providers",
    "homepage.home-featured-providers",
    "homepage.home-testimonies",
    "homepage.home-featured-categories",
    "shared.introduction-with-image",
    "shared.single-content",
    "shared.overview-block",
  ];

  return homepageComponents.includes(block.__component);
}

// ============================================
// Safe Conversion Functions
// ============================================

/**
 * Safely convert any block to BlockComponent
 * Returns null if the block is invalid
 */
export function toBlockComponent(block: unknown): BlockComponent | null {
  if (isValidBlockComponent(block)) {
    return block;
  }
  return null;
}

/**
 * Safely convert array of any blocks to BlockComponent array
 * Filters out invalid blocks
 */
export function toBlockComponents(blocks: unknown[]): BlockComponent[] {
  return blocks
    .map(toBlockComponent)
    .filter((block): block is BlockComponent => block !== null);
}

/**
 * Safely convert to BlockData for DynamicBlock
 * Handles all block types with validation
 */
export function toBlockData(block: unknown): BlockData | null {
  const validBlock = toBlockComponent(block);
  if (validBlock) {
    return mapBlockToBlockData(validBlock);
  }
  return null;
}

// ============================================
// Utility Functions
// ============================================

/**
 * Get block type category (homepage, custom-page, shared)
 */
export function getBlockCategory(
  componentType: string
): "homepage" | "custom-page" | "shared" | "unknown" {
  if (componentType.startsWith("homepage.")) return "homepage";
  if (
    componentType.startsWith("games.") ||
    componentType.startsWith("casinos.")
  )
    return "custom-page";
  if (componentType.startsWith("shared.")) return "shared";
  return "unknown";
}

/**
 * Filter blocks by component type
 */
export function filterBlocksByType<T extends BlockComponent>(
  blocks: T[],
  componentTypes: string[]
): T[] {
  return blocks.filter((block) => componentTypes.includes(block.__component));
}

/**
 * Group blocks by component type
 */
export function groupBlocksByType<T extends BlockComponent>(
  blocks: T[]
): Record<string, T[]> {
  return blocks.reduce((acc, block) => {
    const type = block.__component;
    if (!acc[type]) acc[type] = [];
    acc[type].push(block);
    return acc;
  }, {} as Record<string, T[]>);
}
