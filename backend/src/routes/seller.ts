import { Router } from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma';
import { requireAuth } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

// ── Helpers ────────────────────────────────────
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

function slugify(text: string): string {
  return text.toLowerCase().trim().replace(/[\s\W-]+/g, '-').replace(/^-+|-+$/g, '');
}

/**
 * Resolves a category name (e.g. "Electronics") to a category ID.
 * Returns null if no matching category exists.
 */
async function resolveCategoryId(categoryName: string): Promise<string | null> {
  if (!categoryName) return null;
  const category = await prisma.category.findFirst({
    where: {
      OR: [
        { name: { equals: categoryName, mode: 'insensitive' } },
        { slug: { equals: slugify(categoryName), mode: 'insensitive' } },
      ],
    },
  });
  return category?.id || null;
}

/**
 * Generates a globally unique slug for the products table.
 */
async function uniqueProductSlug(baseSlug: string): Promise<string> {
  const existing = await prisma.product.findUnique({ where: { slug: baseSlug } });
  return existing ? `${baseSlug}-${Date.now()}` : baseSlug;
}

// ── Schemas ───────────────────────────────────
const createSellerProductSchema = z.object({
  title: z.string().min(2),
  description: z.string().min(1).default('No description provided.'),
  price: z.number().positive(),
  originalPrice: z.number().positive().optional(),
  images: z.array(z.string()).min(1).default(['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=600&fit=crop']),
  category: z.string().min(1),
  stock: z.number().int().min(0),
});

const updateSellerProductSchema = createSellerProductSchema.partial().extend({
  status: z.enum(['active', 'draft', 'sold_out', 'archived']).optional(),
});

const recordSaleSchema = z.object({
  productId: z.string(),
  buyerName: z.string().min(2),
  buyerEmail: z.string().email(),
  quantity: z.number().int().positive(),
  unitPrice: z.number().positive(),
  paymentMethod: z.enum(['cash', 'card', 'upi', 'bank_transfer']),
});

// ── Routes ────────────────────────────────────

// GET /api/seller/products — List seller's products
router.get(
  '/products',
  requireAuth,
  asyncHandler(async (req, res) => {
    const clerkUser = (req as any).clerkUser;
    const user = await getOrCreateDbUser((req as any).clerkId, clerkUser);
    if (!user) {
      res.status(404).json({ error: 'Not Found', message: 'User not found.' });
      return;
    }

    const products = await prisma.sellerProduct.findMany({
      where: { sellerId: user.id },
      orderBy: { createdAt: 'desc' },
    });

    res.json(products);
  })
);

// POST /api/seller/products — Add a product
// Creates in BOTH seller_products AND products tables (dual-write)
// so the product appears in the seller dashboard AND the global shop.
router.post(
  '/products',
  requireAuth,
  validate(createSellerProductSchema),
  asyncHandler(async (req, res) => {
    const clerkUser = (req as any).clerkUser;
    const user = await getOrCreateDbUser((req as any).clerkId, clerkUser);
    if (!user) {
      res.status(404).json({ error: 'Not Found', message: 'User not found.' });
      return;
    }

    const baseSlug = slugify(req.body.title);
    const sellerSlugExists = await prisma.sellerProduct.findFirst({
      where: { sellerId: user.id, slug: baseSlug },
    });
    const sellerSlug = sellerSlugExists ? `${baseSlug}-${Date.now()}` : baseSlug;
    const globalSlug = await uniqueProductSlug(baseSlug);
    const status = req.body.stock > 0 ? 'active' : 'draft';
    const categoryId = await resolveCategoryId(req.body.category);

    // Dual-write: seller_products + products in a single transaction
    const [sellerProduct] = await prisma.$transaction([
      prisma.sellerProduct.create({
        data: {
          title: req.body.title,
          description: req.body.description,
          price: req.body.price,
          originalPrice: req.body.originalPrice,
          images: req.body.images,
          category: req.body.category,
          stock: req.body.stock,
          slug: sellerSlug,
          status,
          sellerId: user.id,
          sellerName: user.name,
        },
      }),
      prisma.product.create({
        data: {
          title: req.body.title,
          slug: globalSlug,
          description: req.body.description,
          price: req.body.price,
          originalPrice: req.body.originalPrice,
          images: req.body.images,
          categoryId,
          tags: [],
          stock: req.body.stock,
          sellerId: user.id,
          sellerName: user.name,
        },
      }),
    ]);

    res.status(201).json(sellerProduct);
  })
);

