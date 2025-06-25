// src/app/author/[slug]/page.tsx
import { notFound } from "next/navigation";
import { getAuthorData } from "@/lib/strapi/author-data-loader";
import { getAuthorMetadata } from "@/lib/strapi/author-query-splitter";
import { getLayoutData } from "@/lib/strapi/data-loader";
import { generateMetadata as generateSEOMetadata } from "@/lib/utils/seo";
import { AuthorBio } from "@/components/author/AuthorBio/AuthorBio";
import { AuthorGameList } from "@/components/author/AuthorGameList/AuthorGameList";
import { AuthorBlogList } from "@/components/author/AuthorBlogList/AuthorBlogList";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import type { Metadata } from "next";
import type { AuthorPageProps } from "@/types/author.types";
import type { BreadcrumbItem } from "@/types/breadcrumbs.types";

// Force static generation with ISR
export const dynamic = "force-static";
export const revalidate = 300; // 5 minutes

// Generate metadata for SEO
export async function generateMetadata({
  params,
}: AuthorPageProps): Promise<Metadata> {
  const { slug } = await params;
  const authorMetadata = await getAuthorMetadata(slug);

  if (!authorMetadata) {
    return {
      title: "Author Not Found",
      description: "The requested author could not be found.",
    };
  }

  const { translations } = await getLayoutData({ cached: true });

  return generateSEOMetadata({
    title:
      authorMetadata.seo?.metaTitle ||
      `${authorMetadata.title} - ${translations?.authorPageTitle || "Author"}`,
    description:
      authorMetadata.seo?.metaDescription || authorMetadata.description,
    keywords: authorMetadata.seo?.keywords,
    canonicalUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/author/${slug}`,
    image: authorMetadata.seo?.metaImage?.url,
  });
}

export default async function AuthorPage({ params }: AuthorPageProps) {
  const { slug } = await params;

  // Fetch data in parallel
  const [authorData, layoutData] = await Promise.all([
    getAuthorData(slug),
    getLayoutData({ cached: true }),
  ]);

  if (!authorData) {
    notFound();
  }

  const { author, totalGames, totalBlogs } = authorData;
  const { translations } = layoutData;

  // Breadcrumb items
  const breadcrumbItems: BreadcrumbItem[] = [
    {
      breadCrumbText: translations?.home || "HOME",
      breadCrumbUrl: "/",
    },
    {
      breadCrumbText: translations?.authors || "AUTHORS",
      breadCrumbUrl: "/author",
    },
    {
      breadCrumbText: `${author.firstName} ${author.lastName}`.toUpperCase(),
      breadCrumbUrl: "", // Empty for current page
    },
  ];

  return (
    <>
      {/* Breadcrumbs - Outside hero section */}
      <Breadcrumbs items={breadcrumbItems} showHome={false} />

      {/* Hero Section with Author Bio - Using proper theming */}
      <section className="featured-header relative overflow-hidden bg-gradient-to-b from-background-900 from-30% via-background-700 via-80% to-background-500 rounded-b-3xl">
        <div className="container relative mx-auto px-4 z-10 py-12 pb-16">
          {/* Author Bio */}
          <AuthorBio author={author} translations={translations} />

          {/* Games Section in Hero */}
          {author.games && author.games.length > 0 && (
            <div className="mt-12">
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-6 text-center">
                {translations?.gamesBy || "Games by"} {author.firstName}
              </h2>
              <AuthorGameList
                authorId={author.id}
                initialGames={author.games}
                totalGames={totalGames}
                translations={translations}
              />
            </div>
          )}
        </div>

        {/* Starry Sky Background Effect */}
        <div className="absolute top-0 left-0 w-full pointer-events-none">
          <div className="h-[80vh] bg-[#0e1a2f]" />
          <div className="h-[300px] bg-[#0e1a2f] rounded-b-[50%_300px]" />
        </div>
      </section>

      {/* Main Content Section - Blogs */}
      {author.blogs && author.blogs.length > 0 && (
        <section className="main py-12 lg:py-16">
          <div className="xl:container mx-auto px-4">
            <h2 className="text-3xl lg:text-4xl font-heading font-bold text-center mb-10">
              {translations?.articlesByAuthor || "Articles by"}{" "}
              {author.firstName}
            </h2>

            {/* Blog List */}
            <div className="max-w-6xl mx-auto">
              <AuthorBlogList
                authorId={author.id}
                initialBlogs={author.blogs}
                totalBlogs={totalBlogs}
                translations={translations}
              />
            </div>
          </div>
        </section>
      )}
    </>
  );
}
