// src/types/breadcrumbs.types.ts

/**
 * Individual breadcrumb item structure
 * Updated to handle optional URLs for current page items
 */
export interface BreadcrumbItem {
  breadCrumbText: string;
  breadCrumbUrl?: string | null; // Made optional to handle current page items
}

/**
 * Raw breadcrumb item from data sources (more flexible input)
 */
export interface RawBreadcrumbItem {
  breadCrumbText: string;
  breadCrumbUrl?: string | null | undefined;
}

/**
 * Breadcrumbs component props
 */
export interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
  showHome?: boolean;
}

/**
 * Layout breadcrumbs mapping
 * Maps breadcrumb keys to arrays of breadcrumb items
 */
export interface LayoutBreadcrumbs {
  [key: string]: BreadcrumbItem[];
}

/**
 * Extended breadcrumbs props for layout integration
 */
export interface BreadcrumbsWithLayoutProps extends BreadcrumbsProps {
  breadcrumbKey?: string;
  layoutBreadcrumbs?: LayoutBreadcrumbs;
}
