// src/app/actions/cache.ts
"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { strapiClient } from "@/lib/strapi/strapi-client";

/**
 * Revalidate entire layout (header, footer, navigation)
 */
export async function revalidateLayout() {
  try {
    // Revalidate Next.js cache tags
    revalidateTag("layout");
    revalidateTag("navigation");
    revalidateTag("translations");

    // Clear Redis cache
    await strapiClient.invalidateCache("layout");
    await strapiClient.invalidateCache("main-navigation");
    await strapiClient.invalidateCache("translation");

    // Revalidate root path
    revalidatePath("/", "layout");

    return { success: true };
  } catch (error) {
    console.error("Failed to revalidate layout:", error);
    return { success: false, error: "Failed to revalidate layout" };
  }
}

/**
 * Revalidate games data
 */
export async function revalidateGames() {
  try {
    // Revalidate cache tag
    revalidateTag("games");

    // Clear Redis cache for games
    await strapiClient.invalidateCache("games");

    // Revalidate games pages
    revalidatePath("/games", "page");

    return { success: true };
  } catch (error) {
    console.error("Failed to revalidate games:", error);
    return { success: false, error: "Failed to revalidate games" };
  }
}

/**
 * Revalidate specific game by slug
 */
export async function revalidateGame(slug: string) {
  try {
    // Clear specific game from Redis
    await strapiClient.invalidateCache(`games:*${slug}*`);

    // Revalidate the specific game page
    revalidatePath(`/games/${slug}`, "page");

    // Also revalidate games list as ratings might have changed
    revalidateTag("games");

    return { success: true };
  } catch (error) {
    console.error(`Failed to revalidate game ${slug}:`, error);
    return { success: false, error: "Failed to revalidate game" };
  }
}

/**
 * Revalidate specific path
 */
export async function revalidateByPath(path: string) {
  try {
    revalidatePath(path);
    return { success: true };
  } catch (error) {
    console.error(`Failed to revalidate path ${path}:`, error);
    return { success: false, error: "Failed to revalidate path" };
  }
}

/**
 * Bulk revalidate multiple paths
 */
export async function bulkRevalidatePaths(paths: string[]) {
  try {
    const results = await Promise.all(
      paths.map((path) => revalidateByPath(path))
    );

    const failed = results.filter((r) => !r.success).length;

    return {
      success: failed === 0,
      total: paths.length,
      failed,
    };
  } catch (error) {
    console.error("Failed to bulk revalidate:", error);
    return { success: false, error: "Failed to bulk revalidate" };
  }
}

/**
 * Clear all caches (use sparingly)
 */
export async function clearAllCaches() {
  try {
    // Clear all Redis keys
    await strapiClient.invalidateCache("*");

    // Revalidate all tags
    revalidateTag("layout");
    revalidateTag("navigation");
    revalidateTag("translations");
    revalidateTag("games");
    revalidateTag("popular");
    revalidateTag("new");

    // Revalidate root
    revalidatePath("/", "layout");

    return { success: true };
  } catch (error) {
    console.error("Failed to clear all caches:", error);
    return { success: false, error: "Failed to clear all caches" };
  }
}
