import { Metadata } from "next";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { PaginationServer } from "@/components/ui/Pagination/PaginationServer";
import { getLayoutData } from "@/lib/strapi/data-loader";
import { getSitemapPage } from "@/lib/strapi/sitemap-data-loader";
import { generateMetadata as generateSEOMetadata } from "@/lib/utils/seo";

export const dynamic = "force-static";
export const revalidate = 3600; // 1 hour

interface SitemapPageProps {
  params: Promise<{ page?: string[] }>;
}

function getPageNumber(pageParam?: string[]): number {
  if (!pageParam || pageParam.length === 0) return 1;
  const match = pageParam[0].match(/^p(\d+)$/);
  if (match) {
    const num = parseInt(match[1], 10);
    return num >= 1 ? num : 1;
  }
  return 1;
}

export async function generateStaticParams() {
  return [{ page: undefined }, { page: ["p2"] }, { page: ["p3"] }];
}

export async function generateMetadata({ params }: SitemapPageProps): Promise<Metadata> {
  const pageParam = await params;
  const page = getPageNumber(pageParam.page);
  const url = `${process.env.NEXT_PUBLIC_SITE_URL}/sitemap${page > 1 ? `/p${page}` : ""}`;
  return generateSEOMetadata({
    title: page > 1 ? `Sitemap - Page ${page}` : "Sitemap",
    description: "HTML sitemap of site pages",
    canonicalUrl: url,
  });
}

export default async function HtmlSitemapPage({ params }: SitemapPageProps) {
  const pageParam = await params;
  const currentPage = getPageNumber(pageParam.page);
  const pageSize = 150;

  const [layoutData, sitemap] = await Promise.all([
    getLayoutData({ cached: true }),
    getSitemapPage(currentPage, pageSize),
  ]);

  const { translations } = layoutData;
  const breadcrumbs = [
    { breadCrumbText: translations?.home || "Home", breadCrumbUrl: "/" },
    {
      breadCrumbText: translations?.sitemap || "Sitemap",
      breadCrumbUrl: currentPage > 1 ? "/sitemap" : "",
    },
    ...(currentPage > 1
      ? [{ breadCrumbText: `Page ${currentPage}`, breadCrumbUrl: "" }]
      : []),
  ];

  return (
    <>
      <Breadcrumbs items={breadcrumbs} showHome={false} />
      <section className="main lg:container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-8">
          {translations?.sitemap || "Sitemap"}
          {currentPage > 1 && ` - Page ${currentPage}`}
        </h1>
        <ul className="space-y-2">
          {sitemap.data.map((item) => (
            <li key={item.url}>
              <a href={item.url} className="text-primary hover:underline">
                {item.title}
              </a>
            </li>
          ))}
        </ul>
        {sitemap.totalPages > 1 && (
          <PaginationServer
            currentPage={currentPage}
            totalPages={sitemap.totalPages}
            baseUrl="/sitemap"
            translations={translations}
            showInfo={true}
            totalItems={sitemap.totalItems}
            itemsPerPage={pageSize}
            itemName="pages"
            className="mt-8"
          />
        )}
      </section>
    </>
  );
}
