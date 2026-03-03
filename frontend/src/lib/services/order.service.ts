import { api } from '../api';

export interface OrderItem {
  id: string;
  productId: string;
  title: string;
  image: string;
  price: number;
  quantity: number;
  product?: {
    slug: string;
    category?: { name: string };
  };
}

export interface OrderResponse {
  id: string;
  userId: string;
  total: number;
  status: 'processing' | 'shipped' | 'delivered' | 'cancelled';
  shippingAddress: {
    fullName: string;
    line1: string;
    line2?: string;
    city: string;
    state: string;
    zip: string;
    country: string;
    phone?: string;
    email?: string;
  };
  createdAt: string;
  items: OrderItem[];
}

export interface CreateOrderPayload {
  shippingAddress: {
    fullName: string;
    line1: string;
    line2?: string;
    city: string;
    state: string;
    zip: string;
    country: string;
    phone?: string;
    email?: string;
  };
}

export const orderService = {
  getOrders: async () => {
    return api.get<OrderResponse[]>('/orders');
  },

  getOrder: async (id: string) => {
    return api.get<OrderResponse>(`/orders/${id}`);
  },

  createOrder: async (payload: CreateOrderPayload) => {
    return api.post<OrderResponse>('/orders', payload);
  },
};
