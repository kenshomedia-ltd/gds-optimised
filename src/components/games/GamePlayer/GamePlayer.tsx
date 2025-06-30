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
 * Utility function to detect iOS devices
 */
function isIOSDevice(): boolean {
  if (typeof window === "undefined") return false;

  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  );
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
  const [isIOS, setIsIOS] = useState(false);

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDropdownExpanded, setIsDropdownExpanded] = useState(false);

  // Check for mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    const checkIOS = () => {
      setIsIOS(isIOSDevice());
    };

    checkMobile();
    checkIOS();

    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Handle fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isNativeFullscreen =
        !!document.fullscreenElement || !!document.webkitFullscreenElement;
      setIsFullscreen(isNativeFullscreen);
    };

    const handleIOSFullscreenChange = () => {
      if (isIOS && containerRef.current) {
        const hasFullscreenClass =
          containerRef.current.classList.contains("ios-fullscreen");
        setIsFullscreen(hasFullscreenClass);
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);

    let observer: MutationObserver | undefined;
    if (isIOS && containerRef.current) {
      observer = new MutationObserver(handleIOSFullscreenChange);
      observer.observe(containerRef.current, {
        attributes: true,
        attributeFilter: ["class"],
      });
    }

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener(
        "webkitfullscreenchange",
        handleFullscreenChange
      );
      if (observer) {
        observer.disconnect();
      }
    };
  }, [isIOS]);

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
    const container = containerRef.current;
    if (!container) return;

    const requestFullscreen = async () => {
      if (isIOS) {
        if (container.webkitRequestFullscreen) {
          await container.webkitRequestFullscreen();
        } else {
          // Fallback for iPhones
          container.classList.add("ios-fullscreen");
          document.body.style.overflow = "hidden";
          // Hide header
          const header = document.querySelector("header");
          if (header) {
            header.style.zIndex = "0";
          }
        }
      } else if (container.requestFullscreen) {
        await container.requestFullscreen();
      }
    };

    const exitFullscreen = async () => {
      if (isIOS) {
        if (document.webkitExitFullscreen) {
          await document.webkitExitFullscreen();
        } else {
          // Fallback for iPhones
          container.classList.remove("ios-fullscreen");
          document.body.style.overflow = "unset";
          // Restore header
          const header = document.querySelector("header");
          if (header) {
            header.style.zIndex = "50"; // Restore original z-index
          }
        }
      } else if (document.exitFullscreen) {
        await document.exitFullscreen();
      }
    };

    try {
      if (!isFullscreen) {
        await requestFullscreen();
      } else {
        await exitFullscreen();
      }
    } catch (error) {
      console.error("Fullscreen error:", error);
    }
  };

  // Handle dropdown toggle
  const toggleDropdown = () => {
    setIsDropdownExpanded(!isDropdownExpanded);
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
          "relative w-full md:max-h-[700px] md:px-3 rounded-lg flex flex-col items-center justify-center bg-black aspect-video", // Added 'relative'
          isFullscreen &&
            !isIOS &&
            "fixed inset-0 z-[40] rounded-none h-full w-full",
          isFullscreen && isIOS && "ios-fullscreen"
        )}
      >
        {/* ====================================================================== */}
        {/* Floating Controls -- MODIFICATIONS HERE                              */}
        {/* ====================================================================== */}
        {isFullscreen && (
          <div
            className={cn(
              "absolute top-5 right-5 z-[9999] flex flex-col bg-background-800/90 rounded-lg overflow-hidden transition-all duration-300 pointer-events-auto",
              isDropdownExpanded ? "h-auto" : "h-12", // Increased height for easier tapping
              !isMobile && "group" // Use group-hover for desktop
            )}
            onMouseEnter={() => !isMobile && setIsDropdownExpanded(true)}
            onMouseLeave={() => !isMobile && setIsDropdownExpanded(false)}
          >
            <div className="flex flex-col p-2.5 gap-2"> {/* Increased gap */}
              <button
                className="w-8 h-8 rounded-full border bg-gray-300 border-gray-400 flex items-center justify-center hover:bg-gray-400 transition-colors touch-manipulation"
                onClick={toggleDropdown} // Use onClick for universal support
              >
                <FontAwesomeIcon
                  icon={faChevronDown}
                  className={cn(
                    "w-4 h-4 transition-transform duration-200 text-black pointer-events-none",
                    isDropdownExpanded && "rotate-180",
                    !isMobile && "group-hover:rotate-180" // Rotate on group hover for desktop
                  )}
                  style={{ "--fa-secondary-opacity": 0 }}
                />
              </button>
              <div
                className={cn(
                  "flex-col gap-2",
                  isDropdownExpanded || !isMobile ? "flex" : "hidden" // Control visibility
                )}
              >
                <button
                  className="w-8 h-8 rounded-full border bg-gray-300 border-gray-400 flex items-center justify-center hover:bg-gray-400 transition-colors touch-manipulation"
                  onClick={handleReload}
                >
                  <FontAwesomeIcon
                    icon={faRotateRight}
                    className="w-4 h-4 text-black pointer-events-none"
                    style={{ "--fa-secondary-opacity": 0 }}
                  />
                </button>
                <FavoriteButton
                  gameId={game.id}
                  gameTitle={game.title}
                  game={normalizedGame}
                  translations={translations}
                  size="sm"
                  className="!w-8 !h-8 bg-gray-300 hover:!bg-gray-400 border !border-gray-400 touch-manipulation"
                />
                <button
                  className="w-8 h-8 rounded-full border bg-gray-300 border-gray-400 flex items-center justify-center hover:bg-gray-400 transition-colors touch-manipulation"
                  onClick={handleFullscreen}
                >
                  <FontAwesomeIcon
                    icon={faExpand}
                    className="w-4 h-4 text-black pointer-events-none"
                    style={{ "--fa-secondary-opacity": 0 }}
                  />
                </button>
              </div>
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
                  {translations.playFunBtn || "Play for fun"}
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
          <div className="w-full h-full relative">
            <div className="absolute inset-0">{renderGameIframe()}</div>
          </div>
        )}
      </div>

      {/* Control Bar */}
      <div className="rounded-b-lg bg-gray-100 p-6 md:p-1.5 w-full flex flex-wrap md:flex-nowrap items-center justify-start md:justify-between md:relative gap-y-4">
        {/* --- Left Section (Ratings) --- */}
        <div className="flex items-center order-1">
          {game.documentId && (
            <StarRatingInteractive
              documentId={game.documentId}
              slug={game.slug}
              initialRating={game.ratingAvg}
              initialCount={game.ratingCount}
              size="md"
              ratingType="games"
              itemTitle={game.title}
              translations={translations}
            />
          )}
        </div>

        {/* --- Desktop-Only Centered Button --- */}
        <div className="hidden md:flex absolute inset-x-0 top-0 h-full items-center justify-center pointer-events-none">
          <Button
            href={`${providerPagePath}`}
            variant="default"
            size="lg"
            className="w-[200px] bg-misc pointer-events-auto"
          >
            {translations.playRealBtn || "Play Again"}
          </Button>
        </div>

        {/* --- Right Section (Controls) --- */}
        <div className="flex items-center gap-2 order-2 ml-auto">
          {/* Fullscreen button */}
          <div className="relative">
            <button
              onClick={handleFullscreen}
              onMouseEnter={() => setShowFullscreenTooltip(true)}
              onMouseLeave={() => setShowFullscreenTooltip(false)}
              className="w-8 h-8 rounded-[5px] bg-gray-300 border border-gray-400 flex items-center justify-center hover:bg-gray-400 transition-colors"
              aria-label={translations.fullscreen || "Fullscreen"}
            >
              <FontAwesomeIcon
                icon={faExpand}
                className="w-4 h-4 text-gray-600"
                style={{ "--fa-secondary-opacity": 0 }}
              />
            </button>
            {showFullscreenTooltip && (
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap z-10">
                {translations.fullscreen || "Fullscreen"}
              </div>
            )}
          </div>

          {/* Reload button */}
          <div className="relative">
            <button
              onClick={handleReload}
              onMouseEnter={() => setShowReloadTooltip(true)}
              onMouseLeave={() => setShowReloadTooltip(false)}
              className="w-8 h-8 rounded-[5px] bg-gray-300 border border-gray-400 flex items-center justify-center hover:bg-gray-400 hover:*:text-white transition-colors"
              aria-label={translations.reload || "Reload"}
            >
              <FontAwesomeIcon
                icon={faRotateRight}
                className="w-4 h-4 text-gray-600"
                style={{ "--fa-secondary-opacity": 0 }}
              />
            </button>
            {showReloadTooltip && (
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap z-10">
                {translations.reload || "Reload"}
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
              className="!w-[33px] !h-[33px] bg-gray-300 hover:!bg-gray-400 !rounded-[5px] border !border-gray-400"
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
              className="w-8 h-8 rounded-[5px] border bg-gray-300 border-gray-400 flex items-center justify-center hover:bg-gray-400 hover:*:text-white transition-colors"
              aria-label={translations.info || "Info"}
            >
              <FontAwesomeIcon
                icon={showInfo ? faXmark : faInfo}
                className="w-4 h-4 text-gray-600"
              />
            </button>
          </div>

          {/* Report button */}
          <div className="relative mr-2 lg:mr-0">
            <button
              onClick={handleReportGame}
              onMouseEnter={() => setShowReportTooltip(true)}
              onMouseLeave={() => setShowReportTooltip(false)}
              className="w-8 h-8 rounded-[5px] bg-danger border border-gray-300 flex items-center justify-center hover:bg-danger transition-colors"
              aria-label={translations.report || "Report"}
            >
              <FontAwesomeIcon
                icon={faExclamationTriangle}
                className="w-4 h-4 text-white"
                style={{ "--fa-secondary-opacity": 0 }}
              />
            </button>
            {showReportTooltip && (
              <div className="absolute bottom-full right-0 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap z-10">
                {translations.report || "Report game"}
              </div>
            )}
          </div>
        </div>

        {/* --- Mobile-Only Bottom Button --- */}
        <div className="w-full order-3 md:hidden">
          <Button
            href={`${providerPagePath}`}
            variant="default"
            size="lg"
            className="bg-misc pointer-events-auto w-full"
          >
            {translations.playRealBtn || "Play Again"}
          </Button>
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
