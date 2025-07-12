// src/lib/strapi/html-sitemap-loader.ts
import { cache } from "react";
import { unstable_cache } from "next/cache";
import { strapiClient } from "./strapi-client";
import type { HtmlSitemapData, SitemapItem } from "@/types/sitemap.types";

const CACHE_TIME = 300; // 5 minutes

interface SitemapEndpointConfig {
  fields: string[];
  filters: Record<string, unknown>;
  endpoint: string;
  path: string;
}

const casinoPath = process.env.NEXT_PUBLIC_CASINO_PAGE_PATH || "/casino/recensione";
const casinoProviderPath = "/casino-online";
const slotCategoryPath = "/slot-machines";
const slotProviderPath = process.env.NEXT_PUBLIC_PROVIDER_PAGE_PATH || "/software-slot-machine";
const gamePath = "/slot-machine";

const sitemapEndpointMap: Record<string, SitemapEndpointConfig> = {
  casinos: {
    fields: ["slug", "title"],
    filters: {},
    endpoint: "casinos",
    path: casinoPath,
  },
  "casino-providers": {
    fields: ["slug", "title"],
    filters: {},
    endpoint: "casino-providers",
    path: casinoProviderPath,
  },
  "casino-live": {
    fields: ["urlPath", "title"],
    filters: { pageType: { $eq: "CASINO_LIVE" } },
    endpoint: "custom-pages",
    path: "/",
  },
  "custom-pages": {
    fields: ["urlPath", "title"],
    filters: {
      $and: [
        { urlPath: { $ne: "sitemap" } },
        {
          $or: [
            { pageType: { $eq: "GUIDA_CASINO" } },
            { pageType: { $null: true } },
          ],
        },
      ],
    },
    endpoint: "custom-pages",
    path: "/",
  },
  "slot-categories": {
    fields: ["slug", "title"],
    filters: {},
    endpoint: "slot-categories",
    path: slotCategoryPath,
  },
  "slot-providers": {
    fields: ["slug", "title"],
    filters: {},
    endpoint: "slot-providers",
    path: slotProviderPath,
  },
  games: {
    fields: ["slug", "title"],
    filters: {},
    endpoint: "games",
    path: gamePath,
  },
};

function sitemapPageQs(
  fields: string[],
  filters: Record<string, unknown>,
  page: number,
  pageSize: number,
) {
  return {
    fields,
    filters,
    sort: ["id:asc"],
    pagination: { page, pageSize },
  };
}

function sitemapAnchorTextResolver(endpoint: string, title: string): string {
  switch (endpoint) {
    case "casinos":
      return `Recensione ${title}`;
    case "casino-providers":
      return `${title} Casino Online`;
    case "games":
      return `${title} Slot`;
    case "slot-categories":
      return `Slot Machine ${title}`;
    case "slot-providers":
      return `${title} Slot machine`;
    default:
      return title;
  }
}

function removeGratis(title: string): string {
  return title.replace(/\bgratis\b/gi, "").replace(/\s+/g, " ").trim();
}

async function fetchSitemapData(
  totalRecords: number[],
  page = 1,
  lastRecordId: number | null = null,
  pageSize = 150,
) {
  const keys = Object.keys(sitemapEndpointMap) as Array<keyof typeof sitemapEndpointMap>;

  const startIndex = (page - 1) * pageSize;
  let remainingItems = pageSize;
  let cumulativeTotal = 0;
  const results: SitemapItem[] = [];
  let newLastRecordId: number | null = lastRecordId;

  for (let i = 0; i < keys.length; i++) {
    let endpointTotal = totalRecords[i];
    const previousTotal = cumulativeTotal;
    cumulativeTotal += endpointTotal;

    if (startIndex < cumulativeTotal) {
      let selectedKey = keys[i];
      let { endpoint, fields, filters, path } = sitemapEndpointMap[selectedKey];
      const adjustedStartIndex = startIndex - previousTotal;
      let adjustedPage = Math.floor(adjustedStartIndex / pageSize) + 1;

      while (remainingItems > 0) {
        const availableRecords = endpointTotal - (adjustedPage - 1) * pageSize;
        const currentPageSize = Math.min(remainingItems, availableRecords);

        if (currentPageSize <= 0 && endpointTotal > 0) break;

        if (endpointTotal > 0) {
          const query = sitemapPageQs(
            fields,
            {
              ...filters,
              ...(lastRecordId && remainingItems === pageSize
                ? { id: { $gt: lastRecordId } }
                : {}),
            },
            adjustedPage,
            currentPageSize,
          );

          const response = await strapiClient.fetchWithCache<{
            data: unknown[];
          }>(endpoint, query, CACHE_TIME);

          // We cast to any because each endpoint returns a different shape
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const data = (response.data || []) as any[];
          if (data.length === 0) break;

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const mapped: SitemapItem[] = data.map((item: any) => {
            const baseUrl = `${process.env.NEXT_PUBLIC_SITE_URL}${path}`;
            if (endpoint === "custom-pages") {
              return {
                id: item.id,
                url: `${baseUrl}${item.attributes.urlPath}/`,
                title: removeGratis(item.attributes.title),
                endpoint: selectedKey,
              };
            }
            return {
              id: item.id,
              url: `${baseUrl}/${item.attributes.slug}/`,
              title: sitemapAnchorTextResolver(endpoint, removeGratis(item.attributes.title)),
              endpoint,
            };
          });

          results.push(...mapped);
          remainingItems -= data.length;
          newLastRecordId = data[data.length - 1]?.id ?? newLastRecordId;
        }

        if (remainingItems > 0) {
          if (i + 1 < keys.length) {
            selectedKey = keys[++i];
            ({ endpoint, fields, filters, path } = sitemapEndpointMap[selectedKey]);
            adjustedPage = 1;
            endpointTotal = totalRecords[i];
          } else {
            break;
          }
        }
      }
      break;
    }
  }

  return { page, data: results, pageSize: results.length, lastRecordId: newLastRecordId };
}

const fetchHtmlSitemapDataCached = cache(async (page = 1, pageSize = 150): Promise<HtmlSitemapData> => {
  try {
    const totalsResponse = await strapiClient.fetchWithCache<{
      casinos: number;
      casinoProviders: number;
      casinoLive: number;
      customPages: number;
      slotCategories: number;
      slotProviders: number;
      games: number;
    }>("total-records", {}, CACHE_TIME);

    const totals = [
      totalsResponse.casinos || 0,
      totalsResponse.casinoProviders || 0,
      totalsResponse.casinoLive || 0,
      totalsResponse.customPages || 0,
      totalsResponse.slotCategories || 0,
      totalsResponse.slotProviders || 0,
      totalsResponse.games || 0,
    ];

    const totalCount = totals.reduce((acc, curr) => acc + curr, 0);
    const pageCount = Math.ceil(totalCount / pageSize);

    const { data } = await fetchSitemapData(totals, page, null, pageSize);

    return {
      items: data,
      pagination: {
        page,
        pageSize,
        pageCount,
        total: totalCount,
      },
    };
  } catch (error) {
    console.error("[Sitemap Loader] Failed to fetch sitemap data:", error);
    return { items: [], pagination: { page, pageSize, pageCount: 0, total: 0 } };
  }
});

export const getHtmlSitemapData = unstable_cache(fetchHtmlSitemapDataCached, ["html-sitemap"], {
  revalidate: CACHE_TIME,
  tags: ["html-sitemap"],
});
