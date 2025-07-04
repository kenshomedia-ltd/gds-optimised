// src/app/layout.tsx - Corrected version
import { Lato, Roboto } from "next/font/google";
import { ClientErrorBoundary } from "@/components/common/ErrorBoundary/ErrorBoundary";
import { ChunkLoadErrorHandler } from "@/components/common/ChunkLoadErrorHandler";
import { getLayoutData } from "@/lib/strapi/data-loader";
import { LegalServer } from "@/components/layout/Legal";
import DynamicTheme from "@/components/layout/DynamicTheme/DynamicTheme";
import { Header } from "@/components/layout/Header";
import { FooterServer } from "@/components/layout/Footer";
import { ClientProviders } from "@/components/providers/ClientProviders";
import { BackToTop } from "@/components/common/BackToTop/BackToTop";
import { Toaster } from "sonner";
import { getFaviconPath, generateFaviconLinks } from "@/lib/utils/favicon";
import type { Metadata, Viewport } from "next";

import "./globals.css";
import { cn } from "@/lib/utils/cn";
import Script from "next/script";

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
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
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

        {/* Preconnect to critical third-party origins */}
        <link rel="preconnect" href={process.env.NEXT_PUBLIC_API_URL || ""} />
        <link rel="dns-prefetch" href={process.env.NEXT_PUBLIC_API_URL || ""} />

        {/* Additional performance optimizations */}
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
        {/* Swetrix Analytics Script */}
        <Script
          src="https://swetrix.org/swetrix.js"
          strategy="afterInteractive"
          defer
        />

        {/* Swetrix Initialization Script */}
        <Script
          id="swetrix-init"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              document.addEventListener('DOMContentLoaded', function() {
                if (typeof swetrix !== 'undefined') {
                  swetrix.init('${process.env.NEXT_PUBLIC_SWETRIX_PROJECT_ID}');
                  swetrix.trackViews();
                }
              });
            `,
          }}
        />

        {/* No-script fallback */}
        <noscript>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`https://api.swetrix.com/log/noscript?pid=${process.env.NEXT_PUBLIC_SWETRIX_PROJECT_ID}`}
            alt=""
            referrerPolicy="no-referrer-when-downgrade"
            style={{ display: "none" }}
          />
        </noscript>

        {/* Change this line: */}
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

              <FooterServer
                footerContent={layoutData.layout.footerContent}
                footerImages={layoutData.layout.footerImages}
                footerNavigation={layoutData.navigation.footerNavigation}
                footerNavigations={layoutData.navigation.footerNavigations}
                translations={layoutData.translations}
              />
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
