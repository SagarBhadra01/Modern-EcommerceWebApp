import { api } from '../api';
import type { SellerProduct, SellerSale } from '@/types';

export interface SellerAnalyticsResponse {
  totalRevenue: number;
  totalOrders: number;
  topProducts: { productId: string; title: string; image: string; unitsSold: number; revenue: number }[];
  revenueByDay: { date: string; revenue: number }[];
  recentBuyers: SellerSale[];
}

export interface CreateSellerProductPayload {
  title: string;
  description: string;
  price: number;
  originalPrice?: number;
  images: string[];
  category: string;
  stock: number;
}

export interface RecordSalePayload {
  productId: string;
  buyerName: string;
  buyerEmail: string;
  quantity: number;
  unitPrice: number;
  paymentMethod: 'cash' | 'card' | 'upi' | 'bank_transfer';
}

export const sellerService = {
  // Products
  getProducts: async () => {
    return api.get<SellerProduct[]>('/seller/products');
  },

  createProduct: async (payload: CreateSellerProductPayload) => {
    return api.post<SellerProduct>('/seller/products', payload);
  },

  updateProduct: async (id: string, payload: Partial<CreateSellerProductPayload> & { status?: string }) => {
    return api.put<SellerProduct>(`/seller/products/${id}`, payload);
  },

  deleteProduct: async (id: string) => {
    return api.delete(`/seller/products/${id}`);
  },

  // Sales
  recordSale: async (payload: RecordSalePayload) => {
    return api.post<SellerSale>('/seller/sales', payload);
  },

  // Analytics
  getAnalytics: async () => {
    return api.get<SellerAnalyticsResponse>('/seller/analytics');
  },
};
