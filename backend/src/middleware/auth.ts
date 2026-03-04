import { Request, Response, NextFunction } from 'express';
import { clerkMiddleware, getAuth } from '@clerk/express';
import prisma from '../lib/prisma';

// Attach Clerk auth to all requests
export const clerkAuth = clerkMiddleware();

/**
 * Requires a valid Clerk session. Returns 401 if not authenticated.
 * Also auto-syncs user to DB using Clerk JWT claims.
 */
export const requireAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const auth = getAuth(req);
  const userId = auth?.userId;

  if (!userId) {
    res.status(401).json({ error: 'Unauthorized', message: 'You must be logged in.' });
    return;
  }

  // Attach clerkId to request for downstream use
  (req as any).clerkId = userId;

  // Try to extract user profile from Clerk session claims for auto-upsert
  try {
    const sessionClaims = auth?.sessionClaims as any;
    if (sessionClaims) {
      (req as any).clerkUser = {
        name: sessionClaims?.name || sessionClaims?.fullName || `${sessionClaims?.first_name || ''} ${sessionClaims?.last_name || ''}`.trim() || 'User',
        email: sessionClaims?.email || sessionClaims?.primaryEmail || '',
        avatar: sessionClaims?.image_url || sessionClaims?.picture || sessionClaims?.avatar || '',
      };
    }
  } catch {
    // Non-critical: downstream can handle missing clerkUser
  }

  next();
};

/**
 * Requires the user to have admin role in the database.
 * Must be used after requireAuth.
 */
export const requireAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const clerkId = (req as any).clerkId;

  if (!clerkId) {
    res.status(401).json({ error: 'Unauthorized', message: 'You must be logged in.' });
    return;
  }

  const user = await prisma.user.findUnique({ where: { clerkId } });

  if (!user || user.role !== 'admin') {
    res.status(403).json({ error: 'Forbidden', message: 'Admin access required. Ask an admin to promote your account.' });
    return;
  }

  (req as any).dbUser = user;
  next();
};

/**
 * Optionally attaches auth info — does not block unauthenticated requests.
 */
export const optionalAuth = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  const { userId } = getAuth(req);
  if (userId) {
    (req as any).clerkId = userId;
  }
  next();
};
