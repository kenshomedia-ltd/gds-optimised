// src/app/actions/related-casinos.ts
"use server";

import { getRelatedCasinos as getRelatedCasinosFromLoader } from "@/lib/strapi/related-casinos-loader";
import type { CasinoData } from "@/types/casino.types";

/**
 * Server action to fetch related casinos for a provider
 * This can be called from client components
 */
export async function getRelatedCasinos(
  providerSlug: string,
  maxCasinos?: number
): Promise<{ casinos: CasinoData[]; error?: string }> {
  try {
    if (!providerSlug) {
      return { casinos: [], error: "Provider slug is required" };
    }

    const casinos = await getRelatedCasinosFromLoader(providerSlug, maxCasinos);
    
    return { casinos };
  } catch (error) {
    console.error("Failed to fetch related casinos:", error);
    return { 
      casinos: [], 
      error: "Failed to load related casinos. Please try again later." 
    };
  }
}

/**
 * Server action to prefetch related casinos data
 * Useful for warming the cache
 */
export async function prefetchRelatedCasinos(
  providerSlugs: string[]
): Promise<void> {
  try {
    await Promise.all(
      providerSlugs.map(slug => 
        getRelatedCasinosFromLoader(slug).catch(error => 
          console.error(`Failed to prefetch casinos for ${slug}:`, error)
        )
      )
    );
  } catch (error) {
    console.error("Failed to prefetch related casinos:", error);
  }
}