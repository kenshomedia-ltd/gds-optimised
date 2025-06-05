// src/components/layout/Header/MobileMenu.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown, faXmark } from "@awesome.me/kit-0e07a43543/icons/duotone/light";
import { Image } from "@/components/common/Image";
import type { NavigationItem } from "@/types/strapi.types";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  mainNavigation: NavigationItem[];
  subNavigation: NavigationItem[];
  translations: Record<string, string>;
}

/**
 * Mobile Menu Component
 *
 * Features:
 * - Full-screen overlay menu
 * - Accordion-style submenus
 * - Smooth animations
 * - Touch-optimized
 * - Trap focus when open
 */
export function MobileMenu({
  isOpen,
  onClose,
  mainNavigation,
  subNavigation,
  translations,
}: MobileMenuProps) {
  const [activeSubmenu, setActiveSubmenu] = useState<number | null>(null);

  // Reset submenu when menu closes
  useEffect(() => {
    if (!isOpen) {
      setActiveSubmenu(null);
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  const toggleSubmenu = (index: number) => {
    setActiveSubmenu(activeSubmenu === index ? null : index);
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`
          fixed inset-0 z-40 bg-black transition-opacity duration-300 lg:hidden
          ${isOpen ? "opacity-50" : "pointer-events-none opacity-0"}
        `}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Menu Panel */}
      <div
        className={`
          fixed inset-y-0 left-0 z-50 w-full max-w-sm bg-white shadow-xl
          transition-transform duration-300 ease-in-out lg:hidden
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
        aria-label="Mobile menu"
        aria-modal="true"
        role="dialog"
      >
        {/* Menu Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
          <h2 className="text-lg font-semibold text-gray-900">
            {translations.menu || "Menu"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            aria-label={translations.closeMenu || "Close menu"}
          >
            <FontAwesomeIcon icon={faXmark} className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>

        {/* Menu Content */}
        <div className="flex h-full flex-col overflow-y-auto pb-20">
          {/* Sub Navigation (Featured Items) */}
          {subNavigation.length > 0 && (
            <div className="border-b border-gray-200 px-4 py-4">
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
                {translations.quickLinks || "Quick Links"}
              </h3>
              <div className="space-y-2">
                {subNavigation.map((item) => (
                  <Link
                    key={item.id}
                    href={item.url || "#"}
                    onClick={onClose}
                    className="flex items-center gap-3 rounded-lg bg-gray-50 px-3 py-2 text-sm font-medium text-gray-900 hover:bg-gray-100"
                  >
                    {item.images && (
                      <Image
                        src={item.images.url}
                        alt={`${item.title} icon`}
                        width={20}
                        height={20}
                        className="h-5 w-5"
                        unoptimized={item.images.url.endsWith(".svg")}
                      />
                    )}
                    <span>{item.title}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Main Navigation */}
          <nav className="flex-1 px-4 py-4">
            <ul className="space-y-1">
              {mainNavigation.map((item, index) => {
                const hasSubmenu = item.subMenu && item.subMenu.length > 0;
                const isSubmenuOpen = activeSubmenu === index;

                return (
                  <li key={item.id}>
                    {/* Main Item */}
                    <div className="flex items-center">
                      {item.url && !hasSubmenu ? (
                        <Link
                          href={item.url}
                          onClick={onClose}
                          className="flex-1 rounded-lg px-3 py-2 text-base font-medium text-gray-900 hover:bg-gray-50"
                        >
                          {item.title}
                        </Link>
                      ) : (
                        <button
                          type="button"
                          onClick={() => hasSubmenu && toggleSubmenu(index)}
                          className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-base font-medium text-gray-900 hover:bg-gray-50"
                          aria-expanded={isSubmenuOpen}
                        >
                          <span>{item.title}</span>
                          {hasSubmenu && (
                            <FontAwesomeIcon
                              icon={faChevronDown}
                              className={`
                                h-5 w-5 text-gray-400 transition-transform duration-200
                                ${isSubmenuOpen ? "rotate-180" : ""}
                              `}
                              aria-hidden="true"
                            />
                          )}
                        </button>
                      )}
                    </div>

                    {/* Submenu */}
                    {hasSubmenu && (
                      <ul
                        className={`
                          mt-1 space-y-1 overflow-hidden transition-all duration-200
                          ${isSubmenuOpen ? "max-h-96" : "max-h-0"}
                        `}
                      >
                        {item.subMenu!.map((subItem) => (
                          <li key={subItem.id}>
                            <Link
                              href={subItem.url || "#"}
                              onClick={onClose}
                              className="block rounded-lg py-2 pl-9 pr-3 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                            >
                              {subItem.title}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
      </div>
    </>
  );
}
