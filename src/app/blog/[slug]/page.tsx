// src/app/blog/[slug]/page.tsx

import { notFound } from "next/navigation";
import { Metadata } from "next";
import Link from "next/link";
import {
  getBlogSingleData,
  getBlogMetadata,
} from "@/lib/strapi/blog-data-loader";
import { getLayoutData } from "@/lib/strapi/data-loader";
import { generateMetadata as generateSEOMetadata } from "@/lib/utils/seo";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Image } from "@/components/common/Image";
import { TimeDate } from "@/components/common/TimeDate";
import { BlogList } from "@/components/blog/BlogList/BlogList";
import { AuthorBox } from "@/components/common/AuthorBox/AuthorBox";
import { cn } from "@/lib/utils/cn";

// Force static generation with ISR
export const dynamic = "force-static";
export const revalidate = 300; // 5 minutes

interface BlogPageProps {
  params: {
    slug: string;
  };
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
  const { slug } = params;

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
  const { slug } = params;

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

  // Generate breadcrumbs
  const breadcrumbs = [
    { label: "Home", url: "/" },
    { label: "Blog", url: "/blog" },
    { label: blog.title, url: `/blog/${blog.slug}` },
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
              <h1 className="text-4xl lg:text-5xl font-bold mb-6 text-white">
                {blog.title}
              </h1>

              {/* Blog Brief */}
              {blog.blogBrief && (
                <p className="text-xl text-gray-300 mb-6 leading-relaxed">
                  {blog.blogBrief}
                </p>
              )}

              {/* Meta Information */}
              <div className="flex flex-wrap items-center justify-center gap-4 text-gray-400">
                {blog.author && (
                  <div className="flex items-center gap-2">
                    {blog.author.photo?.url && (
                      <div className="relative w-10 h-10 rounded-full overflow-hidden">
                        <Image
                          src={blog.author.photo.url}
                          alt={`${blog.author.firstName} ${blog.author.lastName}`}
                          fill
                          sizes="40px"
                          className="object-cover"
                        />
                      </div>
                    )}
                    <div className="font-medium text-white">
                      {blog.author.firstName} {blog.author.lastName}
                    </div>
                  </div>
                )}

                <TimeDate timeDate={blog.createdAt} />

                {blog.minutesRead && (
                  <span className="flex items-center gap-1">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    {blog.minutesRead} min read
                  </span>
                )}
              </div>
            </header>

            {/* Featured Image */}
            {blog.images?.url && (
              <figure className="relative aspect-[16/9] rounded-xl overflow-hidden mb-0">
                <Image
                  src={blog.images.url}
                  alt={blog.images.alternativeText || blog.title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 1200px"
                  priority
                  quality={85}
                  className="object-cover"
                />
              </figure>
            )}
          </article>
        </div>

        {/* Starry Sky Background Effect */}
        <div className="absolute top-0 left-0 w-full pointer-events-none">
          <div className="h-[80vh] bg-[#0e1a2f]" />
          <div className="h-[300px] bg-[#0e1a2f] rounded-b-[50%_300px]" />
        </div>
      </section>

      {/* Article Content */}
      <section className="main container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div
            className="prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: blog.content1 || "" }}
          />

          {/* Author Bio */}
          {blog.author && (
            <div className="mt-12 pt-8 border-t">
              <AuthorBox
                author={{
                  id: blog.author.id,
                  firstName: blog.author.firstName,
                  lastName: blog.author.lastName,
                  jobTitle: blog.author.jobTitle,
                  photo: blog.author.photo,
                  content1: blog.author.content1,
                  linkedInLink: blog.author.linkedInLink,
                  twitterLink: blog.author.twitterLink,
                  facebookLink: blog.author.facebookLink,
                }}
              />
            </div>
          )}
        </div>
      </section>

      {/* Related Articles */}
      {relatedBlogs.length > 0 && (
        <section className="bg-gray-50 py-12">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-8 text-center">
              Related Articles
            </h2>
            <BlogList blogs={relatedBlogs} translations={translations} />
          </div>
        </section>
      )}
    </>
  );
}
