import { Router } from 'express';
import prisma from '../lib/prisma';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

// GET /api/content/testimonials
router.get(
  '/testimonials',
  asyncHandler(async (_req, res) => {
    const testimonials = await prisma.testimonial.findMany({
      where: { isActive: true },
    });
    res.json(testimonials);
  })
);

// GET /api/content/faqs
router.get(
  '/faqs',
  asyncHandler(async (_req, res) => {
    const faqs = await prisma.faq.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    });
    res.json(faqs);
  })
);

export default router;
