// src/components/casino/CasinoContent/CasinoContent.tsx

import { SingleContent } from "@/components/common/SingleContent";
import { GameListWidget } from "@/components/widgets/GameListWidget";
import { CasinoComparison } from "@/components/widgets/CasinoComparison";
import { ProsConsWidget } from "@/components/widgets/ProsConsWidget";
import { HowTo } from "@/components/widgets/HowTo";
import { FAQWidget } from "@/components/widgets/FAQWidget";
import { AuthorBox } from "@/components/common/AuthorBox/AuthorBox";
import { QuicklinksWidget } from "@/components/widgets/QuicklinksWidget";
import {
  CasinoDetailSidebar,
  CasinoDetailMobileFooter,
} from "@/components/widgets/CasinoDetailSidebar";
// import { ImageCarousel } from "@/components/widgets/ImageCarousel";
// import { UserReviews } from "@/components/casino/UserReviews";
import type { CasinoPageData } from "@/types/casino-page.types";
import type { GameData } from "@/types/game.types";

interface CasinoContentProps {
  casino: CasinoPageData;
  games: GameData[];
  translations: Record<string, string>;
}

export function CasinoContent({
  casino,
  games,
  translations,
}: CasinoContentProps) {
  return (
    <>
      {/* Mobile sticky footer */}
      <CasinoDetailMobileFooter casino={casino} translations={translations} />

      <div className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="col-span-1 md:col-span-3">
            {/* Quick Links */}
            <QuicklinksWidget
              block={{
                id: 1,
                __component: "shared.quicklinks",
                showQuickLinks: true,
              }}
            />

            {/* Image Carousel - if blocks exist */}
            {casino.blocks &&
              casino.blocks.length > 0 &&
              casino.blocks[0].__component === "shared.image-carousel" && (
                <div className="mb-8">
                  {/* ImageCarousel component would go here when implemented */}
                  {/* <ImageCarousel data={casino.blocks[0]} /> */}
                </div>
              )}

            {/* Introduction */}
            {casino.introduction && (
              <div className="mb-8" id="introduction">
                <SingleContent block={{ content: casino.introduction }} />
              </div>
            )}

            {/* How To Section */}
            {casino.howTo &&
              casino.howTo.howToGroup &&
              casino.howTo.howToGroup.length > 0 && (
                <div className="mb-8" id="howTo">
                  <h2 className="text-2xl md:text-3xl font-bold mb-6">
                    {casino.howTo.title}
                  </h2>
                  <HowTo
                    block={{
                      __component: "shared.how-to-group",
                      ...casino.howTo,
                    }}
                  />
                </div>
              )}

            {/* Content Block 1 */}
            {casino.content1 && (
              <div className="mb-8" id="content1">
                <SingleContent block={{ content: casino.content1 }} />
              </div>
            )}

            {/* Content Block 2 */}
            {casino.content2 && (
              <div className="mb-8" id="content2">
                <SingleContent block={{ content: casino.content2 }} />
              </div>
            )}

            {/* Games List */}
            {games && games.length > 0 && (
              <div className="mb-8 p-2 backdrop-blur-[6px] shadow-[0px_0px_12px_rgba(63,230,252,0.6)] bg-[rgba(255,255,255,0.3)] border border-[rgba(255,255,255,0.3)] rounded-lg">
                <GameListWidget
                  block={{
                    id: 1,
                    __component: "games.games-carousel",
                    numberOfGames: games.length,
                    sortBy: "ratingAvg:desc",
                    showGameFilterPanel: false,
                    showGameMoreButton: false,
                  }}
                  games={games}
                  translations={translations}
                />
              </div>
            )}

            {/* Content Block 3 */}
            {casino.content3 && (
              <div className="mb-8" id="content3">
                <SingleContent block={{ content: casino.content3 }} />
              </div>
            )}

            {/* Pros and Cons */}
            {casino.proscons && (
              <div className="mb-8">
                <ProsConsWidget proscons={casino.proscons} />
              </div>
            )}

            {/* Content Block 4 */}
            {casino.content4 && (
              <div className="mb-8" id="content4">
                <SingleContent block={{ content: casino.content4 }} />
              </div>
            )}

            {/* Casino Comparison */}
            {casino.casinoComparison && casino.casinoComparison.length > 0 && (
              <div className="mb-8">
                <CasinoComparison
                  casinos={casino.casinoComparison}
                  translations={translations}
                />
              </div>
            )}

            {/* FAQs */}
            {casino.faqs && casino.faqs.length > 0 && (
              <div className="mb-8" id="faqs">
                <FAQWidget
                  faqs={casino.faqs}
                  title={translations.faq || "Domande Frequenti"}
                />
              </div>
            )}

            {/* Author Card */}
            {casino.author && (
              <div className="mb-8">
                <AuthorBox author={casino.author} />
              </div>
            )}

            {/* User Reviews - to be implemented */}
            <div id="casino-review" className="mb-8">
              {/* <UserReviews
                reviewTypeSlug={casino.slug}
                reviewTypeName={casino.title}
                reviewTypeId={casino.id}
                reviewType="CASINO"
                translations={translations}
              /> */}
            </div>
          </div>

          {/* Sticky Sidebar */}
          <div className="col-span-1 hidden md:block">
            <CasinoDetailSidebar casino={casino} translations={translations} />
          </div>
        </div>
      </div>
    </>
  );
}
