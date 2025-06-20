// src/app/blog/page.tsx

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
  searchParams?: {
    page?: string;
  };
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
  // Get page number from search params
  const currentPage = Number(searchParams?.page) || 1;
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

  // Breadcrumbs
  const breadcrumbs = [
    { label: "Home", url: "/" },
    { label: "Blog", url: "/blog" },
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
                  "px-4 py-2 rounded-lg",
                  "bg-gray-100 hover:bg-gray-200",
                  "text-gray-700 font-medium",
                  "transition-colors",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                )}
                aria-label="Previous page"
              >
                Previous
              </Link>
            )}

            {/* Page Numbers */}
            <div className="flex items-center gap-1">
              {Array.from(
                { length: pagination.pageCount },
                (_, i) => i + 1
              ).map((pageNum) => {
                // Show first page, last page, current page, and pages around current
                const showPage =
                  pageNum === 1 ||
                  pageNum === pagination.pageCount ||
                  Math.abs(pageNum - currentPage) <= 1;

                if (!showPage && pageNum === currentPage - 2) {
                  return (
                    <span key={pageNum} className="px-2">
                      ...
                    </span>
                  );
                }

                if (!showPage) {
                  return null;
                }

                return (
                  <Link
                    key={pageNum}
                    href={pageNum === 1 ? "/blog" : `/blog?page=${pageNum}`}
                    className={cn(
                      "px-4 py-2 rounded-lg font-medium",
                      "transition-colors",
                      "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                      pageNum === currentPage
                        ? "bg-primary text-white"
                        : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                    )}
                    aria-label={`Page ${pageNum}`}
                    aria-current={pageNum === currentPage ? "page" : undefined}
                  >
                    {pageNum}
                  </Link>
                );
              })}
            </div>

            {/* Next Page */}
            {currentPage < pagination.pageCount && (
              <Link
                href={`/blog?page=${currentPage + 1}`}
                className={cn(
                  "px-4 py-2 rounded-lg",
                  "bg-gray-100 hover:bg-gray-200",
                  "text-gray-700 font-medium",
                  "transition-colors",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                )}
                aria-label="Next page"
              >
                Next
              </Link>
            )}
          </nav>
        )}

        {/* Page Info */}
        <div className="text-center mt-8 text-sm text-gray-600">
          Showing {(currentPage - 1) * pageSize + 1} -{" "}
          {Math.min(currentPage * pageSize, pagination.total)} of{" "}
          {pagination.total} articles
        </div>
      </section>
    </>
  );
}
