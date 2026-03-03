import { api } from '../api';
import type { Product } from '@/types';

export interface ProductsResponse {
  products: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface ProductQueryParams {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: 'price_asc' | 'price_desc' | 'newest' | 'rating';
}

export const productService = {
  getProducts: async (params?: ProductQueryParams) => {
    return api.get<ProductsResponse>('/products', { params });
  },

  getProductBySlug: async (slug: string) => {
    return api.get<Product>(`/products/${slug}`);
  },
};
