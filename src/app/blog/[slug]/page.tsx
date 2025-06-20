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
import { HeaderAuthor } from "@/components/common/HeaderAuthor";
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
    ...(blog.blogCategory
      ? [
          {
            label: blog.blogCategory.blogCategory,
            url: `/blog/category/${blog.blogCategory.slug}`,
          },
        ]
      : []),
    { label: blog.title, url: `/blog/${blog.slug}` },
  ];

  // Generate author URL
  const authorSlug = blog.author
    ? `${blog.author.firstName.toLowerCase()}.${blog.author.lastName.toLowerCase()}`
    : "";
  const authorUrl = authorSlug ? `/author/${authorSlug}/` : "#";

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

      <article className="container mx-auto px-4 py-8">
        {/* Article Header */}
        <header className="max-w-4xl mx-auto mb-8">
          {/* Category */}
          {blog.blogCategory && (
            <Link
              href={`/blog/category/${blog.blogCategory.slug}`}
              className={cn(
                "inline-block mb-4",
                "text-primary hover:text-primary/80",
                "font-medium transition-colors"
              )}
              prefetch={false}
            >
              {blog.blogCategory.blogCategory}
            </Link>
          )}

          {/* Title */}
          <h1 className="text-4xl lg:text-5xl font-bold mb-6">{blog.title}</h1>

          {/* Meta Information */}
          <div className="flex flex-wrap items-center gap-4 text-gray-600 mb-8">
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
                <Link
                  href={authorUrl}
                  className="font-medium hover:text-primary transition-colors"
                  prefetch={false}
                >
                  {blog.author.firstName} {blog.author.lastName}
                </Link>
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
          <figure className="max-w-6xl mx-auto mb-12">
            <div className="relative aspect-[16/9] rounded-xl overflow-hidden">
              <Image
                src={blog.images.url}
                alt={blog.images.alternativeText || blog.title}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 1200px"
                priority
                quality={85}
                className="object-cover"
              />
            </div>
          </figure>
        )}

        {/* Article Content */}
        <div className="max-w-4xl mx-auto">
          <div
            className="prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: blog.content1 || "" }}
          />

          {/* Author Bio */}
          {blog.author && blog.author.content1 && (
            <div className="mt-12 pt-8 border-t">
              <HeaderAuthor
                author={{
                  ...blog.author,
                  description: blog.author.content1,
                  socialLinks: {
                    linkedin: blog.author.linkedInLink,
                    twitter: blog.author.twitterLink,
                    facebook: blog.author.facebookLink,
                  },
                }}
              />
            </div>
          )}
        </div>
      </article>

      {/* Related Articles */}
      {relatedBlogs.length > 0 && (
        <section className="bg-gray-50 py-12 mt-12">
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
