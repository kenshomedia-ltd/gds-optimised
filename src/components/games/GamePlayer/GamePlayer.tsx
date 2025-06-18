// src/components/games/GamePlayer/GamePlayer.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronDown,
  faExpand,
  faRotateRight,
  faInfo,
  faExclamationTriangle,
  faXmark,
} from "@awesome.me/kit-0e07a43543/icons/duotone/light";
import { Image } from "@/components/common/Image";
import { Button } from "@/components/ui/Button";
import { FavoriteButton } from "@/components/features/Favorites/FavoriteButton";
import { StarRating } from "@/components/ui/StarRating/StarRating";
import type { GamePlayerProps } from "@/types/game-page.types";
import { cn } from "@/lib/utils/cn";

/**
 * GamePlayer Component
 *
 * Features:
 * - 16:9 aspect ratio iframe player
 * - Progressive loading with thumbnail
 * - Fullscreen support
 * - Interactive rating
 * - Favorite functionality
 * - Info tooltip
 * - Mobile responsive
 */
export function GamePlayer({ game, translations = {} }: GamePlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [showReloadTooltip, setShowReloadTooltip] = useState(false);
  const [showFullscreenTooltip, setShowFullscreenTooltip] = useState(false);
  const [showFavoriteTooltip, setShowFavoriteTooltip] = useState(false);
  const [showReportTooltip, setShowReportTooltip] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Check for mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Handle fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const handlePlayGame = () => {
    if (game.isGameDisabled) return;
    setIsPlaying(true);
  };

  const handleReload = () => {
    if (iframeRef.current) {
      iframeRef.current.src = iframeRef.current.src;
    }
  };

  const handleFullscreen = async () => {
    if (!containerRef.current) return;

    try {
      if (!document.fullscreenElement) {
        await containerRef.current.requestFullscreen();

        // Adjust z-index for other elements
        const favBtnNav = document.getElementById("fav-search");
        const burgerMenu = document.getElementById("burger-menu");
        const backToTop = document.getElementById("back-to-top");

        if (favBtnNav) favBtnNav.style.zIndex = "-1";
        if (burgerMenu) burgerMenu.style.zIndex = "-1";
        if (backToTop) backToTop.style.zIndex = "-1";
      } else {
        await document.exitFullscreen();

        // Restore z-index
        const favBtnNav = document.getElementById("fav-search");
        const burgerMenu = document.getElementById("burger-menu");
        const backToTop = document.getElementById("back-to-top");

        if (favBtnNav) favBtnNav.style.zIndex = "40";
        if (burgerMenu) burgerMenu.style.zIndex = "40";
        if (backToTop) backToTop.style.zIndex = "40";
      }
    } catch (error) {
      console.error("Fullscreen error:", error);
    }
  };

  const handleReportGame = () => {
    // This would typically open a modal or navigate to a report form
    console.log("Report game:", game.slug);
    // You can emit an event or call a parent handler here
  };

  const handleRatingChange = (rating: number) => {
    // This would typically send the rating to an API
    console.log("Rating changed:", rating);
  };

  // Get embed code based on device
  const embedCode = isMobile
    ? game.embedCode?.mobileEmbedCode
    : game.embedCode?.desktopEmbedCode;

  // Check if it's an iframe URL or embed code
  const isIframeUrl =
    embedCode &&
    (embedCode.startsWith("http://") || embedCode.startsWith("https://"));

  // Debug log embed code
  if (process.env.NODE_ENV === "development") {
    console.log("[GamePlayer] Embed code data:", {
      embedCode: game.embedCode,
      gamesApiOverride: game.gamesApiOverride,
      mobileCode: game.embedCode?.mobileEmbedCode?.substring(0, 100) + "...",
      desktopCode: game.embedCode?.desktopEmbedCode?.substring(0, 100) + "...",
      selectedCode: embedCode?.substring(0, 100) + "...",
      isIframeUrl,
      isMobile,
    });
  }

  // Get game image
  const gameImage = Array.isArray(game.images) ? game.images[0] : game.images;
  const hasImage = gameImage && gameImage.url;

  // Generate provider URLs
//   const siteId = process.env.NEXT_PUBLIC_SITE_ID;
  const providerPagePath = `/provider-pages/${game.provider?.slug}`;
  const casinoProviderPagePath = `/casino-providers-page/${game.provider?.slug}`;

  return (
    <div className="flex flex-col justify-center rounded-t-lg -mx-3 md:mx-0">
      <div
        ref={containerRef}
        className={cn(
          "md:px-3 md:h-[700px] rounded-lg flex flex-col items-center justify-center bg-black aspect-video",
          isFullscreen && "fixed inset-0 z-[40] rounded-none h-full w-full"
        )}
      >
        {/* Floating close button for fullscreen */}
        {isFullscreen && (
          <div className="absolute top-5 right-5 z-[999] flex flex-col bg-background-800/90 rounded-lg overflow-hidden hover:h-auto h-10">
            <div className="flex flex-col p-2.5 gap-1">
              <button
                className="w-[30px] h-[30px] rounded-full border border-gameplayer-meta-btn-border flex items-center justify-center"
                onClick={() => {}}
              >
                <FontAwesomeIcon
                  icon={faChevronDown}
                  className="w-4 h-4 fill-none"
                  style={{ "--fa-secondary-opacity": 0 }}
                />
              </button>
              <button
                className="w-[30px] h-[30px] rounded-full border border-gameplayer-meta-btn-border flex items-center justify-center"
                onClick={handleReload}
              >
                <FontAwesomeIcon
                  icon={faRotateRight}
                  className="w-4 h-4"
                  style={{ "--fa-secondary-opacity": 0 }}
                />
              </button>
              <FavoriteButton
                gameId={game.id}
                gameTitle={game.title}
                game={{
                  id: game.id,
                  documentId: game.documentId,
                  title: game.title,
                  slug: game.slug,
                  ratingAvg: game.ratingAvg,
                  ratingCount: game.ratingCount,
                  publishedAt: game.publishedAt,
                  provider: game.provider,
                  images: gameImage,
                  categories: game.categories,
                  createdAt: game.createdAt,
                  updatedAt: game.updatedAt,
                }}
                translations={translations}
                size="sm"
                className="!w-[30px] !h-[30px] mb-[5px]"
              />
              <button
                className="w-[30px] h-[30px] rounded-full flex items-center justify-center"
                onClick={handleReportGame}
              >
                <FontAwesomeIcon
                  icon={faExclamationTriangle}
                  className="w-4 h-4 text-gameplayer-report-issue-fill"
                  style={{ "--fa-secondary-opacity": 0 }}
                />
              </button>
              <button
                className="w-[30px] h-[30px] rounded-full flex items-center justify-center"
                onClick={handleFullscreen}
              >
                <FontAwesomeIcon icon={faXmark} className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {!isPlaying ? (
          // Start game overlay
          <div className="flex flex-col items-center justify-center p-2.5">
            {game.isGameDisabled ? (
              <>
                <FontAwesomeIcon
                  icon={faExclamationTriangle}
                  className="w-24 h-24 text-white mb-5"
                />
                <h3 className="mt-5 text-white mb-4">
                  {game.gameDisableText ||
                    translations.gameDisabled ||
                    "Game Disabled"}
                </h3>
              </>
            ) : (
              <>
                <div className="flex items-center mb-3">
                  <h3 className="text-white text-sm uppercase mr-3 !my-0">
                    {game.title}
                  </h3>
                  <div className="text-white text-xs">
                    {translations.by || "da"}{" "}
                    <Link
                      href={providerPagePath}
                      className="uppercase hover:underline"
                    >
                      {game.provider?.title}
                    </Link>
                  </div>
                </div>

                {hasImage && (
                  <div className="hidden sm:block mb-4">
                    <Image
                      src={gameImage.url}
                      alt={game.title}
                      width={190}
                      height={197}
                      className="rounded"
                    />
                  </div>
                )}

                <Button
                  onClick={handlePlayGame}
                  className="uppercase my-5 bg-secondary hover:bg-secondary-600"
                  size="lg"
                >
                  {translations.playFunBtn || "GIOCA GRATIS"}
                </Button>

                <div className="text-white text-[11px] border border-danger rounded p-1.5 text-center">
                  {translations.ageWarning || "18+ Only. Gamble responsibly."}
                </div>

                <Link
                  href="#game-review"
                  className="mt-3 text-[11px] !text-white italic underline"
                >
                  {translations.userComments || "User Comments"}
                </Link>
              </>
            )}
          </div>
        ) : // Game iframe
        embedCode ? (
          isIframeUrl ? (
            // Direct iframe URL from games API
            <iframe
              ref={iframeRef}
              src={embedCode}
              className="w-full h-full"
              allowFullScreen
              frameBorder="0"
              title={`${game.title} game`}
            />
          ) : (
            // HTML embed code from Strapi
            <iframe
              ref={iframeRef}
              srcDoc={embedCode}
              className="w-full h-full"
              allowFullScreen
              frameBorder="0"
              title={`${game.title} game`}
            />
          )
        ) : (
          // No embed code available
          <div className="flex flex-col items-center justify-center h-full p-4 text-white">
            <FontAwesomeIcon
              icon={faExclamationTriangle}
              className="w-16 h-16 mb-4 text-yellow-500"
            />
            <h3 className="text-xl font-bold mb-2">
              {translations.noGameAvailable || "Game not available"}
            </h3>
            <p className="text-center text-sm opacity-80 max-w-md">
              {translations.noEmbedCode ||
                "The game embed code is not available. Please try again later or contact support."}
            </p>
            {process.env.NODE_ENV === "development" && (
              <div className="mt-4 p-4 bg-black/50 rounded text-xs font-mono">
                <p>Debug Info:</p>
                <p>embedCode: {JSON.stringify(game.embedCode)}</p>
                <p>gamesApiOverride: {String(game.gamesApiOverride)}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Control Bar */}
      <div className="rounded-b-lg md:p-1.5 flex flex-wrap items-center bg-gray-100 justify-between md:justify-center w-full">
        {/* Game Title */}
        <div className="p-2.5 md:p-0 flex order-1 grow md:grow-0">
          <div className="flex items-center md:w-[105px] md:w-auto">
            <h2 className="leading-tight text-base m-0">{game.title}</h2>
          </div>
        </div>

        {/* Center Section - Rating and Play Button */}
        <div className="px-2.5 shrink-0 justify-between basis-full flex items-center order-3 grow-0 md:basis-[300px] md:grow mt-4 md:mt-0 md:order-2">
          <div className="p-2.5 md:p-0 shrink-0 justify-between basis-full flex items-center order-3 grow-0 md:basis-[300px] md:grow rounded-lg md:rounded-none md:border-0 md:order-2">
            <div className="ml-0 md:ml-4">
              <StarRating
                initialRating={game.ratingAvg}
                onRatingChange={handleRatingChange}
                size="md"
                showValue
                valuePosition="bottom"
                className="flex-col"
              />
            </div>

            <div className="md:absolute md:left-1/2 md:-translate-x-1/2 flex items-center md:m-auto">
              <Button
                href={casinoProviderPagePath}
                className="w-32 md:w-[200px] mr-3 uppercase bg-misc hover:bg-misc-600"
                size="md"
              >
                {translations.playRealBtn || "GIOCA CON SOLDI VERI"}
              </Button>

              {/* Info Button */}
              <div className="relative">
                <button
                  className="w-[30px] h-[30px] rounded bg-grey-300 border border-grey-500 flex items-center justify-center"
                  onMouseEnter={() => setShowInfo(true)}
                  onMouseLeave={() => setShowInfo(false)}
                  onFocus={() => setShowInfo(true)}
                  onBlur={() => setShowInfo(false)}
                >
                  <FontAwesomeIcon icon={faInfo} className="w-4 h-4" />
                </button>

                {showInfo && game.gameInfoTable && (
                  <div className="absolute bottom-full left-0 mb-2 px-5 py-2 bg-grey-100 text-black text-sm rounded shadow-lg z-20 w-[220px] -ml-[180px] md:ml-0">
                    <div className="space-y-1">
                      {game.gameInfoTable.rtp && (
                        <p>
                          <span className="font-semibold">RTP:</span>{" "}
                          {game.gameInfoTable.rtp}
                        </p>
                      )}
                      {game.gameInfoTable.volatilita && (
                        <p>
                          <span className="font-semibold">
                            {translations.volatility || "Volatility"}:
                          </span>{" "}
                          {game.gameInfoTable.volatilita}
                        </p>
                      )}
                      {game.gameInfoTable.layout && (
                        <p>
                          <span className="font-semibold">
                            {translations.layout || "Layout"}:
                          </span>{" "}
                          {game.gameInfoTable.layout}
                        </p>
                      )}
                      {game.gameInfoTable.puntataMinima && (
                        <p>
                          <span className="font-semibold">
                            {translations.minBet || "Min Bet"}:
                          </span>{" "}
                          {game.gameInfoTable.puntataMinima}
                        </p>
                      )}
                      {game.gameInfoTable.puntataMassima && (
                        <p>
                          <span className="font-semibold">
                            {translations.maxBet || "Max Bet"}:
                          </span>{" "}
                          {game.gameInfoTable.puntataMassima}
                        </p>
                      )}
                    </div>
                    <p className="mt-2 text-xs italic">
                      {translations.gameInfoText ||
                        "Check the list of online casinos that offer this game and their welcome offers."}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Section - Action Buttons */}
        {!game.isGameDisabled && (
          <div className="order-2 md:order-3 p-2.5 md:pr-0 flex items-center grow md:grow-0 justify-end">
            <div className="flex gap-x-1">
              {/* Fullscreen Button */}
              <div className="relative">
                <button
                  className="w-[30px] h-[30px] rounded-[5px] bg-grey-300 border border-grey-500 flex items-center justify-center text-primary hover:text-primary-600"
                  onClick={handleFullscreen}
                  onMouseEnter={() => setShowFullscreenTooltip(true)}
                  onMouseLeave={() => setShowFullscreenTooltip(false)}
                  onFocus={() => setShowFullscreenTooltip(true)}
                  onBlur={() => setShowFullscreenTooltip(false)}
                >
                  <FontAwesomeIcon
                    icon={faExpand}
                    className="w-4 h-4"
                    style={{ "--fa-secondary-opacity": 0 }}
                  />
                </button>
                {showFullscreenTooltip && (
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-5 py-2 bg-grey-100 text-black text-sm rounded shadow-lg z-20 w-[150px]">
                    {translations.fullscreen || "Fullscreen"}
                  </div>
                )}
              </div>

              {/* Reload Button */}
              <div className="relative">
                <button
                  className="w-[30px] h-[30px] rounded-[5px] bg-grey-300 border border-grey-500 flex items-center justify-center text-primary hover:text-primary-600"
                  onClick={handleReload}
                  onMouseEnter={() => setShowReloadTooltip(true)}
                  onMouseLeave={() => setShowReloadTooltip(false)}
                  onFocus={() => setShowReloadTooltip(true)}
                  onBlur={() => setShowReloadTooltip(false)}
                >
                  <FontAwesomeIcon
                    icon={faRotateRight}
                    className="w-4 h-4"
                    style={{ "--fa-secondary-opacity": 0 }}
                  />
                </button>
                {showReloadTooltip && (
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-5 py-2 bg-grey-100 text-black text-sm rounded shadow-lg z-20 w-[150px]">
                    {translations.reloadGame || "Reload Game"}
                  </div>
                )}
              </div>

              {/* Favorite Button */}
              <div
                className="relative"
                onMouseEnter={() => setShowFavoriteTooltip(true)}
                onMouseLeave={() => setShowFavoriteTooltip(false)}
                onFocus={() => setShowFavoriteTooltip(true)}
                onBlur={() => setShowFavoriteTooltip(false)}
              >
                <FavoriteButton
                  gameId={game.id}
                  gameTitle={game.title}
                  game={{
                    id: game.id,
                    documentId: game.documentId,
                    title: game.title,
                    slug: game.slug,
                    ratingAvg: game.ratingAvg,
                    ratingCount: game.ratingCount,
                    publishedAt: game.publishedAt,
                    provider: game.provider,
                    images: gameImage,
                    categories: game.categories,
                    createdAt: game.createdAt,
                    updatedAt: game.updatedAt,
                  }}
                  translations={translations}
                  size="sm"
                  className="!w-[30px] !h-[30px] bg-grey-300 rounded-[5px] border border-grey-500"
                />
                {showFavoriteTooltip && (
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-5 py-2 bg-grey-100 text-black text-sm rounded shadow-lg z-20 w-fit whitespace-nowrap -ml-[180px]">
                    {translations.favouriteAGame || "Favorite a game"}
                  </div>
                )}
              </div>

              {/* Report Button */}
              <div className="relative">
                <button
                  className="w-[30px] h-[30px] rounded-[5px] bg-danger border flex items-center justify-center"
                  onClick={handleReportGame}
                  onMouseEnter={() => setShowReportTooltip(true)}
                  onMouseLeave={() => setShowReportTooltip(false)}
                  onFocus={() => setShowReportTooltip(true)}
                  onBlur={() => setShowReportTooltip(false)}
                >
                  <FontAwesomeIcon
                    icon={faExclamationTriangle}
                    className="w-4 h-4 text-white"
                    style={{ "--fa-secondary-opacity": 0 }}
                  />
                </button>
                {showReportTooltip && (
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-5 py-2 bg-grey-100 text-black text-sm rounded shadow-lg z-20 w-fit whitespace-nowrap -ml-[180px]">
                    {translations.reportAGame || "Report a game"}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
