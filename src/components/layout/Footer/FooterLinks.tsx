// src/components/layout/Footer/FooterLinks.tsx
import Link from "next/link";
import type { NavigationItem } from "@/types/strapi.types";

interface FooterLinksProps {
  navigation: NavigationItem;
  className?: string;
}

/**
 * Footer Links Section Component
 *
 * Features:
 * - Renders a section of footer links with title
 * - Handles submenu items
 * - Optimized with proper link prefetching
 * - Accessible navigation structure
 */
export function FooterLinks({ navigation, className = "" }: FooterLinksProps) {
  const hasSubMenu = navigation.subMenu && navigation.subMenu.length > 0;

  return (
    <div className={className}>
      <h3 className="underline mb-3 uppercase font-semibold block text-sm text-footer-quicklink-text">
        {navigation.title}
      </h3>

      {hasSubMenu && (
        <nav aria-label={`${navigation.title} navigation`}>
          <ul className="space-y-1">
            {navigation.subMenu!.map((child) => (
              <li key={child.id}>
                <Link
                  href={`${child.url}/`}
                  className="text-sm text-footer-quicklink-text hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 rounded px-1 -ml-1"
                  prefetch={false}
                >
                  {child.title}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </div>
  );
}
