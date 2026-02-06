/**
 * Square Payment Controller
 * Handles payment processing with Square API
 */

import { Request, Response } from "express";
import { randomUUID } from "crypto";
import { SquareError } from "square";
import squareClient, { squareConfig } from "../config/square";

/**
 * Create a Square payment
 * POST /api/payments/create
 */
export const createPayment = async (req: Request, res: Response) => {
  const startTime = Date.now();
  console.log(
    `🔄 [PAYMENT] Starting payment creation for amount: ${req.body.amount} CAD`,
  );

  try {
    const { sourceId, amount, currency = "CAD", customerId, note } = req.body;

    // Validate required fields
    if (!sourceId || !amount) {
      console.error(
        `❌ [PAYMENT] Validation failed: sourceId and amount are required`,
      );
      return res.status(400).json({
        success: false,
        error: "sourceId and amount are required",
      });
    }

    // Log the sourceId for debugging (first/last 6 chars only)
    const sourceIdPreview =
      sourceId.length > 12
        ? `${sourceId.substring(0, 6)}...${sourceId.substring(sourceId.length - 6)}`
        : sourceId;
    console.log(
      `🔑 [PAYMENT] Source ID: ${sourceIdPreview} (length: ${sourceId.length})`,
    );
    console.log(
      `🏪 [PAYMENT] Location ID: ${squareConfig.locationId || "NOT SET"}`,
    );
    console.log(`🌐 [PAYMENT] Environment: ${squareConfig.environment}`);

    // Convert amount to cents (Square expects smallest currency unit)
    const amountInCents = Math.round(amount * 100);
    console.log(
      `💰 [PAYMENT] Processing payment for ${amount} CAD (${amountInCents} cents)`,
    );

    // Create idempotency key to prevent duplicate charges
    const idempotencyKey = randomUUID();
    console.log(`🔑 [PAYMENT] Generated idempotency key: ${idempotencyKey}`);

    // Create payment with Square (omit empty optional fields)
    const paymentRequest: any = {
      sourceId,
      idempotencyKey,
      amountMoney: {
        amount: BigInt(amountInCents),
        currency,
      },
      autocomplete: true, // Complete payment immediately
    };

    if (squareConfig.locationId) {
      paymentRequest.locationId = squareConfig.locationId;
    }

    if (customerId) {
      paymentRequest.customerId = customerId;
    }

    if (note) {
      paymentRequest.note = note;
    }

    const response = await squareClient.payments.create(paymentRequest);

    const payment = response.payment;
    const processingTime = Date.now() - startTime;

    console.log(
      `✅ [PAYMENT] Payment successful! ID: ${payment?.id}, Status: ${payment?.status}, Amount: ${payment?.amountMoney?.amount} cents, Processing time: ${processingTime}ms`,
    );

    res.json({
      success: true,
      data: {
        paymentId: payment?.id,
        status: payment?.status,
        amountMoney: {
          amount: payment?.amountMoney?.amount
            ? Number(payment.amountMoney.amount)
            : 0,
          currency: payment?.amountMoney?.currency,
        },
        receiptUrl: payment?.receiptUrl,
      },
    });
  } catch (error: any) {
    const processingTime = Date.now() - startTime;
    console.error(`❌ [PAYMENT] Payment failed after ${processingTime}ms`);

    // Handle Square SDK v44 errors (SquareError)
    if (error instanceof SquareError) {
      console.error(`🚨 [PAYMENT] SquareError status: ${error.statusCode}`);
      console.error(`🚨 [PAYMENT] SquareError message: ${error.message}`);
      console.error(
        `🚨 [PAYMENT] SquareError body:`,
        JSON.stringify(error.body, null, 2),
      );

      const squareErrors = (error.body as any)?.errors;
      if (squareErrors && Array.isArray(squareErrors)) {
        const errorMessages = squareErrors
          .map(
            (e: any) =>
              `${e.category}: ${e.detail || e.code || "Unknown error"}${e.field ? ` (field: ${e.field})` : ""}`,
          )
          .join("; ");

        return res.status(error.statusCode || 400).json({
          success: false,
          error: errorMessages || "Payment validation failed",
          details: squareErrors,
        });
      }

      return res.status(error.statusCode || 400).json({
        success: false,
        error: error.message || "Square API error",
      });
    }

    // Handle legacy error format
    if (error?.statusCode) {
      console.error(`🚨 [PAYMENT] Square API status code:`, error.statusCode);
    }

    if (error?.body) {
      console.error(
        `🚨 [PAYMENT] Square API error body:`,
        JSON.stringify(error.body, null, 2),
      );
    }

    const squareErrors = error?.body?.errors || error?.errors;
    if (squareErrors && Array.isArray(squareErrors)) {
      console.error(
        `🚨 [PAYMENT] Square API errors:`,
        JSON.stringify(squareErrors, null, 2),
      );

      const errorMessages = squareErrors
        .map(
          (e: any) =>
            `${e.category}: ${e.detail || e.code || "Unknown error"}${e.field ? ` (field: ${e.field})` : ""}`,
        )
        .join("; ");

      return res.status(400).json({
        success: false,
        error: errorMessages || "Payment validation failed",
        details: squareErrors,
      });
    }

    console.error(
      `💥 [PAYMENT] Unexpected error during payment processing:`,
      error.message || error,
    );
    res.status(500).json({
      success: false,
      error: error.message || "An error occurred while processing payment",
    });
  }
};

/**
 * Get payment by ID
 * GET /api/payments/:paymentId
 */
