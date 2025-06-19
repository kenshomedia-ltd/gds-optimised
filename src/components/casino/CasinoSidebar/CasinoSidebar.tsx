// src/components/casino/CasinoSidebar/CasinoSidebar.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { CasinoSidebarStack } from "../CasinoSidebarStack/CasinoSidebarStack";
import type { CasinoSidebarProps } from "@/types/sidebar.types";
import { cn } from "@/lib/utils/cn";

/**
 * CasinoSidebar Component
 *
 * Features:
 * - Three sections: Most Loved, No Deposit, Free Spins
 * - Sticky positioning within container bounds (desktop only)
 * - Stops before footer
 * - Responsive behavior - no sticky on mobile
 */
export function CasinoSidebar({
  casinos,
  translations = {},
  className,
}: CasinoSidebarProps) {
  const [stickyStyles, setStickyStyles] = useState<React.CSSProperties>({});
  const sidebarRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    // Check if we're on mobile/tablet (lg breakpoint is 1024px)
    const checkIfMobile = () => window.innerWidth < 1024;

    // If mobile, don't apply any sticky behavior
    if (checkIfMobile()) {
      setStickyStyles({});
      return;
    }

    // Find the main container
    containerRef.current = sidebarRef.current?.closest(".main") as HTMLElement;

    const handleScroll = () => {
      // Double-check we're not on mobile
      if (checkIfMobile()) {
        setStickyStyles({});
        return;
      }

      if (!sidebarRef.current || !containerRef.current) return;

      const sidebar = sidebarRef.current;
      const container = containerRef.current;

      const sidebarRect = sidebar.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();

      const topOffset = 80; // Header height
      const bottomPadding = 20; // Extra padding from bottom

      // Calculate the maximum translation when sidebar hits container bottom
      const maxTranslateY =
        containerRect.bottom - sidebarRect.height - topOffset - bottomPadding;

      if (containerRect.top <= topOffset) {
        // Container has scrolled past header
        if (
          sidebarRect.height + topOffset + bottomPadding >=
          containerRect.bottom
        ) {
          // Sidebar would extend past container bottom
          setStickyStyles({
            position: "fixed",
            top: `${maxTranslateY}px`,
            width: `${sidebar.offsetWidth}px`,
          });
        } else {
          // Normal sticky behavior
          setStickyStyles({
            position: "fixed",
            top: `${topOffset}px`,
            width: `${sidebar.offsetWidth}px`,
          });
        }
      } else {
        // Container hasn't reached sticky point
        setStickyStyles({});
      }
    };

    const handleResize = () => {
      // If window is resized to mobile, remove sticky styles
      if (checkIfMobile()) {
        setStickyStyles({});
      } else {
        handleScroll();
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleResize, { passive: true });
    handleScroll(); // Initial check

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const hasCasinos =
    (casinos.most_loved_casinos && casinos.most_loved_casinos.length > 0) ||
    (casinos.no_deposit_casinos && casinos.no_deposit_casinos.length > 0) ||
    (casinos.free_spin_casinos && casinos.free_spin_casinos.length > 0);

  if (!hasCasinos) {
    return null;
  }

  return (
    <div
      ref={sidebarRef}
      className={cn("w-full space-y-6", className)}
      style={stickyStyles}
    >
      {/* Most Loved Casinos */}
      {casinos.most_loved_casinos && casinos.most_loved_casinos.length > 0 && (
        <CasinoSidebarStack
          title={translations.mostLovedCasinos || "Casino Più Amati"}
          casinos={casinos.most_loved_casinos}
          bonusType="regular"
          translations={translations}
        />
      )}

      {/* No Deposit Casinos */}
      {casinos.no_deposit_casinos && casinos.no_deposit_casinos.length > 0 && (
        <CasinoSidebarStack
          title={translations.noDepositCasinos || "Casino Senza Deposito"}
          casinos={casinos.no_deposit_casinos}
          bonusType="noDeposit"
          translations={translations}
        />
      )}

      {/* Free Spin Casinos */}
      {casinos.free_spin_casinos && casinos.free_spin_casinos.length > 0 && (
        <CasinoSidebarStack
          title={translations.freeSpinCasinos || "Casino Con Bonus Free Spin"}
          casinos={casinos.free_spin_casinos}
          bonusType="freeSpins"
          translations={translations}
        />
      )}
    </div>
  );
}
