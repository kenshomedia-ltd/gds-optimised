// next.config.ts
import type { NextConfig } from "next";
import type { RedirectsResponse } from "@/types/redirect.types";

const nextConfig: NextConfig = {
  // Configure base path to serve from /it/
  basePath: "/it",
  // Enable standalone output for Docker deployment
  output: "standalone",
  // trailing slash
  trailingSlash: true,
  // Image optimization configuration
  images: {
    // Allow images from AWS CloudFront
    remotePatterns: [
      {
        protocol: "https",
        hostname: "d1ekh99p753u3m.cloudfront.net",
      },
      {
        protocol: "https",
        hostname: "giochigatsby.s3.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "giochigatsby.s3.eu-west-1.amazonaws.com",
        port: "",
        pathname: "/**",
      },
      // Add your Strapi domain if needed
      {
        protocol: "http",
        hostname: "localhost",
        port: "1337",
      },
    ],
    // Optimize image loading
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    formats: ["image/webp"],
    minimumCacheTTL: 60 * 60 * 24 * 365, // 1 year
    dangerouslyAllowSVG: true,
    contentDispositionType: "inline",
  },

  // Enable experimental features for better performance
  experimental: {
    optimizeCss: true,
    scrollRestoration: true,
  },

  // Compression
  compress: true,

  // Production optimizations
  productionBrowserSourceMaps: false,

  // Strict mode for better development
  reactStrictMode: true,

  // PoweredBy header removal for security
  poweredByHeader: false,

  // Enhanced headers for CDN optimization
  async headers() {
    return [
      // Static assets - Long-term caching with immutable
      {
        source: "/_next/static/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
          {
            key: "Vary",
            value: "Accept-Encoding",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
        ],
      },

      // JavaScript chunks - Critical for fixing ChunkLoadError
      {
        source: "/_next/static/chunks/:path*",
        headers: [
          {
            key: "Cache-Control",
            // Use stale-while-revalidate
            value: "public, max-age=31536000, stale-while-revalidate=604800",
          },
        ],
      },

      // CSS files
      {
        source: "/_next/static/css/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
          {
            key: "Vary",
            value: "Accept-Encoding",
          },
        ],
      },

      // Images from CDN
      {
        source: "/images/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=86400, s-maxage=31536000",
          },
          {
            key: "Vary",
            value: "Accept-Encoding, Accept",
          },
          {
            key: "X-CDN-Cache",
            value: "images",
          },
        ],
      },

      // HTML pages - Short cache with revalidation
      {
        source: "/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value:
              "public, max-age=0, s-maxage=86400, stale-while-revalidate=604800",
          },
          {
            key: "Vary",
            value: "Accept-Encoding, Accept-Language, Cookie",
          },
          {
            key: "X-CDN-Cache",
            value: "pages",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
        ],
      },

      // API routes - No caching
      {
        source: "/api/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "no-cache, no-store, must-revalidate",
          },
          {
            key: "Pragma",
            value: "no-cache",
          },
          {
            key: "Expires",
            value: "0",
          },
        ],
      },

      // Sitemap and robots.txt - Moderate caching
      {
        source: "/(sitemap.xml|robots.txt)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=3600, s-maxage=86400",
          },
        ],
      },
    ];
  },

  // Redirects from Strapi + BasePath Auto-Redirects
  async redirects() {
    const STRAPI_API_URL =
      process.env.NEXT_PUBLIC_API_URL || process.env.PUBLIC_API_URL || "";
    const STRAPI_API_TOKEN =
      process.env.NEXT_PUBLIC_API_TOKEN || process.env.PUBLIC_API_TOKEN || "";
    const BASE_PATH = "/it";

    // Helper functions
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

    function removeBasePath(url: string): string {
      if (url.startsWith(BASE_PATH)) {
        return url.slice(BASE_PATH.length) || "/";
      }
      return url;
    }

    function ensureBasePath(url: string): string {
      if (!url.startsWith(BASE_PATH)) {
        return BASE_PATH + url;
      }
      return url;
    }

    // BasePath auto-redirects (always added first)
    const basePathRedirects: Array<{
      source: string;
      destination: string;
      permanent: boolean;
      basePath?: false;
    }> = [
      // Redirect root to basePath
      {
        source: "/",
        destination: BASE_PATH,
        permanent: true,
        basePath: false, // Important: disable basePath for this redirect
      },
      // Redirect any path without basePath to one with basePath
      // Use negative lookahead to exclude paths that already have basePath
      {
        source: `/:path((?!${BASE_PATH.slice(1)}).*)*`,
        destination: `${BASE_PATH}/:path*`,
        permanent: true,
        basePath: false, // Important: disable basePath for this redirect
      },
    ];

    try {
      // Build query string for Strapi redirects
      const params = new URLSearchParams({
        "pagination[pageSize]": "1000",
        "pagination[page]": "1",
        sort: "createdAt:desc",
      });

      const url = `${STRAPI_API_URL}/api/redirects?${params}`;

      // Fetch redirects from Strapi
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

      const data = (await response.json()) as RedirectsResponse;

      if (!data?.data) {
        console.warn("[Redirects] No redirects found in Strapi");
        // Return basePath redirects even if no Strapi redirects
        return basePathRedirects;
      }

      // Transform Strapi redirects
      const strapiRedirects: Array<{
        source: string;
        destination: string;
        permanent: boolean;
        basePath?: false;
      }> = [];

      data.data.forEach((redirect) => {
        if (!redirect.redirectUrl || !redirect.redirectTarget) {
          return;
        }

        let source = normalizeRedirectUrl(redirect.redirectUrl);
        let destination = redirect.redirectTarget;

        const isExternal =
          destination.startsWith("http://") ||
          destination.startsWith("https://");

        if (isExternal) {
          // For external redirects, ensure source has /it prefix
          source = ensureBasePath(source);
        } else {
          // For internal redirects, remove basePath from both source and destination
          source = removeBasePath(source);
          destination = removeBasePath(destination);
        }

        // Remove trailing slash from source (unless it's root)
        if (source !== "/" && source !== "/it" && source.endsWith("/")) {
          source = source.slice(0, -1);
        }

        // Create single redirect rule
        strapiRedirects.push({
          source,
          destination,
          permanent: redirect.redirectMethod === "permanent",
          ...(isExternal && { basePath: false as const }),
        });
      });

      console.log(`[Redirects] Processed ${data.data.length} Strapi redirects`);
      console.log(
        `[Redirects] Added ${basePathRedirects.length} basePath auto-redirects`
      );

      // Combine basePath redirects with Strapi redirects
      // BasePath redirects go first to ensure they have priority
      return [...basePathRedirects, ...strapiRedirects];
    } catch (error) {
      console.error("[Redirects] Failed to load Strapi redirects:", error);
      // Return basePath redirects even if Strapi fails
      return basePathRedirects;
    }
  },

  // Rewrites for image optimization
  async rewrites() {
    return {
      beforeFiles: [],
      afterFiles: [
        // Rewrite for slot-machine page
        // {
        //   source: "/slot-machine/nuove",
        //   destination: "/pages/slot-machine/nuove",
        // },
        // // Rewrite for slot-machine page
        // {
        //   source: "/slot-machine",
        //   destination: "/pages/slot-machine",
        // },
        // Rewrite for AWS Image Handler if needed
        {
          source: "/images/:path*",
          destination: `${
            process.env.NEXT_PUBLIC_IMAGE_URL ||
            "https://d1ekh99p753u3m.cloudfront.net"
          }/:path*`,
        },
      ],
      fallback: [],
    };
  },
};

export default nextConfig;