export const getPayment = async (req: Request, res: Response) => {
  const { paymentId } = req.params;
  console.log(`🔍 [PAYMENT] Fetching payment details for ID: ${paymentId}`);

  try {
    // List payments and find the one with matching ID
    // Note: Single payment retrieval not directly supported in SDK
    const response = await squareClient.payments.list({
      locationId: squareConfig.locationId,
    });

    let payment = null;
    for await (const p of response) {
      if (p.id === paymentId) {
        payment = p;
        break;
      }
    }

    if (payment) {
      console.log(
        `✅ [PAYMENT] Payment found: ${paymentId}, Status: ${payment.status}`,
      );
    } else {
      console.log(`⚠️ [PAYMENT] Payment not found: ${paymentId}`);
    }

    res.json({
      success: true,
      data: payment,
    });
  } catch (error: any) {
    console.error(`❌ [PAYMENT] Error fetching payment ${paymentId}:`, error);

    res.status(500).json({
      success: false,
      error: "Failed to fetch payment",
    });
  }
};

/**
 * List payments with pagination
 * GET /api/payments/list
 */
export const listPayments = async (req: Request, res: Response) => {
  const { beginTime, endTime } = req.query;
  console.log(
    `📋 [PAYMENT] Listing payments${beginTime ? ` from ${beginTime}` : ""}${endTime ? ` to ${endTime}` : ""}`,
  );

  try {
    const response = await squareClient.payments.list({
      locationId: squareConfig.locationId,
      beginTime: beginTime as string,
      endTime: endTime as string,
    });

    const payments = [];
    for await (const payment of response) {
      payments.push({
        ...payment,
        amountMoney: payment.amountMoney
          ? {
              amount: Number(payment.amountMoney.amount),
              currency: payment.amountMoney.currency,
            }
          : undefined,
      });
    }

    console.log(`✅ [PAYMENT] Retrieved ${payments.length} payments`);

    res.json({
      success: true,
      data: {
        payments,
      },
    });
  } catch (error: any) {
    console.error(`❌ [PAYMENT] Error listing payments:`, error);

    res.status(500).json({
      success: false,
      error: "Failed to list payments",
    });
  }
};

/**
 * Refund a payment
 * POST /api/payments/refund
 */
export const refundPayment = async (req: Request, res: Response) => {
  const startTime = Date.now();
  console.log(`🔄 [REFUND] Starting refund process`);

  try {
    const { paymentId, amount, currency = "CAD", reason } = req.body;

    if (!paymentId || !amount) {
      console.error(
        `❌ [REFUND] Validation failed: paymentId and amount are required`,
      );
      return res.status(400).json({
        success: false,
        error: "paymentId and amount are required",
      });
    }

    const amountInCents = Math.round(amount * 100);
    const idempotencyKey = randomUUID();

    console.log(
      `💸 [REFUND] Processing refund for payment ${paymentId}, amount: ${amount} CAD (${amountInCents} cents), reason: ${reason || "Not specified"}`,
    );

    const response = await (squareClient.refunds as any).create({
      idempotencyKey,
      paymentId,
      amountMoney: {
        amount: BigInt(amountInCents),
        currency,
      },
      reason,
    });

    const refund = response.refund;
    const processingTime = Date.now() - startTime;

    console.log(
      `✅ [REFUND] Refund successful! ID: ${refund?.id}, Status: ${refund?.status}, Amount: ${refund?.amountMoney?.amount} cents, Processing time: ${processingTime}ms`,
    );

    res.json({
      success: true,
      data: {
        refundId: refund?.id,
        status: refund?.status,
        amountMoney: refund?.amountMoney
          ? {
              amount: Number(refund.amountMoney.amount),
              currency: refund.amountMoney.currency,
            }
          : undefined,
      },
    });
  } catch (error: any) {
    const processingTime = Date.now() - startTime;
    console.error(
      `❌ [REFUND] Refund failed after ${processingTime}ms:`,
      error,
    );

    if (error.errors) {
      console.error(`🚨 [REFUND] Square API errors:`, error.errors);
      return res.status(400).json({
        success: false,
        error: "Refund failed",
        details: error.errors,
      });
    }

    console.error(
      `💥 [REFUND] Unexpected error during refund processing:`,
      error.message,
    );
    res.status(500).json({
      success: false,
      error: "An error occurred while processing refund",
    });
  }
};

/**
 * Get Square configuration for frontend
 * GET /api/payments/config
 */
export const getSquareConfig = async (req: Request, res: Response) => {
  console.log(`⚙️ [CONFIG] Square configuration requested`);

  try {
    // Validate that required configuration exists
    if (!squareConfig.applicationId || !squareConfig.locationId) {
      console.error(
        `❌ [CONFIG] Missing required Square configuration:`,
        {
          hasApplicationId: !!squareConfig.applicationId,
          hasLocationId: !!squareConfig.locationId,
          applicationId: squareConfig.applicationId ? `${squareConfig.applicationId.substring(0, 10)}...` : 'MISSING',
          locationId: squareConfig.locationId ? `${squareConfig.locationId.substring(0, 10)}...` : 'MISSING',
        }
      );
      
      return res.status(500).json({
        success: false,
        error: "Square payment configuration is incomplete. Please check environment variables: SQUARE_APPLICATION_ID and SQUARE_LOCATION_ID",
      });
    }

    const config = {
      applicationId: squareConfig.applicationId,
      locationId: squareConfig.locationId,
      environment: squareConfig.environment,
    };

    console.log(
      `✅ [CONFIG] Square configuration provided for environment: ${config.environment}`,
      {
        applicationId: `${config.applicationId.substring(0, 10)}...`,
        locationId: `${config.locationId.substring(0, 10)}...`,
      }
    );

    res.json({
      success: true,
      data: config,
    });
  } catch (error: any) {
    console.error(`❌ [CONFIG] Error providing Square configuration:`, error);

    res.status(500).json({
      success: false,
      error: "Failed to load payment configuration",
    });
  }
};
