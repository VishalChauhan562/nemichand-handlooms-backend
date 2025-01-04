import express from 'express';
import {
  getAllProducts,
  getProductById,
  searchProducts,
  getFeaturedProducts
} from '../controllers/productController';

const router = express.Router();

// Product routes
router.get('/', getAllProducts);
router.get('/search', searchProducts);
router.get('/featured', getFeaturedProducts);
router.get('/:id', getProductById);

export default router;