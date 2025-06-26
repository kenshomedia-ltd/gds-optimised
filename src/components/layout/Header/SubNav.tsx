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
 * - Desktop only sub-navigation bar
 * - Icon support for navigation items
 * - Smooth hover effects
 * - Optimized image loading
 */
export function SubNav({ navigation }: SubNavProps) {
  return (
    <nav
      className="flex lg:hidden h-9 items-center justify-center bg-subnavbar-bkg"
      aria-label="Secondary navigation"
    >
      <div className="flex items-center space-x-1">
        {navigation.map((item) => (
          <Link
            key={item.id}
            href={item.url || "#"}
            className="group inline-flex items-center gap-2 rounded-md bg-transparent px-3 py-1.5 text-xs font-medium uppercase text-navbar-text transition-colors duration-200 hover:bg-nav-hover-bkg focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75"
          >
            {item.images && (
              <div className="relative h-4 w-4 transition-transform duration-200 group-hover:scale-110">
                <Image
                  src={item.images.url}
                  alt={`${item.title} icon`}
                  width={item.images.width}
                  height={item.images.height}
                  className="h-4 w-auto"
                  unoptimized={item.images.url.endsWith(".svg")}
                />
              </div>
            )}
            <span>{item.title}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
