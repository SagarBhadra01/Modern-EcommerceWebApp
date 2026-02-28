import { Router } from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma';
import { requireAuth, requireAdmin } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

// ── Helper ────────────────────────────────────
async function getDbUser(clerkId: string) {
  return prisma.user.findUnique({ where: { clerkId } });
}

// ── Schemas ───────────────────────────────────
const createOrderSchema = z.object({
  shippingAddress: z.object({
    fullName: z.string().min(2),
    line1: z.string().min(5),
    line2: z.string().optional(),
    city: z.string().min(2),
    state: z.string().min(2),
    zip: z.string().min(5),
    country: z.string().min(2),
    phone: z.string().optional(),
    email: z.string().email().optional(),
  }),
});

const updateStatusSchema = z.object({
  status: z.enum(['processing', 'shipped', 'delivered', 'cancelled']),
});

// ── Routes ────────────────────────────────────

// GET /api/orders — List current user's orders
router.get(
  '/',
  requireAuth,
  asyncHandler(async (req, res) => {
    const user = await getDbUser((req as any).clerkId);
    if (!user) {
      res.status(404).json({ error: 'Not Found', message: 'User not found.' });
      return;
    }

    const orders = await prisma.order.findMany({
      where: { userId: user.id },
      include: { items: { include: { product: true } } },
      orderBy: { createdAt: 'desc' },
    });

    res.json(orders);
  })
);

// GET /api/orders/:id — Get single order detail
router.get(
  '/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    const user = await getDbUser((req as any).clerkId);
    if (!user) {
      res.status(404).json({ error: 'Not Found', message: 'User not found.' });
      return;
    }

    const order = await prisma.order.findFirst({
      where: { id: req.params.id, userId: user.id },
      include: { items: { include: { product: true } } },
    });

    if (!order) {
      res.status(404).json({ error: 'Not Found', message: 'Order not found.' });
      return;
    }

    res.json(order);
  })
);

// POST /api/orders — Create order from current cart
router.post(
  '/',
  requireAuth,
  validate(createOrderSchema),
  asyncHandler(async (req, res) => {
    const user = await getDbUser((req as any).clerkId);
    if (!user) {
      res.status(404).json({ error: 'Not Found', message: 'User not found.' });
      return;
    }

    // Fetch user's cart
    const cartItems = await prisma.cartItem.findMany({
      where: { userId: user.id },
      include: { product: true },
    });

    if (cartItems.length === 0) {
      res.status(400).json({ error: 'Bad Request', message: 'Cart is empty.' });
      return;
    }

    // Calculate total
    const total = cartItems.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );

    // Create order + items in a transaction
    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          userId: user.id,
          total,
          shippingAddress: req.body.shippingAddress,
          items: {
            create: cartItems.map((item) => ({
              productId: item.productId,
              title: item.product.title,
              image: item.product.images[0] ?? '',
              price: item.product.price,
              quantity: item.quantity,
            })),
          },
        },
        include: { items: true },
      });

      // Clear cart after order
      await tx.cartItem.deleteMany({ where: { userId: user.id } });

      return newOrder;
    });

    res.status(201).json(order);
  })
);

// PUT /api/orders/:id/status — Update order status (admin only)
router.put(
  '/:id/status',
  requireAuth,
  requireAdmin,
  validate(updateStatusSchema),
  asyncHandler(async (req, res) => {
    const order = await prisma.order.update({
      where: { id: req.params.id },
      data: { status: req.body.status },
    });
    res.json(order);
  })
);

export default router;
