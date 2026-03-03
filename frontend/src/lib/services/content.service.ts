import { api } from '../api';
import type { Testimonial, FAQ } from '@/types';

export const contentService = {
  getTestimonials: async () => {
    return api.get<Testimonial[]>('/content/testimonials');
  },

  getFaqs: async () => {
    return api.get<FAQ[]>('/content/faqs');
  },
};
