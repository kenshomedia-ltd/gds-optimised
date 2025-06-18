// src/app/slot-machine/[slug]/page.tsx

import { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { getGamePageData } from "@/lib/strapi/game-page-data-loader";
import { getLayoutData } from "@/lib/strapi/data-loader";
import { GamePlayer, GamePlayerSkeleton } from "@/components/games/GamePlayer";
import { DynamicBlock } from "@/components/common/DynamicBlock";
import { BreadcrumbsWithLayout } from "@/components/layout/Breadcrumbs";
import { SingleContent } from "@/components/common/SingleContent";
import { HeaderAuthor } from "@/components/common/HeaderAuthor";
import type { GamePageData } from "@/types/game-page.types";
import type { BreadcrumbItem } from "@/types/breadcrumbs.types";

interface GamePageProps {
  params: Promise<{
    slug: string;
  }>;
}

/**
 * Generate metadata for game pages
 */
export async function generateMetadata({
  params,
}: GamePageProps): Promise<Metadata> {
  const { slug } = await params;
  const game = await getGamePageData(slug);

  if (!game) {
    return {
      title: "Game Not Found",
    };
  }

  const description =
    game.seo?.metaDescription ||
    game.introduction ||
    `Play ${game.title} online. ${
      game.provider ? `Provided by ${game.provider.title}.` : ""
    }`;

  return {
    title: game.seo?.metaTitle || `${game.title} - Play Online`,
    description,
    openGraph: {
      title: game.seo?.metaTitle || game.title,
      description,
      type: "website",
      images: game.images?.url
        ? [
            {
              url: game.images.url,
              width: 1200,
              height: 630,
              alt: game.title,
            },
          ]
        : [],
    },
    twitter: {
      card: "summary_large_image",
      title: game.seo?.metaTitle || game.title,
      description,
      images: game.images?.url ? [game.images.url] : [],
    },
  };
}

/**
 * Game Content Component
 * Separated to allow for Suspense boundaries
 */
async function GameContent({ game }: { game: GamePageData }) {
  // Get layout data for breadcrumbs
  const { layout } = await getLayoutData({ cached: true });

  // Get all layout breadcrumb collections
  const layoutBreadcrumbs: Record<string, BreadcrumbItem[]> = {};
  Object.keys(layout).forEach((key) => {
    if (key.endsWith("Breadcrumbs") && Array.isArray(layout[key])) {
      layoutBreadcrumbs[key] = layout[key];
    }
  });

  // Translations (these would come from a translation system)
  const translations = {
    playNow: "Play Now",
    playFunBtn: "GIOCA GRATIS",
    playRealBtn: "GIOCA CON SOLDI VERI",
    by: "da",
    ageWarning: "18+ Only. Gamble responsibly.",
    gameDisabled: "Game Disabled",
    backToInfo: "Back to Info",
    volatility: "Volatility",
    layout: "Layout",
    minBet: "Min Bet",
    maxBet: "Max Bet",
    addToFavorites: "Add to favorites",
    removeFromFavorites: "Remove from favorites",
    favoriteError: "Failed to update favorites",
    fullscreen: "Fullscreen",
    reloadGame: "Reload Game",
    favouriteAGame: "Favorite a game",
    reportAGame: "Report a game",
    userComments: "User Comments",
    gameInfoText:
      "Check the list of online casinos that offer this game and their welcome offers. Remember that gambling is prohibited for minors.",
  };

  // Separate main content sections for better organization
  const hasMainContent = game.heading || game.introduction || game.content1;
  const hasHowTo =
    game.howTo && game.howTo.howToGroup && game.howTo.howToGroup.length > 0;
  const hasProscons =
    game.proscons &&
    ((game.proscons.pros && game.proscons.pros.length > 0) ||
      (game.proscons.cons && game.proscons.cons.length > 0));
  const hasFaqs = game.faqs && game.faqs.length > 0;
  const hasGameInfo = game.gameInfoTable;

  // Debug log to see data structure
  if (process.env.NODE_ENV === "development") {
    console.log("[Game Content] Game data structure:", {
      hasMainContent,
      hasHowTo,
      hasProscons,
      hasFaqs,
      hasGameInfo,
      proscons: game.proscons,
    });
  }

  return (
    <>
      {/* Breadcrumbs - Outside hero section to match other pages */}
      <BreadcrumbsWithLayout
        items={[
          {
            breadCrumbText: game.title,
            breadCrumbUrl: "", // Empty URL for current page
          },
        ]}
        breadcrumbKey="gamesBreadcrumbs"
        layoutBreadcrumbs={layoutBreadcrumbs}
        showHome={true}
      />

      {/* Hero Section with Game Player */}
      <section className="featured-header relative overflow-hidden bg-gradient-to-b from-background-900 from-30% via-background-700 via-80% to-background-500 rounded-b-3xl">
        <div className="container relative mx-auto px-4 z-10 py-8">
          {/* Game Player */}
          <div className="mb-8">
            <GamePlayer game={game} translations={translations} />
          </div>
        </div>

        {/* Starry Sky Background Effect */}
        <div className="absolute top-0 left-0 w-full pointer-events-none">
          <div className="h-[80vh] bg-[#0e1a2f]" />
          <div className="h-[300px] bg-[#0e1a2f] rounded-b-[50%_300px]" />
        </div>
      </section>

      {/* Main Content Section */}
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-12">
          {/* Game Information */}
          {hasMainContent && (
            <section
              className="max-w-4xl mx-auto opacity-0 animate-[fadeIn_0.6s_ease-out_100ms_forwards]"
              style={{ animationDelay: "100ms" }}
            >
              <SingleContent
                data={{
                  heading: game.heading,
                  introduction: game.introduction,
                  content1: game.content1,
                }}
              />
            </section>
          )}

          {/* Author Section */}
          {game.author && (
            <section
              className="max-w-4xl mx-auto opacity-0 animate-[fadeIn_0.6s_ease-out_200ms_forwards]"
              style={{ animationDelay: "200ms" }}
            >
              <HeaderAuthor author={game.author} />
            </section>
          )}

          {/* Dynamic Blocks (if any) */}
          {game.blocks && game.blocks.length > 0 && (
            <section
              className="max-w-6xl mx-auto space-y-8 opacity-0 animate-[fadeIn_0.6s_ease-out_300ms_forwards]"
              style={{ animationDelay: "300ms" }}
            >
              {game.blocks.map((block, index) => (
                <DynamicBlock
                  key={`${block.__component}-${index}`}
                  blockType={block.__component}
                  blockData={block}
                />
              ))}
            </section>
          )}

          {/* How To Section */}
          {hasHowTo && (
            <section
              className="max-w-4xl mx-auto opacity-0 animate-[fadeIn_0.6s_ease-out_400ms_forwards]"
              style={{ animationDelay: "400ms" }}
            >
              <div className="bg-white rounded-lg shadow-sm p-8">
                <h2 className="text-2xl font-bold mb-4">{game.howTo!.title}</h2>
                {game.howTo!.description && (
                  <p className="text-gray-600 mb-6">
                    {game.howTo!.description}
                  </p>
                )}
                <div className="space-y-6">
                  {game.howTo!.howToGroup!.map((group) => (
                    <div
                      key={group.id}
                      className="border-l-4 border-primary pl-6"
                    >
                      {group.heading && (
                        <h3 className="text-xl font-semibold mb-2">
                          {group.heading}
                        </h3>
                      )}
                      {group.copy && (
                        <div
                          className="prose prose-lg"
                          dangerouslySetInnerHTML={{ __html: group.copy }}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Pros and Cons */}
          {hasProscons && (
            <section
              className="max-w-4xl mx-auto opacity-0 animate-[fadeIn_0.6s_ease-out_500ms_forwards]"
              style={{ animationDelay: "500ms" }}
            >
              <div className="grid md:grid-cols-2 gap-6">
                {/* Pros */}
                {game.proscons!.pros && game.proscons!.pros.length > 0 && (
                  <div className="bg-green-50 rounded-lg p-6">
                    <h3 className="text-xl font-bold text-green-800 mb-4 flex items-center">
                      <span className="text-2xl mr-2">✓</span> Pros
                    </h3>
                    <ul className="space-y-2">
                      {game.proscons!.pros.map((pro, index) => {
                        // Handle both string and object formats
                        const proText =
                          typeof pro === "string" ? pro : pro.list || "";
                        return (
                          <li key={index} className="flex items-start">
                            <span className="text-green-600 mr-2 mt-1">•</span>
                            <span className="text-gray-700">{proText}</span>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}

                {/* Cons */}
                {game.proscons!.cons && game.proscons!.cons.length > 0 && (
                  <div className="bg-red-50 rounded-lg p-6">
                    <h3 className="text-xl font-bold text-red-800 mb-4 flex items-center">
                      <span className="text-2xl mr-2">✗</span> Cons
                    </h3>
                    <ul className="space-y-2">
                      {game.proscons!.cons.map((con, index) => {
                        // Handle both string and object formats
                        const conText =
                          typeof con === "string" ? con : con.list || "";
                        return (
                          <li key={index} className="flex items-start">
                            <span className="text-red-600 mr-2 mt-1">•</span>
                            <span className="text-gray-700">{conText}</span>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Game Info Table */}
          {hasGameInfo && (
            <section
              className="max-w-4xl mx-auto opacity-0 animate-[fadeIn_0.6s_ease-out_600ms_forwards]"
              style={{ animationDelay: "600ms" }}
            >
              <div className="bg-gray-50 rounded-lg p-8">
                <h2 className="text-2xl font-bold mb-6">Game Information</h2>
                <dl className="grid md:grid-cols-2 gap-y-4 gap-x-8">
                  {game.gameInfoTable!.rtp && (
                    <div className="flex justify-between py-2 border-b border-gray-200">
                      <dt className="font-semibold text-gray-700">RTP:</dt>
                      <dd className="text-gray-900">
                        {game.gameInfoTable!.rtp}
                      </dd>
                    </div>
                  )}
                  {game.gameInfoTable!.volatilita && (
                    <div className="flex justify-between py-2 border-b border-gray-200">
                      <dt className="font-semibold text-gray-700">
                        Volatility:
                      </dt>
                      <dd className="text-gray-900">
                        {game.gameInfoTable!.volatilita}
                      </dd>
                    </div>
                  )}
                  {game.gameInfoTable!.layout && (
                    <div className="flex justify-between py-2 border-b border-gray-200">
                      <dt className="font-semibold text-gray-700">Layout:</dt>
                      <dd className="text-gray-900">
                        {game.gameInfoTable!.layout}
                      </dd>
                    </div>
                  )}
                  {game.gameInfoTable!.lineeDiPuntata && (
                    <div className="flex justify-between py-2 border-b border-gray-200">
                      <dt className="font-semibold text-gray-700">Paylines:</dt>
                      <dd className="text-gray-900">
                        {game.gameInfoTable!.lineeDiPuntata}
                      </dd>
                    </div>
                  )}
                  {game.gameInfoTable!.puntataMinima && (
                    <div className="flex justify-between py-2 border-b border-gray-200">
                      <dt className="font-semibold text-gray-700">Min Bet:</dt>
                      <dd className="text-gray-900">
                        {game.gameInfoTable!.puntataMinima}
                      </dd>
                    </div>
                  )}
                  {game.gameInfoTable!.puntataMassima && (
                    <div className="flex justify-between py-2 border-b border-gray-200">
                      <dt className="font-semibold text-gray-700">Max Bet:</dt>
                      <dd className="text-gray-900">
                        {game.gameInfoTable!.puntataMassima}
                      </dd>
                    </div>
                  )}
                  {game.gameInfoTable!.jackpot && (
                    <div className="flex justify-between py-2 border-b border-gray-200">
                      <dt className="font-semibold text-gray-700">Jackpot:</dt>
                      <dd className="text-gray-900">
                        {game.gameInfoTable!.jackpot}
                      </dd>
                    </div>
                  )}
                  {game.gameInfoTable!.freeSpins && (
                    <div className="flex justify-between py-2 border-b border-gray-200">
                      <dt className="font-semibold text-gray-700">
                        Free Spins:
                      </dt>
                      <dd className="text-gray-900">
                        {game.gameInfoTable!.freeSpins}
                      </dd>
                    </div>
                  )}
                  {game.gameInfoTable!.bonusGame && (
                    <div className="flex justify-between py-2 border-b border-gray-200">
                      <dt className="font-semibold text-gray-700">
                        Bonus Game:
                      </dt>
                      <dd className="text-gray-900">
                        {game.gameInfoTable!.bonusGame}
                      </dd>
                    </div>
                  )}
                </dl>
              </div>
            </section>
          )}

          {/* FAQs */}
          {hasFaqs && (
            <section
              className="max-w-4xl mx-auto opacity-0 animate-[fadeIn_0.6s_ease-out_700ms_forwards]"
              style={{ animationDelay: "700ms" }}
              id="game-review"
            >
              <div className="bg-white rounded-lg shadow-sm p-8">
                <h2 className="text-2xl font-bold mb-6">
                  Frequently Asked Questions
                </h2>
                <div className="space-y-4">
                  {game.faqs!.map((faq) => (
                    <details
                      key={faq.id}
                      className="border border-gray-200 rounded-lg hover:shadow-sm transition-shadow"
                    >
                      <summary className="px-6 py-4 cursor-pointer font-semibold text-lg hover:bg-gray-50 rounded-t-lg">
                        {faq.question}
                      </summary>
                      <div className="px-6 py-4 border-t border-gray-200">
                        <p className="text-gray-700">{faq.answer}</p>
                      </div>
                    </details>
                  ))}
                </div>
              </div>
            </section>
          )}
        </div>
      </main>
    </>
  );
}

/**
 * Game Page Component
 */
export default async function GamePage({
  params,
  searchParams,
}: GamePageProps & {
  searchParams: Promise<{ nocache?: string }>;
}) {
  const { slug } = await params;
  const { nocache } = await searchParams;

  // Check if we should bypass cache for debugging
  const bypassCache = nocache === "true";

  console.log(
    `[Game Page] Loading game: ${slug}, bypass cache: ${bypassCache}`
  );

  const game = await getGamePageData(slug, { cached: !bypassCache });

  if (!game) {
    notFound();
  }

  // Schema.org structured data for the game
  const gameSchema = {
    "@context": "https://schema.org",
    "@type": "VideoGame",
    name: game.title,
    description: game.introduction || game.seo?.metaDescription,
    image: game.images?.url,
    publisher: game.provider
      ? {
          "@type": "Organization",
          name: game.provider.title,
        }
      : undefined,
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: game.ratingAvg,
      ratingCount: game.ratingCount,
      bestRating: 5,
      worstRating: 1,
    },
  };

  return (
    <>
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(gameSchema) }}
      />

      {/* Main Content with Suspense */}
      <Suspense fallback={<GamePlayerSkeleton />}>
        <GameContent game={game} />
      </Suspense>
    </>
  );
}
