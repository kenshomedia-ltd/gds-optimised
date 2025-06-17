// src/components/widgets/HowTo/HowToServer.tsx
import { Image } from "@/components/common/Image";
import type { HowToGroupBlock } from "@/types/dynamic-block.types";
import type { TranslationData } from "@/types/strapi.types";

interface HowToServerProps {
  block: HowToGroupBlock;
  translations?: TranslationData;
}

/**
 * HowToServer Component
 *
 * Server-side rendered version without interactivity
 * Progressive enhancement handled by client component
 */
export function HowToServer({ block }: HowToServerProps) {
  if (!block.howToGroup || block.howToGroup.length === 0) {
    return null;
  }

  const steps = block.howToGroup;

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

        {/* All Steps Visible (No JS) */}
        <div className="flex flex-col gap-6 max-w-4xl mx-auto">
          {steps.map((step, index) => (
            <div key={step.id} className="bg-gray-50 rounded-2xl p-4 shadow-lg">
              {/* Step content without interactivity */}
              <article className="flex flex-col md:flex-row md:items-start md:gap-5 lg:gap-6 h-full">
                {step.image?.url && (
                  <div className="mb-4 md:mb-0 flex-shrink-0">
                    <div className="relative w-[235px] h-[235px] mx-auto md:mx-0 rounded-2xl overflow-hidden bg-white shadow-inner">
                      <Image
                        src={step.image.url}
                        alt={
                          step.image.alternativeText ||
                          `Step ${index + 1}: ${step.heading}`
                        }
                        width={235}
                        height={235}
                        className="w-full h-full object-contain rounded-2xl"
                        sizes="235px"
                        priority={index === 0}
                      />
                    </div>
                  </div>
                )}

                <div className="flex-1 flex flex-col pt-0">
                  <div className="flex items-start gap-3 mb-3">
                    <span
                      className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-primary text-white text-lg font-bold flex-shrink-0"
                      aria-label={`Step ${index + 1}`}
                    >
                      {index + 1}
                    </span>
                    <h3 className="text-lg md:text-xl font-semibold text-gray-900 leading-tight pt-2">
                      {step.heading}
                    </h3>
                  </div>

                  <div
                    className="text-sm md:text-base text-gray-600 leading-relaxed [&>p]:mb-3 [&>p:last-child]:mb-0"
                    dangerouslySetInnerHTML={{ __html: step.copy }}
                  />
                </div>
              </article>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
