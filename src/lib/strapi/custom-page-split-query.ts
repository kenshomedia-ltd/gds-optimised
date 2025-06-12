
// src/lib/strapi/custom-page-split-query.ts
import { strapiClient } from "./strapi-client";
import { unstable_cache } from "next/cache";
// import { getStrapiSort } from "@/lib/utils/sort-mappings";
import type {
  CustomPageData,
  CustomPageMetadata,
} from "@/types/custom-page.types";
import type {
  GameData,
  CasinoData,
  GamesListResponse,
} from "@/types/strapi.types";

// Cache configuration for different parts
const CACHE_CONFIG = {
  structure: { ttl: 600, swr: 1200, tags: ["custom-page-structure"] }, // 10min/20min
  games: { ttl: 60, swr: 180, tags: ["custom-page-games"] }, // 1min/3min
  casinos: { ttl: 300, swr: 600, tags: ["custom-page-casinos"] }, // 5min/10min
  metadata: { ttl: 600, swr: 1200, tags: ["custom-page-meta"] }, // 10min/20min
};

/**
 * Normalize path by removing leading and trailing slashes
 */
function normalizePath(path: string): string {
  return path.replace(/^\/+|\/+$/g, "");
}

/**
 * Optimized custom page data fetching with split queries
 * Similar to homepage approach but for custom pages
 */
