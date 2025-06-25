// src/types/author.types.ts

import type { StrapiImage, SEOData } from "./strapi.types";
import type { GameData } from "./game.types";
import type { BlogData } from "./blog.types";
import type { CasinoData } from "./casino.types";

/**
 * Full Author data structure
 */
export interface AuthorData {
  id: number;
  documentId?: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  heading?: string;
  content1?: string;
  jobTitle?: string;
  facebookLink?: string;
  linkedInLink?: string;
  slug: string;
  twitterLink?: string;
  experience?: string;
  areaOfWork?: string;
  specialization?: string;
  isAnAuthor: boolean;
  bio?: string;
  photo?: StrapiImage;
  blogs?: BlogData[];
  games?: GameData[];
  casinos?: CasinoData[];
  seo?: SEOData;
}

/**
 * Author card data for listings
 */
export interface AuthorCardData {
  id: number;
  documentId?: string;
  firstName: string;
  lastName: string;
  content1?: string;
  facebookLink?: string;
  linkedInLink?: string;
  twitterLink?: string;
  slug: string;
  isAnAuthor: boolean;
  jobTitle?: string;
  photo?: StrapiImage;
}

/**
 * Author page data structure
 */
export interface AuthorPageData {
  author: AuthorData;
  totalGames: number;
  totalBlogs: number;
}

/**
 * Author index page data
 */
export interface AuthorIndexPageData {
  authors: AuthorCardData[];
  pagination: {
    page: number;
    pageSize: number;
    pageCount: number;
    total: number;
  };
  seo?: SEOData;
}

/**
 * Author bio props
 */
export interface AuthorBioProps {
  author: AuthorData;
  className?: string;
  translations?: Record<string, string>;
}

/**
 * Author page props
 */
export interface AuthorPageProps {
  params: Promise<{
    slug: string;
  }>;
}
