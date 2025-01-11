// src/routes/cartRoutes.ts
import { Router } from "express";
import {
  getCart,
  addItem,
  updatedCart,
  removeItem,
} from "../controllers/cartController";
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Apply authentication middleware
router.use(authenticateToken);

// Cart routes
router.get("/", getCart);
router.post("/items", addItem);
router.put("/items/:id", updatedCart);
router.delete("/items/:id", removeItem);

export default router;
