import { Router } from "express";
import userRoutes from "./user.routes.js";
import profileRoutes from "./profile.routes.js";
import authRoutes from "./auth.routes.js";
import orderRoutes from "./order.routes.js";
import proOrderRoutes from "./proOrder.routes.js";
import paymentRoutes from "./payment.routes.js";
import productRoutes from "./product.routes.js";
import uploadRoutes from "./upload.routes.js";
import categoryRoutes from "./category.routes.js";
import inventoryRoutes from "./inventory.routes.js";
import dailyInventoryRoutes from "./dailyInventory.routes.js";
import partnerRoutes from "./partner.routes.js";
import promoRoutes from "./promo.routes.js";
import paymentReminderRoutes from "./paymentReminder.routes.js";
import settingsRoutes from "./settings.routes.js";
import contactRoutes from "./contact.routes.js";
import quoteRoutes from "./quote.routes.js";

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

router.get("/public/google-review", (req, res) => {
  const placeId = String(process.env.GOOGLE_REVIEW_PLACE_ID_LAVAL || "").trim();
  const url =
    (placeId
      ? `https://search.google.com/local/writereview?placeid=${encodeURIComponent(placeId)}`
      : "https://www.google.com/maps/search/?api=1&query=Marius%20%26%20Fanny%20Laval");
  res.redirect(302, url);
});

/**
 * Mount route modules
 */
router.use("/users", userRoutes);
router.use("/profile", profileRoutes);
router.use("/auth-password", authRoutes);
router.use("/orders", orderRoutes);
router.use("/pro-orders", proOrderRoutes);
router.use("/payments", paymentRoutes);
router.use("/products", productRoutes);
router.use("/categories", categoryRoutes);
router.use("/upload", uploadRoutes);
router.use("/inventory", inventoryRoutes);
router.use("/daily-inventory", dailyInventoryRoutes);
router.use("/partner-request", partnerRoutes);
router.use("/promos", promoRoutes);
router.use("/payment-reminders", paymentReminderRoutes);
router.use("/settings", settingsRoutes);
router.use("/contact", contactRoutes);
router.use("/quotes", quoteRoutes);

export default router;