const getCustomPageDataWithSplitQueries = async (
  path: string,
  casinoCountry?: string,
  localisation: boolean = false
): Promise<{
  pageData: CustomPageData | null;
  games: GameData[];
  casinos: CasinoData[];
}> => {
  const normalizedPath = normalizePath(path);

  // 1. Fetch page structure (lightweight)
  const structureQuery = {
    fields: [
      "title",
      "urlPath",
      "createdAt",
      "updatedAt",
      "showContentDate",
      "sideBarToShow",
    ],
    populate: {
      seo: {
        fields: ["metaTitle", "metaDescription", "keywords", "canonicalURL"],
        populate: {
          metaImage: { fields: ["url", "width", "height"] },
          metaSocial: {
            fields: ["socialNetwork", "title", "description"],
            populate: {
              image: { fields: ["url", "width", "height"] },
            },
          },
        },
      },
      breadcrumbs: {
        fields: ["breadCrumbText", "breadCrumbUrl"],
      },
      author: {
        fields: [
          "firstName",
          "lastName",
          "slug",
          "linkedInLink",
          "twitterLink",
          "facebookLink",
          "content1",
          "jobTitle",
          "experience",
          "areaOfWork",
          "specialization",
        ],
        populate: {
          photo: {
            fields: ["url", "width", "height", "alternativeText"],
          },
        },
      },
      blocks: {
        on: {
          // Basic block structure without heavy data
          "shared.introduction-with-image": {
            fields: ["heading", "introduction"],
            populate: {
              image: {
                fields: ["url", "mime", "width", "height", "alternativeText"],
              },
            },
          },
          "games.new-and-loved-slots": {
            fields: ["newSlots"],
            populate: {
              slot_categories: {
                fields: ["title", "slug"],
              },
              slot_providers: {
                fields: ["title", "slug"],
              },
            },
          },
          "games.games-carousel": {
            fields: ["numberOfGames", "sortBy", "showGameFilterPanel", "showGameMoreButton"],
            populate: {
              gameProviders: {
                populate: {
                  slotProvider: {
                    fields: ["id", "slug", "title"],
                  },
                },
              },
              gameCategories: {
                populate: {
                  slotCategory: {
                    fields: ["id", "slug", "title"],
                  },
                },
              },
            },
          },
          "shared.single-content": {
            fields: ["content"],
          },
          "shared.image": {
            populate: {
              image: {
                fields: ["url", "alternativeText", "mime", "width", "height"],
              },
            },
          },
          "casinos.casino-list": {
            fields: ["casinoSort"],
            populate: {
              casinosList: {
                fields: ["id"],
                // Don't populate casino data here - fetch separately
              },
            },
          },
          "casinos.casinos-comparison": {
            populate: {
              casinos: {
                fields: ["id"],
                // Don't populate casino data here - fetch separately
              },
            },
          },
          "shared.overview-block": {
            populate: {
              overviews: {
                fields: ["title", "url"],
                populate: {
                  card_img: {
                    fields: ["url", "width", "height", "alternativeText"],
                  },
                },
              },
            },
          },
          "homepage.home-featured-providers": {
            populate: {
              homeFeaturedProviders: {
                populate: {
                  providers: {
                    fields: ["title", "slug"],
                    populate: {
                      images: {
                        fields: ["url", "width", "height"],
                      },
                    },
                  },
                },
              },
            },
          },
          "homepage.home-featured-categories": {
            populate: {
              homeCategoriesList: {
                populate: {
                  slot_categories: {
                    fields: ["title", "slug"],
                    populate: {
                      images: {
                        fields: ["url", "width", "height"],
                      },
                    },
                  },
                },
              },
            },
          },
          "shared.provider-list": {
            populate: {
              providers: {
                fields: ["title", "slug"],
                populate: {
                  images: {
                    fields: ["url", "width", "height"],
                  },
                },
              },
            },
          },
          "shared.how-to-group": {
            fields: ["title", "description"],
            populate: {
              howToGroup: {
                fields: ["heading", "copy"],
                populate: {
                  image: {
                    fields: ["url", "width", "height", "alternativeText"],
                  },
                },
              },
            },
          },
          "shared.image-with-paragraph": {
            populate: {
              imageWithParagraph: {
                fields: ["heading", "copy"],
                populate: {
                  image: {
                    fields: ["url", "alternativeText", "width", "height"],
                  },
                },
              },
            },
          },
          "shared.medium-image-with-content": {
            fields: ["title", "content"],
            populate: {
              image: {
                fields: ["url", "alternativeText", "width", "height"],
              },
            },
          },
          "shared.pros-and-cons": {
            fields: ["heading"],
            populate: {
              pros: { fields: ["list"] },
              cons: { fields: ["list"] },
              proImage: { fields: ["url", "width", "height"] },
              conImage: { fields: ["url", "width", "height"] },
            },
          },
          "shared.image-carousel": {
            fields: ["carouselTitle"],
            populate: {
              image: {
                fields: ["url", "alternativeText", "mime", "width", "height"],
              },
            },
          },
        },
      },
    },
    filters: {
      urlPath: {
        $eq: normalizedPath,
      },
    },
    pagination: {
      page: 1,
      pageSize: 1,
    },
  };

  try {
    const pageResponse = await strapiClient.fetchWithCache<{
      data: CustomPageData[];
    }>("custom-pages", structureQuery, CACHE_CONFIG.structure.ttl);

    const pageData = pageResponse.data?.[0];

    if (!pageData) {
      return {
        pageData: null,
        games: [],
        casinos: [],
      };
    }

    // 2. Analyze blocks to determine what dynamic content to fetch
    const gameCarouselBlocks = pageData.blocks?.filter(
      block => block.__component === "games.games-carousel"
    ) || [];

    const casinoBlocks = pageData.blocks?.filter(
      block => 
        block.__component === "casinos.casino-list" ||
        block.__component === "casinos.casinos-comparison"
    ) || [];

    // 3. Fetch dynamic content in parallel
    const [games, casinos] = await Promise.all([
      gameCarouselBlocks.length > 0 ? fetchGamesForCarousels(gameCarouselBlocks) : Promise.resolve([]),
      casinoBlocks.length > 0 ? fetchCasinosForBlocks(casinoBlocks, casinoCountry, localisation) : Promise.resolve([]),
    ]);

    return {
      pageData,
      games,
      casinos,
    };
  } catch (error) {
    console.error("Failed to fetch custom page data:", error);
    return {
      pageData: null,
      games: [],
      casinos: [],
    };
  }
};

/**
 * Fetch games for carousel blocks
 */
