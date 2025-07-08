// src/lib/strapi/html-sitemap-loader.ts
import { unstable_cache } from "next/cache";
import { strapiClient } from "./strapi-client";
import type { HtmlSitemapData, SitemapItem, SitemapPagination } from "@/types/sitemap.types";

const CACHE_TIME = 300; // 5 minutes

async function fetchHtmlSitemapData(page: number = 1, pageSize: number = 150): Promise<HtmlSitemapData> {
  const query = {
    pagination: { page, pageSize, withCount: true },
  };

  try {
    const response = await strapiClient.fetchWithCache<{ data: SitemapItem[]; meta: { pagination: SitemapPagination } }>(
      "html-sitemap",
      query,
      CACHE_TIME
    );

    return {
      items: response.data || [],
      pagination: response.meta?.pagination || { page, pageSize, pageCount: 0, total: 0 },
    };
  } catch (error) {
    console.error("[Sitemap Loader] Failed to fetch sitemap data:", error);
    return { items: [], pagination: { page, pageSize, pageCount: 0, total: 0 } };
  }
}

export const getHtmlSitemapData = unstable_cache(fetchHtmlSitemapData, ["html-sitemap"], {
  revalidate: CACHE_TIME,
  tags: ["html-sitemap"],
});
