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
 * Renders favicon meta tags for a specific site.
 * Useful for pages that need to override the default favicon
 * or for client-side favicon updates.
 */
export function FaviconMeta({
  siteId,
  siteName,
  themeColor = "#000000",
}: FaviconMetaProps) {
  const currentSiteId = siteId || process.env.NEXT_PUBLIC_SITE_ID || "default";
  const currentSiteName =
    siteName || process.env.NEXT_PUBLIC_SITE_NAME || "Casino Games";

  return (
    <>
      {/* Primary favicon */}
      <link
        rel="icon"
        type="image/png"
        sizes="32x32"
        href={getFaviconPath(currentSiteId, "favicon-32x32.png")}
      />
      <link
        rel="icon"
        type="image/png"
        sizes="16x16"
        href={getFaviconPath(currentSiteId, "favicon.png")}
      />

      {/* Apple Touch Icon */}
      <link
        rel="apple-touch-icon"
        sizes="180x180"
        href={getFaviconPath(currentSiteId, "apple-touch-icon.png")}
      />

      {/* Safari Pinned Tab */}
      <link
        rel="mask-icon"
        href={getFaviconPath(currentSiteId, "safari-pinned-tab.svg")}
        color={themeColor}
      />

      {/* Web App Manifest */}
      <link
        rel="manifest"
        href={getFaviconPath(currentSiteId, "site.webmanifest")}
      />

      {/* Browser Configuration */}
      <meta name="msapplication-TileColor" content={themeColor} />
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
 * Useful for scenarios where the favicon needs to change based on user interaction
 */
export function useDynamicFavicon() {
  const updateFavicon = (siteId: string) => {
    if (typeof window === "undefined") return;

    // Update the main favicon
    const faviconLink = document.querySelector(
      "link[rel='icon']"
    ) as HTMLLinkElement;
    if (faviconLink) {
      faviconLink.href = getFaviconPath(siteId, "favicon-32x32.png");
    }

    // Update apple touch icon
    const appleTouchIcon = document.querySelector(
      "link[rel='apple-touch-icon']"
    ) as HTMLLinkElement;
    if (appleTouchIcon) {
      appleTouchIcon.href = getFaviconPath(siteId, "apple-touch-icon.png");
    }

    // Update shortcut icon for older browsers
    const shortcutIcon = document.querySelector(
      "link[rel='shortcut icon']"
    ) as HTMLLinkElement;
    if (shortcutIcon) {
      shortcutIcon.href = getFaviconPath(siteId, "favicon.ico");
    }
  };

  const resetFavicon = () => {
    const defaultSiteId = process.env.NEXT_PUBLIC_SITE_ID || "default";
    updateFavicon(defaultSiteId);
  };

  return { updateFavicon, resetFavicon };
}
