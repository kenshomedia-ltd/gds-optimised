// src/lib/strapi/query-chunks/query-builder.ts

import { gameQueryChunk, imageQueryChunk } from "./shared-chunks";
import { enhancedBlogQueryChunk } from "./blog-fetchers";
import { casinoQueryChunk } from "./casino-fetchers";

/**
 * Dynamic query builder for flexible content fetching
 * Provides a fluent API for building complex Strapi queries
 */

export type ContentType =
  | "games"
  | "casinos"
  | "blogs"
  | "providers"
  | "categories";
export type QueryVariant =
  | "basic"
  | "standard"
  | "detailed"
  | "homepage"
  | "carousel"
  | "table"
  | "minimal";

/**
 * Filter builder interface for type-safe filtering
 */
interface FilterBuilder {
  providers?: string[];
  categories?: string[];
  authors?: string[];
  country?: string;
  minRating?: number;
  maxRating?: number;
  dateRange?: {
    from?: string;
    to?: string;
  };
  excludeDrafts?: boolean;
  excludeInactive?: boolean;
  excludeDisabled?: boolean;
  searchTerm?: string;
}

/**
 * Sort options for different content types
 */
export const SORT_OPTIONS = {
  games: {
    newest: "createdAt:desc",
    popular: "views:desc,ratingAvg:desc",
    rating: "ratingAvg:desc",
    alphabetical: "title:asc",
    nuove: "createdAt:desc",
    az: "title:asc",
    za: "title:desc",
    giocati: "views:desc",
    votate: "ratingAvg:desc",
  },
  casinos: {
    rating: "ratingAvg:desc",
    newest: "createdAt:desc",
    alphabetical: "title:asc",
  },
  blogs: {
    newest: "publishedAt:desc",
    updated: "updatedAt:desc",
    alphabetical: "title:asc",
    popular: "views:desc",
  },
} as const;

/**
 * Advanced Query Builder Class
 * Provides a fluent interface for building complex queries
 */
export class StrapiQueryBuilder {
  private contentType: ContentType;
  private queryVariant: QueryVariant = "standard";
  private filters: Record<string, unknown> = {};
  private sortBy: string = "createdAt:desc";
  private pagination = { page: 1, pageSize: 20 };
  private extraPopulate: Record<string, unknown> = {};
  private extraFields: string[] = [];

  constructor(contentType: ContentType) {
    this.contentType = contentType;
  }

  /**
   * Set the query variant (basic, standard, detailed, etc.)
   */
  variant(variant: QueryVariant): this {
    this.queryVariant = variant;
    return this;
  }

