// src/components/common/FaviconMeta/FaviconMeta.tsx
import { getFaviconPath } from "@/lib/utils/favicon";

interface FaviconMetaProps {
  siteId?: string;
  siteName?: string;
  themeColor?: string;
}

/**
 * FaviconMeta Component
 *
 * Updated to work with your favicon format: /favicon/favicon-{siteId}.png
 * Renders favicon meta tags for a specific site.
 */
export function FaviconMeta({
  siteId,
  siteName,
  themeColor = "#000000",
}: FaviconMetaProps) {
  const currentSiteId = siteId || process.env.NEXT_PUBLIC_SITE_ID || "default";
  const currentSiteName =
    siteName || process.env.NEXT_PUBLIC_SITE_NAME || "Casino Games";

  const faviconUrl = getFaviconPath(currentSiteId);

  return (
    <>
      {/* Primary favicon */}
      <link rel="icon" type="image/png" href={faviconUrl} />

      {/* Different sizes - all point to same file, browser will scale */}
      <link rel="icon" type="image/png" sizes="16x16" href={faviconUrl} />
      <link rel="icon" type="image/png" sizes="32x32" href={faviconUrl} />
      <link rel="icon" type="image/png" sizes="192x192" href={faviconUrl} />

      {/* Apple Touch Icon - use same favicon */}
      <link rel="apple-touch-icon" href={faviconUrl} />
      <link rel="apple-touch-icon" sizes="180x180" href={faviconUrl} />

      {/* Shortcut icon for older browsers */}
      <link rel="shortcut icon" href={faviconUrl} type="image/png" />

      {/* Web App Manifest - you may want to create these files */}
      <link
        rel="manifest"
        href={`/favicon/site-${currentSiteId}.webmanifest`}
      />

      {/* Browser Configuration */}
      <meta name="msapplication-TileColor" content={themeColor} />
      <meta name="msapplication-TileImage" content={faviconUrl} />
      <meta name="theme-color" content={themeColor} />

      {/* Additional Apple meta tags */}
      <meta name="apple-mobile-web-app-title" content={currentSiteName} />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
    </>
  );
}

/**
 * Hook for dynamically updating favicons on the client side
 * Updated to work with your favicon format
 */
export function useDynamicFavicon() {
  const updateFavicon = (siteId: string) => {
    if (typeof window === "undefined") return;

    const faviconUrl = getFaviconPath(siteId);

    // Update all favicon links
    const faviconLinks = document.querySelectorAll(
      "link[rel='icon'], link[rel='shortcut icon'], link[rel='apple-touch-icon']"
    );

    faviconLinks.forEach((link) => {
      (link as HTMLLinkElement).href = faviconUrl;
    });

    // Update page title to reflect the change (optional)
    console.log(`Updated favicon to: ${faviconUrl}`);
  };

  const resetFavicon = () => {
    const defaultSiteId = process.env.NEXT_PUBLIC_SITE_ID || "default";
    updateFavicon(defaultSiteId);
  };

  return { updateFavicon, resetFavicon };
}
