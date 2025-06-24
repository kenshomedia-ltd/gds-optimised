// src/components/common/SingleContent/SingleContent.tsx
"use client";

import { useMemo } from "react";
import DOMPurify from "isomorphic-dompurify";
import { SingleContentSkeleton } from "./SingleContentSkeleton";
import type { SingleContentProps } from "@/types/single-content.types";
import { cn } from "@/lib/utils/cn";

/**
 * SingleContent Component
 *
 * Renders sanitized HTML content with proper styling
 * Features:
 * - XSS protection with DOMPurify
 * - Tailwind Typography styling
 * - Image optimization
 * - SEO structured data
 * - Performance optimizations
 * - Accessibility compliant
 * - Print-friendly styling
 */
export function SingleContent({
  block,
  loading = false,
  className,
  priority = false,
}: SingleContentProps) {
  // Sanitize and process content
  const { processedContent, textPreview } = useMemo(() => {
    if (!block?.content) {
      return { sanitizedContent: "", processedContent: "", textPreview: "" };
    }

    // Sanitize HTML content for security
    const sanitized = DOMPurify.sanitize(block.content, {
      ADD_TAGS: ["style"],
      ADD_ATTR: ["target", "rel", "loading", "decoding"],
      FORBID_TAGS: ["script", "iframe", "object", "embed", "form"],
      FORBID_ATTR: ["onerror", "onload", "onclick", "onmouseover"],
    });

    // Process content to add optimizations
    const processed = sanitized
      // Add lazy loading to images
      .replace(/<img([^>]*)>/gi, (match, attrs) => {
        // Check if loading attribute already exists
        if (attrs.includes("loading=")) return match;
        return `<img${attrs} loading="${
          priority ? "eager" : "lazy"
        }" decoding="async">`;
      })
      // Add rel="noopener noreferrer" to external links
      .replace(
        /<a([^>]*href=["']https?:\/\/[^"']*["'][^>]*)>/gi,
        (match, attrs) => {
          // Check if rel attribute already exists
          if (attrs.includes("rel=")) return match;
          return `<a${attrs} rel="noopener noreferrer">`;
        }
      );

    // Extract text for preview/meta
    const text = sanitized
      .replace(/<[^>]*>/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    const preview = text.length > 160 ? text.substring(0, 160) + "..." : text;

    return {
      sanitizedContent: sanitized,
      processedContent: processed,
      textPreview: preview,
    };
  }, [block?.content, priority]);

  const hasContent = processedContent.length > 0;
  const contentId = `content-block-${block?.id || "default"}`;

  // Generate schema markup for SEO
  const schemaData = useMemo(() => {
    if (!hasContent) return null;

    return {
      "@context": "https://schema.org",
      "@type": "WebPageElement",
      "@id": `#${contentId}`,
      text: textPreview,
      ...(block?.heading && { name: block.heading }),
    };
  }, [hasContent, contentId, textPreview, block?.heading]);

  if (loading) {
    return <SingleContentSkeleton className={className} />;
  }

  if (!hasContent) {
    return null;
  }

  return (
    <section
      id={contentId}
      className={cn(
        "single-content-block",
        // Performance optimizations
        "will-change-transform",
        "[contain:layout_style_paint]",
        // Print optimization
        "print:break-inside-avoid",
        className
      )}
      aria-label={block?.heading || "Content section"}
    >
      {/* Hidden schema markup for SEO */}
      {schemaData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
        />
      )}

      {/* Optional heading */}
      {block?.heading && (
        <h2 className="text-3xl font-bold text-heading-text mb-6">
          {block.heading}
        </h2>
      )}

      {/* Main content with Tailwind Typography */}
      <div
        className={cn(
          "prose prose-lg max-w-none",

          // Table wrapper (figure) centering
          "[&_figure.table]:flex [&_figure.table]:justify-center [&_figure.table]:mx-auto",
          "[&_figure.table_table]:w-auto",

          // Headings
          "prose-headings:font-bold prose-headings:text-heading-text prose-headings:text-left prose-headings:capitalize",
          "prose-h2:text-3xl prose-h2:mt-8 prose-h2:mb-4",
          "prose-h3:text-2xl prose-h3:mt-6 prose-h3:mb-3",
          "prose-h4:text-xl prose-h4:mt-4 prose-h4:mb-2",

          // Paragraphs
          "prose-p:text-body-text prose-p:leading-relaxed prose-p:mb-4",
          "prose-p:last:mb-0",

          // Links
          "prose-a:text-primary prose-a:underline prose-a:font-medium",
          "prose-a:underline-offset-2",
          "hover:prose-a:text-primary/80 prose-a:transition-colors prose-a:duration-200",
          "focus:prose-a:outline-none focus:prose-a:ring-2 focus:prose-a:ring-primary focus:prose-a:ring-offset-2",

          // Strong/Bold text
          "prose-strong:text-heading-text prose-strong:font-semibold",

          // Lists
          "prose-ul:list-disc prose-ul:pl-6 prose-ul:my-4",
          "prose-ol:list-decimal prose-ol:pl-6 prose-ol:my-4",
          "prose-li:mb-2 prose-li:text-body-text",
          "marker:prose-li:text-primary",

          // Blockquotes
          "prose-blockquote:border-l-4 prose-blockquote:border-primary/30",
          "prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-body-text/80",
          "prose-blockquote:my-6",

          // Images
          "prose-img:rounded-lg prose-img:shadow-md prose-img:my-6",
          "prose-img:max-w-full prose-img:h-auto",

          // Tables - with center alignment
          "prose-table:border-collapse prose-table:my-6",
          "prose-thead:border-b-2 prose-thead:border-gray-300",
          "prose-th:text-center prose-th:p-3 prose-th:font-semibold prose-th:bg-table-header-bkg prose-th:text-white",
          "prose-tbody:divide-y prose-tbody:divide-gray-200",
          "prose-td:p-3 prose-td:text-body-text prose-td:text-center",
          "prose-tr:transition-colors prose-tr:bg-white hover:prose-tr:bg-gray-50",

          // Code blocks
          "prose-code:bg-gray-100 prose-code:px-1 prose-code:py-0.5",
          "prose-code:rounded prose-code:text-sm prose-code:font-mono",
          "prose-pre:bg-gray-900 prose-pre:text-gray-100",
          "prose-pre:p-4 prose-pre:rounded-lg prose-pre:overflow-x-auto",
          "prose-pre:my-6",

          // Horizontal rules
          "prose-hr:border-gray-300 prose-hr:my-8",

          // Reduced motion support
          "motion-reduce:prose-a:transition-none",
          "motion-reduce:[&_*]:!animate-none",
          "motion-reduce:[&_*]:!transition-none",

          // Print styles
          "print:prose-a:text-black print:prose-a:underline",
          "print:prose-headings:text-black",
          "print:prose-p:text-black"
        )}
        dangerouslySetInnerHTML={{ __html: processedContent }}
      />
    </section>
  );
}
