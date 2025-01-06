// src/routes/admin/productRoutes.ts
import { Router } from 'express';
import {
  addProduct,
  updateProduct,
  deleteProduct,
  getAllProducts
} from '../../controllers/admin/productController';
import { isAdmin } from '../../middleware/auth';

const router = Router();

// router.use(isAdmin); // Apply admin middleware to all routes

router.post('/', addProduct);
router.put('/:id', updateProduct);
router.delete('/:id', deleteProduct);
router.get('/', getAllProducts);

export default router;