  /**
   * Add filters using a type-safe filter builder
   */
  where(filterBuilder: FilterBuilder): this {
    // Provider filtering
    if (filterBuilder.providers && filterBuilder.providers.length > 0) {
      if (this.contentType === "games" || this.contentType === "casinos") {
        this.filters.provider = { slug: { $in: filterBuilder.providers } };
      }
    }

    // Category filtering
    if (filterBuilder.categories && filterBuilder.categories.length > 0) {
      if (this.contentType === "games") {
        this.filters.categories = { slug: { $in: filterBuilder.categories } };
      } else if (this.contentType === "blogs") {
        this.filters.blogCategory = { slug: { $in: filterBuilder.categories } };
      }
    }

    // Author filtering (blogs)
    if (
      filterBuilder.authors &&
      filterBuilder.authors.length > 0 &&
      this.contentType === "blogs"
    ) {
      this.filters.author = { slug: { $in: filterBuilder.authors } };
    }

    // Country filtering (casinos)
    if (filterBuilder.country && this.contentType === "casinos") {
      this.filters.availableCountries = { $contains: filterBuilder.country };
    }

    // Rating filtering
    if (filterBuilder.minRating !== undefined) {
      this.filters.ratingAvg = {
        ...(this.filters.ratingAvg as object),
        $gte: filterBuilder.minRating,
      };
    }
    if (filterBuilder.maxRating !== undefined) {
      this.filters.ratingAvg = {
        ...(this.filters.ratingAvg as object),
        $lte: filterBuilder.maxRating,
      };
    }

    // Date range filtering
    if (filterBuilder.dateRange) {
      const dateField =
        this.contentType === "blogs" ? "publishedAt" : "createdAt";
      const dateFilter: Record<string, unknown> = {};
      if (filterBuilder.dateRange.from)
        dateFilter.$gte = filterBuilder.dateRange.from;
      if (filterBuilder.dateRange.to)
        dateFilter.$lte = filterBuilder.dateRange.to;
      this.filters[dateField] = dateFilter;
    }

    // Exclude drafts (blogs)
    if (filterBuilder.excludeDrafts && this.contentType === "blogs") {
      this.filters.publishedAt = {
        ...(this.filters.publishedAt as object),
        $notNull: true,
      };
    }

    // Exclude inactive (casinos)
    if (filterBuilder.excludeInactive && this.contentType === "casinos") {
      this.filters.isActive = { $eq: true };
    }

    // Exclude disabled (games)
    if (filterBuilder.excludeDisabled && this.contentType === "games") {
      this.filters.isGameDisabled = { $ne: true };
    }

    // Search term
    if (filterBuilder.searchTerm) {
      this.filters.title = { $containsi: filterBuilder.searchTerm };
    }

    return this;
  }

  /**
   * Set sorting with type-safe sort options
   */
  orderBy(sort: string): this {
    // Use predefined sort options if available
    const sortOptions =
      SORT_OPTIONS[this.contentType as keyof typeof SORT_OPTIONS];
    if (sortOptions && sort in sortOptions) {
      this.sortBy = sortOptions[sort as keyof typeof sortOptions];
    } else {
      this.sortBy = sort;
    }
    return this;
  }

  /**
   * Set pagination
   */
  paginate(page: number = 1, pageSize: number = 20): this {
    this.pagination = { page, pageSize };
    return this;
  }

  /**
   * Add custom populate fields
   */
  populate(populateFields: Record<string, unknown>): this {
    this.extraPopulate = { ...this.extraPopulate, ...populateFields };
    return this;
  }

  /**
   * Add custom fields
   */
  fields(fields: string[]): this {
    this.extraFields = [...this.extraFields, ...fields];
    return this;
  }

  /**
   * Build the final query object
   */
  build(): Record<string, unknown> {
    // Get the base query chunk
    const baseQuery = this.getBaseQueryChunk();

    // Merge with custom fields and populate
    const query: Record<string, unknown> = {
      ...baseQuery,
      filters: this.filters,
      sort: [this.sortBy],
      pagination: this.pagination,
    };

    // Add extra fields
    if (this.extraFields.length > 0) {
      query.fields = [
        ...((baseQuery.fields as string[]) || []),
        ...this.extraFields,
      ];
    }

    // Add extra populate
    if (Object.keys(this.extraPopulate).length > 0) {
      query.populate = {
        ...((baseQuery.populate as Record<string, unknown>) || {}),
        ...this.extraPopulate,
      };
    }

    return query;
  }

  /**
   * Get the base query chunk based on content type and variant
   */
  private getBaseQueryChunk(): Record<string, unknown> {
    switch (this.contentType) {
      case "games":
        if (this.queryVariant === "homepage") return gameQueryChunk.homepage;
        if (this.queryVariant === "carousel") return gameQueryChunk.carousel;
        if (this.queryVariant === "detailed") return gameQueryChunk.detailed;
        if (this.queryVariant === "minimal") return gameQueryChunk.minimal;
        if (this.queryVariant === "basic") return gameQueryChunk.minimal; // Map 'basic' to 'minimal'
        return gameQueryChunk.standard;

      case "casinos":
        return (
          casinoQueryChunk[
            this.queryVariant as keyof typeof casinoQueryChunk
          ] || casinoQueryChunk.standard
        );

      case "blogs":
        return (
          enhancedBlogQueryChunk[
            this.queryVariant as keyof typeof enhancedBlogQueryChunk
          ] || enhancedBlogQueryChunk.standard
        );

      case "providers":
        return {
          fields: ["title", "slug"],
          populate: {
            images: imageQueryChunk,
          },
        };

      case "categories":
        return {
          fields: ["title", "slug"],
          populate: {
            images: imageQueryChunk,
          },
        };

      default:
        return { fields: ["title", "slug"] };
    }
  }
}

