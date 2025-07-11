// src/app/layout.tsx - Corrected version
import { BackToTop } from "@/components/common/BackToTop/BackToTop";
import { ChunkLoadErrorHandler } from "@/components/common/ChunkLoadErrorHandler";
import { ClientErrorBoundary } from "@/components/common/ErrorBoundary/ErrorBoundary";
import DynamicTheme from "@/components/layout/DynamicTheme/DynamicTheme";
import { FooterWrapper } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { LegalServer } from "@/components/layout/Legal";
import { ClientProviders } from "@/components/providers/ClientProviders";
import { getLayoutData } from "@/lib/strapi/data-loader";
import { generateFaviconLinks, getFaviconPath } from "@/lib/utils/favicon";
import type { Metadata, Viewport } from "next";
import { Lato, Roboto } from "next/font/google";
import { Toaster } from "sonner";

import "./globals.css";
import { cn } from "@/lib/utils/cn";
import { GoogleAnalytics } from "@next/third-parties/google";

// Configure Lato for headings with font metrics for reduced CLS
const lato = Lato({
  weight: ["300", "400", "700", "900"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-lato",
  preload: true,
  adjustFontFallback: true,
});

// Configure Roboto for body text with font metrics for reduced CLS
const roboto = Roboto({
  weight: ["300", "400", "500", "700"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-roboto",
  preload: true,
  adjustFontFallback: true,
});

// Viewport configuration for mobile optimization
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#ffffff",
};

// Dynamic metadata generation with site-specific favicon
export async function generateMetadata(): Promise<Metadata> {
  const siteId = process.env.NEXT_PUBLIC_SITE_ID || "default";
  const siteName = process.env.NEXT_PUBLIC_SITE_NAME || "Casino Games";
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://example.com";

  // Generate favicon icons for the specific site
  const faviconIcons = generateFaviconLinks(siteId);

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: siteName,
      template: `%s | ${siteName}`,
    },
    description: "Play the best casino games and read expert reviews",
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    // Dynamic favicon configuration
    icons: faviconIcons,
    // Additional meta tags
    other: {
      // Add cache control for static assets
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Fetch layout data with caching
  const layoutData = await getLayoutData();

  const siteId = process.env.NEXT_PUBLIC_SITE_ID || "default";
  const siteName = process.env.NEXT_PUBLIC_SITE_NAME || "Casino Games";
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://example.com";

  return (
    <html lang="en" className={`${lato.variable} ${roboto.variable}`}>
      <head>
        {/* The ChunkLoadErrorHandler */}
        <ChunkLoadErrorHandler />
        {/* RENDER THE THEME COMPONENT */}
        {/* This component imports the CSS but renders no HTML */}
        <DynamicTheme siteId={siteId} />

        {/* Site-specific favicon fallback for older browsers */}
        <link
          rel="shortcut icon"
          href={getFaviconPath(siteId, "favicon.ico")}
          type="image/x-icon"
        />

        {/* Preconnect to critical origins */}
        <link
          rel="preconnect"
          href={process.env.NEXT_PUBLIC_API_URL || ""}
          crossOrigin="anonymous"
        />
        <link rel="dns-prefetch" href={process.env.NEXT_PUBLIC_API_URL || ""} />
        <link
          rel="preconnect"
          href={process.env.NEXT_PUBLIC_SITE_URL || ""}
          crossOrigin="anonymous"
        />
        <link rel="dns-prefetch" href={process.env.NEXT_PUBLIC_SITE_URL || ""} />

        {/* Additional performance optimizations */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="dns-prefetch" href="//fonts.gstatic.com" />

        {/* Open Graph meta tags for better social sharing */}
        <meta property="og:site_name" content={siteName} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={siteUrl} />

        {/* Twitter Card meta tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content={siteName} />

        {/* Additional SEO meta tags */}
        <meta name="author" content={siteName} />
        <meta name="publisher" content={siteName} />
        <meta name="format-detection" content="telephone=no" />

        {/* Structured data for site identity */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: siteName,
              url: siteUrl,
              logo: `${siteUrl}${getFaviconPath(
                siteId,
                "favicon-192x192.png"
              )}`,
              sameAs: [siteUrl],
            }),
          }}
        />
      </head>

      <body
        className={cn(
          "min-h-screen bg-body-bg text-body-text antialiased font-body",
          roboto.className
        )}
        suppressHydrationWarning={true}
      >
        {/* Google Analytics */}
        <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || ""} />

        <ClientErrorBoundary>
          {/* Legal bar at the very top */}
          <LegalServer legalText={layoutData.layout.legalText} />

          {/* Wrap everything that needs client providers */}
          <ClientProviders>
            {/* Main layout structure */}
            <div className="flex flex-col min-h-[calc(100vh-35px)]">
              {/* Header Component - Now inside ClientProviders */}
              <Header
                logo={layoutData.layout.Logo}
                mainNavigation={layoutData.navigation.mainNavigation}
                subNavigation={layoutData.navigation.subNavigation}
                translations={layoutData.translations}
              />

              {/* Main content */}
              <main className="flex-1 z-50">{children}</main>

              <FooterWrapper layoutData={layoutData} />
            </div>

            {/* Back to Top Button - Also needs to be inside providers if it uses any context */}
            <BackToTop />
          </ClientProviders>

          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: "var(--color-background-900)",
                color: "var(--color-white)",
                border: "1px solid var(--color-border)",
              },
            }}
          />

          {/* Portal root for rendering outside the main component tree */}
          <div id="portal-root"></div>
        </ClientErrorBoundary>
      </body>
    </html>
  );
}
