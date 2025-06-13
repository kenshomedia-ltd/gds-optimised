// src/components/widgets/NewAndLovedSlotsOptimized.tsx

import React, { Suspense } from "react";
import dynamic from "next/dynamic";
import { unstable_cache } from "next/cache";
import { GameCard } from "@/components/games/GameCard";
import { GameCardSkeleton } from "@/components/games/GameCardSkeleton";
import { strapiClient } from "@/lib/strapi/strapi-client";
import { gamesQs } from "@/lib/strapi/queries/games";
import { redis } from "@/lib/redis";
import type { Game } from "@/types/games";
import type {
  NewAndLovedSlotsProps,
  GamesData,
} from "@/types/widgets/new-and-loved-slots.types";

// Lazy load the GameCard component for better initial load
const LazyGameCard = dynamic(
  () =>
    import("@/components/games/GameCard").then((mod) => ({
      default: mod.GameCard,
    })),
  {
    loading: () => <GameCardSkeleton />,
    ssr: true,
  }
);

// Cache key generators
const getCacheKey = (
  type: "new" | "popular",
  providers: string[],
  categories: string[]
) => {
  return `games:${type}:${providers.join(",")}-${categories.join(",")}`;
};

// Cached fetch function with Redis integration
const fetchGamesWithRedis = async (
  type: "new" | "popular",
  providers: string[],
  categories: string[]
): Promise<Game[]> => {
  const cacheKey = getCacheKey(type, providers, categories);

  try {
    // Try Redis first
    const cached = await redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }
  } catch (error) {
    console.error("Redis error:", error);
  }

  // Prepare query variables based on type
  const variables = {
    limit: 3,
    sort: type === "new" ? "createdAt:desc" : "ratingAvg:desc,ratingCount:desc",
    page: 1,
    providers,
    categories,
  };

  // Fetch from Strapi
  const response = await strapiClient.fetchWithCache(
    "games",
    gamesQs(variables),
    60 // 1 minute cache
  );

  const games = response.data || [];

  // Store in Redis with 1 minute TTL
  try {
    await redis.setex(cacheKey, 60, JSON.stringify(games));
  } catch (error) {
    console.error("Redis set error:", error);
  }

  return games;
};

// Create cached versions of the fetch functions
const getNewGames = unstable_cache(
  async (providers: string[], categories: string[]) =>
    fetchGamesWithRedis("new", providers, categories),
  ["new-games"],
  { revalidate: 60, tags: ["games", "new-games"] }
);

const getPopularGames = unstable_cache(
  async (providers: string[], categories: string[]) =>
    fetchGamesWithRedis("popular", providers, categories),
  ["popular-games"],
  { revalidate: 60, tags: ["games", "popular-games"] }
);

// Games section component for better code organization
const GamesSection = ({
  title,
  games,
  translations,
}: {
  title: string;
  games: Game[];
  translations: any;
}) => {
  if (games.length === 0) return null;

  return (
    <div className="xl:w-1/2">
      <h2 className="text-white mb-4 font-bold text-xl leading-6 mt-0">
        {title}
      </h2>
      <div className="bg-white/[0.36] border border-white/30 shadow-[0px_0px_12px_rgba(63,230,252,0.6)] backdrop-blur-[6px] rounded-xl flex md:grid grid-cols-3 gap-x-2 p-2">
        {games.map((game, index) => (
          <Suspense key={game.id} fallback={<GameCardSkeleton />}>
            {/* Progressive loading: use regular GameCard for first 2, lazy for rest */}
            {index < 2 ? (
              <GameCard
                game={game}
                translations={translations}
                priority={index === 0} // First game gets priority loading
              />
            ) : (
              <LazyGameCard game={game} translations={translations} />
            )}
          </Suspense>
        ))}
      </div>
    </div>
  );
};

export async function NewAndLovedSlotsOptimized({
  blockData,
  translations,
}: NewAndLovedSlotsProps) {
  // Early return if component is disabled
  if (!blockData.newSlots) {
    return null;
  }

  // Extract slugs with null checks
  const providerSlugs =
    blockData.slot_providers?.data?.map(
      (provider) => provider.attributes.slug
    ) || [];

  const categorySlugs =
    blockData.slot_categories?.data?.map(
      (category) => category.attributes.slug
    ) || [];

  // Skip if no providers or categories
  if (providerSlugs.length === 0 && categorySlugs.length === 0) {
    return null;
  }

  // Fetch games data in parallel using cached functions
  const [newGames, popularGames] = await Promise.all([
    getNewGames(providerSlugs, categorySlugs),
    getPopularGames(providerSlugs, categorySlugs),
  ]);

  // Don't render if no games are available
  if (newGames.length === 0 && popularGames.length === 0) {
    return null;
  }

  return (
    <section className="relative z-10" aria-label="New and Popular Slots">
      <div className="relative xl:container px-2 pb-5">
        <div className="hidden pt-[23px] gap-x-5 gap-y-6 flex-col md:flex md:max-w-[60%] xl:flex-row xl:max-w-full">
          <GamesSection
            title={translations?.newSlots || "New Slots"}
            games={newGames}
            translations={translations}
          />
          <GamesSection
            title={translations?.mostPopularSlots || "Most Popular Slots"}
            games={popularGames}
            translations={translations}
          />
        </div>
      </div>
    </section>
  );
}

// Export the optimized version as default
export { NewAndLovedSlotsOptimized as NewAndLovedSlots };
