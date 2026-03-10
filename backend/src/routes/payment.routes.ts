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
  getSquareConfig,
  createInvoice,
  getInvoice,
} from "../controllers/payment.controller.js";
import { validateBody, validateQuery } from "../middleware/validation.js";
import {
  createPaymentSchema,
  refundPaymentSchema,
  refundOrderSchema,
  listPaymentsSchema,
  createInvoiceSchema,
} from "../schemas/payment.schema.js";
import { requireAuth, requireAdmin } from "../middleware/auth.js";

const router = Router();

/**
 * Public routes
 */

// Get Square configuration for frontend
router.get("/config", getSquareConfig);

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

/**
 * Invoice routes
 */

// Create a Square invoice
router.post("/invoice", requireAuth, requireAdmin, validateBody(createInvoiceSchema), createInvoice);

// Get invoice by ID
router.get("/invoice/:invoiceId", getInvoice);

export default router;
