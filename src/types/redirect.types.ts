// src/types/redirect.types.ts
export interface RedirectData {
  id: number;
  documentId?: string;
  redirectUrl: string;
  redirectTarget: string;
  redirectMethod: "permanent" | "temporary" | null;
  createdAt?: string;
  updatedAt?: string;
  publishedAt?: string;
}

export interface RedirectsResponse {
  data: RedirectData[];
  meta?: {
    pagination?: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}
