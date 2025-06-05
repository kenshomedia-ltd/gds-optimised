// src/types/header.types.ts

import type {
  NavigationItem,
  StrapiImage,
  TranslationData,
} from "./strapi.types";

/**
 * User authentication state
 */
export interface UserState {
  isAuthenticated: boolean;
  id?: string;
  email?: string;
  username?: string;
  avatar?: string;
}

/**
 * Header component props
 */
export interface HeaderProps {
  logo: StrapiImage;
  mainNavigation: NavigationItem[];
  subNavigation: NavigationItem[];
  translations: TranslationData;
  user?: UserState;
}

/**
 * Mobile menu component props
 */
export interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  mainNavigation: NavigationItem[];
  subNavigation: NavigationItem[];
  translations: TranslationData;
}

/**
 * Main navigation component props
 */
export interface MainNavProps {
  navigation: NavigationItem[];
  translations: TranslationData;
}

/**
 * Sub navigation component props
 */
export interface SubNavProps {
  navigation: NavigationItem[];
  translations: TranslationData;
}
