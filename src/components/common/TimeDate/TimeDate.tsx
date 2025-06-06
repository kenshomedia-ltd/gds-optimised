// src/components/common/TimeDate/TimeDate.tsx
"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendar } from "@awesome.me/kit-0e07a43543/icons/duotone/light";

interface TimeDateProps {
  timeDate: string | Date;
  translations?: Record<string, string>;
  className?: string;
}

/**
 * TimeDate Component
 *
 * Displays formatted date with icon
 * Features:
 * - Locale-aware date formatting
 * - Semantic HTML time element
 * - Accessible date representation
 */
export function TimeDate({
  timeDate,
  translations = {},
  className,
}: TimeDateProps) {
  const date = new Date(timeDate);
  const formattedDate = new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);

  return (
    <time
      dateTime={date.toISOString()}
      className={`flex items-center gap-2 text-sm text-gray-400 ${
        className || ""
      }`}
    >
      <FontAwesomeIcon icon={faCalendar} className="h-4 w-4" />
      <span>{formattedDate}</span>
    </time>
  );
}
