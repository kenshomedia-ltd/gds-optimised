// src/app/sitemap/page.tsx
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getLayoutData } from "@/lib/strapi/data-loader";
import { getCustomPageMetadata, getCustomPageDataSplit } from "@/lib/strapi/custom-page-split-query";
import { getHtmlSitemapData } from "@/lib/strapi/html-sitemap-loader";
import { generateMetadata as generateSEOMetadata } from "@/lib/utils/seo";
import { IntroWithImage } from "@/components/common/IntroWithImage";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { PaginationServer } from "@/components/ui/Pagination/PaginationServer";
import type { BreadcrumbItem } from "@/types/breadcrumbs.types";
import type { IntroductionWithImageBlock } from "@/types/custom-page.types";

export const dynamic = "force-static";
export const revalidate = 300; // 5 minutes

interface SitemapPageProps {
  searchParams?: Promise<{ page?: string }>;
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams?: { page?: string };
}): Promise<Metadata> {
  const [layoutData, meta] = await Promise.all([
    getLayoutData({ cached: true }),
    getCustomPageMetadata("/sitemap"),
  ]);

  const { translations } = layoutData;

  return generateSEOMetadata({
    title:
      meta?.seo?.metaTitle || meta?.title || translations?.sitemapPageTitle || "Sitemap",
    description:
      meta?.seo?.metaDescription || translations?.sitemapPageDescription || "HTML sitemap",
    canonicalUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/sitemap${
      searchParams && searchParams.page && Number(searchParams.page) > 1
        ? `?page=${searchParams.page}`
        : ""
    }`,
  });
}

export default async function SitemapPage({ searchParams }: SitemapPageProps) {
  const params = searchParams ? await searchParams : undefined;
  const currentPage = Number(params?.page) || 1;
  const pageSize = 150;

  const [layoutData, customPage, sitemapData] = await Promise.all([
    getLayoutData({ cached: true }),
    getCustomPageDataSplit("/sitemap"),
    getHtmlSitemapData(currentPage, pageSize),
  ]);

  const { translations } = layoutData;
  const introductionBlock = customPage.pageData?.blocks?.[0] as
    | IntroductionWithImageBlock
    | undefined;
  const { items, pagination } = sitemapData;

  if (pagination.pageCount > 0 && currentPage > pagination.pageCount) {
    notFound();
  }

  const filteredItems = items.filter((item) => item.endpoint !== "users");

  const breadcrumbItems: BreadcrumbItem[] = [
    { breadCrumbText: translations?.home || "HOME", breadCrumbUrl: "/" },
    { breadCrumbText: translations?.sitemap || "Sitemap", breadCrumbUrl: "" },
  ];

  return (
    <>
      <Breadcrumbs items={breadcrumbItems} showHome={false} />

      <section className="featured-header relative overflow-hidden bg-gradient-to-b from-background-900 from-30% via-background-700 via-80% to-background-500 rounded-b-3xl">
        <div className="lg:container relative mx-auto lg:px-4 z-10 py-12">
          {introductionBlock && (
            <IntroWithImage
              heading={introductionBlock.heading}
              introduction={introductionBlock.introduction}
              image={introductionBlock.image}
              translations={translations}
              isDateEnabled={false}
              showContentDate={false}
            />
          )}
        </div>

        {/* Starry Sky Background Effect */}
        <div className="absolute top-0 left-0 w-full pointer-events-none">
          <div className="h-[80vh] bg-[#0e1a2f]" />
          <div className="h-[300px] bg-[#0e1a2f] rounded-b-[50%_300px]" />
        </div>
      </section>

      <section className="main lg:container mx-auto px-2 py-8">
        <div>
          {filteredItems.map((item, idx) => {
            const showHeader =
              idx === 0 || filteredItems[idx - 1].endpoint !== item.endpoint;
            return (
              <div key={item.id}>
                {showHeader && (
                  <h2 className="text-2xl my-3">
                    {translations?.[item.endpoint] || item.endpoint}
                  </h2>
                )}
                <a href={item.url} className="hover:underline">
                  {item.title}
                </a>
              </div>
            );
          })}
        </div>

        {pagination.pageCount > 1 && (
          <div className="mt-3">
            <PaginationServer
              currentPage={pagination.page}
              totalPages={pagination.pageCount}
              baseUrl="/sitemap"
              buildUrl={(p) => (p === 1 ? "/sitemap" : `/sitemap?page=${p}`)}
              translations={translations}
            />
          </div>
        )}
      </section>
    </>
  );
}
