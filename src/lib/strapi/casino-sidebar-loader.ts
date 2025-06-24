// src/lib/strapi/casino-sidebar-loader.ts
import { unstable_cache } from "next/cache";
import { cache } from "react";
import { strapiClient, REVALIDATE_TIMES } from "./strapi-client";
import { cacheManager } from "@/lib/cache/cache-manager";
import type { SidebarCasinoSections } from "@/types/sidebar.types";
import type { CasinoData } from "@/types/casino.types";

/**
 * Build query for casino sidebar sections from layout endpoint
 */
function buildCasinoSidebarQuery() {
  return {
    populate: {
      most_loved_casinos: {
        fields: ["slug", "title"],
        populate: {
          logoIcon: {
            fields: ["url", "width", "height"],
          },
          casinoBonus: {
            fields: ["bonusUrl", "bonusLabel", "bonusCode"],
          },
          bonusSection: {
            fields: ["bonusAmount", "termsConditions", "cashBack", "freeSpin"],
          },
        },
      },
      no_deposit_casinos: {
        fields: ["slug", "title"],
        populate: {
          logoIcon: {
            fields: ["url", "width", "height"],
          },
          casinoBonus: {
            fields: ["bonusUrl", "bonusLabel", "bonusCode"],
          },
          noDepositSection: {
            fields: ["bonusAmount", "termsConditions"],
          },
        },
      },
      free_spin_casinos: {
        fields: ["slug", "title"],
        populate: {
          logoIcon: {
            fields: ["url", "width", "height"],
          },
          casinoBonus: {
            fields: ["bonusUrl", "bonusLabel", "bonusCode"],
          },
          freeSpinsSection: {
            fields: ["bonusAmount", "termsConditions"],
          },
        },
      },
    },
  };
}

/**
 * React cache for deduplicating requests within a single render
 */
const getCasinoSidebarDataCached = cache(
  async (): Promise<SidebarCasinoSections> => {
    const cacheKey = "casino-sidebar-data";

    try {
      // Try to get from Redis cache first
      const cached = await cacheManager.get<SidebarCasinoSections>(cacheKey);
      if (cached.data && !cached.isStale) {
        console.log("Casino sidebar cache hit");
        return cached.data;
      }

      // If stale, we'll fetch fresh data
      if (cached.isStale) {
        console.log("Casino sidebar cache stale");
      }
    } catch (error) {
      console.error("Cache error:", error);
    }

    try {
      // Fetch casino sections from layout endpoint
      const query = buildCasinoSidebarQuery();

      const response = await strapiClient.fetchWithCache<{
        data: {
          most_loved_casinos?: CasinoData[];
          no_deposit_casinos?: CasinoData[];
          free_spin_casinos?: CasinoData[];
        };
      }>("layout", query, REVALIDATE_TIMES.layout);

      const layoutData = response.data;

      const sidebarData = {
        most_loved_casinos: layoutData.most_loved_casinos || [],
        no_deposit_casinos: layoutData.no_deposit_casinos || [],
        free_spin_casinos: layoutData.free_spin_casinos || [],
      };

      // Cache the results
      try {
        await cacheManager.set(cacheKey, sidebarData, {
          ttl: REVALIDATE_TIMES.layout,
          swr: REVALIDATE_TIMES.layout * 2,
        });
      } catch (error) {
        console.error("Failed to cache casino sidebar data:", error);
      }

      return sidebarData;
    } catch (error) {
      console.error("Failed to fetch casino sidebar data from layout:", error);
      return {
        most_loved_casinos: [],
        no_deposit_casinos: [],
        free_spin_casinos: [],
      };
    }
  }
);

/**
 * Next.js unstable_cache for persistent caching with ISR
 */
const getCasinoSidebarDataPersistent = unstable_cache(
  async () => {
    return getCasinoSidebarDataCached();
  },
  ["casino-sidebar-data"],
  {
    revalidate: REVALIDATE_TIMES.layout, // Use layout cache time
    tags: ["layout", "casino-sidebar"],
  }
);

/**
 * Main casino sidebar data loader
 * Fetches casino sections from the layout endpoint
 */
export async function getCasinoSidebarData(
  options: { cached?: boolean } = {}
): Promise<SidebarCasinoSections> {
  const { cached = true } = options;

  if (cached) {
    return getCasinoSidebarDataPersistent();
  }

  return getCasinoSidebarDataCached();
}

/**
 * Revalidate casino sidebar cache
 */
export async function revalidateCasinoSidebarCache() {
  const { revalidateTag } = await import("next/cache");

  revalidateTag("casino-sidebar");
  revalidateTag("layout");

  // Clear Redis cache
  await strapiClient.invalidateCache("layout:*");
  await cacheManager.delete("casino-sidebar-data");
}
