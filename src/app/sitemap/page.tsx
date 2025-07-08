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
import type { SitemapItem } from "@/types/sitemap.types";
import type { IntroductionWithImageBlock } from "@/types/custom-page.types";

export const dynamic = "force-static";
export const revalidate = 300; // 5 minutes

interface SitemapPageProps {
  searchParams?: Promise<{ page?: string }>;
}

export async function generateMetadata(): Promise<Metadata> {
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
    canonicalUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/sitemap`,
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

  const columns: SitemapItem[][] = [[], [], []];
  const headerMap: Record<string, { col: number; index: number }> = {};

  items.forEach((item, idx) => {
    const col = Math.min(2, Math.floor(idx / 50));
    const pos = columns[col].push(item) - 1;
    if (!headerMap[item.endpoint]) {
      headerMap[item.endpoint] = { col, index: pos };
    }
  });

  const breadcrumbItems: BreadcrumbItem[] = [
    { breadCrumbText: translations?.home || "HOME", breadCrumbUrl: "/" },
    { breadCrumbText: translations?.sitemap || "Sitemap", breadCrumbUrl: "" },
  ];

  return (
    <>
      <Breadcrumbs items={breadcrumbItems} showHome={false} />

      <section className="featured-background curve pb-[50px]">
        <div className="container">
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
      </section>

      <section className="xl:container content-auto px-2 pt-5">
        <div className="md:flex gap-x-4">
          {columns.map((column, colIndex) => (
            <div key={colIndex} className="md:w-1/3">
              {column.map((item, itemIndex) => (
                <div key={item.id}>
                  {headerMap[item.endpoint]?.col === colIndex &&
                    headerMap[item.endpoint]?.index === itemIndex && (
                      <h2 className="text-2xl my-3">
                        {translations?.[item.endpoint] || item.endpoint}
                      </h2>
                    )}
                  <a href={item.url} className="hover:underline">
                    {item.title}
                  </a>
                </div>
              ))}
            </div>
          ))}
        </div>

        {pagination.pageCount > 1 && (
          <div className="mt-3">
            <PaginationServer
              currentPage={pagination.page}
              totalPages={pagination.pageCount}
              baseUrl="/sitemap"
              translations={translations}
            />
          </div>
        )}
      </section>
    </>
  );
}
