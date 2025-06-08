// src/components/features/index.ts

// Search components
export { SearchBar } from "./Search/SearchBar";
export type { SearchBarProps, SearchResult } from "@/types/search.types";

// Favorites components
export { FavoritesProvider, useFavorites } from "@/contexts/FavoritesContext";
export { FavoriteButton } from "./Favorites/FavoriteButton";

// Add other feature components as they are created:
// export { Favorites } from "./Favorites";
// export { Rating } from "./Rating";
// export { Share } from "./Share";
