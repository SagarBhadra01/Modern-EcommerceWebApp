import { Router } from 'express';
import productsRouter from './products';
import cartRouter from './cart';
import ordersRouter from './orders';
import sellerRouter from './seller';
import adminRouter from './admin';
import usersRouter from './users';

const router = Router();

router.use('/products', productsRouter);
router.use('/cart', cartRouter);
router.use('/orders', ordersRouter);
router.use('/seller', sellerRouter);
router.use('/admin', adminRouter);
router.use('/users', usersRouter);

export default router;
