import { Router } from "express";
import userRoutes from "./user.routes.js";
import profileRoutes from "./profile.routes.js";
import authRoutes from "./auth.routes.js";
import orderRoutes from "./order.routes.js";
import paymentRoutes from "./payment.routes.js";
import productRoutes from "./product.routes.js";

const router = Router();

/**
 * Health check endpoint
 */
router.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "API is healthy",
    timestamp: new Date().toISOString(),
  });
});

/**
 * Mount route modules
 */
router.use("/users", userRoutes);
router.use("/profile", profileRoutes);
router.use("/auth-password", authRoutes);
router.use("/orders", orderRoutes);
router.use("/payments", paymentRoutes);
router.use("/products", productRoutes);

export default router;
