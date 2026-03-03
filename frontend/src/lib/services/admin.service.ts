import { api } from '../api';

export interface AdminStats {
  totalUsers: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  recentOrders: {
    id: string;
    total: number;
    status: string;
    createdAt: string;
    user: { name: string; email: string };
    items?: { id: string }[];
  }[];
  revenueByDay: { date: string; revenue: number }[];
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  status: 'active' | 'banned';
  avatar?: string;
  joinedAt: string;
  phone?: string;
  _count: { orders: number };
}

export interface AdminOrdersResponse {
  orders: {
    id: string;
    total: number;
    status: 'processing' | 'shipped' | 'delivered' | 'cancelled';
    createdAt: string;
    user: { name: string; email: string };
    items: { id: string; title: string; image: string; price: number; quantity: number }[];
  }[];
  pagination: { page: number; limit: number; total: number; pages: number };
}

export interface AdminAnalytics {
  totalRevenue: number;
  ordersByStatus: { status: string; _count: { id: number }; _sum: { total: number | null } }[];
  topBuyers: { id?: string; name?: string; email?: string; orderCount: number; totalSpent: number }[];
}

export const adminService = {
  getStats: async () => {
    return api.get<AdminStats>('/admin/stats');
  },

  getUsers: async () => {
    return api.get<AdminUser[]>('/admin/users');
  },

  updateUser: async (id: string, data: { role?: 'user' | 'admin'; status?: 'active' | 'banned' }) => {
    return api.put(`/admin/users/${id}`, data);
  },

  getOrders: async (params?: { page?: number; limit?: number; status?: string }) => {
    return api.get<AdminOrdersResponse>('/admin/orders', { params });
  },

  updateOrderStatus: async (id: string, status: string) => {
    return api.put(`/orders/${id}/status`, { status });
  },

  getAnalytics: async () => {
    return api.get<AdminAnalytics>('/admin/analytics');
  },
};
