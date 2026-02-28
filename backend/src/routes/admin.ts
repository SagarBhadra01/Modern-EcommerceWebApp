import { Router } from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma';
import { requireAuth, requireAdmin } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

// ── Schemas ───────────────────────────────────
const updateUserSchema = z.object({
  role: z.enum(['user', 'admin']).optional(),
  status: z.enum(['active', 'banned']).optional(),
});

const adminOrderQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  status: z.enum(['processing', 'shipped', 'delivered', 'cancelled']).optional(),
});

// ── Routes ────────────────────────────────────

// GET /api/admin/stats — Dashboard overview stats
router.get(
  '/stats',
  requireAuth,
  requireAdmin,
  asyncHandler(async (_req, res) => {
    const [totalUsers, totalProducts, totalOrders, revenueAgg] = await Promise.all([
      prisma.user.count(),
      prisma.product.count(),
      prisma.order.count(),
      prisma.order.aggregate({ _sum: { total: true }, where: { status: { not: 'cancelled' } } }),
    ]);

    const totalRevenue = revenueAgg._sum.total ?? 0;

    // Recent orders (last 10)
    const recentOrders = await prisma.order.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { name: true, email: true } } },
    });

    // Revenue by day (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentSales = await prisma.order.findMany({
      where: { createdAt: { gte: thirtyDaysAgo }, status: { not: 'cancelled' } },
      select: { createdAt: true, total: true },
    });

    const dayMap = new Map<string, number>();
    recentSales.forEach((s) => {
      const date = s.createdAt.toISOString().split('T')[0];
      dayMap.set(date, (dayMap.get(date) ?? 0) + s.total);
    });

    const revenueByDay = Array.from(dayMap.entries())
      .map(([date, revenue]) => ({ date, revenue }))
      .sort((a, b) => a.date.localeCompare(b.date));

    res.json({
      totalUsers,
      totalProducts,
      totalOrders,
      totalRevenue,
      recentOrders,
      revenueByDay,
    });
  })
);

// GET /api/admin/users — List all users
router.get(
  '/users',
  requireAuth,
  requireAdmin,
  asyncHandler(async (_req, res) => {
    const users = await prisma.user.findMany({
      orderBy: { joinedAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        avatar: true,
        joinedAt: true,
        phone: true,
        _count: { select: { orders: true } },
      },
    });
    res.json(users);
  })
);

// PUT /api/admin/users/:id — Update user role or status
router.put(
  '/users/:id',
  requireAuth,
  requireAdmin,
  validate(updateUserSchema),
  asyncHandler(async (req, res) => {
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: req.body,
      select: { id: true, name: true, email: true, role: true, status: true },
    });
    res.json(user);
  })
);

// GET /api/admin/orders — All orders with pagination
router.get(
  '/orders',
  requireAuth,
  requireAdmin,
  validate(adminOrderQuerySchema, 'query'),
  asyncHandler(async (req, res) => {
    const { page, limit, status } = (req as any).query;
    const skip = (page - 1) * limit;
    const where = status ? { status } : {};

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { name: true, email: true } },
          items: true,
        },
      }),
      prisma.order.count({ where }),
    ]);

    res.json({ orders, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  })
);

// GET /api/admin/analytics — Full revenue analytics
router.get(
  '/analytics',
  requireAuth,
  requireAdmin,
  asyncHandler(async (_req, res) => {
    const [totalRevenue, ordersByStatus, topBuyers] = await Promise.all([
      prisma.order.aggregate({ _sum: { total: true }, where: { status: { not: 'cancelled' } } }),

      prisma.order.groupBy({
        by: ['status'],
        _count: { id: true },
        _sum: { total: true },
      }),

      prisma.order.groupBy({
        by: ['userId'],
        _count: { id: true },
        _sum: { total: true },
        orderBy: { _sum: { total: 'desc' } },
        take: 10,
      }),
    ]);

    // Enrich topBuyers with user info
    const userIds = topBuyers.map((b) => b.userId);
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, name: true, email: true },
    });
    const userMap = new Map(users.map((u) => [u.id, u]));

    const enrichedTopBuyers = topBuyers.map((b) => ({
      ...userMap.get(b.userId),
      orderCount: b._count.id,
      totalSpent: b._sum.total ?? 0,
    }));

    res.json({
      totalRevenue: totalRevenue._sum.total ?? 0,
      ordersByStatus,
      topBuyers: enrichedTopBuyers,
    });
  })
);

export default router;
