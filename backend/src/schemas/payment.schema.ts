/**
 * Payment Validation Schemas
 * Zod schemas for Square payment requests
 */

import { z } from "zod";

/**
 * Create Payment Schema
 * POST /api/payments/create
 */
export const createPaymentSchema = z.object({
  sourceId: z.string().min(1, "Payment source ID is required"),
  amount: z.number().positive("Amount must be positive"),
  currency: z.string().optional().default("CAD"),
  customerId: z.string().optional(),
  note: z.string().optional(),
});

/**
 * Refund Payment Schema
 * POST /api/payments/refund
 */
export const refundPaymentSchema = z.object({
  paymentId: z.string().min(1, "Payment ID is required"),
  amount: z.number().positive("Refund amount must be positive"),
  currency: z.string().optional().default("CAD"),
  reason: z.string().optional(),
});

/**
 * List Payments Schema
 * GET /api/payments/list
 */
export const listPaymentsSchema = z.object({
  beginTime: z.string().optional(),
  endTime: z.string().optional(),
  cursor: z.string().optional(),
});

// Type exports
export type CreatePaymentInput = z.infer<typeof createPaymentSchema>;
export type RefundPaymentInput = z.infer<typeof refundPaymentSchema>;
export type ListPaymentsInput = z.infer<typeof listPaymentsSchema>;
