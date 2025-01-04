import { Router } from 'express';
import {
  addCategory,
  updateCategory,
  deleteCategory
} from '../../controllers/admin/categoryController';
import { isAdmin } from '../../middleware/auth';

const router = Router();

router.use(isAdmin); // Apply admin middleware to all routes

router.post('/', addCategory);
router.put('/:id', updateCategory);
router.delete('/:id', deleteCategory);

export default router;