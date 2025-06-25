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
import { StarRatingInteractive } from "@/components/ui/StarRating/StarRatingInteractive";
import type { GamePlayerProps } from "@/types/game-page.types";
import { cn } from "@/lib/utils/cn";

/**
 * Utility function to check if a string contains an iframe tag
 */
function containsIframe(html: string): boolean {
  return /<iframe[^>]*>/i.test(html);
}

/**
 * Utility function to extract iframe attributes from an iframe HTML string
 */
function extractIframeAttributes(iframeHtml: string): Record<string, string> {
  const match = iframeHtml.match(/<iframe([^>]*)>/i);
  if (!match) return {};

  const attributesString = match[1];
  const attributes: Record<string, string> = {};

  // Extract src
  const srcMatch = attributesString.match(/src=["']([^"']+)["']/i);
  if (srcMatch) attributes.src = srcMatch[1];

  // Extract other common attributes
  const widthMatch = attributesString.match(/width=["']([^"']+)["']/i);
  if (widthMatch) attributes.width = widthMatch[1];

  const heightMatch = attributesString.match(/height=["']([^"']+)["']/i);
  if (heightMatch) attributes.height = heightMatch[1];

  const titleMatch = attributesString.match(/title=["']([^"']+)["']/i);
  if (titleMatch) attributes.title = titleMatch[1];

  const allowMatch = attributesString.match(/allow=["']([^"']+)["']/i);
  if (allowMatch) attributes.allow = allowMatch[1];

  // Check for allowFullScreen
  if (/allowfullscreen/i.test(attributesString)) {
    attributes.allowFullScreen = "true";
  }

  // Check for frameBorder
  const frameBorderMatch = attributesString.match(
    /frameborder=["']([^"']+)["']/i
  );
  if (frameBorderMatch) attributes.frameBorder = frameBorderMatch[1];

  return attributes;
}

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
 * - Smart iframe handling to prevent nesting
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

  // Get embed code based on device
  const embedCode = isMobile
    ? game.embedCode?.mobileEmbedCode
    : game.embedCode?.desktopEmbedCode;

  // Check if it's a direct URL or HTML embed code
  const isDirectUrl =
    embedCode &&
    (embedCode.startsWith("http://") || embedCode.startsWith("https://"));

  // Check if embed code already contains an iframe
  const hasExistingIframe = embedCode && containsIframe(embedCode);

  // Extract iframe attributes if embed code contains an iframe
  const iframeAttributes = hasExistingIframe
    ? extractIframeAttributes(embedCode)
    : {};

  // Debug log embed code
  if (process.env.NODE_ENV === "development") {
    console.log("[GamePlayer] Embed code data:", {
      embedCode: game.embedCode,
      gamesApiOverride: game.gamesApiOverride,
      mobileCode: game.embedCode?.mobileEmbedCode?.substring(0, 100) + "...",
      desktopCode: game.embedCode?.desktopEmbedCode?.substring(0, 100) + "...",
      selectedCode: embedCode?.substring(0, 100) + "...",
      isDirectUrl,
      hasExistingIframe,
      extractedAttributes: iframeAttributes,
      isMobile,
    });
  }

  // Get game image
  const gameImage = Array.isArray(game.images) ? game.images[0] : game.images;
  const hasImage = gameImage && gameImage.url;

  // Create a normalized game object with default values for optional date fields
  const normalizedGame = {
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
    // Provide default values for optional date fields
    createdAt: game.createdAt || new Date().toISOString(),
    updatedAt: game.updatedAt || new Date().toISOString(),
  };

  // Generate provider URLs
  const providerPagePath = `/software-slot-machine/${game.provider?.slug}`;
  // const casinoProviderPagePath = `/casino-providers-page/${game.provider?.slug}`;

  /**
   * Render the game iframe based on the embed code type
   */
  const renderGameIframe = () => {
    if (!embedCode) {
      return (
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
      );
    }

    // Case 1: Direct URL - create an iframe with the URL
    if (isDirectUrl) {
      return (
        <iframe
          ref={iframeRef}
          src={embedCode}
          className="w-full h-full"
          allowFullScreen
          frameBorder="0"
          title={`${game.title} game`}
        />
      );
    }

    // Case 2: Embed code already contains an iframe - extract src and create new iframe
    if (hasExistingIframe && iframeAttributes.src) {
      return (
        <iframe
          ref={iframeRef}
          src={iframeAttributes.src}
          className="w-full h-full"
          allowFullScreen={iframeAttributes.allowFullScreen === "true"}
          frameBorder={iframeAttributes.frameBorder || "0"}
          title={iframeAttributes.title || `${game.title} game`}
          allow={iframeAttributes.allow}
        />
      );
    }

    // Case 3: HTML embed code without iframe - use srcDoc
    return (
      <iframe
        ref={iframeRef}
        srcDoc={embedCode}
        className="w-full h-full"
        allowFullScreen
        frameBorder="0"
        title={`${game.title} game`}
      />
    );
  };

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
              <button
                className="w-[30px] h-[30px] rounded-full border border-gameplayer-meta-btn-border flex items-center justify-center"
                onClick={handleFullscreen}
              >
                <FontAwesomeIcon
                  icon={faExpand}
                  className="w-4 h-4"
                  style={{ "--fa-secondary-opacity": 0 }}
                />
              </button>
            </div>
          </div>
        )}

        {/* Game content or play button */}
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
        ) : (
          // Render the game iframe using our smart logic
          renderGameIframe()
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
              {game.documentId && (
                <StarRatingInteractive
                  documentId={game.documentId}
                  slug={game.slug}
                  initialRating={game.ratingAvg}
                  initialCount={game.ratingCount}
                  size="md"
                  ratingType="games"
                  itemTitle={game.title}
                />
              )}
            </div>

            {/* Play Again Button - Only show when playing */}
            {isPlaying && (
              <Button
                onClick={handleReload}
                variant="default"
                size="sm"
                className="ml-4"
              >
                {translations.playAgain || "Play Again"}
              </Button>
            )}
          </div>
        </div>

        {/* Control Icons */}
        <div className="p-2.5 md:p-0 flex order-2 md:order-3 grow md:grow-0">
          <div className="flex items-center gap-2 ml-auto">
            {/* Reload button */}
            <div className="relative">
              <button
                onClick={handleReload}
                onMouseEnter={() => setShowReloadTooltip(true)}
                onMouseLeave={() => setShowReloadTooltip(false)}
                className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors"
                aria-label={translations.reload || "Reload"}
              >
                <FontAwesomeIcon
                  icon={faRotateRight}
                  className="w-4 h-4 text-gray-600"
                />
              </button>
              {showReloadTooltip && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap z-10">
                  {translations.reload || "Reload"}
                </div>
              )}
            </div>

            {/* Fullscreen button */}
            <div className="relative">
              <button
                onClick={handleFullscreen}
                onMouseEnter={() => setShowFullscreenTooltip(true)}
                onMouseLeave={() => setShowFullscreenTooltip(false)}
                className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors"
                aria-label={translations.fullscreen || "Fullscreen"}
              >
                <FontAwesomeIcon
                  icon={faExpand}
                  className="w-4 h-4 text-gray-600"
                />
              </button>
              {showFullscreenTooltip && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap z-10">
                  {translations.fullscreen || "Fullscreen"}
                </div>
              )}
            </div>

            {/* Favorite button */}
            <div
              className="relative"
              onMouseEnter={() => setShowFavoriteTooltip(true)}
              onMouseLeave={() => setShowFavoriteTooltip(false)}
            >
              <FavoriteButton
                gameId={game.id}
                gameTitle={game.title}
                game={normalizedGame}
                translations={translations}
                size="sm"
                className="!w-[30px] !h-[30px] bg-grey-300 !rounded-[5px] border border-grey-500"
              />
              {showFavoriteTooltip && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-5 py-2 bg-grey-100 text-black text-sm rounded shadow-lg z-20 w-fit whitespace-nowrap -ml-[180px]">
                  {translations.favouriteAGame || "Favorite a game"}
                </div>
              )}
            </div>

            {/* Info button */}
            <div className="relative">
              <button
                onClick={() => setShowInfo(!showInfo)}
                className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors"
                aria-label={translations.info || "Info"}
              >
                <FontAwesomeIcon
                  icon={showInfo ? faXmark : faInfo}
                  className="w-4 h-4 text-gray-600"
                />
              </button>
            </div>

            {/* Report button */}
            <div className="relative">
              <button
                onClick={handleReportGame}
                onMouseEnter={() => setShowReportTooltip(true)}
                onMouseLeave={() => setShowReportTooltip(false)}
                className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors"
                aria-label={translations.report || "Report"}
              >
                <FontAwesomeIcon
                  icon={faExclamationTriangle}
                  className="w-4 h-4 text-gray-600"
                />
              </button>
              {showReportTooltip && (
                <div className="absolute bottom-full right-0 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap z-10">
                  {translations.report || "Report game"}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Info Panel */}
      {showInfo && (
        <div className="mt-4 p-4 bg-gray-100 rounded-lg">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="font-semibold">
                {translations.provider || "Provider"}:
              </span>
              <Link
                href={providerPagePath}
                className="text-primary hover:underline"
              >
                {game.provider?.title}
              </Link>
            </div>
            {game.categories && game.categories.length > 0 && (
              <div className="flex justify-between">
                <span className="font-semibold">
                  {translations.categories || "Categories"}:
                </span>
                <span>
                  {game.categories.map((cat) => cat.title).join(", ")}
                </span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="font-semibold">
                {translations.rating || "Rating"}:
              </span>
              <span>{game.ratingAvg.toFixed(1)} / 5.0</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
