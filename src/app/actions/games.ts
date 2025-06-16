// src/app/actions/games.ts
"use server";

import { strapiClient } from "@/lib/strapi/strapi-client";
import { getStrapiSort } from "@/lib/utils/sort-mappings";
import type { GameData } from "@/types/game.types";
import type { FilterOption } from "@/types/game-list-widget.types";

interface GetGamesParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  filters?: Record<string, unknown>;
}

interface GetGamesResponse {
  games: GameData[];
  total: number;
  page: number;
  pageSize: number;
}

/**
 * Server action to fetch games with filters
 */
export async function getGames({
  page = 1,
  pageSize = 24,
  sortBy = "Newest",
  filters = {},
}: GetGamesParams): Promise<GetGamesResponse> {
  try {
    // Map the sortBy value to Strapi sort parameter
    const sort = getStrapiSort(sortBy);

    const query = {
      fields: [
        "title",
        "slug",
        "ratingAvg",
        "ratingCount",
        "createdAt",
        "views",
        "publishedAt",
        "isGameDisabled",
        "gameDisableText",
      ],
      populate: {
        images: {
          fields: ["url", "alternativeText", "width", "height"],
        },
        provider: {
          fields: ["title", "slug"],
        },
        categories: {
          fields: ["title", "slug"],
        },
      },
      filters,
      sort: [sort],
      pagination: {
        page,
        pageSize,
      },
    };

    const response = await strapiClient.fetchWithCache<{
      data: GameData[];
      meta: { pagination: { total: number } };
    }>("games", query, 60); // Cache for 1 minute

    return {
      games: response.data || [],
      total: response.meta?.pagination?.total || 0,
      page,
      pageSize,
    };
  } catch (error) {
    console.error("Failed to fetch games:", error);
    return {
      games: [],
      total: 0,
      page,
      pageSize,
    };
  }
}

/**
 * Server action to search games
 */
export async function searchGames(searchQuery: string): Promise<GameData[]> {
  try {
    const query = {
      fields: ["title", "slug", "ratingAvg", "publishedAt"],
      populate: {
        images: {
          fields: ["url", "alternativeText"],
        },
        provider: {
          fields: ["title", "slug"],
        },
      },
      filters: {
        title: {
          $containsi: searchQuery,
        },
      },
      sort: ["ratingAvg:desc"],
      pagination: {
        pageSize: 10,
      },
    };

    const response = await strapiClient.fetchWithCache<{
      data: GameData[];
    }>("games", query, 300); // Cache for 5 minutes

    return response.data || [];
  } catch (error) {
    console.error("Failed to search games:", error);
    return [];
  }
}

/**
 * Server action to fetch game filter providers
 * Fetches from layout endpoint's filterProviders
 */
export async function getFilterProviders(): Promise<FilterOption[]> {
  try {
    const query = {
      fields: ["id"],
      populate: {
        filterProviders: {
          fields: ["slug"],
          populate: {
            images: {
              fields: ["url"],
            },
          },
        },
      },
    };

    const response = await strapiClient.fetchWithCache<{
      data: {
        filterProviders?: Array<{
          id: number;
          slug: string;
          images?: { url: string };
        }>;
      };
    }>("layout", query, 3600); // Cache for 1 hour

    const providers = response.data?.filterProviders || [];

    return providers.map((provider) => ({
      id: provider.id,
      title: provider.slug, // Using slug as title since title field not available
      slug: provider.slug,
    }));
  } catch (error) {
    console.error("Failed to fetch filter providers:", error);
    return [];
  }
}

/**
 * Server action to fetch game categories
 */
export async function getGameCategories(): Promise<FilterOption[]> {
  try {
    const query = {
      fields: ["id", "slug", "title"],
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
      }>;
    }>("slot-categories", query, 3600); // Cache for 1 hour

    return (
      response.data?.map((category) => ({
        id: category.id,
        title: category.title,
        slug: category.slug,
      })) || []
    );
  } catch (error) {
    console.error("Failed to fetch game categories:", error);
    return [];
  }
}
