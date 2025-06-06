// src/components/layout/Footer/FooterBottom.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { NavigationItem } from "@/types/strapi.types";

interface FooterBottomProps {
  footerNavigation: NavigationItem[];
  copyright: string;
  siteUrl: string;
  className?: string;
}

/**
 * Footer Bottom Bar Component
 *
 * Features:
 * - Legal links navigation
 * - Dynamic copyright year
 * - Responsive layout with mobile/desktop order
 * - Accessible navigation structure
 */
export function FooterBottom({
  footerNavigation,
  copyright,
  siteUrl,
  className = "",
}: FooterBottomProps) {
  const [currentYear, setCurrentYear] = useState<number>(
    new Date().getFullYear()
  );

  // Update year on client side to avoid hydration mismatch
  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
  }, []);

  return (
    <div className={`md:flex md:items-center md:justify-between ${className}`}>
      {/* Legal Navigation Links */}
      {footerNavigation.length > 0 && (
        <nav
          className="flex flex-wrap justify-center mb-6 md:mb-0 md:justify-end space-x-6 md:order-2"
          aria-label="Legal navigation"
        >
          {footerNavigation.map((nav) => (
            <Link
              key={nav.id}
              href={`${nav.url}/`}
              className="text-right text-sm text-footer-quicklink-text hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 rounded px-1"
              prefetch={false}
            >
              {nav.title}
            </Link>
          ))}
        </nav>
      )}

      {/* Copyright Text */}
      <p className="flex m-0 justify-center text-center md:text-left text-sm text-gray-500 md:order-1">
        <span className="shrink-0">&copy; 2011-{currentYear} </span>
        <span>
          {siteUrl} | {copyright}
        </span>
      </p>
    </div>
  );
}
