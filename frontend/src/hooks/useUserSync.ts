import { useEffect, useRef } from 'react';
import { useUser } from '@clerk/clerk-react';
import { userService } from '@/lib/services/user.service';

/**
 * Syncs the currently logged-in Clerk user to the backend database.
 * Called at the app root level. Retries automatically if it fails.
 * Uses a ref so it only triggers once per session even if state updates.
 */
export function useUserSync() {
  const { user, isSignedIn, isLoaded } = useUser();
  const hasSynced = useRef(false);
  const retryCount = useRef(0);

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
        retryCount.current = 0;
      } catch (error) {
        console.warn('[useUserSync] Failed to sync user, will retry:', error);
        // Retry up to 3 times with exponential backoff
        if (retryCount.current < 3) {
          retryCount.current += 1;
          const delay = retryCount.current * 2000; // 2s, 4s, 6s
          setTimeout(sync, delay);
        }
      }
    };

    sync();
  }, [isLoaded, isSignedIn, user]);
}
