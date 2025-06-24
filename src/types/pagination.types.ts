export interface PaginationSimpleProps {
  currentPage: number;
  totalPages: number;
  baseUrl: string;
  translations?: {
    previous?: string;
    next?: string;
  };
  className?: string;
  buildUrl?: (page: number) => string;
}

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  disabled?: boolean;
  showInfo?: boolean;
  totalItems?: number;
  itemsPerPage?: number;
  itemName?: string;
  translations?: {
    previous?: string;
    next?: string;
    page?: string;
    of?: string;
    showing?: string;
  };
  className?: string;
  variant?: "default" | "compact";
}