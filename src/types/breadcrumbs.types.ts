// src/types/breadcrumbs.types.ts

/**
 * Individual breadcrumb item structure
 */
export interface BreadcrumbItem {
  breadCrumbText: string;
  breadCrumbUrl: string;
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
