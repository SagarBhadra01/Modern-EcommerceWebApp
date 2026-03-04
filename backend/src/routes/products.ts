import { Router } from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma';
import { requireAuth } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

// ── Helpers ────────────────────────────────────────────────────────────────

/**
 * Gets or auto-creates the user in DB from Clerk session claims.
 */
async function getOrCreateDbUser(clerkId: string, clerkUser?: { name?: string; email?: string; avatar?: string }) {
  let user = await prisma.user.findUnique({ where: { clerkId } });
  if (!user && clerkUser?.email) {
    user = await prisma.user.upsert({
      where: { clerkId },
      update: { name: clerkUser.name || 'User', avatar: clerkUser.avatar },
      create: {
        clerkId,
        name: clerkUser.name || 'User',
        email: clerkUser.email,
        avatar: clerkUser.avatar,
        role: 'user',
        status: 'active',
      },
    });
  }
  return user;
}

/**
 * Checks admin access — auto-promotes user to admin if they are the first/only user.
 */
async function requireDbAdmin(clerkId: string, clerkUser?: { name?: string; email?: string; avatar?: string }) {
  let user = await prisma.user.findUnique({ where: { clerkId } });

  // Auto-create user if not in DB
  if (!user && clerkUser?.email) {
    user = await prisma.user.create({
      data: {
        clerkId,
        name: clerkUser.name || 'User',
        email: clerkUser.email,
        avatar: clerkUser.avatar,
        role: 'user',
        status: 'active',
      },
    });
  }

  if (!user) return null;

  // Auto-promote to admin if no admins exist in the system
  const adminCount = await prisma.user.count({ where: { role: 'admin' } });
  if (adminCount === 0) {
    user = await prisma.user.update({ where: { clerkId }, data: { role: 'admin' } });
  }

  return user.role === 'admin' ? user : null;
}

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
  title: z.string().min(2),
  slug: z.string().min(2).optional(),
  description: z.string().min(10),
  price: z.number().positive(),
  originalPrice: z.number().positive().optional(),
  images: z.array(z.string()).min(1),
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

// POST /api/products — Create product (admin or first user)
router.post(
  '/',
  requireAuth,
  validate(createProductSchema),
  asyncHandler(async (req, res) => {
    const clerkId = (req as any).clerkId;
    const clerkUser = (req as any).clerkUser;
    const adminUser = await requireDbAdmin(clerkId, clerkUser);

    if (!adminUser) {
      res.status(403).json({
        error: 'Forbidden',
        message: 'Admin access required. Use the make-admin script to promote your account.',
      });
      return;
    }

    // Auto-generate slug if not provided
    const baseSlug = req.body.slug || req.body.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    
    // Ensure uniqueness
    const existing = await prisma.product.findUnique({ where: { slug: baseSlug } });
    const slug = existing ? `${baseSlug}-${Date.now()}` : baseSlug;

    const product = await prisma.product.create({
      data: { ...req.body, slug },
      include: { category: true },
    });
    res.status(201).json(product);
  })
);

// PUT /api/products/:id — Update product (admin only)
router.put(
  '/:id',
  requireAuth,
  validate(updateProductSchema),
  asyncHandler(async (req, res) => {
    const clerkId = (req as any).clerkId;
    const clerkUser = (req as any).clerkUser;
    const adminUser = await requireDbAdmin(clerkId, clerkUser);

    if (!adminUser) {
      res.status(403).json({ error: 'Forbidden', message: 'Admin access required.' });
      return;
    }

    const product = await prisma.product.update({
      where: { id: req.params.id },
      data: req.body,
      include: { category: true },
    });
    res.json(product);
  })
);

// DELETE /api/products/:id — Delete product (admin only)
router.delete(
  '/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    const clerkId = (req as any).clerkId;
    const clerkUser = (req as any).clerkUser;
    const adminUser = await requireDbAdmin(clerkId, clerkUser);

    if (!adminUser) {
      res.status(403).json({ error: 'Forbidden', message: 'Admin access required.' });
      return;
    }

    await prisma.product.delete({ where: { id: req.params.id } });
    res.json({ message: 'Product deleted.' });
  })
);

export default router;
