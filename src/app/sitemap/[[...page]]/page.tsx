import { Metadata } from "next";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { PaginationServer } from "@/components/ui/Pagination/PaginationServer";
import { getLayoutData } from "@/lib/strapi/data-loader";
import { getSitemapPage, SitemapItem } from "@/lib/strapi/sitemap-data-loader";
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

  const sitemapRecordMap: Record<string, [number, number]> = {
    users: [0, 0],
    "custom-pages": [0, 0],
    blogs: [0, 0],
    "slot-categories": [0, 0],
    "slot-providers": [0, 0],
    games: [0, 0],
    "casino-providers": [0, 0],
    casinos: [0, 0],
  };

  const sitemapData = sitemap.data;
  const sitemapDataColumns: SitemapItem[][] = [
    sitemapData.slice(0, 50),
    sitemapData.slice(50, 100),
    sitemapData.slice(100, 150),
  ];

  const headerList = [
    ...new Set(sitemapData.map((item) => item.group)),
  ] as Array<keyof typeof sitemapRecordMap>;

  for (const header of headerList) {
    const headerFirstIndex = sitemapData.findIndex((item) => item.group === header);
    const headerLastIndex = sitemapData.findLastIndex((item) => item.group === header);

    const firstIndex =
      headerLastIndex < 50 || headerFirstIndex < 50
        ? 0
        : (headerLastIndex > 49 && headerLastIndex < 100) ||
          (headerFirstIndex > 49 && headerFirstIndex < 100)
        ? 1
        : 2;
    const secondIndex =
      headerFirstIndex < 50
        ? headerFirstIndex
        : headerFirstIndex > 50 && headerFirstIndex < 100
        ? headerFirstIndex % 50
        : headerFirstIndex % 100;
    sitemapRecordMap[header] = [firstIndex, secondIndex];
  }

  return (
    <>
      <Breadcrumbs items={breadcrumbs} showHome={false} />
      <section className="featured-header relative overflow-hidden bg-gradient-to-b from-background-900 from-30% via-background-700 via-80% to-background-500 rounded-b-3xl">
        <div className="lg:container relative mx-auto px-4 z-10 py-12 text-center">
          <h1 className="text-4xl lg:text-5xl font-heading font-bold text-white">
            {translations?.sitemap || "Sitemap"}
            {currentPage > 1 && ` - Page ${currentPage}`}
          </h1>
        </div>
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="stars absolute inset-0" />
          <div className="twinkling absolute inset-0" />
        </div>
      </section>

      <section className="main py-12 lg:py-16">
        <div className="lg:container mx-auto px-4">
          <div className="md:flex gap-6">
            {sitemapDataColumns.map((column, colIndex) => (
              <div key={colIndex} className="md:w-1/3">
                {column.map((item, itemIndex) => (
                  <div key={item.url}>
                    {sitemapRecordMap[item.group] &&
                      sitemapRecordMap[item.group][0] === colIndex &&
                      sitemapRecordMap[item.group][1] === itemIndex && (
                        <h2 className="text-xl font-semibold mt-4 mb-2">
                          {translations?.[item.group] || item.group}
                        </h2>
                      )}
                    <a href={item.url} className="hover:underline block">
                      {item.title}
                    </a>
                  </div>
                ))}
              </div>
            ))}
          </div>

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
        </div>
      </section>
    </>
  );
}
