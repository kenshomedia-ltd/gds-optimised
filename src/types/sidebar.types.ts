// src/types/sidebar.types.ts

import type { CasinoData } from "./casino.types";

/**
 * Sidebar casino sections structure from layout endpoint
 */
export interface SidebarCasinoSections {
  most_loved_casinos?: CasinoData[];
  no_deposit_casinos?: CasinoData[];
  free_spin_casinos?: CasinoData[];
}

/**
 * Props for casino sidebar component
 */
export interface CasinoSidebarProps {
  casinos: SidebarCasinoSections;
  translations?: Record<string, string>;
  className?: string;
}

/**
 * Props for individual casino sidebar stack
 */
export interface CasinoSidebarStackProps {
  title: string;
  casinos: CasinoData[];
  bonusType: "regular" | "noDeposit" | "freeSpins";
  translations?: Record<string, string>;
}

/**
 * Props for casino sidebar item
 */
export interface CasinoSidebarItemProps {
  casino: CasinoData;
  bonusType: "regular" | "noDeposit" | "freeSpins";
  translations?: Record<string, string>;
}