async function fetchGamesForCarousels(carouselBlocks: any[]): Promise<GameData[]> {
  // Collect all unique providers and categories
  const allProviders = new Set<string>();
  const allCategories = new Set<string>();
  let maxGames = 0;

  carouselBlocks.forEach((block: any) => {
    block.gameProviders?.forEach((p: any) => {
      if (p.slotProvider?.slug) allProviders.add(p.slotProvider.slug);
    });
    block.gameCategories?.forEach((c: any) => {
      if (c.slotCategory?.slug) allCategories.add(c.slotCategory.slug);
    });
    maxGames = Math.max(maxGames, block.numberOfGames || 24);
  });

  // If no specific providers/categories, return empty
  if (allProviders.size === 0 && allCategories.size === 0) {
    // Fetch popular games as fallback
    const query = {
      fields: ["title", "slug", "ratingAvg", "createdAt", "publishedAt"],
      populate: {
        images: {
          fields: ["url", "alternativeText", "width", "height"],
        },
        provider: { fields: ["title", "slug"] },
        categories: { fields: ["title", "slug"] },
      },
      sort: ["ratingAvg:desc", "createdAt:desc"],
      pagination: {
        pageSize: maxGames || 24,
        page: 1,
      },
    };

    try {
      const response = await strapiClient.fetchWithCache<GamesListResponse>(
        "games",
        query,
        CACHE_CONFIG.games.ttl
      );
      return response.data || [];
    } catch (error) {
      console.error("Failed to fetch games:", error);
      return [];
    }
  }

  // Fetch games by provider if providers are specified
  if (allProviders.size > 0) {
    const gamesPerProvider = Math.ceil(maxGames / allProviders.size);
    
    const gamePromises = Array.from(allProviders).map(async (providerSlug) => {
      const query = {
        fields: ["title", "slug", "ratingAvg", "createdAt", "publishedAt"],
        populate: {
          images: {
            fields: ["url", "alternativeText", "width", "height"],
          },
          provider: { fields: ["title", "slug"] },
          categories: { fields: ["title", "slug"] },
        },
        filters: {
          provider: { slug: { $eq: providerSlug } },
          ...(allCategories.size > 0 && {
            categories: { slug: { $in: Array.from(allCategories) } },
          }),
        },
        sort: ["ratingAvg:desc", "createdAt:desc"],
        pagination: {
          pageSize: gamesPerProvider,
          page: 1,
        },
      };

      try {
        const response = await strapiClient.fetchWithCache<GamesListResponse>(
          "games",
          query,
          CACHE_CONFIG.games.ttl
        );
        return response.data || [];
      } catch (error) {
        console.error(`Failed to fetch games for provider ${providerSlug}:`, error);
        return [];
      }
    });

    const gamesPerProviderArray = await Promise.all(gamePromises);
    return gamesPerProviderArray.flat();
  }

  // Fetch by categories only
  const query = {
    fields: ["title", "slug", "ratingAvg", "createdAt", "publishedAt"],
    populate: {
      images: {
        fields: ["url", "alternativeText", "width", "height"],
      },
      provider: { fields: ["title", "slug"] },
      categories: { fields: ["title", "slug"] },
    },
    filters: {
      categories: { slug: { $in: Array.from(allCategories) } },
    },
    sort: ["ratingAvg:desc", "createdAt:desc"],
    pagination: {
      pageSize: maxGames,
      page: 1,
    },
  };

  try {
    const response = await strapiClient.fetchWithCache<GamesListResponse>(
      "games",
      query,
      CACHE_CONFIG.games.ttl
    );
    return response.data || [];
  } catch (error) {
    console.error("Failed to fetch games:", error);
    return [];
  }
}

/**
 * Fetch casinos for casino blocks
 */
