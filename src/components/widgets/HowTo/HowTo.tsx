// src/components/widgets/HowTo/HowTo.tsx
"use client";

import { useState } from "react";
import { Image } from "@/components/common/Image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft,
  faChevronRight,
} from "@awesome.me/kit-0e07a43543/icons/duotone/light";
import { cn } from "@/lib/utils/cn";
import type { HowToGroupBlock } from "@/types/dynamic-block.types";
import type { TranslationData } from "@/types/strapi.types";

interface HowToProps {
  block: HowToGroupBlock;
  translations?: TranslationData;
}

/**
 * HowTo Component
 *
 * Displays a step-by-step guide with images
 * Features:
 * - Mobile carousel navigation
 * - Desktop column layout
 * - Numbered steps with images
 * - Smooth transitions
 * - Touch-friendly mobile navigation
 */
export function HowTo({ block, translations }: HowToProps) {
  const [currentStep, setCurrentStep] = useState(0);

  if (!block.howToGroup || block.howToGroup.length === 0) {
    return null;
  }

  const steps = block.howToGroup;
  const totalSteps = steps.length;

  const nextStep = () => {
    setCurrentStep((prev) => (prev + 1) % totalSteps);
  };

  const prevStep = () => {
    setCurrentStep((prev) => (prev - 1 + totalSteps) % totalSteps);
  };

  const goToStep = (index: number) => {
    setCurrentStep(index);
  };

  return (
    <section
      className="py-6 md:py-8 lg:py-12"
      aria-label={block.title || "How to guide"}
    >
      <div className="container mx-auto px-4">
        {/* Header */}
        {(block.title || block.description) && (
          <div className="text-center mb-6 md:mb-8">
            {block.title && (
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-3">
                {block.title}
              </h2>
            )}
            {block.description && (
              <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto">
                {block.description}
              </p>
            )}
          </div>
        )}

        {/* Mobile Carousel View */}
        <div className="md:hidden">
          <div className="relative">
            {/* Current Step */}
            <div className="bg-gray-50 rounded-2xl p-2 shadow-lg">
              <HowToStep
                step={steps[currentStep]}
                stepNumber={currentStep + 1}
                isMobile={true}
              />
            </div>

            {/* Navigation Arrows */}
            {totalSteps > 1 && (
              <>
                <button
                  onClick={prevStep}
                  className={cn(
                    "absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3",
                    "bg-white rounded-full shadow-lg p-3",
                    "hover:bg-gray-100 transition-colors",
                    "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  )}
                  aria-label={translations?.previous || "Previous step"}
                >
                  <FontAwesomeIcon
                    icon={faChevronLeft}
                    className="w-4 h-4 text-gray-700"
                  />
                </button>

                <button
                  onClick={nextStep}
                  className={cn(
                    "absolute right-0 top-1/2 -translate-y-1/2 translate-x-3",
                    "bg-white rounded-full shadow-lg p-3",
                    "hover:bg-gray-100 transition-colors",
                    "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  )}
                  aria-label={translations?.next || "Next step"}
                >
                  <FontAwesomeIcon
                    icon={faChevronRight}
                    className="w-4 h-4 text-gray-700"
                  />
                </button>
              </>
            )}
          </div>

          {/* Dots Indicator */}
          {totalSteps > 1 && (
            <div className="flex justify-center mt-6 gap-2">
              {steps.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToStep(index)}
                  className={cn(
                    "h-2 rounded-full transition-all duration-300",
                    currentStep === index
                      ? "bg-primary w-8"
                      : "bg-gray-300 w-2 hover:bg-gray-400"
                  )}
                  aria-label={`Go to step ${index + 1}`}
                  aria-current={currentStep === index ? "true" : "false"}
                />
              ))}
            </div>
          )}
        </div>

        {/* Desktop Column View */}
        <div className="hidden md:flex md:flex-col gap-6 max-w-4xl mx-auto">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className="bg-gray-50 rounded-2xl p-4 shadow-lg hover:shadow-xl transition-shadow"
            >
              <HowToStep step={step} stepNumber={index + 1} isMobile={false} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/**
 * Individual Step Component
 */
interface HowToStepProps {
  step: {
    id: number;
    heading: string;
    copy: string;
    image?: {
      url: string;
      width?: number;
      height?: number;
      alternativeText?: string;
    };
  };
  stepNumber: number;
  isMobile: boolean;
}

function HowToStep({ step, stepNumber, isMobile }: HowToStepProps) {
  const imageUrl = step.image?.url;
  const hasImage = Boolean(imageUrl);

  return (
    <article
      className={cn(
        "flex h-full",
        isMobile ? "flex-col" : "flex-row items-start gap-5 lg:gap-6"
      )}
    >
      {/* Image Container */}
      {hasImage && imageUrl && (
        <div className={cn("flex-shrink-0", isMobile ? "mb-4" : "")}>
          <div className="relative w-[235px] h-[235px] mx-auto md:mx-0 rounded-2xl overflow-hidden bg-white shadow-inner">
            <Image
              src={imageUrl}
              alt={
                step.image?.alternativeText ||
                `Step ${stepNumber}: ${step.heading}`
              }
              width={235}
              height={235}
              className="w-full h-full object-contain rounded-2xl"
              sizes="235px"
              priority={stepNumber === 1}
            />
          </div>
        </div>
      )}

      {/* Content - aligned with top of image */}
      <div className="flex-1 flex flex-col pt-0">
        {/* Step Number Badge */}
        <div className="flex items-start gap-3 mb-3">
          <span
            className={cn(
              "inline-flex items-center justify-center",
              "w-10 h-10 rounded-full",
              "bg-primary text-white",
              "text-lg font-bold",
              "flex-shrink-0"
            )}
            aria-label={`Step ${stepNumber}`}
          >
            {stepNumber}
          </span>
          <h3 className="text-lg md:text-xl font-semibold text-gray-900 leading-tight pt-2">
            {step.heading}
          </h3>
        </div>

        {/* Description */}
        <div
          className="text-sm md:text-base text-gray-600 leading-relaxed [&>p]:mb-3 [&>p:last-child]:mb-0"
          dangerouslySetInnerHTML={{ __html: step.copy }}
        />
      </div>
    </article>
  );
}
