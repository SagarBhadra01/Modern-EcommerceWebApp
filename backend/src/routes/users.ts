import { Router } from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma';
import { requireAuth } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

// ── Schemas ───────────────────────────────────
const syncUserSchema = z.object({
  clerkId: z.string(),
  name: z.string().min(1),
  email: z.string().email(),
  avatar: z.string().optional(),
  phone: z.string().optional(),
});

const updateProfileSchema = z.object({
  name: z.string().min(2).optional(),
  phone: z.string().optional(),
  avatar: z.string().optional(),
});

const upsertAddressSchema = z.object({
  fullName: z.string().min(2),
  line1: z.string().min(5),
  line2: z.string().optional(),
  city: z.string().min(2),
  state: z.string().min(2),
  zip: z.string().min(4),
  country: z.string().min(2),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  isDefault: z.boolean().default(false),
});

// ── Routes ────────────────────────────────────

/**
 * POST /api/users/sync
 * Called on first login to create or update the user record in DB from Clerk.
 * This is called from the frontend after Clerk authentication.
 */
router.post(
  '/sync',
  requireAuth,
  validate(syncUserSchema),
  asyncHandler(async (req, res) => {
    const { clerkId, name, email, avatar, phone } = req.body;

    // Ensure the syncing user matches the authenticated user
    if ((req as any).clerkId !== clerkId) {
      res.status(403).json({ error: 'Forbidden', message: 'Cannot sync another user.' });
      return;
    }

    const user = await prisma.user.upsert({
      where: { clerkId },
      update: { name, email, avatar, phone },
      create: { clerkId, name, email, avatar, phone, role: 'user', status: 'active' },
    });

    res.status(200).json(user);
  })
);

// GET /api/users/me — Get current user's profile
router.get(
  '/me',
  requireAuth,
  asyncHandler(async (req, res) => {
    const user = await prisma.user.findUnique({
      where: { clerkId: (req as any).clerkId },
      include: { addresses: true },
    });

    if (!user) {
      res.status(404).json({ error: 'Not Found', message: 'User not found. Call /sync first.' });
      return;
    }

    res.json(user);
  })
);

// PUT /api/users/me — Update profile
router.put(
  '/me',
  requireAuth,
  validate(updateProfileSchema),
  asyncHandler(async (req, res) => {
    const user = await prisma.user.update({
      where: { clerkId: (req as any).clerkId },
      data: req.body,
      select: { id: true, name: true, email: true, phone: true, avatar: true, role: true },
    });
    res.json(user);
  })
);

// GET /api/users/me/addresses — List user addresses
router.get(
  '/me/addresses',
  requireAuth,
  asyncHandler(async (req, res) => {
    const user = await prisma.user.findUnique({ where: { clerkId: (req as any).clerkId } });
    if (!user) {
      res.status(404).json({ error: 'Not Found', message: 'User not found.' });
      return;
    }

    const addresses = await prisma.address.findMany({
      where: { userId: user.id },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    });

    res.json(addresses);
  })
);

// POST /api/users/me/addresses — Add an address
router.post(
  '/me/addresses',
  requireAuth,
  validate(upsertAddressSchema),
  asyncHandler(async (req, res) => {
    const user = await prisma.user.findUnique({ where: { clerkId: (req as any).clerkId } });
    if (!user) {
      res.status(404).json({ error: 'Not Found', message: 'User not found.' });
      return;
    }

    // If new address is default, unset others
    if (req.body.isDefault) {
      await prisma.address.updateMany({ where: { userId: user.id }, data: { isDefault: false } });
    }

    const address = await prisma.address.create({
      data: { ...req.body, userId: user.id },
    });

    res.status(201).json(address);
  })
);

// DELETE /api/users/me/addresses/:id — Delete an address
router.delete(
  '/me/addresses/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    const user = await prisma.user.findUnique({ where: { clerkId: (req as any).clerkId } });
    if (!user) {
      res.status(404).json({ error: 'Not Found', message: 'User not found.' });
      return;
    }

    const address = await prisma.address.findFirst({
      where: { id: req.params.id, userId: user.id },
    });

    if (!address) {
      res.status(404).json({ error: 'Not Found', message: 'Address not found.' });
      return;
    }

    await prisma.address.delete({ where: { id: address.id } });
    res.json({ message: 'Address deleted.' });
  })
);

export default router;
