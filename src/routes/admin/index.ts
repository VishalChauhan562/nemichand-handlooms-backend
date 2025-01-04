import { Router } from 'express';
import productRoutes from './productRoutes';
import categoryRoutes from './categoryRoutes';
import { createAdmin } from '../../controllers/userController';

const router = Router();

router.use('/products', productRoutes);
router.use('/categories', categoryRoutes);
router.post('/users/register', createAdmin);


export default router;