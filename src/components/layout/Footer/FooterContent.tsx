// src/components/layout/Footer/FooterContent.tsx
"use client";

import { useEffect, useRef } from "react";
import DOMPurify from "isomorphic-dompurify";

interface FooterContentProps {
  content: string;
  className?: string;
}

/**
 * Footer Content Component
 *
 * Features:
 * - Safely renders HTML content with DOMPurify
 * - Applies proper styling to rendered content
 * - Handles heading colors and spacing
 * - Performance optimized with memoization
 */
export function FooterContent({ content, className = "" }: FooterContentProps) {
  const contentRef = useRef<HTMLDivElement>(null);

  // Sanitize content for security
  const sanitizedContent = DOMPurify.sanitize(content, {
    ADD_TAGS: ["style"],
    ADD_ATTR: ["target", "rel"],
  });

  // Apply styles to rendered content
  useEffect(() => {
    if (!contentRef.current) return;

    // Style all h4 elements in the footer content
    const headings = contentRef.current.querySelectorAll("h4");
    headings.forEach((heading) => {
      heading.classList.add("text-white", "mb-2");
    });

    // Style paragraphs
    const paragraphs = contentRef.current.querySelectorAll("p");
    paragraphs.forEach((p) => {
      p.classList.add("text-sm", "leading-relaxed");
    });

    // Style links
    const links = contentRef.current.querySelectorAll("a");
    links.forEach((link) => {
      link.classList.add(
        "hover:underline",
        "focus:outline-none",
        "focus-visible:ring-2",
        "focus-visible:ring-white",
        "focus-visible:ring-opacity-75",
        "rounded"
      );
      // Ensure external links open in new tab
      if (link.href && !link.href.includes(window.location.hostname)) {
        link.setAttribute("target", "_blank");
        link.setAttribute("rel", "noopener noreferrer");
      }
    });
  }, [sanitizedContent]);

  return (
    <div
      ref={contentRef}
      className={`about-site place-items-start text-left text-footer-text ${className}`}
      dangerouslySetInnerHTML={{ __html: sanitizedContent }}
    />
  );
}
