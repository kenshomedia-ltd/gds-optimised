// src/components/author/AuthorBio/AuthorBio.tsx

import Link from "next/link";
import { Image } from "@/components/common/Image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faLinkedin,
  faTwitter,
  faFacebook,
} from "@awesome.me/kit-0e07a43543/icons/classic/brands";
import type { AuthorBioProps } from "@/types/author.types";
import { cn } from "@/lib/utils/cn";

/**
 * AuthorBio Component
 *
 * Displays author information in the hero section
 * Similar to AuthorBox but with different layout for hero
 */
export function AuthorBio({
  author,
  className,
  translations = {},
}: AuthorBioProps) {
  const authorName = `${author.firstName} ${author.lastName}`;
  const authorBio = author.bio || author.content1 || "";

  return (
    <div className={cn("w-full", className)}>
      <div className="flex flex-col lg:flex-row items-center lg:items-start gap-8 lg:gap-12">
        {/* Author Photo */}
        <div className="flex-shrink-0">
          {author.photo?.url ? (
            <Image
              src={author.photo.url}
              alt={author.photo.alternativeText || authorName}
              width={180}
              height={180}
              className="w-40 h-40 lg:w-48 lg:h-48 rounded-full object-cover ring-4 ring-white shadow-2xl"
              quality={90}
              priority
            />
          ) : (
            <div className="w-40 h-40 lg:w-48 lg:h-48 rounded-full bg-gray-200 flex items-center justify-center ring-4 ring-white shadow-2xl">
              <span className="text-5xl text-gray-400">
                {author.firstName[0]}
                {author.lastName[0]}
              </span>
            </div>
          )}
        </div>

        {/* Author Info */}
        <div className="flex-1 text-center lg:text-left">
          {/* Name and Social Links Row */}
          <div className="flex flex-col lg:flex-row lg:items-center gap-4 mb-6">
            <h1 className="text-4xl lg:text-5xl font-heading font-bold text-white">
              {authorName}
            </h1>

            {/* Social Links */}
            {(author.linkedInLink ||
              author.twitterLink ||
              author.facebookLink) && (
              <div className="flex gap-2 justify-center lg:justify-start">
                {author.linkedInLink && (
                  <Link
                    href={author.linkedInLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/20 transition-all duration-200"
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
                    className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/20 transition-all duration-200"
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
                    className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/20 transition-all duration-200"
                    aria-label={`${authorName} Facebook profile`}
                  >
                    <FontAwesomeIcon icon={faFacebook} className="w-5 h-5" />
                  </Link>
                )}
              </div>
            )}
          </div>

          {/* Professional Details */}
          <div className="flex flex-wrap justify-center lg:justify-start gap-3 mb-6">
            {author.jobTitle && (
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm text-white rounded-full text-sm">
                <span className="text-white/70">
                  {translations.role || "Ruolo"}:
                </span>
                <span className="font-medium">{author.jobTitle}</span>
              </span>
            )}
            {author.experience && (
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm text-white rounded-full text-sm">
                <span className="text-white/70">
                  {translations.experience || "Esperienza"}:
                </span>
                <span className="font-medium">{author.experience}</span>
              </span>
            )}
            {author.specialization && (
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm text-white rounded-full text-sm">
                <span className="text-white/70">
                  {translations.specialization || "Specializzazione"}:
                </span>
                <span className="font-medium">{author.specialization}</span>
              </span>
            )}
          </div>

          {/* Bio */}
          {authorBio && (
            <div
              className="text-white/90 text-lg leading-relaxed prose prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: authorBio }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
