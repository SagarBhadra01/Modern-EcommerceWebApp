import { Router } from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma';
import { requireAuth } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

// ── Helper ────────────────────────────────────
async function getDbUser(clerkId: string) {
  return prisma.user.findUnique({ where: { clerkId } });
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[\s\W-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// ── Schemas ───────────────────────────────────
const createSellerProductSchema = z.object({
  title: z.string().min(2),
  description: z.string().min(10),
  price: z.number().positive(),
  originalPrice: z.number().positive().optional(),
  images: z.array(z.string()).min(1),
  category: z.string().min(2),
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
    const user = await getDbUser((req as any).clerkId);
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
router.post(
  '/products',
  requireAuth,
  validate(createSellerProductSchema),
  asyncHandler(async (req, res) => {
    const user = await getDbUser((req as any).clerkId);
    if (!user) {
      res.status(404).json({ error: 'Not Found', message: 'User not found.' });
      return;
    }

    const slug = slugify(req.body.title);
    const status = req.body.stock > 0 ? 'active' : 'draft';

    const product = await prisma.sellerProduct.create({
      data: {
        ...req.body,
        slug,
        status,
        sellerId: user.id,
        sellerName: user.name,
      },
    });

    res.status(201).json(product);
  })
);

// PUT /api/seller/products/:id — Update a product
router.put(
  '/products/:id',
  requireAuth,
  validate(updateSellerProductSchema),
  asyncHandler(async (req, res) => {
    const user = await getDbUser((req as any).clerkId);
    if (!user) {
      res.status(404).json({ error: 'Not Found', message: 'User not found.' });
      return;
    }

    // Ensure seller owns this product
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

    const updated = await prisma.sellerProduct.update({
      where: { id: product.id },
      data: updates,
    });

    res.json(updated);
  })
);

// DELETE /api/seller/products/:id — Delete a product
router.delete(
  '/products/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    const user = await getDbUser((req as any).clerkId);
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

    await prisma.sellerProduct.delete({ where: { id: product.id } });
    res.json({ message: 'Product deleted.' });
  })
);

// POST /api/seller/sales — Record a POS sale
router.post(
  '/sales',
  requireAuth,
  validate(recordSaleSchema),
  asyncHandler(async (req, res) => {
    const user = await getDbUser((req as any).clerkId);
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
    const user = await getDbUser((req as any).clerkId);
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

    // Top products by revenue
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

    // Revenue by day (last 30 days)
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
