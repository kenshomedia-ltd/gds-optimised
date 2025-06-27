// src/lib/strapi-redirects.ts
/**
 * Standalone redirects loader for Next.js config
 * This file contains all redirect logic in one place to avoid module resolution issues
 */

const STRAPI_API_URL =
  process.env.NEXT_PUBLIC_API_URL || process.env.PUBLIC_API_URL || "";
const STRAPI_API_TOKEN =
  process.env.NEXT_PUBLIC_API_TOKEN || process.env.PUBLIC_API_TOKEN || "";
const BASE_PATH = "/it";

interface RedirectData {
  id: number;
  documentId?: string;
  redirectUrl: string;
  redirectTarget: string;
  redirectMethod: "permanent" | "temporary" | null;
}

interface RedirectsResponse {
  data: RedirectData[];
  meta?: {
    pagination?: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

// Define redirect types matching Next.js expectations
interface NextJsRedirectBase {
  source: string;
  destination: string;
  permanent: boolean;
}

interface NextJsRedirectExternal extends NextJsRedirectBase {
  basePath: false;
}

type NextJsRedirect = NextJsRedirectBase | NextJsRedirectExternal;

/**
 * Simple fetch wrapper for Strapi API
 */
async function fetchFromStrapi(
  endpoint: string,
  params: Record<string, string> = {}
): Promise<unknown> {
  const queryString = new URLSearchParams(params).toString();
  const url = `${STRAPI_API_URL}/api/${endpoint}${
    queryString ? `?${queryString}` : ""
  }`;

  console.log(`[Redirects] Fetching from: ${url}`);

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${STRAPI_API_TOKEN}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(
      `Strapi API error: ${response.status} ${response.statusText}`
    );
  }

  return response.json();
}

/**
 * Normalize redirect URL
 */
function normalizeRedirectUrl(url: string): string {
  if (
    !url.startsWith("http://") &&
    !url.startsWith("https://") &&
    !url.startsWith("/")
  ) {
    return `/${url}`;
  }
  return url;
}

/**
 * Remove base path from URL if present
 */
function removeBasePath(url: string): string {
  if (url.startsWith(BASE_PATH)) {
    return url.slice(BASE_PATH.length) || "/";
  }
  return url;
}

/**
 * Fetch and transform redirects for Next.js
 */
export async function loadRedirects(): Promise<NextJsRedirect[]> {
  try {
    console.log("[Redirects] Starting redirect fetch...");

    // Fetch redirects from Strapi
    const response = (await fetchFromStrapi("redirects", {
      "pagination[pageSize]": "1000",
      "pagination[page]": "1",
      "fields[0]": "redirectUrl",
      "fields[1]": "redirectTarget",
      "fields[2]": "redirectMethod",
      "sort[0]": "createdAt:desc",
    })) as RedirectsResponse;

    if (!response?.data) {
      console.warn("[Redirects] No redirects found in response");
      return [];
    }

    console.log(`[Redirects] Fetched ${response.data.length} redirects`);

    // Transform redirects
    const redirects: NextJsRedirect[] = response.data
      .filter((redirect) => {
        if (!redirect.redirectUrl || !redirect.redirectTarget) {
          console.warn(
            `[Redirects] Skipping invalid redirect: ${JSON.stringify(redirect)}`
          );
          return false;
        }
        return true;
      })
      .map((redirect): NextJsRedirect => {
        let source = normalizeRedirectUrl(redirect.redirectUrl);
        let destination = redirect.redirectTarget;

        const isExternal =
          destination.startsWith("http://") ||
          destination.startsWith("https://");

        // Remove basePath for internal redirects
        if (!isExternal) {
          source = removeBasePath(source);
          destination = removeBasePath(destination);
        }

        // Build redirect object based on whether it's external
        if (isExternal) {
          return {
            source,
            destination,
            permanent: redirect.redirectMethod === "permanent",
            basePath: false as const,
          };
        }

        return {
          source,
          destination,
          permanent: redirect.redirectMethod === "permanent",
        };
      });

    console.log(`[Redirects] Transformed ${redirects.length} redirects`);
    console.log(
      `[Redirects] External: ${
        redirects.filter((r) => "basePath" in r && r.basePath === false).length
      }`
    );
    console.log(
      `[Redirects] Internal: ${
        redirects.filter((r) => !("basePath" in r)).length
      }`
    );

    return redirects;
  } catch (error) {
    console.error("[Redirects] Failed to load redirects:", error);
    return [];
  }
}
