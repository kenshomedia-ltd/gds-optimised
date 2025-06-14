// src/lib/utils/type-conversions.ts

import type { BlockComponent } from "@/types/strapi.types";
import type { CustomPageBlock } from "@/types/custom-page.types";
import type { HomepageBlock } from "@/types/homepage.types";

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
  ];

  if (validComponents.includes(block.__component)) {
    return block as CustomPageBlock;
  }

  console.warn(`Unknown block component type: ${block.__component}`);
  return null;
}

/**
 * Convert array of BlockComponent to CustomPageBlock array
 */
export function blockComponentsToCustomPageBlocks(
  blocks: BlockComponent[]
): CustomPageBlock[] {
  return blocks
    .map(blockComponentToCustomPageBlock)
    .filter((block): block is CustomPageBlock => block !== null);
}

/**
 * Convert HomepageBlock to BlockComponent
 */
export function homepageBlockToBlockComponent(
  block: HomepageBlock
): BlockComponent {
  return block as BlockComponent;
}

/**
 * Convert array of HomepageBlock to BlockComponent array
 */
export function homepageBlocksToBlockComponents(
  blocks: HomepageBlock[]
): BlockComponent[] {
  return blocks as BlockComponent[];
}

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
 * Safely convert any block to BlockComponent
 */
export function toBlockComponent(block: unknown): BlockComponent | null {
  if (isValidBlockComponent(block)) {
    return block;
  }
  return null;
}

/**
 * Safely convert array of any blocks to BlockComponent array
 */
export function toBlockComponents(blocks: unknown[]): BlockComponent[] {
  return blocks
    .map(toBlockComponent)
    .filter((block): block is BlockComponent => block !== null);
}
