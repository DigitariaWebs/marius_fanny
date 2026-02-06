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
} from "../controllers/payment.controller";
import { validateBody, validateQuery } from "../middleware/validation";
import {
  createPaymentSchema,
  refundPaymentSchema,
  listPaymentsSchema,
} from "../schemas/payment.schema";

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

export default router;
