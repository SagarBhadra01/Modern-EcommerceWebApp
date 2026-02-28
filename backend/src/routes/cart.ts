import { Router } from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma';
import { requireAuth } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

// ── Helper: resolve DB user from clerkId ──────
async function getDbUser(clerkId: string) {
  return prisma.user.findUnique({ where: { clerkId } });
}

// ── Schemas ───────────────────────────────────
const addCartItemSchema = z.object({
  productId: z.string(),
  quantity: z.number().int().positive().default(1),
  selectedVariant: z.record(z.string()).optional(),
});

const updateCartItemSchema = z.object({
  quantity: z.number().int().positive(),
});

// ── Routes ────────────────────────────────────

// GET /api/cart — Get user's cart
router.get(
  '/',
  requireAuth,
  asyncHandler(async (req, res) => {
    const user = await getDbUser((req as any).clerkId);
    if (!user) {
      res.status(404).json({ error: 'Not Found', message: 'User not found. Please sync first.' });
      return;
    }

    const items = await prisma.cartItem.findMany({
      where: { userId: user.id },
      include: { product: true },
      orderBy: { createdAt: 'desc' },
    });

    const total = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    res.json({ items, total, itemCount: items.reduce((c, i) => c + i.quantity, 0) });
  })
);

// POST /api/cart — Add item to cart
router.post(
  '/',
  requireAuth,
  validate(addCartItemSchema),
  asyncHandler(async (req, res) => {
    const user = await getDbUser((req as any).clerkId);
    if (!user) {
      res.status(404).json({ error: 'Not Found', message: 'User not found.' });
      return;
    }

    const { productId, quantity, selectedVariant } = req.body;

    const existing = await prisma.cartItem.findUnique({
      where: { userId_productId: { userId: user.id, productId } },
    });

    let item;
    if (existing) {
      item = await prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: existing.quantity + quantity },
        include: { product: true },
      });
    } else {
      item = await prisma.cartItem.create({
        data: { userId: user.id, productId, quantity, selectedVariant },
        include: { product: true },
      });
    }

    res.status(201).json(item);
  })
);

// PUT /api/cart/:itemId — Update quantity
router.put(
  '/:itemId',
  requireAuth,
  validate(updateCartItemSchema),
  asyncHandler(async (req, res) => {
    const user = await getDbUser((req as any).clerkId);
    if (!user) {
      res.status(404).json({ error: 'Not Found', message: 'User not found.' });
      return;
    }

    const item = await prisma.cartItem.findFirst({
      where: { id: req.params.itemId, userId: user.id },
    });

    if (!item) {
      res.status(404).json({ error: 'Not Found', message: 'Cart item not found.' });
      return;
    }

    const updated = await prisma.cartItem.update({
      where: { id: item.id },
      data: { quantity: req.body.quantity },
      include: { product: true },
    });

    res.json(updated);
  })
);

// DELETE /api/cart/:itemId — Remove item
router.delete(
  '/:itemId',
  requireAuth,
  asyncHandler(async (req, res) => {
    const user = await getDbUser((req as any).clerkId);
    if (!user) {
      res.status(404).json({ error: 'Not Found', message: 'User not found.' });
      return;
    }

    const item = await prisma.cartItem.findFirst({
      where: { id: req.params.itemId, userId: user.id },
    });

    if (!item) {
      res.status(404).json({ error: 'Not Found', message: 'Cart item not found.' });
      return;
    }

    await prisma.cartItem.delete({ where: { id: item.id } });
    res.json({ message: 'Item removed from cart.' });
  })
);

// DELETE /api/cart — Clear entire cart
router.delete(
  '/',
  requireAuth,
  asyncHandler(async (req, res) => {
    const user = await getDbUser((req as any).clerkId);
    if (!user) {
      res.status(404).json({ error: 'Not Found', message: 'User not found.' });
      return;
    }

    await prisma.cartItem.deleteMany({ where: { userId: user.id } });
    res.json({ message: 'Cart cleared.' });
  })
);

export default router;
