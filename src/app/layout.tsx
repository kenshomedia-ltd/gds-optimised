// src/app/layout.tsx
import type { Metadata, Viewport } from "next";
import { Lato, Roboto } from "next/font/google";
import { getLayoutData } from "@/lib/strapi/data-loader";
import { LegalServer } from "@/components/layout/Legal";
import DynamicTheme from "@/components/layout/DynamicTheme/DynamicTheme";
import { Header } from "@/components/layout/Header";
import { FooterServer } from "@/components/layout/Footer";
import { ClientProviders } from "@/components/providers/ClientProviders";
import { BackToTop } from "@/components/common/BackToTop/BackToTop";
import { Toaster } from "sonner";

import "./globals.css";
import { cn } from "@/lib/utils/cn";

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
        {/* RENDER THE THEME COMPONENT */}
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

      <body
        className={cn(
          "min-h-screen bg-body-bg text-body-text antialiased font-body",
          roboto.className
        )}
        suppressHydrationWarning={true}
      >
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
            <main className="flex-1">{children}</main>

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
      </body>
    </html>
  );
}
