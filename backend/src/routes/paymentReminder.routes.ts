import { Router } from "express";
import { processPaymentReminders, getUpcomingPayments } from "../controllers/paymentReminder.controller.js";
import { requireAuth, requireAdmin } from "../middleware/auth.js";

const router = Router();

/**
 * POST /api/payment-reminders/process
 * Process payment reminders and cancellations
 * Can be called via cron job or manually by admin
 */
router.post("/process", requireAuth, requireAdmin, processPaymentReminders);

/**
 * GET /api/payment-reminders/upcoming
 * Get orders with upcoming payment due dates (for admin preview)
 */
router.get("/upcoming", requireAuth, requireAdmin, getUpcomingPayments);

export default router;
