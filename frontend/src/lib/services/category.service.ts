import { api } from '../api';
import type { Category } from '@/types';

export const categoryService = {
  getCategories: async () => {
    return api.get<Category[]>('/categories');
  },
};
