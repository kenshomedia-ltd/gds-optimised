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

  // Add provider filters
  if (filters.providers && filters.providers.length > 0) {
    strapiFilters.providers = {
      slug: {
        $in: filters.providers,
      },
    };
  }

  // Add wagering filter - using casinoGeneralInfo.wageringRequirements
  if (filters.wagering) {
    strapiFilters.casinoGeneralInfo = {
      wageringRequirements: {
        $eq: filters.wagering,
      },
    };
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
    }

    strapiFilters.$and = andConditions;
  }

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

    const response = await strapiClient.fetchWithCache<{
      data: CasinoData[];
      meta: { pagination: { total: number } };
    }>("casinos", query, 300); // Cache for 5 minutes

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

/**
 * Fetch paginated casinos for server-side rendering
 * This is a simplified version for pagination without filters
 */
export async function getPaginatedCasinos(
  page: number = 1,
  itemsPerPage: number = 10,
  country: string = "IT"
): Promise<GetCasinosResponse> {
  try {
    const query = {
      fields: [
        "title",
        "slug",
        "ratingAvg",
        "ratingCount",
        "publishedAt",
        "Badges",
      ],
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
        freeSpinsSection: {
          fields: ["bonusAmount", "termsConditions"],
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
          ],
        },
      },
      filters: {
        countries: { $containsi: country },
      },
      sort: ["ratingAvg:desc"],
      pagination: {
        page,
        pageSize: itemsPerPage,
      },
    };

    const response = await strapiClient.fetchWithCache<{
      data: CasinoData[];
      meta: {
        pagination: {
          page: number;
          pageSize: number;
          pageCount: number;
          total: number;
        };
      };
    }>("casinos", query, 60); // 1 minute cache

    return {
      casinos: response.data || [],
      total: response.meta?.pagination?.total || 0,
      page: response.meta?.pagination?.page || 1,
      pageSize: response.meta?.pagination?.pageSize || itemsPerPage,
    };
  } catch (error) {
    console.error("Failed to fetch paginated casinos:", error);
    return {
      casinos: [],
      total: 0,
      page: 1,
      pageSize: itemsPerPage,
    };
  }
}
