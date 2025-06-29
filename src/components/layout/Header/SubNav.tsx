// src/components/layout/Header/SubNav.tsx
"use client";

import Link from "next/link";
import { Image } from "@/components/common/Image";
import type { NavigationItem } from "@/types/strapi.types";

interface SubNavProps {
  navigation: NavigationItem[];
}

/**
 * Sub Navigation Component
 *
 * Features:
 * - Mobile only sub-navigation bar (correctly using lg:hidden)
 * - Fixed icon sizing issues - icons now properly constrained
 * - Proper responsive layout with scrolling for overflow
 * - Smooth hover effects
 * - Optimized image loading
 * - CENTER ALIGNED navigation items (FIXED)
 */
export function SubNav({ navigation }: SubNavProps) {
  return (
    <nav
      className="flex lg:hidden h-9 items-center bg-subnavbar-bkg overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
      aria-label="Secondary navigation"
    >
      {/* 
        FIXED: Added justify-center to center-align the navigation items.
        The flex container now centers its content horizontally.
        For cases where content overflows, it will still scroll properly.
      */}
      <div className="flex items-center justify-center space-x-1 px-2 min-w-full w-max">
        {navigation.map((item) => (
          <Link
            key={item.id}
            href={item.url || "#"}
            className="group inline-flex items-center gap-1.5 rounded-md bg-transparent px-2 py-1 text-xs font-medium uppercase text-navbar-text transition-colors duration-200 hover:bg-nav-hover-bkg focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 whitespace-nowrap"
          >
            {item.images && (
              <div className="relative w-3 h-3 flex-shrink-0">
                <Image
                  src={item.images.url}
                  alt={`${item.title} icon`}
                  width={12}
                  height={12}
                  className="w-3 h-3 object-contain"
                  unoptimized={item.images.url.endsWith(".svg")}
                  loading="lazy"
                />
              </div>
            )}
            <span className="text-[10px] leading-tight">{item.title}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
