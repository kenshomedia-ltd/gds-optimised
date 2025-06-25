// src/components/providers/ClientProviders.tsx
"use client";

import { FavoritesProvider } from "@/contexts/FavoritesContext";

interface ClientProvidersProps {
  children: React.ReactNode;
}

/**
 * ClientProviders Component
 *
 * Wraps the app with all client-side context providers
 * Currently includes:
 * - FavoritesProvider for managing favorite games
 */
export function ClientProviders({ children }: ClientProvidersProps) {
  return <FavoritesProvider>{children}</FavoritesProvider>;
}
