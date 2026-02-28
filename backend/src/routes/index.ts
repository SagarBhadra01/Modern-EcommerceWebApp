import { Router } from 'express';
import productsRouter from './products';
import cartRouter from './cart';
import ordersRouter from './orders';
import sellerRouter from './seller';
import adminRouter from './admin';
import usersRouter from './users';
import categoriesRouter from './categories';
import reviewsRouter from './reviews';
import wishlistRouter from './wishlist';
import contentRouter from './content';

const router = Router();

router.use('/products', productsRouter);
router.use('/cart', cartRouter);
router.use('/orders', ordersRouter);
router.use('/seller', sellerRouter);
router.use('/admin', adminRouter);
router.use('/users', usersRouter);
router.use('/categories', categoriesRouter);
router.use('/reviews', reviewsRouter);
router.use('/wishlist', wishlistRouter);
router.use('/content', contentRouter);

export default router;
