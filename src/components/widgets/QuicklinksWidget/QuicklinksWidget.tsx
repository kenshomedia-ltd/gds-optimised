// src/components/widgets/QuicklinksWidget/QuicklinksWidget.tsx
"use client";

import { QuicklinksCollapsible } from "@/components/ui/QuicklinksCollapsible";
import type { QuicklinksBlock } from "@/types/dynamic-block.types";

interface QuicklinksWidgetProps {
  block: QuicklinksBlock;
}

/**
 * QuicklinksWidget Component
 *
 * Renders the quicklinks collapsible component based on the showQuickLinks flag
 */
export function QuicklinksWidget({ block }: QuicklinksWidgetProps) {
  // Only render if showQuickLinks is true
  if (!block.showQuickLinks) {
    return null;
  }

  return (
    <QuicklinksCollapsible
      id="page-quicklinks"
      label="Link Rapidi"
      defaultOpen={true}
      containerClass="mb-8"
    />
  );
}
