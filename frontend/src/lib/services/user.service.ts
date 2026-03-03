import { api } from '../api';

export interface UserProfile {
  id: string;
  clerkId: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  avatar?: string;
  phone?: string;
  status: 'active' | 'banned';
  joinedAt: string;
  addresses: UserAddress[];
}

export interface UserAddress {
  id: string;
  fullName: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  phone?: string;
  email?: string;
  isDefault: boolean;
}

export interface NotificationPreferences {
  id: string;
  emailNotifications: boolean;
  orderUpdates: boolean;
  promotions: boolean;
}

export const userService = {
  // Sync user from Clerk → DB (call on first login)
  syncUser: async (data: { clerkId: string; name: string; email: string; avatar?: string; phone?: string }) => {
    return api.post<UserProfile>('/users/sync', data);
  },

  getProfile: async () => {
    return api.get<UserProfile>('/users/me');
  },

  updateProfile: async (data: { name?: string; phone?: string; avatar?: string }) => {
    return api.put<UserProfile>('/users/me', data);
  },

  // Preferences
  getPreferences: async () => {
    return api.get<NotificationPreferences>('/users/me/preferences');
  },

  updatePreferences: async (data: Partial<Omit<NotificationPreferences, 'id'>>) => {
    return api.patch<NotificationPreferences>('/users/me/preferences', data);
  },

  // Addresses
  getAddresses: async () => {
    return api.get<UserAddress[]>('/users/me/addresses');
  },

  addAddress: async (data: Omit<UserAddress, 'id'>) => {
    return api.post<UserAddress>('/users/me/addresses', data);
  },

  deleteAddress: async (id: string) => {
    return api.delete(`/users/me/addresses/${id}`);
  },
};