// PUT /api/seller/products/:id — Update a product
// Also updates the matching product in the global products table.
router.put(
  '/products/:id',
  requireAuth,
  validate(updateSellerProductSchema),
  asyncHandler(async (req, res) => {
    const user = await getOrCreateDbUser((req as any).clerkId);
    if (!user) {
      res.status(404).json({ error: 'Not Found', message: 'User not found.' });
      return;
    }

    const product = await prisma.sellerProduct.findFirst({
      where: { id: req.params.id, sellerId: user.id },
    });

    if (!product) {
      res.status(404).json({ error: 'Not Found', message: 'Product not found.' });
      return;
    }

    const updates: any = { ...req.body };
    if (req.body.title) {
      updates.slug = slugify(req.body.title);
    }
    if (req.body.stock !== undefined && req.body.status === undefined) {
      updates.status = req.body.stock === 0 ? 'sold_out' : 'active';
    }

    // Build the global product updates (map category name → categoryId)
    const globalUpdates: any = {};
    if (req.body.title) globalUpdates.title = req.body.title;
    if (req.body.description) globalUpdates.description = req.body.description;
    if (req.body.price) globalUpdates.price = req.body.price;
    if (req.body.originalPrice !== undefined) globalUpdates.originalPrice = req.body.originalPrice;
    if (req.body.images) globalUpdates.images = req.body.images;
    if (req.body.stock !== undefined) globalUpdates.stock = req.body.stock;
    if (req.body.category) {
      globalUpdates.categoryId = await resolveCategoryId(req.body.category);
    }

    const updated = await prisma.sellerProduct.update({
      where: { id: product.id },
      data: updates,
    });

    // Also sync to global products table (find by sellerId + title match)
    try {
      await prisma.product.updateMany({
        where: { sellerId: user.id, title: product.title },
        data: globalUpdates,
      });
    } catch {
      // Non-critical: global sync may fail if product doesn't exist in products table yet
    }

    res.json(updated);
  })
);

// DELETE /api/seller/products/:id — Delete a product
// Also removes from the global products table.
router.delete(
  '/products/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    const user = await getOrCreateDbUser((req as any).clerkId);
    if (!user) {
      res.status(404).json({ error: 'Not Found', message: 'User not found.' });
      return;
    }

    const product = await prisma.sellerProduct.findFirst({
      where: { id: req.params.id, sellerId: user.id },
    });

    if (!product) {
      res.status(404).json({ error: 'Not Found', message: 'Product not found.' });
      return;
    }

    // Delete from both tables in a transaction
    await prisma.$transaction([
      prisma.sellerProduct.delete({ where: { id: product.id } }),
      // Delete matching global product (by sellerId + title)
      prisma.product.deleteMany({
        where: { sellerId: user.id, title: product.title },
      }),
    ]);

    res.json({ message: 'Product deleted.' });
  })
);

// POST /api/seller/sales — Record a POS sale
router.post(
  '/sales',
  requireAuth,
  validate(recordSaleSchema),
  asyncHandler(async (req, res) => {
    const user = await getOrCreateDbUser((req as any).clerkId);
    if (!user) {
      res.status(404).json({ error: 'Not Found', message: 'User not found.' });
      return;
    }

    const product = await prisma.sellerProduct.findFirst({
      where: { id: req.body.productId, sellerId: user.id },
    });

    if (!product) {
      res.status(404).json({ error: 'Not Found', message: 'Product not found.' });
      return;
    }

    const { quantity, unitPrice, buyerName, buyerEmail, paymentMethod } = req.body;
    const totalAmount = quantity * unitPrice;

    const [sale] = await prisma.$transaction([
      prisma.sellerSale.create({
        data: {
          sellerId: user.id,
          productId: product.id,
          productTitle: product.title,
          productImage: product.images[0] ?? '',
          buyerName,
          buyerEmail,
          quantity,
          unitPrice,
          totalAmount,
          paymentMethod,
          status: 'completed',
        },
      }),
      prisma.sellerProduct.update({
        where: { id: product.id },
        data: {
          stock: Math.max(0, product.stock - quantity),
          status: product.stock - quantity <= 0 ? 'sold_out' : 'active',
        },
      }),
    ]);

    res.status(201).json(sale);
  })
);

// GET /api/seller/analytics — Seller analytics summary
router.get(
  '/analytics',
  requireAuth,
  asyncHandler(async (req, res) => {
    const user = await getOrCreateDbUser((req as any).clerkId);
    if (!user) {
      res.status(404).json({ error: 'Not Found', message: 'User not found.' });
      return;
    }

    const sales = await prisma.sellerSale.findMany({
      where: { sellerId: user.id, status: 'completed' },
      orderBy: { date: 'desc' },
    });

    const totalRevenue = sales.reduce((sum, s) => sum + s.totalAmount, 0);
    const totalOrders = sales.length;

    const productMap = new Map<string, { productId: string; title: string; image: string; unitsSold: number; revenue: number }>();
    sales.forEach((s) => {
      const existing = productMap.get(s.productId);
      if (existing) {
        existing.unitsSold += s.quantity;
        existing.revenue += s.totalAmount;
      } else {
        productMap.set(s.productId, {
          productId: s.productId,
          title: s.productTitle,
          image: s.productImage,
          unitsSold: s.quantity,
          revenue: s.totalAmount,
        });
      }
    });

    const topProducts = Array.from(productMap.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    const dayMap = new Map<string, number>();
    sales.forEach((s) => {
      const date = new Date(s.date).toISOString().split('T')[0];
      dayMap.set(date, (dayMap.get(date) ?? 0) + s.totalAmount);
    });

    const revenueByDay = Array.from(dayMap.entries())
      .map(([date, revenue]) => ({ date, revenue }))
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-30);

    const recentBuyers = sales.slice(0, 10);

    res.json({
      totalRevenue,
      totalOrders,
      topProducts,
      revenueByDay,
      recentBuyers,
    });
  })
);

export default router;
