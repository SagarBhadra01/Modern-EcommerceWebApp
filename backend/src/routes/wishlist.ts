import { Router } from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma';
import { requireAuth } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

// Helper
async function getDbUser(clerkId: string) {
  return prisma.user.findUnique({ where: { clerkId } });
}

const addWishlistSchema = z.object({
  productId: z.string(),
});

// GET /api/wishlist — Get user's wishlist
router.get(
  '/',
  requireAuth,
  asyncHandler(async (req, res) => {
    const user = await getDbUser((req as any).clerkId);
    if (!user) {
      res.status(404).json({ error: 'Not Found', message: 'User not found.' });
      return;
    }

    const wishlist = await prisma.wishlist.findMany({
      where: { userId: user.id },
      include: { product: true },
      orderBy: { addedAt: 'desc' },
    });

    res.json(wishlist.map((w) => w.product));
  })
);

// POST /api/wishlist — Add to wishlist
router.post(
  '/',
  requireAuth,
  validate(addWishlistSchema),
  asyncHandler(async (req, res) => {
    const user = await getDbUser((req as any).clerkId);
    if (!user) {
      res.status(404).json({ error: 'Not Found', message: 'User not found.' });
      return;
    }

    try {
      const item = await prisma.wishlist.create({
        data: {
          userId: user.id,
          productId: req.body.productId,
        },
      });
      res.status(201).json(item);
    } catch (error: any) {
      if (error.code === 'P2002') {
        // Already in wishlist
        res.status(200).json({ message: 'Already in wishlist' });
        return;
      }
      throw error;
    }
  })
);

// DELETE /api/wishlist/:productId — Remove from wishlist
router.delete(
  '/:productId',
  requireAuth,
  asyncHandler(async (req, res) => {
    const user = await getDbUser((req as any).clerkId);
    if (!user) {
      res.status(404).json({ error: 'Not Found', message: 'User not found.' });
      return;
    }

    await prisma.wishlist.deleteMany({
      where: {
        userId: user.id,
        productId: req.params.productId,
      },
    });

    res.json({ message: 'Removed from wishlist' });
  })
);

export default router;
