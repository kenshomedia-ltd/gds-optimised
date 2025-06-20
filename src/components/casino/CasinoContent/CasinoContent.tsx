// src/components/casino/CasinoContent/CasinoContent.tsx

import { SingleContent } from "@/components/common/SingleContent";
import { GameListWidget } from "@/components/widgets/GameListWidget";
// import { CasinoComparison } from "@/components/casino/CasinoComparison";
// import { ProsCons } from "@/components/casino/ProsCons";
// import { HowTo } from "@/components/casino/HowTo";
// import { Faqs } from "@/components/casino/Faqs";
// import { AuthorCard } from "@/components/general/authorCard";
// import { UserReviews } from "@/components/casino/UserReviews";
import type { CasinoPageData, GameData } from "@/types";

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
    <div className="container mx-auto px-4 py-8">
      <div className="grid md:grid-cols-4 gap-8">
        <div className="col-span-1 md:col-span-3">
          {/* Quick Links - will be implemented later */}
          {/* <QuickLinks data={casino} translations={translations} /> */}

          {/* Image Carousel - will be implemented later */}
          {/* {casino.blocks?.[0] && (
            <ImageCarousel data={casino.blocks[0]} />
          )} */}

          {/* Introduction */}
          {casino.introduction && (
            <div className="mb-8">
              <SingleContent content={casino.introduction} />
            </div>
          )}

          {/* How To Section */}
          {/* {casino.howTo && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-6">{casino.howTo.title}</h2>
              {casino.howTo.howToGroup.map((step, index) => (
                <HowTo
                  key={step.id}
                  count={index + 1}
                  howToImage={step.image?.url}
                  howToWidth={step.image?.width}
                  howToHeight={step.image?.height}
                  howToCopy={step.copy}
                  howToHeading={step.heading}
                />
              ))}
            </div>
          )} */}

          {/* Content Block 1 */}
          {casino.content1 && (
            <div className="mb-8">
              <SingleContent content={casino.content1} />
            </div>
          )}

          {/* Content Block 2 */}
          {casino.content2 && (
            <div className="mb-8">
              <SingleContent content={casino.content2} />
            </div>
          )}

          {/* Games List */}
          {/* {games.length > 0 && (
            <div className="mb-8 p-2 backdrop-blur-[6px] shadow-[0px_0px_12px_rgba(63,230,252,0.6)] bg-[rgba(255,255,255,0.3)] border border-[rgba(255,255,255,0.3)] rounded-lg">
              <GameListWidget
                games={games}
                title={`${casino.title} ${translations.games || "Games"}`}
                translations={translations}
              />
            </div>
          )} */}

          {/* Content Block 3 */}
          {casino.content3 && (
            <div className="mb-8">
              <SingleContent content={casino.content3} />
            </div>
          )}

          {/* Pros and Cons */}
          {/* {casino.proscons && (
            <div className="mb-8">
              <ProsCons
                heading={casino.proscons.heading}
                pros={casino.proscons.pros}
                cons={casino.proscons.cons}
                prosImage={casino.proscons.proImage}
                consImage={casino.proscons.conImage}
              />
            </div>
          )} */}

          {/* Content Block 4 */}
          {casino.content4 && (
            <div className="mb-8">
              <SingleContent content={casino.content4} />
            </div>
          )}

          {/* Casino Comparison */}
          {/* {casino.casinoComparison && casino.casinoComparison.length > 0 && (
            <div className="mb-8">
              <CasinoComparison
                casinos={casino.casinoComparison}
                translations={translations}
              />
            </div>
          )} */}

          {/* FAQs */}
          {/* {casino.faqs && casino.faqs.length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-6">
                {translations.faq || "Frequently Asked Questions"}
              </h2>
              <div className="space-y-4">
                {casino.faqs.map((faq) => (
                  <Faqs key={faq.id} data={faq} />
                ))}
              </div>
            </div>
          )} */}

          {/* Author Card */}
          {/* {casino.author && (
            <div className="mb-8">
              <AuthorCard author={casino.author} translations={translations} />
            </div>
          )} */}

          {/* User Reviews - will be implemented later */}
          {/* <div id="casino-review" className="mb-8">
            <UserReviews
              reviewTypeSlug={casino.slug}
              reviewTypeName={casino.title}
              reviewTypeId={casino.id}
              reviewType="CASINO"
              translations={translations}
            />
          </div> */}
        </div>

        {/* Sticky Sidebar */}
        <div className="col-span-1 hidden md:block">
          <CasinoSidebar casino={casino} translations={translations} />
        </div>
      </div>
    </div>
  );
}

// Sidebar component - reuses the same content as hero for consistency
function CasinoSidebar({
  casino,
  translations,
}: {
  casino: CasinoPageData;
  translations: Record<string, string>;
}) {
  // This would be similar to the hero card but sticky
  return (
    <div className="bg-white flex flex-col p-3 rounded sticky top-3">
      {/* Similar content to hero card but simplified for sidebar */}
      {/* Implementation would follow the same pattern as CasinoHero card */}
    </div>
  );
}
