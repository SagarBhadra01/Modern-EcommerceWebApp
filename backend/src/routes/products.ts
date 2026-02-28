import { Router } from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma';
import { requireAuth } from '../middleware/auth';
import { requireAdmin } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

// ── Zod schemas ───────────────────────────────
const productQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  category: z.string().optional(),
  search: z.string().optional(),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  sort: z.enum(['price_asc', 'price_desc', 'newest', 'rating']).default('newest'),
});

const createProductSchema = z.object({
  slug: z.string().min(2),
  title: z.string().min(2),
  description: z.string().min(10),
  price: z.number().positive(),
  originalPrice: z.number().positive().optional(),
  images: z.array(z.string().url()).min(1),
  categoryId: z.string().optional(),
  tags: z.array(z.string()).default([]),
  stock: z.number().int().min(0),
  badge: z.enum(['New', 'Sale', 'Hot']).optional(),
  specs: z.record(z.string()).optional(),
});

const updateProductSchema = createProductSchema.partial();

// ── Routes ────────────────────────────────────

// GET /api/products — List & search products (public)
router.get(
  '/',
  validate(productQuerySchema, 'query'),
  asyncHandler(async (req, res) => {
    const { page, limit, category, search, minPrice, maxPrice, sort } = (req as any).query;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (category) {
      where.category = { slug: category };
    }
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { tags: { has: search } },
      ];
    }
    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined) where.price.gte = minPrice;
      if (maxPrice !== undefined) where.price.lte = maxPrice;
    }

    const orderBy: any =
      sort === 'price_asc' ? { price: 'asc' }
      : sort === 'price_desc' ? { price: 'desc' }
      : sort === 'rating' ? { rating: 'desc' }
      : { createdAt: 'desc' };

    const [products, total] = await Promise.all([
      prisma.product.findMany({ where, skip, take: limit, orderBy, include: { category: true } }),
      prisma.product.count({ where }),
    ]);

    res.json({
      products,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  })
);

// GET /api/products/:slug — Product detail (public)
router.get(
  '/:slug',
  asyncHandler(async (req, res) => {
    const product = await prisma.product.findUnique({
      where: { slug: req.params.slug },
      include: {
        category: true,
        reviews: { orderBy: { createdAt: 'desc' }, take: 20 },
      },
    });

    if (!product) {
      res.status(404).json({ error: 'Not Found', message: 'Product not found.' });
      return;
    }

    res.json(product);
  })
);

// POST /api/products — Create product (admin only)
router.post(
  '/',
  requireAuth,
  requireAdmin,
  validate(createProductSchema),
  asyncHandler(async (req, res) => {
    const product = await prisma.product.create({ data: req.body });
    res.status(201).json(product);
  })
);

// PUT /api/products/:id — Update product (admin only)
router.put(
  '/:id',
  requireAuth,
  requireAdmin,
  validate(updateProductSchema),
  asyncHandler(async (req, res) => {
    const product = await prisma.product.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json(product);
  })
);

// DELETE /api/products/:id — Delete product (admin only)
router.delete(
  '/:id',
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    await prisma.product.delete({ where: { id: req.params.id } });
    res.json({ message: 'Product deleted.' });
  })
);

export default router;
