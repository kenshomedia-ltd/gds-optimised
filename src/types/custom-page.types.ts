// src/types/custom-page.types.ts
import type { StrapiImage, SEOData } from "./strapi.types";

/**
 * Breadcrumb item
 */
export interface BreadcrumbItem {
  id: number;
  breadCrumbText: string;
  breadCrumbUrl: string;
}

/**
 * Author data
 */
export interface PageAuthor {
  id: number;
  documentId?: string;
  firstName: string;
  lastName: string;
  slug?: string;
  linkedInLink?: string;
  twitterLink?: string;
  facebookLink?: string;
  content1?: string;
  jobTitle?: string;
  experience?: string;
  areaOfWork?: string;
  specialization?: string;
  photo?: StrapiImage;
}

/**
 * Base block structure
 */
export interface BaseCustomPageBlock {
  id: number;
  __component: string;
}

/**
 * Custom page metadata (lightweight)
 */
export interface CustomPageMetadata {
  id: number;
  documentId?: string;
  title: string;
  urlPath: string;
  publishedAt: string;
  seo?: Pick<SEOData, "metaTitle" | "metaDescription">;
}

/**
 * Full custom page data
 */
export interface CustomPageData {
  id: number;
  documentId?: string;
  title: string;
  urlPath: string;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  showContentDate?: boolean;
  sideBarToShow?: string;
  seo?: SEOData;
  breadcrumbs?: BreadcrumbItem[];
  author?: PageAuthor;
  blocks?: BaseCustomPageBlock[];
}

/**
 * Custom page response
 */
export interface CustomPageResponse {
  data: CustomPageData[];
  meta: {
    pagination: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}
