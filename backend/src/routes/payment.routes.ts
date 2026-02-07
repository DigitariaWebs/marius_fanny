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
  getSquareConfig,
  createInvoice,
  getInvoice,
} from "../controllers/payment.controller.js";
import { validateBody, validateQuery } from "../middleware/validation.js";
import {
  createPaymentSchema,
  refundPaymentSchema,
  listPaymentsSchema,
  createInvoiceSchema,
} from "../schemas/payment.schema.js";

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
router.post("/refund", validateBody(refundPaymentSchema), refundPayment);

/**
 * Invoice routes
 */

// Create a Square invoice
router.post("/invoice", validateBody(createInvoiceSchema), createInvoice);

// Get invoice by ID
router.get("/invoice/:invoiceId", getInvoice);

export default router;
