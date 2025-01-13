// src/routes/orderRoutes.ts
import { Router } from "express";
import {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
} from "../controllers/orderController";
import { authenticateToken, isAdmin } from "../middleware/auth";

const router = Router();

// Apply authentication middleware to all order routes
router.use(authenticateToken);

// Order routes
router.post("/", createOrder);
router.get("/", getOrders);
router.get("/:id", getOrderById);
router.put("/:id/status", isAdmin, updateOrderStatus);

export default router;
