// src/app/layout.tsx
import type { Metadata, Viewport } from "next";
import { Lato, Roboto } from "next/font/google";
import { getLayoutData } from "@/lib/strapi/data-loader";
import { LegalServer } from "@/components/layout/Legal";
import DynamicTheme from "@/components/layout/DynamicTheme/DynamicTheme";
import { Header } from "@/components/layout/Header";

// Font Awesome
// import { config } from '@fortawesome/fontawesome-svg-core'
// import '@fortawesome/fontawesome-svg-core/styles.css'

// // Font Awesome Kit package
// import '@awesome.me/kit-0e07a43543'
// config.autoAddCss = false;

import "./globals.css";

// Configure Lato for headings
const lato = Lato({
  weight: ["300", "400", "700", "900"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-lato",
  preload: true,
});

// Configure Roboto for body text
const roboto = Roboto({
  weight: ["300", "400", "500", "700"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-roboto",
  preload: true,
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

// Base metadata
export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://example.com"
  ),
  title: {
    default: "Casino Games & Reviews",
    template: "%s | Casino Games",
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
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Fetch layout data with caching
  const layoutData = await getLayoutData();

  const siteId = process.env.NEXT_PUBLIC_SITE_ID || "default";

  return (
    <html lang="en" className={`${lato.variable} ${roboto.variable}`}>
      <head>
        {/* 3. RENDER THE THEME COMPONENT */}
        {/* This component imports the CSS but renders no HTML */}
        <DynamicTheme siteId={siteId} />

        {/* Preconnect to critical third-party origins */}
        <link rel="preconnect" href={process.env.NEXT_PUBLIC_API_URL || ""} />
        <link rel="dns-prefetch" href={process.env.NEXT_PUBLIC_API_URL || ""} />

        {/* Preload critical assets */}
        <link
          rel="preload"
          href="/icons/logo-timone.svg"
          as="image"
          type="image/svg+xml"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/icons/logo-adm.svg"
          as="image"
          type="image/svg+xml"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/icons/plus-18.svg"
          as="image"
          type="image/svg+xml"
          crossOrigin="anonymous"
        />
      </head>

      <body className="min-h-screen bg-body-bg text-body-text antialiased font-body">
        {/* Legal bar at the very top */}
        <LegalServer legalText={layoutData.layout.legalText} />

        {/* Main layout structure */}
        <div className="flex flex-col min-h-[calc(100vh-35px)]">
          {/* Header Component */}
          <Header
            logo={layoutData.layout.Logo}
            mainNavigation={layoutData.navigation.mainNavigation}
            subNavigation={layoutData.navigation.subNavigation}
            translations={layoutData.translations}
          />

          {/* Main content */}
          <main className="flex-1">{children}</main>

          {/* Temporary footer placeholder */}
          <footer className="bg-footer-bkg text-footer-text mt-auto">
            <div className="container mx-auto p-4">
              <p className="text-sm">
                Footer Images: {layoutData.layout.footerImages.length}
              </p>
              <p className="text-xs mt-1">
                Translations loaded:{" "}
                {Object.keys(layoutData.translations).length}
              </p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
