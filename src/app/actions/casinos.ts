// src/app/actions/casinos.ts
"use server";

import { strapiClient } from "@/lib/strapi/strapi-client";
import type { CasinoData } from "@/types/casino.types";
import type {
  CasinoFilterOption,
  CasinoFiltersState,
} from "@/types/casino-filters.types";

interface GetCasinosParams {
  page?: number;
  pageSize?: number;
  filters?: Partial<CasinoFiltersState>;
}

interface GetCasinosResponse {
  casinos: CasinoData[];
  total: number;
  page: number;
  pageSize: number;
}

/**
 * Build Strapi filters from casino filter state
 */
function buildCasinoFilters(
  filters: Partial<CasinoFiltersState>
): Record<string, unknown> {
  const strapiFilters: Record<string, unknown> = {};

  console.log("=== Building Casino Filters ===");
  console.log("Input filters:", filters);

  // Add provider filters
  if (filters.providers && filters.providers.length > 0) {
    strapiFilters.providers = {
      slug: {
        $in: filters.providers,
      },
    };
    console.log("Added provider filters:", strapiFilters.providers);
  }

  // Add wagering filter - using casinoGeneralInfo.wageringRequirements
  if (filters.wagering) {
    strapiFilters.casinoGeneralInfo = {
      wageringRequirements: {
        $eq: filters.wagering,
      },
    };
    console.log("Added wagering filter:", strapiFilters.casinoGeneralInfo);
  }

  // Add bonus key filters with $and operator for complex conditions
  if (filters.bonusKey) {
    // Create a typed array to avoid 'any' error
    const andConditions: Array<
      Record<string, Record<string, Record<string, unknown>>>
    > = [
      // Bonus amount must not be 0
      {
        [filters.bonusKey]: {
          bonusAmount: {
            $ne: 0,
          },
        },
      },
      // Bonus amount must not be null
      {
        [filters.bonusKey]: {
          bonusAmount: {
            $notNull: true,
          },
        },
      },
    ];

    // Add condition filter
    if (filters.condition) {
      andConditions.push({
        [filters.bonusKey]: {
          availability: {
            $eq: filters.condition,
          },
        },
      });
      console.log(
        `Added condition filter for ${filters.bonusKey}:`,
        filters.condition
      );
    }

    // Add amount filter - using $eq instead of $gte
    if (filters.amount) {
      andConditions.push({
        [filters.bonusKey]: {
          bonusAmount: {
            $eq: parseInt(filters.amount),
          },
        },
      });
      console.log(
        `Added amount filter for ${filters.bonusKey}:`,
        filters.amount
      );
    }

    // Add speed filter - capitalize "Immediate"
    if (filters.speed === "immediate") {
      andConditions.push({
        [filters.bonusKey]: {
          speed: {
            $eq: "Immediate", // Note: capitalized
          },
        },
      });
      console.log(`Added speed filter for ${filters.bonusKey}: Immediate`);
    }

    strapiFilters.$and = andConditions;
    console.log(
      "Added bonus key filters with $and:",
      JSON.stringify(andConditions, null, 2)
    );
  }

  console.log("=== Final Strapi Filters ===");
  console.log(JSON.stringify(strapiFilters, null, 2));

  return strapiFilters;
}

/**
 * Server action to fetch casinos with filters
 */
export async function getCasinos({
  page = 1,
  pageSize = 50,
  filters = {},
}: GetCasinosParams): Promise<GetCasinosResponse> {
  console.log("=== getCasinos Server Action Called ===");
  console.log("Page:", page);
  console.log("PageSize:", pageSize);
  console.log("Filters received:", filters);

  try {
    const strapiFilters = buildCasinoFilters(filters);

    const query = {
      fields: [
        "title",
        "slug",
        "ratingAvg",
        "ratingCount",
        "publishedAt",
        "Badges",
        "playthrough",
      ],
      populate: {
        images: {
          fields: ["url", "width", "height"],
        },
        casinoBonus: {
          fields: ["bonusUrl", "bonusLabel", "bonusCode"],
        },
        noDepositSection: {
          fields: ["bonusAmount", "termsConditions", "availability", "speed"],
        },
        freeSpinsSection: {
          fields: ["bonusAmount", "termsConditions", "availability", "speed"],
        },
        termsAndConditions: {
          fields: ["copy", "gambleResponsibly"],
        },
        bonusSection: {
          fields: [
            "bonusAmount",
            "termsConditions",
            "cashBack",
            "freeSpin",
            "availability",
            "speed",
          ],
        },
        providers: {
          fields: ["slug", "title"],
        },
        casinoGeneralInfo: {
          fields: ["wageringRequirements"],
        },
      },
      filters: strapiFilters,
      sort: [filters.sort || "ratingAvg:desc"],
      pagination: { pageSize, page },
    };

    console.log("=== Strapi Query ===");
    console.log(JSON.stringify(query, null, 2));

    const response = await strapiClient.fetchWithCache<{
      data: CasinoData[];
      meta: { pagination: { total: number } };
    }>("casinos", query, 300); // Cache for 5 minutes

    console.log("=== Strapi Response ===");
    console.log("Total casinos found:", response.meta?.pagination?.total || 0);
    console.log("Casinos returned:", response.data?.length || 0);

    if (response.data && response.data.length > 0) {
      console.log("First casino:", {
        title: response.data[0].title,
        bonusSection: response.data[0].bonusSection,
        noDepositSection: response.data[0].noDepositSection,
        freeSpinsSection: response.data[0].freeSpinsSection,
      });
    }

    return {
      casinos: response.data || [],
      total: response.meta?.pagination?.total || 0,
      page,
      pageSize,
    };
  } catch (error) {
    console.error("=== Error in getCasinos ===");
    console.error("Failed to fetch casinos:", error);
    return {
      casinos: [],
      total: 0,
      page,
      pageSize,
    };
  }
}

/**
 * Server action to fetch casino filter providers
 */
export async function getCasinoProviders(): Promise<CasinoFilterOption[]> {
  try {
    const query = {
      fields: ["id", "slug", "title"],
      populate: {
        images: {
          fields: ["url"],
        },
      },
      pagination: {
        page: 1,
        pageSize: 1000,
      },
      sort: ["listSortOrder:asc"],
    };

    const response = await strapiClient.fetchWithCache<{
      data: Array<{
        id: number;
        slug: string;
        title: string;
        images?: { url: string };
      }>;
    }>("slot-providers", query, 3600); // Cache for 1 hour

    return (
      response.data?.map((provider) => ({
        id: provider.id,
        title: provider.title,
        slug: provider.slug,
        value: provider.slug,
      })) || []
    );
  } catch (error) {
    console.error("Failed to fetch casino providers:", error);
    return [];
  }
}
