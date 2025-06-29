// src/app/author/page.tsx
import { getAuthorsData } from "@/lib/strapi/author-data-loader";
import { getLayoutData } from "@/lib/strapi/data-loader";
import { generateMetadata as generateSEOMetadata } from "@/lib/utils/seo";
import { AuthorCard } from "@/components/author/AuthorCard/AuthorCard";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { PaginationServer } from "@/components/ui/Pagination/PaginationServer";
import type { Metadata } from "next";
import type { BreadcrumbItem } from "@/types/breadcrumbs.types";

// Force static generation with ISR
export const dynamic = "force-static";
export const revalidate = 600; // 10 minutes

// Generate metadata for SEO
export async function generateMetadata(): Promise<Metadata> {
  const { translations } = await getLayoutData({ cached: true });

  return generateSEOMetadata({
    title: translations?.authorsPageTitle || "Our Authors",
    description:
      translations?.authorsPageDescription ||
      "Meet our expert team of authors and contributors",
    canonicalUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/author`,
  });
}

// Parse page from URL
function getPageFromParams(searchParams: { p?: string }): number {
  const page = searchParams.p
    ? parseInt(searchParams.p.replace("p", ""), 10)
    : 1;
  return isNaN(page) || page < 1 ? 1 : page;
}

export default async function AuthorsIndexPage({
  searchParams,
}: {
  searchParams: Promise<{ p?: string }>;
}) {
  const params = await searchParams;
  const currentPage = getPageFromParams(params);

  // Fetch data in parallel
  const [authorsData, layoutData] = await Promise.all([
    getAuthorsData(currentPage, 12),
    getLayoutData({ cached: true }),
  ]);

  const { authors, pagination } = authorsData;
  const { translations } = layoutData;

  // Breadcrumb items
  const breadcrumbItems: BreadcrumbItem[] = [
    {
      breadCrumbText: translations?.home || "HOME",
      breadCrumbUrl: "/",
    },
    {
      breadCrumbText: translations?.authors || "AUTHORS",
      breadCrumbUrl: "", // Empty for current page
    },
  ];

  return (
    <>
      {/* Breadcrumbs - Outside hero section */}
      <Breadcrumbs items={breadcrumbItems} showHome={false} />

      {/* Hero Section - Using proper theming */}
      <section className="featured-header relative overflow-hidden bg-gradient-to-b from-background-900 from-30% via-background-700 via-80% to-background-500 rounded-b-3xl">
        <div className="lg:container relative mx-auto px-4 z-10 py-12">
          {/* Page Title */}
          <div className="text-center">
            <h1 className="text-4xl lg:text-5xl font-heading font-bold text-white mb-4">
              {translations?.authorsPageTitle || "Our Authors"}
            </h1>
            <p className="text-xl text-white/80 max-w-3xl mx-auto">
              {translations?.authorsPageDescription ||
                "Meet our expert team of authors and contributors who bring you the latest insights and reviews"}
            </p>
          </div>
        </div>

        {/* Starry Sky Background Effect */}
        <div className="absolute top-0 left-0 w-full pointer-events-none">
          <div className="h-[80vh] bg-[#0e1a2f]" />
          <div className="h-[300px] bg-[#0e1a2f] rounded-b-[50%_300px]" />
        </div>
      </section>

      {/* Main Content Section */}
      <section className="main py-12 lg:py-16">
        <div className="lg:container mx-auto lg:px-4">
          {/* Authors Grid */}
          {authors.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                {authors.map((author) => (
                  <AuthorCard
                    key={author.id}
                    author={author}
                    translations={translations}
                  />
                ))}
              </div>

              {/* Pagination */}
              {pagination.pageCount > 1 && (
                <PaginationServer
                  currentPage={pagination.page}
                  totalPages={pagination.pageCount}
                  baseUrl="/author"
                  translations={translations}
                  showInfo={true}
                  totalItems={pagination.total}
                  itemsPerPage={pagination.pageSize}
                  itemName={translations?.authors || "authors"}
                />
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">
                {translations?.noAuthorsFound || "No authors found."}
              </p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
