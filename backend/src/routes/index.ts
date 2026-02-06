import { Router } from "express";
import userRoutes from "./user.routes";
import profileRoutes from "./profile.routes";
import authRoutes from "./auth.routes";
import orderRoutes from "./order.routes";

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
router.use("/auth", authRoutes);
router.use("/orders", orderRoutes);

export default router;
