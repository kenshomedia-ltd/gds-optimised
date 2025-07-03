// src/components/layout/Header/Header.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHeart,
  faUser,
  faBars,
} from "@awesome.me/kit-0e07a43543/icons/duotone/light";
import { faHeart as faHeartSolid } from "@awesome.me/kit-0e07a43543/icons/duotone/solid";
import { Image } from "@/components/common/Image";
import { SearchBar } from "@/components/features/Search/SearchBar";
import { FavoritesDrawer } from "@/components/features/Favorites/FavoritesDrawer";
import { useFavorites } from "@/contexts/FavoritesContext";
import { MainNav } from "./MainNav";
import { MobileMenu } from "./MobileMenu";
import type { HeaderProps } from "@/types/header.types";
import { cn } from "@/lib/utils/cn";
import { SubNav } from "./SubNav";

/**
 * Main Header Component
 *
 * Features:
 * - Sticky header with scroll detection
 * - Responsive navigation with search, favorites, and user account
 * - Favorites drawer with red heart indicator when items are favorited
 * - Mobile-first approach with improved mobile layout
 * - Accessibility compliant
 * - Performance optimized with React hooks
 */
export function Header({
  logo,
  mainNavigation,
  subNavigation,
  translations,
  user,
}: HeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isFavoritesOpen, setIsFavoritesOpen] = useState(false);
  // REMOVED: isSearchExpanded state is no longer needed
  const { favoritesCount } = useFavorites();

  const siteName = process.env.NEXT_PUBLIC_SITE_NAME || "GiochiDiSlots";
  const siteId = process.env.NEXT_PUBLIC_SITE_ID || "gds";

  // Handle scroll for sticky header
  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY > 0;
      if (scrolled !== isScrolled) {
        setIsScrolled(scrolled);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isScrolled]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobileMenuOpen]);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const toggleFavorites = () => {
    setIsFavoritesOpen(!isFavoritesOpen);
  };

  // REMOVED: toggleSearch function is no longer needed

  return (
    <>
      {/* Main Header */}
      <header
        className={cn(
          "top-0 z-60 w-full bg-navbar-bkg",
          "transition-shadow duration-300",
          isScrolled && "shadow-lg"
        )}
      >
        <nav
          className="mx-auto flex h-16 items-center justify-between px-4 py-2 xl:container"
          aria-label="Main navigation"
        >
          {/* Mobile Layout (lg and below) */}
          <div className="flex items-center justify-between w-full lg:hidden">
            {/* Left side - Mobile Menu + Auth */}
            <div className="flex items-center gap-2">
              {/* Mobile Menu Button */}
              <button
                type="button"
                onClick={toggleMobileMenu}
                className="p-2 rounded-md text-navbar-text hover:bg-white/10 transition-colors"
                aria-expanded={isMobileMenuOpen}
                aria-label={translations.menu || "Open menu"}
              >
                <FontAwesomeIcon icon={faBars} className="!h-6 !w-6" />
              </button>

              {/* Authentication Button - Mobile */}
              <Link
                href={user?.isAuthenticated ? "/account" : "/login"}
                className="p-2 rounded-md text-navbar-text hover:bg-white/10 transition-colors"
                aria-label={
                  user?.isAuthenticated
                    ? translations.account || "My Account"
                    : translations.login || "Login"
                }
              >
                <FontAwesomeIcon
                  icon={faUser}
                  className="!h-6 !w-6"
                  style={{ "--fa-secondary-opacity": 0 }}
                />
              </Link>
            </div>

            {/* Center - Logo */}
            <div className="absolute left-1/2 -translate-x-1/2">
              <Link
                href="/"
                className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75"
                onClick={closeMobileMenu}
                aria-label={`${siteName} Home`}
              >
                <span className="sr-only">{siteName}</span>
                {logo ? (
                  <Image
                    src={logo.url}
                    alt={`${siteName} Logo`}
                    width={122}
                    height={50}
                    className={
                      siteId === "csi"
                        ? "w-[130px] md:w-auto h-[50px] object-contain"
                        : "h-[50px] w-auto"
                    }
                    priority
                    quality={90}
                    unoptimized={logo.url.endsWith(".svg")}
                  />
                ) : (
                  <div className="h-[50px] flex items-center text-navbar-text font-bold text-xl">
                    {siteName}
                  </div>
                )}
              </Link>
            </div>

            {/* Right side - Favorites + Search */}
            <div className="flex items-center gap-2">
              {/* Favorites Button - Mobile */}
              <button
                type="button"
                className={cn(
                  "relative p-2 rounded-md transition-colors",
                  "hover:bg-white/10",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
                )}
                onClick={toggleFavorites}
                aria-label={translations.favorite || "Favorites"}
                data-favorites-trigger
              >
                <FontAwesomeIcon
                  icon={favoritesCount > 0 ? faHeartSolid : faHeart}
                  className={cn(
                    "!h-6 !w-6 transition-colors",
                    favoritesCount > 0 ? "text-danger" : "text-navbar-text"
                  )}
                  swapOpacity
                />
                {/* Favorites count badge */}
                {favoritesCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-danger text-white text-[10px] font-bold flex items-center justify-center">
                    {favoritesCount > 9 ? "9+" : favoritesCount}
                  </span>
                )}
              </button>

              {/* MODIFIED: Search Bar now directly in the mobile header */}
              <SearchBar
                position="header"
                className="w-8 h-8"
                placeholder={
                  translations.searchPlaceholder || "Search games..."
                }
              />
            </div>
          </div>

          {/* Desktop Layout (lg and above) */}
          <div className="hidden lg:flex lg:items-center lg:justify-between lg:w-full">
            {/* Desktop Logo */}
            <div className="flex lg:flex-1">
              <Link
                href="/"
                className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75"
                onClick={closeMobileMenu}
                aria-label={`${siteName} Home`}
              >
                <span className="sr-only">{siteName}</span>
                {logo ? (
                  <Image
                    src={logo.url}
                    alt={`${siteName} Logo`}
                    width={122}
                    height={50}
                    className={
                      siteId === "csi"
                        ? "w-[130px] md:w-auto h-[50px] object-contain"
                        : "h-[50px] w-auto"
                    }
                    priority
                    quality={90}
                    unoptimized={logo.url.endsWith(".svg")}
                  />
                ) : (
                  <div className="h-[50px] flex items-center text-navbar-text font-bold text-xl">
                    {siteName}
                  </div>
                )}
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex lg:flex-1">
              <MainNav
                navigation={mainNavigation}
                translations={translations}
              />
            </div>

            {/* Desktop User Actions - Reordered: Favorites, Auth, Search */}
            <div className="flex items-center gap-2">
              {/* Favorites Button - Desktop (First) */}
              <button
                type="button"
                className={cn(
                  "relative p-2 rounded-md transition-colors",
                  "hover:bg-white/10",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
                )}
                onClick={toggleFavorites}
                aria-label={translations.favorite || "Favorites"}
                data-favorites-trigger
              >
                <FontAwesomeIcon
                  icon={favoritesCount > 0 ? faHeartSolid : faHeart}
                  className={cn(
                    "h-5 w-5 transition-colors",
                    favoritesCount > 0 ? "text-danger" : "text-navbar-text"
                  )}
                  swapOpacity
                />
                {/* Favorites count badge */}
                {favoritesCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-danger text-white text-[10px] font-bold flex items-center justify-center">
                    {favoritesCount > 9 ? "9+" : favoritesCount}
                  </span>
                )}
              </button>

              {/* User Account - Desktop (Second) */}
              <Link
                href={user?.isAuthenticated ? "/account" : "/login"}
                className="p-2 rounded-md text-navbar-text hover:bg-white/10 transition-colors"
                aria-label={
                  user?.isAuthenticated
                    ? translations.account || "My Account"
                    : translations.login || "Login"
                }
              >
                <FontAwesomeIcon icon={faUser} className="h-5 w-5" />
              </Link>

              {/* Search Bar - Desktop (Last) */}
              <SearchBar
                position="header"
                className="w-5 h-5"
                placeholder={
                  translations.searchPlaceholder || "Search games..."
                }
              />
            </div>
          </div>
        </nav>

        {/* Sub Navigation - Mobile only */}
        {subNavigation.length > 0 && <SubNav navigation={subNavigation} />}
      </header>

      {/* Mobile Menu */}
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={closeMobileMenu}
        mainNavigation={mainNavigation}
        subNavigation={subNavigation}
        translations={translations}
      />

      {/* Favorites Drawer */}
      <FavoritesDrawer
        isOpen={isFavoritesOpen}
        onClose={() => setIsFavoritesOpen(false)}
        translations={{
          favouritesTitle: translations.favouritesTitle,
          noFavourites: translations.noFavourites,
          noFavouritesDesc: translations.noFavouritesDesc,
          viewAll: translations.viewAll,
          numberInFavs: translations.numberInFavs,
        }}
      />
    </>
  );
}
