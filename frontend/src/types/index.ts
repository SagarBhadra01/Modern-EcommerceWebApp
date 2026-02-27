export interface Product {
  id: string;
  slug: string;
  title: string;
  description: string;
  price: number;
  originalPrice?: number;
  images: string[];
  category: string;
  tags: string[];
  rating: number;
  reviewCount: number;
  stock: number;
  badge?: 'New' | 'Sale' | 'Hot';
  specs?: Record<string, string>;
}

export interface CartItem extends Product {
  quantity: number;
  selectedVariant?: Record<string, string>;
}

export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  total: number;
  status: 'processing' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: string;
  shippingAddress: Address;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  avatar?: string;
  joinedAt: string;
  phone?: string;
  status?: 'active' | 'banned';
}

export interface Address {
  fullName: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  phone?: string;
  email?: string;
}

export interface Review {
  id: string;
  userId: string;
  productId: string;
  rating: number;
  comment: string;
  createdAt: string;
  userName: string;
  userAvatar?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  count: number;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  avatar?: string;
  quote: string;
  rating: number;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
}

export interface StatCard {
  label: string;
  value: string;
  trend: string;
  trendUp: boolean;
  icon: string;
}
