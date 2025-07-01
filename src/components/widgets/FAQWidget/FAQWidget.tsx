// src/components/widgets/FAQWidget/FAQWidget.tsx
"use client";

import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faMinus,
} from "@awesome.me/kit-0e07a43543/icons/duotone/light";
import { cn } from "@/lib/utils/cn";
import type { FAQ } from "@/types/game-page.types";

interface FAQWidgetProps {
  faqs: FAQ[];
  title?: string;
  className?: string;
  defaultOpen?: boolean;
}

/**
 * FAQWidget Component
 *
 * Displays FAQs using collapsible items without container
 * Features:
 * - No containing box - direct collapsible items
 * - Can be open by default
 * - Smooth expand/collapse animations
 * - Accessible with ARIA attributes
 * - Mobile-friendly
 */
export function FAQWidget({
  faqs,
  title = "Frequently Asked Questions",
  className,
  defaultOpen = true,
}: FAQWidgetProps) {
  // Initialize all items as open if defaultOpen is true
  const initialOpenState = defaultOpen
    ? new Set(faqs.map((faq) => faq.id))
    : new Set<number>();

  const [openItems, setOpenItems] = useState<Set<number>>(initialOpenState);

  const toggleItem = (id: number) => {
    const newOpenItems = new Set(openItems);
    if (newOpenItems.has(id)) {
      newOpenItems.delete(id);
    } else {
      newOpenItems.add(id);
    }
    setOpenItems(newOpenItems);
  };

  if (!faqs || faqs.length === 0) {
    return null;
  }

  return (
    <section
      className={cn(
        "opacity-0 animate-[fadeIn_0.6s_ease-out_700ms_forwards]",
        className
      )}
      style={{ animationDelay: "700ms" }}
      id="game-faqs"
    >
      {/* Title */}
      {title && (
        <h2 className="text-2xl md:text-3xl font-bold text-heading-text mb-8">
          {title}
        </h2>
      )}

      {/* FAQs - No container, direct collapsibles */}
      <div className="space-y-4">
        {faqs.map((faq) => {
          const isOpen = openItems.has(faq.id);

          return (
            <div key={faq.id} className="w-full">
              <button
                type="button"
                onClick={() => toggleItem(faq.id)}
                className={cn(
                  "flex items-center justify-between w-full text-left p-4",
                  "bg-gray-900 text-white transition-colors",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                  isOpen ? "rounded-t-lg" : "rounded-lg"
                )}
                aria-expanded={isOpen}
                aria-controls={`faq-${faq.id}`}
              >
                <span className="font-semibold pr-4 text-lg">
                  {faq.question}
                </span>
                <FontAwesomeIcon
                  icon={isOpen ? faMinus : faPlus}
                  className="w-5 h-5 text-white flex-shrink-0"
                />
              </button>

              <div
                id={`faq-${faq.id}`}
                className={cn(
                  "overflow-hidden transition-all duration-300",
                  isOpen ? "max-h-96" : "max-h-0"
                )}
              >
                <div
                  className="p-4 text-gray-700 bg-gray-100 rounded-b-lg"
                  dangerouslySetInnerHTML={{ __html: faq.answer }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
