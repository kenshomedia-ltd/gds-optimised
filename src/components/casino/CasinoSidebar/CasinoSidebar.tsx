// src/components/casino/CasinoSidebar/CasinoSidebar.tsx
// Server component - no "use client" directive

import { CasinoSidebarStack } from "../CasinoSidebarStack/CasinoSidebarStack";
import type { CasinoSidebarProps } from "@/types/sidebar.types";
import { cn } from "@/lib/utils/cn";

/**
 * CasinoSidebar Component
 *
 * Features:
 * - Three sections: Most Loved, No Deposit, Free Spins
 * - CSS-only sticky positioning (no JavaScript required)
 * - Responsive behavior - no sticky on mobile
 * - Server-side rendered for better performance
 */
export function CasinoSidebar({
  casinos,
  translations = {},
  className,
}: CasinoSidebarProps) {
  const hasCasinos =
    (casinos.most_loved_casinos && casinos.most_loved_casinos.length > 0) ||
    (casinos.no_deposit_casinos && casinos.no_deposit_casinos.length > 0) ||
    (casinos.free_spin_casinos && casinos.free_spin_casinos.length > 0);

  if (!hasCasinos) {
    return null;
  }

  return (
    <aside
      className={cn(
        "w-full space-y-6",
        // CSS-only sticky positioning
        "lg:sticky lg:top-20", // Only sticky on desktop (lg and up)
        "lg:max-h-[calc(100vh-6rem)]", // Constrain height on desktop
        "lg:overflow-y-auto", // Allow scrolling if content is too long
        // Hide scrollbar for cleaner look
        "[&::-webkit-scrollbar]:w-2",
        "[&::-webkit-scrollbar-track]:bg-gray-100",
        "[&::-webkit-scrollbar-thumb]:bg-gray-300",
        "[&::-webkit-scrollbar-thumb]:rounded-full",
        className
      )}
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
    </aside>
  );
}
