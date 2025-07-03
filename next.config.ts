// next.config.ts
import type { NextConfig } from "next";
import type { RedirectsResponse } from "@/types/redirect.types";

const nextConfig: NextConfig = {
  // Configure base path to serve from /it/
  basePath: "/it",
  // Enable standalone output for Docker deployment
  output: "standalone",
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

  // Headers for caching and security
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "origin-when-cross-origin",
          },
        ],
      },
      {
        source: "/api/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "no-store, no-cache, must-revalidate",
          },
        ],
      },
      {
        // Static assets caching
        source: "/static/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        // Image caching
        source: "/_next/image(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/dashboard/:path*",
        headers: [
          {
            key: "X-Robots-Tag",
            value: "noindex, nofollow",
          },
        ],
      },
    ];
  },

  // Redirects from Strapi
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

    try {
      // Build query string
      const params = new URLSearchParams({
        "pagination[pageSize]": "1000",
        "pagination[page]": "1",
        sort: "createdAt:desc",
      });

      const url = `${STRAPI_API_URL}/api/redirects?${params}`;

      // Fetch redirects
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
        console.warn("[Redirects] No redirects found");
        return [];
      }

      // Transform redirects
      const processedRedirects: Array<{
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
        processedRedirects.push({
          source,
          destination,
          permanent: redirect.redirectMethod === "permanent",
          ...(isExternal && { basePath: false as const }),
        });
      });

      console.log(`[Redirects] Processed ${data.data.length} redirects`);

      return processedRedirects;
    } catch (error) {
      console.error("[Redirects] Failed to load redirects:", error);
      return [];
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
