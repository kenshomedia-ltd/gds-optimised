// src/app/blog/[slug]/page.tsx

import { notFound } from "next/navigation";
import { Metadata } from "next";
import {
  getBlogSingleData,
  getBlogMetadata,
} from "@/lib/strapi/blog-data-loader";
import { getLayoutData } from "@/lib/strapi/data-loader";
import { generateMetadata as generateSEOMetadata } from "@/lib/utils/seo";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Image } from "@/components/common/Image";
import { TimeDate } from "@/components/common/TimeDate";
import { SingleContent } from "@/components/common/SingleContent";
import { BlogList } from "@/components/blog/BlogList/BlogList";
import { AuthorBox } from "@/components/common/AuthorBox/AuthorBox";

// Force static generation with ISR
export const dynamic = "force-static";
export const revalidate = 300; // 5 minutes

interface BlogPageProps {
  params: Promise<{
    slug: string;
  }>;
}

// Generate static params for all blog pages
export async function generateStaticParams() {
  // This would fetch all blog slugs from Strapi
  // For now, return empty array to allow dynamic generation
  return [];
}

// Generate metadata for SEO
export async function generateMetadata({
  params,
}: BlogPageProps): Promise<Metadata> {
  const { slug } = await params;

  try {
    const blogMetadata = await getBlogMetadata(slug);

    if (!blogMetadata) {
      return {};
    }

    const canonicalUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/blog/${slug}`;

    return generateSEOMetadata({
      title: blogMetadata.seo?.metaTitle || blogMetadata.title,
      description:
        blogMetadata.seo?.metaDescription || blogMetadata.description,
      keywords: blogMetadata.seo?.keywords,
      canonicalUrl,
      image: blogMetadata.seo?.metaImage?.url,
    });
  } catch (error) {
    console.error("Error generating metadata:", error);
    return {};
  }
}

export default async function BlogPage({ params }: BlogPageProps) {
  const { slug } = await params;

  // Fetch data
  const [layoutData, blogPageData] = await Promise.all([
    getLayoutData({ cached: true }),
    getBlogSingleData(slug),
  ]);

  if (!blogPageData) {
    notFound();
  }

  const { translations } = layoutData;
  const { blog, relatedBlogs } = blogPageData;

  // Generate breadcrumbs - Updated to use correct property names
  const breadcrumbs = [
    { breadCrumbText: "Home", breadCrumbUrl: "/" },
    { breadCrumbText: "Blog", breadCrumbUrl: "/blog" },
    { breadCrumbText: blog.title, breadCrumbUrl: "" }, // Empty URL for current page
  ];

  // Schema.org structured data
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: blog.title,
    description: blog.blogBrief || "",
    url: `${process.env.NEXT_PUBLIC_SITE_URL}/blog/${blog.slug}`,
    datePublished: blog.publishedAt || blog.createdAt,
    dateModified: blog.updatedAt || blog.createdAt,
    ...(blog.author && {
      author: {
        "@type": "Person",
        name: `${blog.author.firstName} ${blog.author.lastName}`,
        ...(blog.author.jobTitle && { jobTitle: blog.author.jobTitle }),
      },
    }),
    ...(blog.images?.url && {
      image: {
        "@type": "ImageObject",
        url: blog.images.url,
        ...(blog.images.width && { width: blog.images.width }),
        ...(blog.images.height && { height: blog.images.height }),
      },
    }),
    ...(blog.blogCategory && {
      articleSection: blog.blogCategory.blogCategory,
    }),
    publisher: {
      "@type": "Organization",
      name: process.env.NEXT_PUBLIC_SITE_NAME || "Website",
      logo: {
        "@type": "ImageObject",
        url: `${process.env.NEXT_PUBLIC_SITE_URL}/logo.png`,
      },
    },
  };

  return (
    <>
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />

      {/* Breadcrumbs */}
      <Breadcrumbs items={breadcrumbs} />

      {/* Hero Section */}
      <section className="featured-header relative overflow-hidden bg-gradient-to-b from-background-900 from-30% via-background-700 via-80% to-background-500 rounded-b-3xl">
        <div className="container relative mx-auto px-4 z-10 py-12">
          <article className="max-w-6xl mx-auto">
            {/* Article Header */}
            <header className="max-w-4xl mx-auto mb-8 text-center">
              {/* Category */}
              {blog.blogCategory && (
                <div className="inline-block mb-4 text-primary-tint font-medium">
                  {blog.blogCategory.blogCategory}
                </div>
              )}

              {/* Title */}
              <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white">
                {blog.title}
              </h1>

              {/* Meta Information */}
              <div className="flex items-center justify-center gap-4 text-sm text-gray-300">
                {blog.author && (
                  <span>
                    By {blog.author.firstName} {blog.author.lastName}
                  </span>
                )}
                <span>•</span>
                <TimeDate
                  timeDate={blog.publishedAt || blog.createdAt}
                  className="text-gray-300"
                />
                {blog.minutesRead && (
                  <>
                    <span>•</span>
                    <span>{blog.minutesRead} min read</span>
                  </>
                )}
              </div>
            </header>

            {/* Featured Image */}
            {blog.images?.url && (
              <div className="relative aspect-[16/9] mb-8 rounded-xl overflow-hidden">
                <Image
                  src={blog.images.url}
                  alt={blog.images.alternativeText || blog.title}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            )}
          </article>
        </div>

        {/* Starry Sky Background Effect */}
        <div className="absolute top-0 left-0 w-full pointer-events-none">
          <div className="h-[80vh] bg-[#0e1a2f]" />
          <div className="h-[300px] bg-[#0e1a2f] rounded-b-[50%_300px]" />
        </div>
      </section>

      {/* Main Content Section */}
      <section className="main container mx-auto px-4 py-12">
        <article className="max-w-4xl mx-auto">
          {/* Article Content - Using SingleContent component */}
          {blog.content1 && (
            <SingleContent
              block={{
                content: blog.content1,
              }}
              className="mb-8"
            />
          )}

          {/* Author Box */}
          {blog.author && (
            <div className="mt-12 pt-8 border-t border-gray-200">
              <AuthorBox
                author={{
                  ...blog.author,
                  // Convert null to undefined for twitterLink and facebookLink
                  twitterLink: blog.author.twitterLink || undefined,
                  facebookLink: blog.author.facebookLink || undefined,
                  areaOfWork: blog.author.areaOfWork || undefined,
                }}
              />
            </div>
          )}
        </article>

        {/* Related Articles */}
        {relatedBlogs.length > 0 && (
          <section className="mt-16 pt-12 border-t border-gray-200">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-3xl font-bold mb-8 text-center">
                {translations?.relatedArticles || "Related Articles"}
              </h2>
              <BlogList
                blogs={relatedBlogs}
                translations={translations}
                className="max-w-none"
              />
            </div>
          </section>
        )}
      </section>
    </>
  );
}