async function fetchCasinosForBlocks(
  casinoBlocks: any[],
  casinoCountry?: string,
  localisation: boolean = false
): Promise<CasinoData[]> {
  // Extract casino IDs from blocks
  const casinoIds = new Set<number>();
  
  casinoBlocks.forEach((block: any) => {
    if (block.__component === "casinos.casino-list") {
      block.casinosList?.forEach((item: any) => {
        if (item.id) casinoIds.add(item.id);
      });
    } else if (block.__component === "casinos.casinos-comparison") {
      block.casinos?.forEach((item: any) => {
        if (item.id) casinoIds.add(item.id);
      });
    }
  });

  // If specific casino IDs are found, fetch those
  if (casinoIds.size > 0) {
    const query = {
      fields: [
        "title",
        "slug",
        "ratingAvg",
        "ratingCount",
        "Badges",
        "publishedAt",
      ],
      populate: {
        images: { fields: ["url", "width", "height"] },
        logoIcon: { fields: ["url"] },
        casinoBonus: { fields: ["bonusUrl", "bonusLabel", "bonusCode"] },
        noDepositSection: { fields: ["bonusAmount", "termsConditions"] },
        freeSpinsSection: { fields: ["bonusAmount", "termsConditions"] },
        bonusSection: {
          fields: ["bonusAmount", "termsConditions", "cashBack", "freeSpin"],
        },
        providers: {
          fields: ["title"],
          populate: {
            images: { fields: ["url"] },
          },
        },
        casinoGeneralInfo: { fields: ["wageringRequirements"] },
        termsAndConditions: { fields: ["copy", "gambleResponsibly"] },
        countries: { fields: ["countryName", "shortCode"] },
      },
      filters: {
        id: { $in: Array.from(casinoIds) },
        ...(localisation && casinoCountry && {
          countries: {
            shortCode: { $in: casinoCountry },
          },
        }),
      },
      pagination: { pageSize: 100, page: 1 },
    };

    try {
      const response = await strapiClient.fetchWithCache<{
        data: CasinoData[];
      }>("casinos", query, CACHE_CONFIG.casinos.ttl);
      return response.data || [];
    } catch (error) {
      console.error("Failed to fetch specific casinos:", error);
      return [];
    }
  }

  // Otherwise fetch top casinos
  const query = {
    fields: [
      "title",
      "slug",
      "ratingAvg",
      "ratingCount",
      "Badges",
      "publishedAt",
    ],
    populate: {
      images: { fields: ["url", "width", "height"] },
      logoIcon: { fields: ["url"] },
      casinoBonus: { fields: ["bonusUrl", "bonusLabel", "bonusCode"] },
      noDepositSection: { fields: ["bonusAmount", "termsConditions"] },
      freeSpinsSection: { fields: ["bonusAmount", "termsConditions"] },
      bonusSection: {
        fields: ["bonusAmount", "termsConditions", "cashBack", "freeSpin"],
      },
      providers: {
        fields: ["title"],
        populate: {
          images: { fields: ["url"] },
        },
      },
      casinoGeneralInfo: { fields: ["wageringRequirements"] },
      termsAndConditions: { fields: ["copy", "gambleResponsibly"] },
      countries: { fields: ["countryName", "shortCode"] },
    },
    filters: {
      ...(localisation && casinoCountry && {
        countries: {
          shortCode: { $in: casinoCountry },
        },
      }),
    },
    sort: ["ratingAvg:desc"],
    pagination: { pageSize: 20, page: 1 },
  };

  try {
    const response = await strapiClient.fetchWithCache<{
      data: CasinoData[];
    }>("casinos", query, CACHE_CONFIG.casinos.ttl);
    return response.data || [];
  } catch (error) {
    console.error("Failed to fetch casinos:", error);
    return [];
  }
}

/**
 * Cached metadata fetcher
 */
export const getCustomPageMetadata = unstable_cache(
  async (path: string): Promise<CustomPageMetadata | null> => {
    try {
      const query = {
        fields: ["title", "urlPath", "publishedAt"],
        populate: {
          seo: {
            fields: ["metaTitle", "metaDescription"],
          },
        },
        filters: {
          urlPath: { $eq: normalizePath(path) },
        },
        pagination: { page: 1, pageSize: 1 },
      };

      const response = await strapiClient.fetchWithCache<{
        data: CustomPageMetadata[];
      }>("custom-pages", query, CACHE_CONFIG.metadata.ttl);

      return response.data?.[0] || null;
    } catch (error) {
      console.error("Failed to fetch custom page metadata:", error);
      return null;
    }
  },
  ["custom-page-metadata"],
  {
    revalidate: CACHE_CONFIG.metadata.ttl,
    tags: CACHE_CONFIG.metadata.tags,
  }
);

/**
 * Export the cached version of the split query
 */
export const getCustomPageDataSplit = unstable_cache(
  getCustomPageDataWithSplitQueries,
  ["custom-page-data-split"],
  {
    revalidate: 60, // 1 minute base revalidation
    tags: ["custom-page"],
  }
);