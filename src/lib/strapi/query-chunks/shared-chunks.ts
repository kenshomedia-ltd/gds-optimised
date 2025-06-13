// src/lib/strapi/query-chunks/shared-chunks.ts

/**
 * Shared query chunks that can be reused across different page loaders
 */

export const seoQueryChunk = {
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
};

export const breadcrumbsQueryChunk = {
  fields: ["breadCrumbText", "breadCrumbUrl"],
};

export const authorQueryChunk = {
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
};

export const imageQueryChunk = {
  fields: ["url", "width", "height", "alternativeText", "mime"],
};

export const providerQueryChunk = {
  fields: ["title", "slug"],
  populate: {
    images: {
      fields: ["url", "width", "height"],
    },
  },
};

export const categoryQueryChunk = {
  fields: ["title", "slug"],
  populate: {
    images: {
      fields: ["url", "width", "height"],
    },
  },
};

export const casinoQueryChunk = (
  casinoCountry?: string,
  localisation: boolean = false
) => ({
  fields: ["title", "slug", "ratingAvg", "ratingCount", "publishedAt"],
  populate: {
    images: {
      fields: ["url"],
    },
    logoIcon: {
      fields: ["url"],
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
      fields: ["bonusAmount", "termsConditions", "cashBack", "freeSpin"],
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
  filters: {
    ...(localisation &&
      casinoCountry && {
        countries: {
          shortCode: {
            $in: casinoCountry,
          },
        },
      }),
  },
});

// Block-specific query chunks
export const blockQueryChunks = {
  "shared.introduction-with-image": {
    fields: ["heading", "introduction"],
    populate: {
      image: imageQueryChunk,
    },
  },
  "games.new-and-loved-slots": {
    fields: ["newSlots"],
    populate: {
      slot_categories: categoryQueryChunk,
      slot_providers: providerQueryChunk,
    },
  },
  "games.games-carousel": {
    fields: [
      "numberOfGames",
      "sortBy",
      "showGameFilterPanel",
      "showGameMoreButton",
    ],
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
      image: imageQueryChunk,
    },
  },
  "casinos.casino-list": {
    fields: ["heading"],
    populate: {
      casinosList: {
        fields: ["id"],
        populate: {
          casino: (casinoCountry?: string, localisation: boolean = false) =>
            casinoQueryChunk(casinoCountry, localisation),
        },
      },
    },
  },
  "casinos.casinos-comparison": {
    fields: ["heading"],
    populate: {
      casinos: {
        fields: ["id"],
        populate: {
          casino: (casinoCountry?: string, localisation: boolean = false) =>
            casinoQueryChunk(casinoCountry, localisation),
        },
      },
    },
  },
  "shared.overview-block": {
    fields: ["title"],
    populate: {
      overviews: {
        fields: ["title", "url"],
        populate: {
          card_img: imageQueryChunk,
        },
      },
    },
  },
  "homepage.home-featured-providers": {
    populate: {
      homeFeaturedProviders: {
        populate: {
          providers: providerQueryChunk,
        },
      },
    },
  },
  "homepage.home-featured-categories": {
    populate: {
      homeCategoriesList: {
        populate: {
          slot_categories: categoryQueryChunk,
        },
      },
    },
  },
  "shared.provider-list": {
    populate: {
      providers: providerQueryChunk,
    },
  },
  "shared.how-to-group": {
    fields: ["title", "description"],
    populate: {
      howToGroup: {
        fields: ["heading", "copy"],
        populate: {
          image: imageQueryChunk,
        },
      },
    },
  },
  "shared.image-with-paragraph": {
    populate: {
      imageWithParagraph: {
        fields: ["heading", "copy"],
        populate: {
          image: imageQueryChunk,
        },
      },
    },
  },
  "shared.medium-image-with-content": {
    fields: ["title", "content"],
    populate: {
      image: imageQueryChunk,
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
      proImage: imageQueryChunk,
      conImage: imageQueryChunk,
    },
  },
  "shared.image-carousel": {
    fields: ["carouselTitle"],
    populate: {
      image: imageQueryChunk,
    },
  },
};

// Build games query with filters and sorting
export function buildGamesQuery(options: {
  limit?: number;
  sort?: string;
  page?: number;
  providers?: string[];
  categories?: string[];
}) {
  const {
    limit = 24,
    sort = 'createdAt:desc',
    page = 1,
    providers = [],
    categories = [],
  } = options;

  const query: any = {
    fields: [
      "title",
      "slug",
      "ratingAvg",
      "ratingCount",
      "createdAt",
      "publishedAt",
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
    sort: [sort],
    pagination: {
      pageSize: limit,
      page: page,
    },
  };

  // Add filters if providers or categories are specified
  if (providers.length > 0 || categories.length > 0) {
    query.filters = {};
    
    if (providers.length > 0) {
      query.filters.provider = {
        slug: { $in: providers },
      };
    }
    
    if (categories.length > 0) {
      query.filters.categories = {
        slug: { $in: categories },
      };
    }
  }

  return query;
}
