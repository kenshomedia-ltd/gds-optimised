// src/components/widgets/Testimonials/Testimonials.tsx
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Image } from "@/components/common/Image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft,
  faChevronRight,
} from "@awesome.me/kit-0e07a43543/icons/duotone/light";
import type {
  TestimonialsProps,
  OptimizedTestimony,
} from "@/types/testimonials.types";
import { cn } from "@/lib/utils/cn";

/**
 * Testimonials Component
 *
 * Features:
 * - Responsive carousel (1 slide mobile, 2 tablet, 3 desktop)
 * - Touch/swipe support on mobile
 * - Keyboard navigation
 * - Auto-play with pause on hover
 * - Optimized image loading
 * - Accessibility compliant
 * - Smooth animations
 */
export function Testimonials({ data, className }: TestimonialsProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [visibleSlides, setVisibleSlides] = useState(1);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const [isAutoplayPaused, setIsAutoplayPaused] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const autoplayIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const testimonies = data.homeTestimonies || [];

  // Optimize images with Cloudfront transformation
  const optimizedTestimonies: OptimizedTestimony[] = testimonies.map(
    (testimony) => ({
      ...testimony,
      provider: testimony.provider
        ? {
            ...testimony.provider,
            imageUrl: testimony.provider.images?.url || "",
          }
        : undefined,
    })
  );

  // Calculate visible slides based on screen size
  useEffect(() => {
    const updateVisibleSlides = () => {
      const width = window.innerWidth;
      setVisibleSlides(width >= 1024 ? 3 : width >= 768 ? 2 : 1);
    };

    updateVisibleSlides();
    window.addEventListener("resize", updateVisibleSlides);

    return () => window.removeEventListener("resize", updateVisibleSlides);
  }, []);

  const maxIndex = Math.max(0, testimonies.length - visibleSlides);

  // Navigation functions
  const goToSlide = useCallback(
    (index: number) => {
      if (isTransitioning) return;

      setIsTransitioning(true);
      setCurrentIndex(Math.max(0, Math.min(index, maxIndex)));

      setTimeout(() => setIsTransitioning(false), 300);
    },
    [isTransitioning, maxIndex]
  );

  const nextSlide = useCallback(() => {
    goToSlide(currentIndex >= maxIndex ? 0 : currentIndex + 1);
  }, [currentIndex, goToSlide, maxIndex]);

  const prevSlide = useCallback(() => {
    goToSlide(currentIndex <= 0 ? maxIndex : currentIndex - 1);
  }, [currentIndex, goToSlide, maxIndex]);

  // Touch handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.touches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const diff = touchStart - touchEnd;
    const threshold = 50;

    if (Math.abs(diff) > threshold) {
      if (diff > 0) {
        nextSlide();
      } else {
        prevSlide();
      }
    }

    setTouchStart(0);
    setTouchEnd(0);
  };

  // Autoplay functionality
  useEffect(() => {
    if (testimonies.length <= visibleSlides || isAutoplayPaused) {
      if (autoplayIntervalRef.current) {
        clearInterval(autoplayIntervalRef.current);
        autoplayIntervalRef.current = null;
      }
      return;
    }

    autoplayIntervalRef.current = setInterval(nextSlide, 5000);

    return () => {
      if (autoplayIntervalRef.current) {
        clearInterval(autoplayIntervalRef.current);
      }
    };
  }, [nextSlide, testimonies.length, visibleSlides, isAutoplayPaused]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        prevSlide();
        setIsAutoplayPaused(true);
      } else if (e.key === "ArrowRight") {
        nextSlide();
        setIsAutoplayPaused(true);
      }
    };

    window.addEventListener("keydown", handleKeydown);
    return () => window.removeEventListener("keydown", handleKeydown);
  }, [nextSlide, prevSlide]);

  if (!testimonies.length) {
    return null;
  }

  return (
    <section
      className={cn(
        "py-12 md:py-16 lg:py-20",
        className
      )}
      aria-label="Testimonials"
    >
      <div className="container mx-auto px-4">
        {/* Title */}
        {data.title && (
          <h2
            className={cn(
              "text-2xl md:text-3xl lg:text-4xl font-bold text-center",
              "mb-8 md:mb-12 text-heading-text",
              "opacity-0 animate-[fadeIn_0.6s_ease-out_400ms_forwards]"
            )}
          >
            {data.title}
          </h2>
        )}

        {/* Carousel Container */}
        <div
          className="relative"
          role="region"
          aria-label="Testimonials carousel"
          aria-roledescription="carousel"
          onMouseEnter={() => setIsAutoplayPaused(true)}
          onMouseLeave={() => setIsAutoplayPaused(false)}
        >
          <div
            ref={containerRef}
            className="overflow-hidden"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <div
              className={cn(
                "flex transition-transform duration-300 ease-in-out",
                isTransitioning && "pointer-events-none"
              )}
              style={{
                transform: `translateX(-${
                  currentIndex * (100 / visibleSlides)
                }%)`,
              }}
              aria-live="polite"
              aria-atomic="true"
            >
              {optimizedTestimonies.map((testimony, index) => (
                <TestimonyCard
                  key={testimony.id}
                  testimony={testimony}
                  index={index}
                  isVisible={
                    index >= currentIndex &&
                    index < currentIndex + visibleSlides
                  }
                  totalCount={testimonies.length}
                />
              ))}
            </div>
          </div>

          {/* Navigation Arrows */}
          {testimonies.length > visibleSlides && (
            <>
              <button
                type="button"
                className={cn(
                  "absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4",
                  "bg-white rounded-full shadow-lg p-3",
                  "hover:bg-gray-100 hover:shadow-xl",
                  "transition-all duration-200",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                  "disabled:opacity-50 disabled:cursor-not-allowed",
                  "hidden md:flex items-center justify-center"
                )}
                onClick={prevSlide}
                aria-label="Previous testimonial"
                disabled={currentIndex === 0}
              >
                <FontAwesomeIcon
                  icon={faChevronLeft}
                  className="w-5 h-5 text-gray-700"
                />
              </button>

              <button
                type="button"
                className={cn(
                  "absolute right-0 top-1/2 -translate-y-1/2 translate-x-4",
                  "bg-white rounded-full shadow-lg p-3",
                  "hover:bg-gray-100 hover:shadow-xl",
                  "transition-all duration-200",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                  "disabled:opacity-50 disabled:cursor-not-allowed",
                  "hidden md:flex items-center justify-center"
                )}
                onClick={nextSlide}
                aria-label="Next testimonial"
                disabled={currentIndex === maxIndex}
              >
                <FontAwesomeIcon
                  icon={faChevronRight}
                  className="w-5 h-5 text-gray-700"
                />
              </button>
            </>
          )}

          {/* Dots Indicator */}
          {testimonies.length > visibleSlides && (
            <div
              className="flex justify-center mt-6 space-x-2"
              role="group"
              aria-label="Slide controls"
            >
              {Array.from({ length: maxIndex + 1 }).map((_, index) => (
                <button
                  key={index}
                  type="button"
                  className={cn(
                    "h-2 rounded-full transition-all duration-200",
                    "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary",
                    currentIndex === index
                      ? "bg-primary w-8"
                      : "bg-gray-300 w-2 hover:bg-gray-400"
                  )}
                  onClick={() => goToSlide(index)}
                  aria-label={`Go to slide group ${index + 1}`}
                  aria-current={currentIndex === index ? "true" : "false"}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

/**
 * Individual Testimony Card
 */
interface TestimonyCardProps {
  testimony: OptimizedTestimony;
  index: number;
  isVisible: boolean;
  totalCount: number;
}

function TestimonyCard({
  testimony,
  index,
  isVisible,
  totalCount,
}: TestimonyCardProps) {
  return (
    <article
      className="w-full md:w-1/2 lg:w-1/3 flex-shrink-0 px-3"
      aria-hidden={!isVisible}
      aria-label={`Testimonial ${index + 1} of ${totalCount}`}
    >
      <div
        className={cn(
          "bg-white rounded-lg shadow-lg p-6 h-full flex flex-col",
          "transition-all duration-300",
          "hover:shadow-xl hover:-translate-y-1",
          "border border-gray-100"
        )}
      >
        {/* Provider Logo */}
        {testimony.provider && (
          <div className="h-16 flex items-center justify-center mb-4">
            <Image
              src={testimony.provider.imageUrl}
              alt={`${testimony.provider.title} logo`}
              width={200}
              height={100}
              className="max-h-full max-w-full object-contain"
              loading="lazy"
              quality={80}
            />
          </div>
        )}

        {/* Testimony Content */}
        <div className="flex-grow">
          <h3 className="text-lg font-semibold mb-3 text-gray-900 line-clamp-2">
            {testimony.title}
          </h3>
          <blockquote className="text-gray-600 text-sm mb-4 line-clamp-4 italic">
            &ldquo;{testimony.testimony}&rdquo;
          </blockquote>
        </div>

        {/* Testifier Info */}
        <footer className="mt-auto pt-4 border-t border-gray-200">
          <cite className="not-italic">
            <p className="font-medium text-gray-900">
              {testimony.testifierName}
            </p>
            {testimony.testifierTitle && (
              <p className="text-sm text-gray-500">
                {testimony.testifierTitle}
              </p>
            )}
          </cite>
        </footer>
      </div>
    </article>
  );
}
