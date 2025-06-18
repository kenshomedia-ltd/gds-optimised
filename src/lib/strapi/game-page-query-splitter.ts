// src/lib/strapi/game-page-query-splitter.ts

import type { GamePageData, GamePageSplitData } from "@/types/game-page.types";

/**
 * Static fields that rarely change (good for ISR)
 */
export const GAME_STATIC_FIELDS = [
  "title",
  "heading",
  "slug",
  "introduction",
  "content1",
] as const;

/**
 * Dynamic fields that change frequently
 */
export const GAME_DYNAMIC_FIELDS = [
  "ratingAvg",
  "ratingCount",
  "views",
  "isGameDisabled",
  "gameDisableText",
  "gamesApiOverride",
] as const;

/**
 * Static populate configuration
 */
export const GAME_STATIC_POPULATE = {
  blocks: {
    on: {
      "shared.image-carousel": {
        fields: ["carouselTitle"],
        populate: {
          image: {
            fields: ["url", "alternativeText", "mime"],
          },
        },
      },
    },
  },
  author: {
    fields: [
      "firstName",
      "lastName",
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
        fields: ["url"],
      },
    },
  },
  howTo: {
    fields: ["title", "description"],
    populate: {
      howToGroup: {
        fields: ["heading", "copy"],
        populate: {
          image: {
            fields: ["url", "width", "height"],
          },
        },
      },
    },
  },
  proscons: {
    populate: {
      pros: true,
      cons: true,
      proImage: {
        fields: ["url", "width", "height"],
      },
      conImage: {
        fields: ["url", "width", "height"],
      },
    },
  },
  faqs: {
    fields: ["question", "answer"],
  },
  gameInfoTable: {
    fields: [
      "rtp",
      "volatilita",
      "layout",
      "lineeDiPuntata",
      "puntataMinima",
      "puntataMassima",
      "jackpot",
      "freeSpins",
      "bonusGame",
    ],
  },
  seo: {
    fields: ["metaTitle", "metaDescription"],
  },
} as const;

/**
 * Dynamic populate configuration
 */
export const GAME_DYNAMIC_POPULATE = {
  categories: {
    fields: ["title"],
  },
  embedCode: {
    fields: ["desktopEmbedCode", "mobileEmbedCode"],
  },
  images: {
    fields: ["url", "width", "height", "alternativeText"],
  },
  provider: {
    fields: ["title", "slug"],
  },
} as const;

/**
 * Create static query for game data
 */
export function createGameStaticQuery(slug: string) {
  const query = {
    fields: [...GAME_STATIC_FIELDS],
    populate: GAME_STATIC_POPULATE,
    filters: {
      slug: {
        $eq: slug,
      },
    },
    pagination: {
      page: 1,
      pageSize: 1,
    },
  };

  if (process.env.NODE_ENV === "development") {
    console.log(
      `[Game Static Query Builder] Generated query for slug '${slug}':`,
      JSON.stringify(query, null, 2)
    );
  }

  return query;
}

/**
 * Create dynamic query for game data
 */
export function createGameDynamicQuery(slug: string) {
  const query = {
    fields: [...GAME_DYNAMIC_FIELDS],
    populate: GAME_DYNAMIC_POPULATE,
    filters: {
      slug: {
        $eq: slug,
      },
    },
    pagination: {
      page: 1,
      pageSize: 1,
    },
  };

  if (process.env.NODE_ENV === "development") {
    console.log(
      `[Game Dynamic Query Builder] Generated query for slug '${slug}':`,
      JSON.stringify(query, null, 2)
    );
  }

  return query;
}

/**
 * Split game page data into static and dynamic parts
 */
export function splitGamePageData(data: GamePageData): GamePageSplitData {
  return {
    staticData: {
      title: data.title,
      heading: data.heading,
      slug: data.slug,
      introduction: data.introduction,
      content1: data.content1,
      blocks: data.blocks,
      author: data.author,
      howTo: data.howTo,
      proscons: data.proscons,
      faqs: data.faqs,
      gameInfoTable: data.gameInfoTable,
      seo: data.seo,
    },
    dynamicData: {
      ratingAvg: data.ratingAvg,
      ratingCount: data.ratingCount,
      views: data.views,
      isGameDisabled: data.isGameDisabled,
      gameDisableText: data.gameDisableText,
      gamesApiOverride: data.gamesApiOverride,
      embedCode: data.embedCode,
      images: data.images,
      provider: data.provider,
      categories: data.categories,
    },
  };
}

/**
 * Merge static and dynamic data back together
 */
export function mergeGamePageData(
  staticData: GamePageSplitData["staticData"],
  dynamicData: GamePageSplitData["dynamicData"]
): GamePageData {
  return {
    ...staticData,
    ...dynamicData,
    id: 0, // These will be set from the actual data
    documentId: "",
    createdAt: "",
    updatedAt: "",
    publishedAt: "",
  } as GamePageData;
}
