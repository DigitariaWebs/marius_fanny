/**
 * Payment Routes
 * Square payment processing endpoints
 */

import { Router } from "express";
import {
  createPayment,
  getPayment,
  listPayments,
  refundPayment,
  refundOrderPayment,
  refundBalance,
  getSquareConfig,
  createInvoice,
  getInvoice,
  squareWebhook,
} from "../controllers/payment.controller.js";
import { validateBody, validateQuery } from "../middleware/validation.js";
import {
  createPaymentSchema,
  refundPaymentSchema,
  refundOrderSchema,
  listPaymentsSchema,
  createInvoiceSchema,
} from "../schemas/payment.schema.js";
import { requireAuth, requireAdmin, requireRole } from "../middleware/auth.js";

const router = Router();

/**
 * Public routes
 */

// Get Square configuration for frontend
router.get("/config", getSquareConfig);

// Square webhook (receives payment notifications)
router.post("/webhook", squareWebhook);

/**
 * Payment processing routes
 */

// Create a new payment
router.post("/create", validateBody(createPaymentSchema), createPayment);

// Get payment by ID
router.get("/:paymentId", getPayment);

// List payments with pagination
router.get("/list", validateQuery(listPaymentsSchema), listPayments);

// Refund a payment
router.post("/refund", requireAuth, requireAdmin, validateBody(refundPaymentSchema), refundPayment);
router.post(
  "/refund-order",
  requireAuth,
  requireAdmin,
  validateBody(refundOrderSchema),
  refundOrderPayment,
);

// Partial refund for balance difference
router.post(
  "/refund-balance",
  requireAuth,
  requireAdmin,
  refundBalance,
);

/**
 * Invoice routes
 */

// Create a Square invoice
router.post(
  "/invoice",
  requireAuth,
  requireRole("admin", "vendeur"),
  validateBody(createInvoiceSchema),
  createInvoice,
);

// Get invoice by ID
router.get("/invoice/:invoiceId", getInvoice);

export default router;
