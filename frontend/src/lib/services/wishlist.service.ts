import { api } from '../api';
import type { Product } from '@/types';

export const wishlistService = {
  getWishlist: async () => {
    return api.get<Product[]>('/wishlist');
  },

  addToWishlist: async (productId: string) => {
    return api.post('/wishlist', { productId });
  },

  removeFromWishlist: async (productId: string) => {
    return api.delete(`/wishlist/${productId}`);
  },
};
