import { api } from '../api';

export interface CartItemResponse {
  id: string;
  userId: string;
  productId: string;
  quantity: number;
  selectedVariant?: Record<string, string>;
  product: {
    id: string;
    slug: string;
    title: string;
    description: string;
    price: number;
    originalPrice?: number;
    images: string[];
    category?: { name: string };
    categoryId?: string;
    tags: string[];
    rating: number;
    reviewCount: number;
    stock: number;
    badge?: string;
    specs?: Record<string, string>;
  };
}

export interface CartResponse {
  items: CartItemResponse[];
  total: number;
  itemCount: number;
}

export const cartService = {
  getCart: async () => {
    return api.get<CartResponse>('/cart');
  },

  addItem: async (productId: string, quantity = 1, selectedVariant?: Record<string, string>) => {
    return api.post<CartItemResponse>('/cart', { productId, quantity, selectedVariant });
  },

  updateQuantity: async (itemId: string, quantity: number) => {
    return api.put<CartItemResponse>(`/cart/${itemId}`, { quantity });
  },

  removeItem: async (itemId: string) => {
    return api.delete(`/cart/${itemId}`);
  },

  clearCart: async () => {
    return api.delete('/cart');
  },
};
