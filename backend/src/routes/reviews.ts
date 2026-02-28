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

// Schemas
const addReviewSchema = z.object({
  productId: z.string(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().min(5),
});

// GET /api/reviews?productId=123
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const { productId } = req.query;

    if (!productId || typeof productId !== 'string') {
      res.status(400).json({ error: 'Bad Request', message: 'productId query param is required.' });
      return;
    }

    const reviews = await prisma.review.findMany({
      where: { productId },
      orderBy: { createdAt: 'desc' },
    });

    res.json(reviews);
  })
);

// POST /api/reviews
router.post(
  '/',
  requireAuth,
  validate(addReviewSchema),
  asyncHandler(async (req, res) => {
    const user = await getDbUser((req as any).clerkId);
    if (!user) {
      res.status(404).json({ error: 'Not Found', message: 'User not found.' });
      return;
    }

    const { productId, rating, comment } = req.body;

    // Check if product exists
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      res.status(404).json({ error: 'Not Found', message: 'Product not found.' });
      return;
    }

    // Check if user already reviewed
    const existingReview = await prisma.review.findFirst({
      where: { userId: user.id, productId },
    });

    if (existingReview) {
      res.status(409).json({ error: 'Conflict', message: 'You have already reviewed this product.' });
      return;
    }

    const review = await prisma.review.create({
      data: {
        userId: user.id,
        productId,
        rating,
        comment,
        userName: user.name,
        userAvatar: user.avatar,
      },
    });

    // Update product rating and review count
    const allReviews = await prisma.review.findMany({ where: { productId }, select: { rating: true } });
    const newRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

    await prisma.product.update({
      where: { id: productId },
      data: {
        rating: newRating,
        reviewCount: allReviews.length,
      },
    });

    res.status(201).json(review);
  })
);

export default router;
