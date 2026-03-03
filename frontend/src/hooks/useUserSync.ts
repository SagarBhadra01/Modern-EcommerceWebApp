import { useEffect, useRef } from 'react';
import { useUser } from '@clerk/clerk-react';
import { userService } from '@/lib/services/user.service';

/**
 * Syncs the currently logged-in Clerk user to the backend database.
 * Should be called once at the app root level (e.g., in main.tsx or App.tsx).
 * Uses a ref to ensure it only runs once per session.
 */
export function useUserSync() {
  const { user, isSignedIn, isLoaded } = useUser();
  const hasSynced = useRef(false);

  useEffect(() => {
    if (!isLoaded || !isSignedIn || !user || hasSynced.current) return;

    const sync = async () => {
      try {
        await userService.syncUser({
          clerkId: user.id,
          name: user.fullName || user.firstName || 'User',
          email: user.primaryEmailAddress?.emailAddress || '',
          avatar: user.imageUrl,
          phone: user.primaryPhoneNumber?.phoneNumber,
        });
        hasSynced.current = true;
      } catch (error) {
        console.error('Failed to sync user:', error);
      }
    };

    sync();
  }, [isLoaded, isSignedIn, user]);
}
