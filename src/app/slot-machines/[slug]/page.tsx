// src/app/slot-machines/[slug]/page.tsx

import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getGamePageData } from "@/lib/strapi/game-page-data-loader";
import { getLayoutData } from "@/lib/strapi/data-loader";
import { getCasinoSidebarData } from "@/lib/strapi/casino-sidebar-loader";
import { fetchRelatedGames } from "@/lib/strapi/fetch-related-games";
import { GamePlayer } from "@/components/games/GamePlayer";
import { RelatedGames } from "@/components/widgets/RelatedGames";
import { DynamicBlock } from "@/components/common/DynamicBlock";
import { BreadcrumbsWithLayout } from "@/components/layout/Breadcrumbs";
import { SingleContent } from "@/components/common/SingleContent";
import { FAQWidget } from "@/components/widgets/FAQWidget";
import { ProsConsWidget } from "@/components/widgets/ProsConsWidget";
import { AuthorBox } from "@/components/common/AuthorBox/AuthorBox";
import { RelatedCasinosServer } from "@/components/widgets/RelatedCasinos/RelatedCasinosServer";
import { CasinoSidebar } from "@/components/casino/CasinoSidebar/CasinoSidebar";
import { QuicklinksWidget } from "@/components/widgets/QuicklinksWidget";
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
  // Fetch all data in parallel
  const [{ layout, translations }, relatedGames, sidebarCasinos] =
    await Promise.all([
      getLayoutData({ cached: true }),
      game.provider?.slug
        ? fetchRelatedGames(game.provider.slug, game.slug, 6)
        : Promise.resolve([]),
      getCasinoSidebarData({ cached: true }),
    ]);

  // Get all layout breadcrumb collections
  const layoutBreadcrumbs: Record<string, BreadcrumbItem[]> = {};
  Object.keys(layout).forEach((key) => {
    if (key.endsWith("Breadcrumbs") && Array.isArray(layout[key])) {
      layoutBreadcrumbs[key] = layout[key];
    }
  });

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

  return (
    <>
      {/* Breadcrumbs */}
      <BreadcrumbsWithLayout
        items={[
          {
            breadCrumbText: game.title,
            breadCrumbUrl: "", // Empty URL for current page
          },
        ]}
        breadcrumbKey="gamesBreadcrumbs"
        layoutBreadcrumbs={layoutBreadcrumbs}
        showHome={false}
      />

      {/* Hero Section with Game Player */}
      <section className="featured-header relative overflow-hidden bg-gradient-to-b from-background-900 from-30% via-background-700 via-80% to-background-500 rounded-b-3xl">
        <div className="lg:container relative mx-auto px-4 z-10 py-8">
          {/* Game Player */}
          <div className="mb-8">
            <GamePlayer game={game} translations={translations} />
          </div>

          {/* Related Games - Show after GamePlayer in hero section */}
          {relatedGames.length > 0 && (
            <RelatedGames
              games={relatedGames}
              translations={translations}
              providerName={game.provider?.title}
            />
          )}
        </div>

        {/* Starry Sky Background Effect */}
        <div className="absolute top-0 left-0 w-full pointer-events-none">
          <div className="h-[80vh] bg-[#0e1a2f]" />
          <div className="h-[300px] bg-[#0e1a2f] rounded-b-[50%_300px]" />
        </div>
      </section>

      {/* Main Content Section */}
      <main className="lg:container mx-auto px-4 py-8">
        <div className="space-y-12">
          {/* Related Casinos Widget - Full width */}
          {game.provider && (
            <>
              <h2 className="text-2xl md:text-3xl font-bold text-heading-text text-left mb-6">
                {`${game.title} ${translations.gamePageRelatedCasinoH2}` ||
                  `Best Casinos with ${game.title} Games`}
              </h2>
              <RelatedCasinosServer
                provider={game.provider}
                maxCasinos={5}
                showTitle={false}
                className="w-full"
                translations={translations}
              />
            </>
          )}

          {/* Two column layout for content and sidebar */}
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 main">
            {/* Main Content Column */}
            <div className="flex-1 min-w-0 space-y-12">
              {/* Quicklinks Widget */}
              <QuicklinksWidget
                block={{
                  id: 0,
                  __component: "shared.quicklinks",
                  showQuickLinks: true,
                }}
              />

              {/* Game Information */}
              {hasMainContent && (
                <section
                  className="opacity-0 animate-[fadeIn_0.6s_ease-out_100ms_forwards]"
                  style={{ animationDelay: "100ms" }}
                >
                  <SingleContent
                    block={{
                      heading: game.heading,
                      content: game.introduction,
                    }}
                  />
                </section>
              )}

              {/* Game Info Table */}
              {hasGameInfo && (
                <section
                  className="opacity-0 animate-[fadeIn_0.6s_ease-out_600ms_forwards]"
                  style={{ animationDelay: "600ms" }}
                >
                  <div className="bg-gray-50 rounded-lg p-8">
                    <h2 className="text-2xl font-bold mb-6">
                      {`${translations.gameInfoTableH2} ${game.title}`}
                    </h2>
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
                          <dt className="font-semibold text-gray-700">
                            Layout:
                          </dt>
                          <dd className="text-gray-900">
                            {game.gameInfoTable!.layout}
                          </dd>
                        </div>
                      )}
                      {game.gameInfoTable!.lineeDiPuntata && (
                        <div className="flex justify-between py-2 border-b border-gray-200">
                          <dt className="font-semibold text-gray-700">
                            Paylines:
                          </dt>
                          <dd className="text-gray-900">
                            {game.gameInfoTable!.lineeDiPuntata}
                          </dd>
                        </div>
                      )}
                      {game.gameInfoTable!.puntataMinima && (
                        <div className="flex justify-between py-2 border-b border-gray-200">
                          <dt className="font-semibold text-gray-700">
                            Min Bet:
                          </dt>
                          <dd className="text-gray-900">
                            {game.gameInfoTable!.puntataMinima}
                          </dd>
                        </div>
                      )}
                      {game.gameInfoTable!.puntataMassima && (
                        <div className="flex justify-between py-2 border-b border-gray-200">
                          <dt className="font-semibold text-gray-700">
                            Max Bet:
                          </dt>
                          <dd className="text-gray-900">
                            {game.gameInfoTable!.puntataMassima}
                          </dd>
                        </div>
                      )}
                      {game.gameInfoTable!.jackpot && (
                        <div className="flex justify-between py-2 border-b border-gray-200">
                          <dt className="font-semibold text-gray-700">
                            Jackpot:
                          </dt>
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

              {/* Additional Content */}
              {game.content1 && (
                <section
                  className="opacity-0 animate-[fadeIn_0.6s_ease-out_200ms_forwards]"
                  style={{ animationDelay: "200ms" }}
                >
                  <SingleContent
                    block={{
                      content: game.content1,
                    }}
                  />
                </section>
              )}

              {/* Dynamic Blocks (if any) */}
              {game.blocks && game.blocks.length > 0 && (
                <section
                  className="space-y-8 opacity-0 animate-[fadeIn_0.6s_ease-out_300ms_forwards]"
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
                  className="opacity-0 animate-[fadeIn_0.6s_ease-out_400ms_forwards]"
                  style={{ animationDelay: "400ms" }}
                >
                  <div className="bg-white rounded-lg shadow-sm p-8">
                    <h2 className="text-2xl font-bold mb-4">
                      {game.howTo!.title}
                    </h2>
                    {game.howTo!.description && (
                      <p className="text-gray-700 mb-6">
                        {game.howTo!.description}
                      </p>
                    )}
                    <div className="space-y-6">
                      {game.howTo!.howToGroup!.map((item) => (
                        <div
                          key={item.id}
                          className="border-l-4 border-blue-500 pl-4"
                        >
                          {item.heading && (
                            <h3 className="text-lg font-semibold mb-2">
                              {item.heading}
                            </h3>
                          )}
                          {item.copy && (
                            <p className="text-gray-700">{item.copy}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </section>
              )}

              {/* Pros and Cons Widget */}
              {hasProscons && <ProsConsWidget proscons={game.proscons!} />}

              {/* FAQ Widget */}
              {hasFaqs && <FAQWidget faqs={game.faqs!} title={translations.faq}/>}

              {/* Author Box - At the bottom of left column */}
              {game.author && (
                <div className="mt-12">
                  <AuthorBox author={game.author} />
                </div>
              )}
            </div>

            {/* Casino Sidebar - Right column */}
            <aside className="lg:w-80 xl:w-96">
              <CasinoSidebar
                casinos={sidebarCasinos}
                translations={translations}
              />
            </aside>
          </div>
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

      {/* Main Content - No Suspense needed for server components */}
      <GameContent game={game} />
    </>
  );
}
