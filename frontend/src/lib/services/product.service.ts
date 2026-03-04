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

export interface CreateProductPayload {
  title: string;
  slug: string;
  description: string;
  price: number;
  originalPrice?: number;
  images: string[];
  categoryId?: string;
  tags?: string[];
  stock: number;
  badge?: 'New' | 'Sale' | 'Hot';
  specs?: Record<string, string>;
}

export const productService = {
  getProducts: async (params?: ProductQueryParams) => {
    return api.get<ProductsResponse>('/products', { params });
  },

  getProductBySlug: async (slug: string) => {
    return api.get<Product>(`/products/${slug}`);
  },

  createProduct: async (data: CreateProductPayload) => {
    return api.post<Product>('/products', data);
  },

  updateProduct: async (id: string, data: Partial<CreateProductPayload>) => {
    return api.put<Product>(`/products/${id}`, data);
  },

  deleteProduct: async (id: string) => {
    return api.delete(`/products/${id}`);
  },
};
