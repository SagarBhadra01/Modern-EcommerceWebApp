import { useAuthStore } from '@/store/authStore';
import { useNavigate } from 'react-router-dom';
import { users } from '@/lib/mockData';
import type { User } from '@/types';

export function useAuth() {
  const { user, isAuthenticated, login, logout } = useAuthStore();
  const navigate = useNavigate();

  const signIn = (email: string, _password: string) => {
    // Mock auth — find user by email
    const found = users.find((u) => u.email === email);
    if (found) {
      login(found);
      localStorage.setItem('token', 'mock-token-' + found.id);
      return { success: true, user: found };
    }
    // Default: create mock user
    const mockUser: User = {
      id: 'mock-1',
      name: 'Demo User',
      email,
      role: 'user',
      joinedAt: new Date().toISOString(),
    };
    login(mockUser);
    localStorage.setItem('token', 'mock-token-demo');
    return { success: true, user: mockUser };
  };

  const signOut = () => {
    logout();
    navigate('/');
  };

  return { user, isAuthenticated, signIn, signOut, login };
}
