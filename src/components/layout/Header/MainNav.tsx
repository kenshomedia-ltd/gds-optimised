// src/components/layout/Header/MainNav.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown } from "@awesome.me/kit-0e07a43543/icons/duotone/light";
import type { NavigationItem } from "@/types/strapi.types";

interface MainNavProps {
  navigation: NavigationItem[];
  translations: Record<string, string>;
}

/**
 * Desktop Main Navigation Component
 *
 * Features:
 * - Hover dropdown menus
 * - Keyboard navigation support
 * - Smooth animations
 * - Accessibility compliant
 */
export function MainNav({ navigation, translations }: MainNavProps) {
  const [activeDropdown, setActiveDropdown] = useState<number | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const navRef = useRef<HTMLDivElement>(null);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setActiveDropdown(null);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Handle mouse enter with delay
  const handleMouseEnter = (index: number) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setActiveDropdown(index);
  };

  // Handle mouse leave with delay
  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setActiveDropdown(null);
    }, 100);
  };

  return (
    <div className="flex items-center space-x-1" ref={navRef}>
      {navigation.map((item, index) => {
        const hasSubmenu = item.subMenu && item.subMenu.length > 0;
        const isActive = activeDropdown === index;

        return (
          <div
            key={item.id}
            className="relative"
            onMouseEnter={() => hasSubmenu && handleMouseEnter(index)}
            onMouseLeave={handleMouseLeave}
          >
            {/* Main Navigation Item */}
            {item.url ? (
              <Link
                href={item.url}
                className={`
                  inline-flex items-center px-4 py-2 text-sm font-medium text-navbar-text
                  transition-colors duration-200 hover:bg-nav-hover-bkg hover:text-white
                  focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75
                  ${isActive ? "bg-nav-hover-bkg text-white" : ""}
                `}
              >
                {item.title}
                {hasSubmenu && (
                  <FontAwesomeIcon
                    icon={faChevronDown}
                    className={`
                      ml-1 h-4 w-4 transition-transform duration-200
                      ${isActive ? "rotate-180" : ""}
                    `}
                    aria-hidden="true"
                  />
                )}
              </Link>
            ) : (
              <button
                type="button"
                className={`
                  inline-flex items-center px-4 py-2 text-sm font-medium text-navbar-text
                  transition-colors duration-200 hover:bg-nav-hover-bkg hover:text-white
                  focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75
                  ${isActive ? "bg-nav-hover-bkg text-white" : ""}
                `}
                aria-expanded={isActive}
                aria-haspopup="true"
              >
                {item.title}
                {hasSubmenu && (
                  <FontAwesomeIcon
                    icon={faChevronDown}
                    className={`
                      ml-1 h-4 w-4 transition-transform duration-200
                      ${isActive ? "rotate-180" : ""}
                    `}
                    aria-hidden="true"
                  />
                )}
              </button>
            )}

            {/* Dropdown Menu */}
            {hasSubmenu && (
              <div
                className={`
                  absolute left-0 top-full z-50 mt-0 w-56 origin-top-left
                  transition-all duration-200 ease-out
                  ${
                    isActive
                      ? "visible scale-100 opacity-100"
                      : "invisible scale-95 opacity-0"
                  }
                `}
              >
                <div className="overflow-hidden rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5">
                  <div className="py-1">
                    {item.subMenu!.map((subItem) => (
                      <Link
                        key={subItem.id}
                        href={subItem.url || "#"}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-primary hover:text-white transition-colors duration-150"
                      >
                        {subItem.title}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
