import express from 'express';
import categoryRoutes from './categoryRoutes';
import productRoutes from './productRoutes';

const router = express.Router();

router.use('/categories', categoryRoutes);
router.use('/products', productRoutes);

export default router;