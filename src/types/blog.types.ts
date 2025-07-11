// src/types/blog.types.ts

import type { StrapiImage, SEOData } from "./strapi.types";

/**
 * Blog author structure
 */
export interface BlogAuthor {
  id: number;
  documentId?: string;
  firstName: string;
  lastName: string;
  slug?: string;
  photo?: StrapiImage;
  linkedInLink?: string;
  twitterLink?: string | null;
  facebookLink?: string | null;
  jobTitle?: string;
  content1?: string;
  experience?: string;
  areaOfWork?: string | null;
  specialization?: string;
}

/**
 * Blog category structure
 */
export interface BlogCategory {
  id: number;
  documentId?: string;
  blogCategory: string;
  slug: string;
  seo?: SEOData;
}

/**
 * Blog data structure
 */
export interface BlogData {
  id: number;
  documentId?: string;
  title: string;
  slug: string;
  blogBrief?: string;
  excerpt?: string;
  content?: string;
  content1?: string;
  publishedAt: string;
  createdAt: string;
  updatedAt?: string;
  minutesRead?: number | null;
  readingTime?: number;
  images?: StrapiImage;
  featuredImage?: StrapiImage;
  author?: BlogAuthor;
  blogCategory?: BlogCategory;
  categories?: BlogCategory[];
  tags?: string[];
  seo?: SEOData;
}

/**
 * Home blog list block structure
 */
export interface HomeBlogListBlock {
  id: number;
  __component: "homepage.home-blog-list";
  numOfBlogs?: number;
  link?: {
    label: string;
    url: string;
  };
}

/**
 * Blog card props
 */
export interface BlogCardProps {
  blog: BlogData;
  translations?: Record<string, string>;
  isFeatured?: boolean;
  priority?: boolean;
  className?: string;
  index?: number;
}

/**
 * Blog list props
 */
export interface BlogListProps {
  blogs: BlogData[];
  translations?: Record<string, string>;
  className?: string;
  showViewAll?: boolean;
  viewAllLink?: {
    label: string;
    url: string;
  };
}

/**
 * Home latest blogs props
 */
export interface HomeLatestBlogsProps {
  block: HomeBlogListBlock;
  blogs: BlogData[];
  translations?: Record<string, string>;
  className?: string;
}



/**
 * Type-safe signature interface for ETag generation
 */
export interface BlogETagSignature {
  // For index pages
  page?: number;
  total?: number;
  blogIds?: number[];
  featuredId?: number;
  // For single pages
  blogId?: number;
  updatedAt?: string;
  relatedIds?: number[];
}