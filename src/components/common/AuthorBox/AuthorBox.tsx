// src/components/common/AuthorBox/AuthorBox.tsx
"use client";

import Link from "next/link";
import { Image } from "@/components/common/Image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faLinkedin,
  faTwitter,
  faFacebook,
} from "@awesome.me/kit-0e07a43543/icons/classic/brands";
import type { Author } from "@/types/strapi.types";
import { cn } from "@/lib/utils/cn";

interface AuthorBoxProps {
  author: Author;
  className?: string;
}

/**
 * AuthorBox Component
 *
 * Displays author information in a card format
 * Features:
 * - Responsive design (mobile/desktop)
 * - Author photo with fallback
 * - Social media links
 * - Professional details
 * - Accessible markup
 */
export function AuthorBox({ author, className }: AuthorBoxProps) {
  const authorName = `${author.firstName} ${author.lastName}`;

  // Format content if it contains HTML
  const authorBio = author.content1 || "";

  return (
    <div
      className={cn(
        "bg-white rounded-2xl shadow-lg overflow-hidden",
        "border border-gray-200",
        className
      )}
    >
      {/* Desktop and Mobile Layout */}
      <div className="p-6 md:p-8">
        {/* Mobile: Centered layout */}
        <div className="flex flex-col items-center text-center md:hidden">
          {/* Author Photo */}
          {author.photo?.url ? (
            <Image
              src={author.photo.url}
              alt={author.photo.alternativeText || authorName}
              width={author.photo.width || 120}
              height={author.photo.height || 120}
              className="w-32 h-32 rounded-2xl object-cover mb-4"
              quality={90}
            />
          ) : (
            <div className="w-32 h-32 rounded-2xl bg-gray-200 flex items-center justify-center mb-4">
              <span className="text-4xl text-gray-400">
                {author.firstName[0]}
                {author.lastName[0]}
              </span>
            </div>
          )}

          {/* Social Links - Mobile */}
          {(author.linkedInLink ||
            author.twitterLink ||
            author.facebookLink) && (
            <div className="flex gap-2 mb-4">
              {author.linkedInLink && (
                <Link
                  href={author.linkedInLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-linkedin flex items-center justify-center text-white hover:opacity-90 transition-opacity"
                  aria-label={`${authorName} LinkedIn profile`}
                >
                  <FontAwesomeIcon icon={faLinkedin} className="w-5 h-5" />
                </Link>
              )}
              {author.twitterLink && (
                <Link
                  href={author.twitterLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-twitter flex items-center justify-center text-white hover:opacity-90 transition-opacity"
                  aria-label={`${authorName} Twitter profile`}
                >
                  <FontAwesomeIcon icon={faTwitter} className="w-5 h-5" />
                </Link>
              )}
              {author.facebookLink && (
                <Link
                  href={author.facebookLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-facebook flex items-center justify-center text-white hover:opacity-90 transition-opacity"
                  aria-label={`${authorName} Facebook profile`}
                >
                  <FontAwesomeIcon icon={faFacebook} className="w-5 h-5" />
                </Link>
              )}
            </div>
          )}

          {/* Author Name */}
          <h3 className="text-2xl font-heading font-bold text-gray-900 mb-4">
            {authorName}
          </h3>

          {/* Professional Details - Mobile */}
          <div className="flex flex-wrap justify-center gap-2 mb-4">
            {author.jobTitle && (
              <span className="inline-block px-3 py-1 bg-gray-100 text-gray-700 rounded-md text-sm">
                Ruolo: {author.jobTitle}
              </span>
            )}
            {author.experience && (
              <span className="inline-block px-3 py-1 bg-gray-100 text-gray-700 rounded-md text-sm">
                Esperienza: {author.experience}
              </span>
            )}
            {author.specialization && (
              <span className="inline-block px-3 py-1 bg-gray-100 text-gray-700 rounded-md text-sm max-w-full">
                Specializzazione: {author.specialization}
              </span>
            )}
          </div>

          {/* Bio */}
          {authorBio && (
            <div
              className="text-gray-600 text-base leading-relaxed"
              dangerouslySetInnerHTML={{ __html: authorBio }}
            />
          )}
        </div>

        {/* Desktop: Side-by-side layout */}
        <div className="hidden md:flex md:gap-8">
          {/* Left Column: Photo and Social */}
          <div className="flex-shrink-0">
            {author.photo?.url ? (
              <Image
                src={author.photo.url}
                alt={author.photo.alternativeText || authorName}
                width={author.photo.width || 150}
                height={author.photo.height || 150}
                className="w-36 h-36 rounded-2xl object-cover mb-4"
                quality={90}
              />
            ) : (
              <div className="w-36 h-36 rounded-2xl bg-gray-200 flex items-center justify-center mb-4">
                <span className="text-4xl text-gray-400">
                  {author.firstName[0]}
                  {author.lastName[0]}
                </span>
              </div>
            )}

            {/* Social Links - Desktop */}
            {(author.linkedInLink ||
              author.twitterLink ||
              author.facebookLink) && (
              <div className="flex gap-2 justify-center">
                {author.linkedInLink && (
                  <Link
                    href={author.linkedInLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full bg-linkedin flex items-center justify-center text-white hover:opacity-90 transition-opacity"
                    aria-label={`${authorName} LinkedIn profile`}
                  >
                    <FontAwesomeIcon icon={faLinkedin} className="w-5 h-5" />
                  </Link>
                )}
                {author.twitterLink && (
                  <Link
                    href={author.twitterLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full bg-twitter flex items-center justify-center text-white hover:opacity-90 transition-opacity"
                    aria-label={`${authorName} Twitter profile`}
                  >
                    <FontAwesomeIcon icon={faTwitter} className="w-5 h-5" />
                  </Link>
                )}
                {author.facebookLink && (
                  <Link
                    href={author.facebookLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full bg-facebook flex items-center justify-center text-white hover:opacity-90 transition-opacity"
                    aria-label={`${authorName} Facebook profile`}
                  >
                    <FontAwesomeIcon icon={faFacebook} className="w-5 h-5" />
                  </Link>
                )}
              </div>
            )}
          </div>

          {/* Right Column: Content */}
          <div className="flex-1">
            {/* Author Name */}
            <h3 className="text-3xl font-heading font-bold text-gray-900 mb-4">
              {authorName}
            </h3>

            {/* Professional Details - Desktop */}
            <div className="flex flex-wrap gap-4 mb-6">
              {author.jobTitle && (
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">Ruolo:</span>
                  <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md">
                    {author.jobTitle}
                  </span>
                </div>
              )}
              {author.experience && (
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">Esperienza:</span>
                  <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md">
                    {author.experience}
                  </span>
                </div>
              )}
              {author.specialization && (
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">Specializzazione:</span>
                  <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md">
                    {author.specialization}
                  </span>
                </div>
              )}
            </div>

            {/* Bio */}
            {authorBio && (
              <div
                className="text-gray-600 text-base leading-relaxed prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: authorBio }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
