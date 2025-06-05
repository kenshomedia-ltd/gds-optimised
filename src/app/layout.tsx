// src/app/layout.tsx
import type { Metadata, Viewport } from "next";
import { Lato, Roboto } from "next/font/google";
import { getLayoutData } from "@/lib/strapi/data-loader";
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

  // Log the data received from API
  console.log("=== LAYOUT DATA FROM API ===");
  console.log("Layout:", JSON.stringify(layoutData.layout, null, 2));
  console.log("Navigation:", JSON.stringify(layoutData.navigation, null, 2));
  console.log(
    "Translations:",
    JSON.stringify(layoutData.translations, null, 2)
  );
  console.log("=== END LAYOUT DATA ===");

  return (
    <html lang="en" className={`${lato.variable} ${roboto.variable}`}>
      <head>
        {/* Preconnect to critical third-party origins */}
        <link rel="preconnect" href={process.env.NEXT_PUBLIC_API_URL || ""} />
        <link rel="dns-prefetch" href={process.env.NEXT_PUBLIC_API_URL || ""} />
      </head>

      <body className="min-h-screen bg-white text-gray-900 antialiased font-body">
        {/* Basic layout structure */}
        <div className="flex flex-col min-h-screen">
          {/* Temporary header placeholder */}
          <header className="bg-gray-100 p-4 border-b">
            <div className="container mx-auto">
              <h1 className="text-2xl font-heading font-bold">Site Header</h1>
              <p className="text-sm mt-1">
                Navigation items: {layoutData.navigation.mainNavigation.length}
              </p>
              <p className="text-sm">Logo URL: {layoutData.layout.Logo.url}</p>
            </div>
          </header>

          {/* Main content */}
          <main className="flex-1 container mx-auto py-8 px-4">{children}</main>

          {/* Temporary footer placeholder */}
          <footer className="bg-gray-100 p-4 border-t mt-auto">
            <div className="container mx-auto">
              <p className="text-sm">
                Footer Images: {layoutData.layout.footerImages.length}
              </p>
              <p className="text-xs mt-1">
                Translations loaded:{" "}
                {Object.keys(layoutData.translations).length}
              </p>
              <p className="text-xs mt-1">{layoutData.layout.legalText}</p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
