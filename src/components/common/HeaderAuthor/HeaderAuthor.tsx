// src/components/common/HeaderAuthor/HeaderAuthor.tsx
"use client";

import Link from "next/link";
import { Image } from "@/components/common/Image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser } from "@awesome.me/kit-0e07a43543/icons/duotone/light";
import type { StrapiImage } from "@/types/strapi.types";

interface HeaderAuthorProps {
  author: {
    id: number | string;
    firstName: string;
    lastName: string;
    slug?: string;
    photo?: StrapiImage;
  };
  translations?: Record<string, string>;
  className?: string;
}

/**
 * HeaderAuthor Component
 *
 * Displays author information with avatar
 * Features:
 * - Optimized avatar image loading
 * - Fallback icon when no photo
 * - Accessible author links
 * - Hover effects
 */
export function HeaderAuthor({
  author,
  translations = {},
  className,
}: HeaderAuthorProps) {
  const authorName = `${author.firstName} ${author.lastName}`;
  const authorLink = author.slug ? `/author/${author.slug}` : null;

  const content = (
    <>
      {author.photo?.url ? (
        <Image
          src={author.photo.url}
          alt={author.photo.alternativeText || authorName}
          width={24}
          height={24}
          className="w-6 h-6 rounded-full object-cover"
          quality={85}
        />
      ) : (
        <FontAwesomeIcon icon={faUser} className="h-4 w-4" />
      )}
      <span className="hover:underline">{authorName}</span>
    </>
  );

  if (authorLink) {
    return (
      <Link
        href={authorLink}
        className={`flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors ${
          className || ""
        }`}
        aria-label={`${
          translations.viewAuthorProfile || "View author profile"
        }: ${authorName}`}
      >
        {content}
      </Link>
    );
  }

  return (
    <div
      className={`flex items-center gap-2 text-sm text-gray-400 ${
        className || ""
      }`}
    >
      {content}
    </div>
  );
}
