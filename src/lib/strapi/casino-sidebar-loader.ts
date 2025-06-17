// src/lib/strapi/casino-sidebar-loader.ts
import { unstable_cache } from "next/cache";
import { cache } from "react";
import { strapiClient, REVALIDATE_TIMES } from "./strapi-client";
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
          images: {
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
          images: {
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
          images: {
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

      return {
        most_loved_casinos: layoutData.most_loved_casinos || [],
        no_deposit_casinos: layoutData.no_deposit_casinos || [],
        free_spin_casinos: layoutData.free_spin_casinos || [],
      };
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
}
