// src/types/footer.types.ts

import type { NavigationItem, FooterImageItem } from "./strapi.types";

/**
 * Footer component props
 */
export interface FooterProps {
  footerContent: string;
  footerImages: FooterImageItem[];
  footerNavigation: NavigationItem[];
  footerNavigations: NavigationItem[];
  translations: Record<string, string>;
  className?: string;
}

/**
 * Footer section props for sub-components
 */
export interface FooterSectionProps {
  navigations: NavigationItem[];
  className?: string;
}

/**
 * Footer links props
 */
export interface FooterLinksProps {
  navigation: NavigationItem[];
  className?: string;
}

/**
 * Footer images props
 */
export interface FooterImagesProps {
  images: FooterImageItem[];
  className?: string;
}

/**
 * Footer bottom bar props
 */
export interface FooterBottomProps {
  footerNavigation: NavigationItem[];
  copyright: string;
  siteUrl: string;
  className?: string;
}
