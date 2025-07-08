// src/components/providers/ClientProviders.tsx
"use client";

import { FavoritesProvider } from "@/contexts/FavoritesContext";
import { UserProvider } from "@/contexts/UserContext";

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
  return (
    <UserProvider>
      <FavoritesProvider>{children}</FavoritesProvider>
    </UserProvider>
  );
}
