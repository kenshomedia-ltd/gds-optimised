// next.config.ts
import type { NextConfig } from "next";
import type { RedirectsResponse } from "@/types/redirect.types";
import path from "path";
import fs from "fs";

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
    ];
  },

  // Redirects from Strapi
  async redirects() {
    return [
      {
        source: "/go/hardrock",
        destination: "https://www.hardrockcasino.it/slot-machine",
        permanent: false,
        basePath: false,
        locale: false,
      },
      {
        source: "/go/star-casino",
        destination:
          "https://offerte.starcasino.it/it/bonus-benvenuto-casino?from=3AofSeKqaZZ09ljkoFnMbWNd7ZgqdRLk-AQ2391140206&affcode=AQ2391140206&utm_medium=MA_Affiliates&utm_source=10069751",
        permanent: false,
        basePath: false,
        locale: false,
      },
    ];

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
