// src/components/navigation/Breadcrumbs/breadcrumbs.types.ts
export interface BreadcrumbItem {
  breadCrumbText: string;
  breadCrumbUrl: string;
}

export interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}
