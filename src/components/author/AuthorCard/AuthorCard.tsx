// src/components/author/AuthorCard/AuthorCard.tsx

import Link from "next/link";
import { Image } from "@/components/common/Image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faLinkedin,
  faTwitter,
  faFacebook,
} from "@awesome.me/kit-0e07a43543/icons/classic/brands";
import type { AuthorCardData } from "@/types/author.types";
import { cn } from "@/lib/utils/cn";

interface AuthorCardProps {
  author: AuthorCardData;
  translations?: Record<string, string>;
  className?: string;
}

/**
 * AuthorCard Component
 *
 * Displays author information in a card format for listings
 * Features:
 * - Responsive design
 * - Author photo with fallback
 * - Social media links
 * - Hover effects
 */
export function AuthorCard({ author, className }: AuthorCardProps) {
  const authorName = `${author.firstName} ${author.lastName}`;
  // Generate URL as firstname.lastname
  const authorSlug = `${author.firstName.toLowerCase()}.${author.lastName.toLowerCase()}`;
  const authorBio = author.content1 || "";

  // Strip HTML and truncate bio for card display
  const plainTextBio = authorBio.replace(/<[^>]*>/g, "");
  const truncatedBio =
    plainTextBio.length > 150
      ? plainTextBio.substring(0, 150) + "..."
      : plainTextBio;

  return (
    <article
      className={cn(
        "bg-white rounded-2xl shadow-lg overflow-hidden",
        "border border-gray-200 hover:shadow-xl transition-shadow duration-300",
        "flex flex-col h-full",
        className
      )}
    >
      <Link
        href={`/author/${authorSlug}`}
        className="block p-6 flex-1 flex flex-col"
      >
        {/* Author Photo and Name */}
        <div className="flex items-center gap-4 mb-4">
          {author.photo?.url ? (
            <Image
              src={author.photo.url}
              alt={author.photo.alternativeText || authorName}
              width={80}
              height={80}
              className="w-20 h-20 rounded-full object-cover ring-2 ring-gray-100"
              quality={85}
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center ring-2 ring-gray-100">
              <span className="text-2xl text-gray-400 font-medium">
                {author.firstName[0]}
                {author.lastName[0]}
              </span>
            </div>
          )}

          <div className="flex-1">
            <h3 className="text-xl font-heading font-bold text-gray-900 hover:text-primary transition-colors">
              {authorName}
            </h3>
            {author.jobTitle && (
              <p className="text-sm text-gray-600 mt-1">{author.jobTitle}</p>
            )}
          </div>
        </div>

        {/* Bio */}
        {truncatedBio && (
          <p className="text-gray-600 text-sm leading-relaxed mb-4 flex-1">
            {truncatedBio}
          </p>
        )}
      </Link>

      {/* Social Links */}
      {(author.linkedInLink || author.twitterLink || author.facebookLink) && (
        <div className="px-6 pb-6 pt-2 border-t border-gray-100">
          <div className="flex gap-2">
            {author.linkedInLink && (
              <Link
                href={author.linkedInLink}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-linkedin/10 flex items-center justify-center text-linkedin hover:bg-linkedin hover:text-white transition-all duration-200"
                aria-label={`${authorName} LinkedIn profile`}
              >
                <FontAwesomeIcon icon={faLinkedin} className="w-4 h-4" />
              </Link>
            )}
            {author.twitterLink && (
              <Link
                href={author.twitterLink}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-twitter/10 flex items-center justify-center text-twitter hover:bg-twitter hover:text-white transition-all duration-200"
                aria-label={`${authorName} Twitter profile`}
              >
                <FontAwesomeIcon icon={faTwitter} className="w-4 h-4" />
              </Link>
            )}
            {author.facebookLink && (
              <Link
                href={author.facebookLink}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-facebook/10 flex items-center justify-center text-facebook hover:bg-facebook hover:text-white transition-all duration-200"
                aria-label={`${authorName} Facebook profile`}
              >
                <FontAwesomeIcon icon={faFacebook} className="w-4 h-4" />
              </Link>
            )}
          </div>
        </div>
      )}
    </article>
  );
}
