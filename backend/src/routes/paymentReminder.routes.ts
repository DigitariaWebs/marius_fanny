import { Router, Request, Response, NextFunction } from "express";
import { processPaymentReminders, getUpcomingPayments } from "../controllers/paymentReminder.controller.js";
import { requireAuth, requireAdmin } from "../middleware/auth.js";

const router = Router();

/**
 * Token guard for the cron endpoint. The scheduler (GitHub Actions / Vercel
 * Cron / external) sends Authorization: Bearer <CRON_SECRET>.
 */
function requireCronSecret(req: Request, res: Response, next: NextFunction) {
  const expected = process.env.CRON_SECRET;
  if (!expected) {
    return res.status(503).json({
      success: false,
      error: "CRON_SECRET not configured on the server",
    });
  }
  const header = req.header("authorization") || "";
  const provided = header.startsWith("Bearer ") ? header.slice(7) : header;
  if (provided !== expected) {
    return res.status(401).json({ success: false, error: "Invalid cron token" });
  }
  next();
}

/**
 * POST /api/payment-reminders/process
 * Manual trigger by an authenticated admin (button in dashboard).
 */
router.post("/process", requireAuth, requireAdmin, processPaymentReminders);

/**
 * POST /api/payment-reminders/cron
 * Scheduled trigger — protected by CRON_SECRET so a cron job can hit it
 * without an admin session.
 */
router.post("/cron", requireCronSecret, processPaymentReminders);

/**
 * GET /api/payment-reminders/upcoming
 * Get orders with upcoming payment due dates (for admin preview)
 */
router.get("/upcoming", requireAuth, requireAdmin, getUpcomingPayments);

export default router;
