import { useUser, useClerk } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';

export function useAuth() {
  const { user, isSignedIn } = useUser();
  const { signOut } = useClerk();
  const navigate = useNavigate();

  const handleSignOut = () => {
    signOut(() => navigate('/'));
  };

  return {
    user: user ? {
      id: user.id,
      name: user.fullName || user.firstName || 'User',
      email: user.primaryEmailAddress?.emailAddress || '',
      role: (user.publicMetadata?.role as string) || 'user',
      joinedAt: user.createdAt ? new Date(user.createdAt).toISOString() : new Date().toISOString(),
      imageUrl: user.imageUrl,
    } : null,
    isAuthenticated: !!isSignedIn,
    signOut: handleSignOut,
  };
}
