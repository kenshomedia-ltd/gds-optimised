// src/components/casino/CasinoHero/CasinoTestimonial.tsx

import Link from "next/link";
import { Image } from "@/components/common/Image";
import { StarRatingServer } from "@/components/ui/StarRating";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faQuoteLeft } from "@awesome.me/kit-0e07a43543/icons/duotone/solid";
import type { CasinoPageData } from "@/types/casino-page.types";

interface CasinoTestimonialProps {
  casino: CasinoPageData;
  translations: Record<string, string>;
}

export function CasinoTestimonial({
  casino,
  translations,
}: CasinoTestimonialProps) {
  if (!casino.testimonial || !casino.author) return null;

  // Clean testimonial text from HTML
  const testimonialCleaned =
    casino.testimonial.testimonial?.replace(/(<([^>]+)>)/gi, "") || "";

  // Generate author URLs
  const siteId = process.env.NEXT_PUBLIC_SITE_ID || "default";
  const authorPagePath = process.env.NEXT_PUBLIC_AUTHOR_PAGE_PATH || "/author";

  const reviewAuthorPageURL = casino.author
    ? `${
        siteId === "it" ? "/it" : ""
      }${authorPagePath}/${casino.author.firstName?.toLowerCase()}.${casino.author.lastName?.toLowerCase()}/`
    : "#";

  const approvedAuthorPageURL = casino.testimonial.approvedBy
    ? `${
        siteId === "it" ? "/it" : ""
      }${authorPagePath}/${casino.testimonial.approvedBy.firstName?.toLowerCase()}.${casino.testimonial.approvedBy.lastName?.toLowerCase()}/`
    : "#";

  return (
    <div className="testimonial-wrapper bg-[#eef4f9] rounded-lg mt-5">
      <div className="casino-detail-testimonial p-3">
        <div className="flex flex-col justify-evenly">
          {/* Authors Section */}
          <div className="flex justify-between">
            <div className="flex testimonial_author w-full justify-around md:justify-start">
              {/* Review Author */}
              <div className="approval-author mr-10 flex flex-col md:flex-row items-center">
                <div className="review_author_img mr-2 w-[60px] h-[60px] flex-shrink-0">
                  <Image
                    src={casino.author?.photo?.url || ""}
                    alt="Reviewer Image"
                    width={60}
                    height={60}
                    className="rounded-full"
                  />
                </div>
                <div className="flex flex-col details-container">
                  <div className="approval-author-details flex flex-col items-center md:items-start text-xs">
                    <span className="text-gray-600">
                      {translations.reviewedBy || "Reviewed by"}
                    </span>
                    <Link
                      href={reviewAuthorPageURL}
                      className="font-semibold text-primary hover:underline"
                    >
                      {casino.author.firstName} {casino.author.lastName}
                    </Link>
                    <span className="text-gray-600">
                      {casino.author.jobTitle}
                    </span>
                  </div>
                </div>
              </div>

              {/* Approved By Author */}
              {casino.testimonial.approvedBy && (
                <div className="approval-author flex flex-col md:flex-row items-center">
                  <div className="review_author_img mr-2 w-[60px] h-[60px] flex-shrink-0">
                    <Image
                      src={casino.testimonial.approvedBy.photo?.url || ""}
                      alt="Approver image"
                      width={60}
                      height={60}
                      className="rounded-full"
                    />
                  </div>
                  <div className="flex flex-col details-container">
                    <div className="approval-author-details flex flex-col items-center md:items-start text-xs">
                      <span className="text-gray-600">
                        {translations.approvedBy || "Approved by"}
                      </span>
                      <Link
                        href={approvedAuthorPageURL}
                        className="font-semibold text-primary hover:underline"
                      >
                        {casino.testimonial.approvedBy.firstName}{" "}
                        {casino.testimonial.approvedBy.lastName}
                      </Link>
                      <span className="text-gray-600">
                        {casino.testimonial.approvedBy.jobTitle}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Desktop Logo */}
            <div className="hidden md:block">
              <Image
                src="/images/adm-icons.svg"
                alt="ADM Icons"
                width={250}
                height={50}
                isLocal={true}
                priority
              />
            </div>
          </div>

          {/* Author Rating */}
          {casino.authorRatings && (
            <div className="mt-3 mb-10 flex justify-start">
              <StarRatingServer
                rating={casino.authorRatings}
                maxRating={5}
                size="md"
                showValue={true}
                showCount={false}
              />
            </div>
          )}

          {/* Testimonial Quote */}
          <blockquote className="testimonial relative">
            <FontAwesomeIcon
              icon={faQuoteLeft}
              className="absolute -top-2 left-0 w-8 h-8 text-gray-300 opacity-40"
            />
            <p className="italic text-gray-700 text-[15px] pl-12 pt-4">
              {testimonialCleaned}
            </p>
          </blockquote>
        </div>
      </div>
    </div>
  );
}