/**
 * Factory functions for creating query builders
 */
export const QueryBuilder = {
  games: () => new StrapiQueryBuilder("games"),
  casinos: () => new StrapiQueryBuilder("casinos"),
  blogs: () => new StrapiQueryBuilder("blogs"),
  providers: () => new StrapiQueryBuilder("providers"),
  categories: () => new StrapiQueryBuilder("categories"),
};

/**
 * Pre-built query templates for common use cases
 */
export const QueryTemplates = {
  // Homepage queries
  homepageGames: (providers: string[], limit: number = 18) =>
    QueryBuilder.games()
      .variant("homepage")
      .where({ providers })
      .orderBy("popular") // Changed to popular instead of newest
      .paginate(1, limit)
      .build(),

  homepageBlogs: (limit: number = 6) =>
    QueryBuilder.blogs()
      .variant("homepage")
      .where({ excludeDrafts: true })
      .orderBy("newest")
      .paginate(1, limit)
      .build(),

  homepageCasinos: (limit: number = 10) =>
    QueryBuilder.casinos()
      .variant("standard")
      .where({ excludeInactive: true })
      .orderBy("rating")
      .paginate(1, limit)
      .build(),

  // Search queries
  searchGames: (searchTerm: string, filters: FilterBuilder = {}) =>
    QueryBuilder.games()
      .variant("standard")
      .where({ searchTerm, ...filters })
      .orderBy("popular")
      .paginate(1, 50)
      .build(),

  // Related content queries
  relatedBlogs: (category: string, excludeSlug: string, limit: number = 4) =>
    QueryBuilder.blogs()
      .variant("standard")
      .where({
        categories: [category],
        excludeDrafts: true,
      })
      .orderBy("newest")
      .paginate(1, limit)
      .build(),

  // Filter queries
  gamesByProvider: (provider: string, limit: number = 24) =>
    QueryBuilder.games()
      .variant("detailed")
      .where({ providers: [provider] })
      .orderBy("popular") // Changed to popular instead of rating
      .paginate(1, limit)
      .build(),

  casinosByCountry: (country: string, limit: number = 20) =>
    QueryBuilder.casinos()
      .variant("table")
      .where({ country, excludeInactive: true })
      .orderBy("rating")
      .paginate(1, limit)
      .build(),
};

/**
 * Utility functions for query optimization
 */
export const QueryUtils = {
  /**
   * Optimize query for performance
   */
  optimizeQuery: (query: Record<string, unknown>): Record<string, unknown> => {
    // Limit pagination for performance
    if (query.pagination && typeof query.pagination === "object") {
      const pagination = query.pagination as { pageSize?: number };
      if (pagination.pageSize && pagination.pageSize > 100) {
        pagination.pageSize = 100;
      }
    }

    // Add performance hints
    return {
      ...query,
      // Add any performance optimizations here
    };
  },

  /**
   * Validate query structure
   */
  validateQuery: (query: Record<string, unknown>): boolean => {
    // Basic validation
    if (!query.fields && !query.populate) {
      console.warn("Query should include either fields or populate");
      return false;
    }

    return true;
  },

  /**
   * Debug query for development
   */
  debugQuery: (query: Record<string, unknown>): void => {
    if (process.env.NODE_ENV === "development") {
      console.log("Strapi Query:", JSON.stringify(query, null, 2));
    }
  },
};
