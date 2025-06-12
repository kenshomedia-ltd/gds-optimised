// src/lib/strapi/custom-page-loader.ts
import { unstable_cache } from "next/cache";
import { cache } from "react";
import { strapiClient } from "./strapi-client";
import type {
  CustomPageData,
  CustomPageMetadata,
} from "@/types/custom-page.types";

// Cache configuration
const CACHE_CONFIG = {
  page: { ttl: 300, swr: 600, tags: ["custom-page"] }, // 5min/10min
  metadata: { ttl: 600, swr: 1200, tags: ["custom-page-meta"] }, // 10min/20min
};

/**
 * Normalize path by removing leading and trailing slashes
 */
function normalizePath(path: string): string {
  // Remove leading and trailing slashes
  return path.replace(/^\/+|\/+$/g, "");
}

/**
 * Build query for custom page metadata (lightweight)
 */
function buildMetadataQuery(path: string) {
  return {
    fields: ["title", "urlPath", "publishedAt"],
    filters: {
      urlPath: { $eq: normalizePath(path) },
    },
    pagination: { page: 1, pageSize: 1 },
  };
}

/**
 * Build full query for custom page data
 */
function buildCustomPageQuery(
  path: string,
  casinoCountry?: string,
  localisation: boolean = false
) {
  const normalizedPath = normalizePath(path);

  return {
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
          "shared.introduction-with-image": {
            fields: ["heading", "introduction"],
            populate: {
              image: {
                fields: ["url", "mime", "width", "height", "alternativeText"],
              },
            },
          },
          "games.new-and-loved-slots": {
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
            populate: "*",
          },
          "shared.image": {
            populate: {
              image: {
                fields: ["url", "alternativeText", "mime", "width", "height"],
              },
            },
          },
          "casinos.casino-list": {
            populate: {
              casinosList: {
                fields: ["id"],
                populate: {
                  casino: {
                    fields: [
                      "title",
                      "slug",
                      "ratingAvg",
                      "ratingCount",
                      "publishedAt",
                      "Badges",
                      "createdAt",
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
                      bonusSection: {
                        fields: [
                          "bonusAmount",
                          "termsConditions",
                          "cashBack",
                          "freeSpin",
                        ],
                      },
                      providers: {
                        fields: ["title"],
                        populate: {
                          images: {
                            fields: ["url"],
                          },
                        },
                      },
                      casinoGeneralInfo: {
                        fields: ["wageringRequirements"],
                      },
                      termsAndConditions: {
                        fields: ["copy", "gambleResponsibly"],
                      },
                      countries: {
                        fields: ["countryName", "shortCode"],
                      },
                    },
                    ...(localisation &&
                      casinoCountry && {
                        filters: {
                          countries: {
                            shortCode: {
                              $in: [casinoCountry],
                            },
                          },
                        },
                      }),
                  },
                },
              },
            },
          },
          "casinos.casinos-comparison": {
            populate: {
              casinos: {
                fields: ["id"],
                populate: {
                  casino: {
                    fields: [
                      "title",
                      "slug",
                      "ratingAvg",
                      "ratingCount",
                      "publishedAt",
                      "Badges",
                      "createdAt",
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
                      bonusSection: {
                        fields: [
                          "bonusAmount",
                          "termsConditions",
                          "cashBack",
                          "freeSpin",
                        ],
                      },
                      termsAndConditions: {
                        fields: ["copy", "gambleResponsibly"],
                      },
                      countries: {
                        fields: ["countryName", "shortCode"],
                      },
                    },
                    ...(localisation &&
                      casinoCountry && {
                        filters: {
                          countries: {
                            shortCode: {
                              $in: [casinoCountry],
                            },
                          },
                        },
                      }),
                  },
                },
              },
            },
          },
          "shared.overview-block": {
            fields: ["overview_type"],
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
            fields: ["title"],
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
              pros: {
                fields: ["list"],
              },
              cons: {
                fields: ["list"],
              },
              proImage: {
                fields: ["url", "width", "height"],
              },
              conImage: {
                fields: ["url", "width", "height"],
              },
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
}

/**
 * Fetch custom page metadata (lightweight for metadata generation)
 */
const fetchCustomPageMetadata = cache(
  async (path: string): Promise<CustomPageMetadata | null> => {
    try {
      const query = buildMetadataQuery(path);

      console.log(
        "Fetching metadata for normalized path:",
        normalizePath(path)
      );

      const response = await strapiClient.fetchWithCache<{
        data: CustomPageMetadata[];
      }>("custom-pages", query, CACHE_CONFIG.metadata.ttl);

      return response.data?.[0] || null;
    } catch (error) {
      console.error("Failed to fetch custom page metadata:", error);
      return null;
    }
  }
);

/**
 * Fetch full custom page data
 */
const fetchCustomPageData = cache(
  async (
    path: string,
    casinoCountry?: string,
    localisation: boolean = false
  ): Promise<CustomPageData | null> => {
    try {
      const query = buildCustomPageQuery(path, casinoCountry, localisation);

      console.log(
        "Fetching page data for normalized path:",
        normalizePath(path)
      );

      const response = await strapiClient.fetchWithCache<{
        data: CustomPageData[];
      }>("custom-pages", query, CACHE_CONFIG.page.ttl);

      const pageData = response.data?.[0];

      if (!pageData) {
        console.log("No page data found for path:", normalizePath(path));
        return null;
      }

      // Log the fetched data structure
      console.log("Fetched custom page data:", {
        title: pageData.title,
        urlPath: pageData.urlPath,
        blocksCount: pageData.blocks?.length || 0,
        blockTypes: pageData.blocks?.map((b) => b.__component) || [],
      });

      return pageData;
    } catch (error) {
      console.error("Failed to fetch custom page data:", error);
      return null;
    }
  }
);

/**
 * Get custom page metadata with caching
 */
export const getCustomPageMetadata = unstable_cache(
  fetchCustomPageMetadata,
  ["custom-page-metadata"],
  {
    revalidate: CACHE_CONFIG.metadata.ttl,
    tags: CACHE_CONFIG.metadata.tags,
  }
);

/**
 * Get custom page data with caching
 */
export const getCustomPageData = unstable_cache(
  fetchCustomPageData,
  ["custom-page-data"],
  {
    revalidate: CACHE_CONFIG.page.ttl,
    tags: CACHE_CONFIG.page.tags,
  }
);

/**
 * Revalidate custom page cache
 */
export async function revalidateCustomPageCache(path?: string) {
  const { revalidateTag, revalidatePath } = await import("next/cache");

  // Revalidate tags
  revalidateTag("custom-page");
  revalidateTag("custom-page-meta");

  // Revalidate specific path if provided
  if (path) {
    revalidatePath(path);
  }

  // Clear Redis cache
  await strapiClient.invalidateCache(
    path ? `custom-pages:${path}*` : "custom-pages:*"
  );
}
