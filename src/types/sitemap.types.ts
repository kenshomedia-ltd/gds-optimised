export interface SitemapItem {
  id: number;
  title: string;
  url: string;
  endpoint: string;
}

export interface SitemapPagination {
  page: number;
  pageSize: number;
  pageCount: number;
  total: number;
}

export interface HtmlSitemapData {
  items: SitemapItem[];
  pagination: SitemapPagination;
}
