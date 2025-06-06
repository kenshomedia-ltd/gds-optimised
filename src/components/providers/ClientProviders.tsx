// src/components/providers/ClientProviders.tsx
"use client";

import { FavoritesProvider } from "@/contexts/FavoritesContext";
import type { UserFavoriteGame } from "@/types/favorite.types";

interface ClientProvidersProps {
  children: React.ReactNode;
  userFavorites?: UserFavoriteGame[];
  isAuthenticated?: boolean;
}

export function ClientProviders({
  children,
  userFavorites = [],
  isAuthenticated = false,
}: ClientProvidersProps) {
  return (
    <FavoritesProvider
      initialUserFavorites={userFavorites}
      isAuthenticated={isAuthenticated}
    >
      {children}
    </FavoritesProvider>
  );
}
