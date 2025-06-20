// src/app/blog/page.tsx

import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import { getBlogIndexData } from "@/lib/strapi/blog-data-loader";
import { getLayoutData } from "@/lib/strapi/data-loader";
import { generateMetadata as generateSEOMetadata } from "@/lib/utils/seo";
import { BlogFeatured } from "@/components/blog/BlogFeatured/BlogFeatured";
import { BlogList } from "@/components/blog/BlogList/BlogList";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { cn } from "@/lib/utils/cn";

// Force static generation with ISR
export const dynamic = "force-static";
export const revalidate = 300; // 5 minutes

interface BlogIndexPageProps {
  searchParams?: Promise<{
    page?: string;
  }>;
}

// Generate metadata for SEO
export async function generateMetadata(): Promise<Metadata> {
  const layoutData = await getLayoutData({ cached: true });
  const { translations } = layoutData;

  return generateSEOMetadata({
    title: translations?.blogPageTitle || "Blog",
    description:
      translations?.blogPageDescription || "Latest articles and insights",
    canonicalUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/blog`,
  });
}

export default async function BlogIndexPage({
  searchParams,
}: BlogIndexPageProps) {
  // Await searchParams if it's a Promise
  const params = searchParams ? await searchParams : undefined;
  // Get page number from search params
  const currentPage = Number(params?.page) || 1;
  const pageSize = 12; // Number of blogs per page (excluding featured)

  // Fetch data
  const [layoutData, blogData] = await Promise.all([
    getLayoutData({ cached: true }),
    getBlogIndexData(currentPage, pageSize),
  ]);

  const { translations } = layoutData;
  const { blogs, featuredBlog, pagination } = blogData;

  // Filter out featured blog from the list if on first page
  const blogList =
    currentPage === 1 && featuredBlog
      ? blogs.filter((blog) => blog.slug !== featuredBlog.slug)
      : blogs;

  // Breadcrumbs - Updated to use correct property names
  const breadcrumbs = [
    { breadCrumbText: "Home", breadCrumbUrl: "/" },
    { breadCrumbText: "Blog", breadCrumbUrl: "" }, // Empty URL for current page
  ];

  // Schema.org structured data
  const blogSchema = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: translations?.blogPageTitle || "Blog",
    description:
      translations?.blogPageDescription || "Latest articles and insights",
    url: `${process.env.NEXT_PUBLIC_SITE_URL}/blog`,
    blogPost: blogs.map((blog) => ({
      "@type": "BlogPosting",
      headline: blog.title,
      url: `${process.env.NEXT_PUBLIC_SITE_URL}/blog/${blog.slug}`,
      datePublished: blog.publishedAt || blog.createdAt,
      ...(blog.author && {
        author: {
          "@type": "Person",
          name: `${blog.author.firstName} ${blog.author.lastName}`,
        },
      }),
      ...(blog.images?.url && {
        image: blog.images.url,
      }),
    })),
  };

  return (
    <>
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogSchema) }}
      />

      {/* Breadcrumbs */}
      <Breadcrumbs items={breadcrumbs} />

      {/* Hero Section with Featured Post (only on first page) */}
      {currentPage === 1 && featuredBlog && (
        <section className="featured-header relative overflow-hidden bg-gradient-to-b from-background-900 from-30% via-background-700 via-80% to-background-500 rounded-b-3xl">
          <div className="container relative mx-auto px-4 z-10 py-12">
            <BlogFeatured blog={featuredBlog} />
          </div>

          {/* Starry Sky Background Effect */}
          <div className="absolute top-0 left-0 w-full pointer-events-none">
            <div className="h-[80vh] bg-[#0e1a2f]" />
            <div className="h-[300px] bg-[#0e1a2f] rounded-b-[50%_300px]" />
          </div>
        </section>
      )}

      {/* Main Content Section */}
      <section className="main container mx-auto px-4 py-12">
        {/* Page Title (shown on pages other than first) */}
        {currentPage > 1 && (
          <h1 className="text-4xl font-bold mb-8">
            {translations?.blogPageTitle || "Blog"} - Page {currentPage}
          </h1>
        )}

        {/* Blog List */}
        {blogList.length > 0 ? (
          <BlogList blogs={blogList} translations={translations} />
        ) : (
          <div className="text-center py-12">
            <p className="text-lg text-gray-600">No articles found.</p>
          </div>
        )}

        {/* Pagination */}
        {pagination.pageCount > 1 && (
          <nav
            className="flex justify-center items-center gap-2 mt-12"
            aria-label="Blog pagination"
          >
            {/* Previous Page */}
            {currentPage > 1 && (
              <Link
                href={
                  currentPage === 2 ? "/blog" : `/blog?page=${currentPage - 1}`
                }
                className={cn(
                  "px-4 py-2 rounded-lg font-medium",
                  "bg-primary text-white",
                  "hover:bg-primary-shade transition-colors",
                  "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                )}
              >
                {translations?.previous || "Previous"}
              </Link>
            )}

            {/* Page Numbers */}
            <div className="flex items-center gap-2">
              {Array.from({ length: pagination.pageCount }, (_, i) => i + 1)
                .filter((page) => {
                  // Show first page, last page, current page, and pages adjacent to current
                  return (
                    page === 1 ||
                    page === pagination.pageCount ||
                    Math.abs(page - currentPage) <= 1
                  );
                })
                .map((page, index, array) => (
                  <React.Fragment key={page}>
                    {/* Add ellipsis if there's a gap */}
                    {index > 0 && array[index - 1] !== page - 1 && (
                      <span className="px-2 text-gray-500">...</span>
                    )}

                    {page === currentPage ? (
                      <span
                        className={cn(
                          "px-4 py-2 rounded-lg font-medium",
                          "bg-primary text-white",
                          "cursor-default"
                        )}
                        aria-current="page"
                      >
                        {page}
                      </span>
                    ) : (
                      <Link
                        href={page === 1 ? "/blog" : `/blog?page=${page}`}
                        className={cn(
                          "px-4 py-2 rounded-lg font-medium",
                          "bg-gray-200 text-gray-700",
                          "hover:bg-gray-300 transition-colors",
                          "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                        )}
                      >
                        {page}
                      </Link>
                    )}
                  </React.Fragment>
                ))}
            </div>

            {/* Next Page */}
            {currentPage < pagination.pageCount && (
              <Link
                href={`/blog?page=${currentPage + 1}`}
                className={cn(
                  "px-4 py-2 rounded-lg font-medium",
                  "bg-primary text-white",
                  "hover:bg-primary-shade transition-colors",
                  "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                )}
              >
                {translations?.next || "Next"}
              </Link>
            )}
          </nav>
        )}
      </section>
    </>
  );
}
