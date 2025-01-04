// src/routes/categoryRoutes.ts
import { Router } from 'express';
import { 
  getAllCategories,
  getCategoryById,
  getProductsByCategory
} from '../controllers/categoryController';

const router = Router();

// Category routes
router.get('/', getAllCategories);
router.get('/:id', getCategoryById);
router.get('/:id/products', getProductsByCategory);

export default router;