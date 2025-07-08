import { unstable_cache } from "next/cache";
import { strapiClient } from "./strapi-client";

export interface SitemapItem {
  url: string;
  title: string;
  group: keyof typeof sitemapEndpointMap;
}

const sitemapEndpointMap = {
  "custom-pages": {
    endpoint: "custom-pages",
    fields: ["urlPath", "title"],
    filters: {
      urlPath: { $ne: "sitemap" },
    },
    path: "/",
  },
  casinos: {
    endpoint: "casinos",
    fields: ["slug", "title"],
    filters: {},
    path: process.env.NEXT_PUBLIC_CASINO_PAGE_PATH || "/casino/recensione",
  },
  "casino-providers": {
    endpoint: "casino-providers",
    fields: ["slug", "title"],
    filters: {},
    path: "/casino-online",
  },
  "slot-providers": {
    endpoint: "slot-providers",
    fields: ["slug", "title"],
    filters: {},
    path: process.env.NEXT_PUBLIC_PROVIDER_PAGE_PATH || "/software-slot-machine",
  },
  "slot-categories": {
    endpoint: "slot-categories",
    fields: ["slug", "title"],
    filters: {},
    path: "/slot-machine",
  },
  games: {
    endpoint: "games",
    fields: ["slug", "title"],
    filters: {},
    path: process.env.NEXT_PUBLIC_GAME_PAGE_PATH || "/slot-machines",
  },
  blogs: {
    endpoint: "blogs",
    fields: ["slug", "title"],
    filters: {},
    path: "/blog",
  },
  users: {
    endpoint: "users",
    fields: ["firstName", "lastName"],
    filters: { isAnAuthor: { $eq: true } },
    path: process.env.NEXT_PUBLIC_AUTHOR_PAGE_PATH || "/author",
  },
} as const;

const sitemapKeys = Object.keys(sitemapEndpointMap) as Array<keyof typeof sitemapEndpointMap>;

function buildQuery(
  fields: string[],
  filters: Record<string, unknown>,
  page = 1,
  pageSize = 1000
) {
  return {
    fields,
    filters,
    sort: ["id:asc"],
    pagination: { page, pageSize },
  };
}

async function fetchAllItems(): Promise<SitemapItem[]> {
  const items: SitemapItem[] = [];
  for (const key of sitemapKeys) {
    const config = sitemapEndpointMap[key];
    try {
      const query = buildQuery(config.fields, config.filters);
      const response = await strapiClient.fetchWithCache<{ data: unknown[] }>(
        config.endpoint,
        query,
        3600
      );
      const data = response.data || [];
      for (const item of data) {
        if (config.endpoint === "users") {
          items.push({
            url: `${config.path}/${item.firstName.toLowerCase()}.${item.lastName.toLowerCase()}/`,
            title: `${item.firstName} ${item.lastName}`,
            group: key,
          });
        } else if (config.endpoint === "custom-pages") {
          items.push({
            url: `${config.path}${item.urlPath}/`,
            title: item.title,
            group: key,
          });
        } else {
          items.push({
            url: `${config.path}/${item.slug}/`,
            title: item.title,
            group: key,
          });
        }
      }
    } catch (error) {
      console.error("Sitemap fetch error", error);
    }
  }
  return items;
}

const getAllSitemapItems = unstable_cache(fetchAllItems, ["sitemap-all-items"], {
  revalidate: 3600,
  tags: ["sitemap"],
});

export async function getSitemapPage(page: number, pageSize: number): Promise<{
  data: SitemapItem[];
  totalItems: number;
  totalPages: number;
}> {
  const allItems = await getAllSitemapItems();
  const totalItems = allItems.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const start = (page - 1) * pageSize;
  const data = allItems.slice(start, start + pageSize);
  return { data, totalItems, totalPages };
}

