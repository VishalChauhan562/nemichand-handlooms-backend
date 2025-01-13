// src/routes/orderRoutes.ts
import { Router } from "express";

import { authenticateToken, isAdmin } from "../middleware/auth";
import { verifyPayment } from "../controllers/orderController";

const router = Router();

// Apply authentication middleware to all order routes
router.use(authenticateToken);

router.post("/", verifyPayment);

export default router;
