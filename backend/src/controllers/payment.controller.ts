/**
 * Square Payment Controller
 * Handles payment processing with Square API
 */

import { Request, Response } from "express";
import { randomUUID } from "crypto";
import { SquareError } from "square";
import squareClient, { squareConfig } from "../config/square.js";
import Order from "../models/Order.js";
import { sendSms } from "../utils/smsService.js";

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

/**
 * Create a Square invoice
 * POST /api/payments/invoice
 */
export const createInvoice = async (req: Request, res: Response) => {
  const startTime = Date.now();
  console.log(`🧾 [INVOICE] Creating Square invoice`);

  try {
    const {
      orderId,
      customerEmail,
      customerPhone,
      customerName,
      deliveryChannel = "email",
      items,
      deliveryFee = 0,
      taxAmount,
      total,
      dueDate,
      notes,
    } = req.body;

    // Validate required fields
    if (!orderId || !customerEmail || !customerName || !items || !total) {
      console.error(`❌ [INVOICE] Missing required fields`);
      return res.status(400).json({
        success: false,
        error: "orderId, customerEmail, customerName, items, and total are required",
      });
    }

    console.log(`📧 [INVOICE] Creating invoice for ${customerEmail} (Order: ${orderId})`);

    // Create idempotency key
    const idempotencyKey = randomUUID();

    // Build line items for the invoice
    const lineItems = items.map((item: any, index: number) => ({
      name: item.name,
      quantity: item.quantity.toString(),
      itemType: "ITEM",
      basePriceMoney: {
        amount: Math.round(item.unitPrice * 100),
        currency: "CAD",
      },
    }));

    // Add delivery fee as a line item if applicable
    if (deliveryFee > 0) {
      lineItems.push({
        name: "Frais de livraison",
        quantity: "1",
        itemType: "ITEM",
        basePriceMoney: {
          amount: Math.round(deliveryFee * 100),
          currency: "CAD",
        },
      });
    }

    // Calculate due date (default to 7 days from now)
    const invoiceDueDate = dueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    // Create the invoice
    const invoiceRequest: any = {
      idempotencyKey,
      locationId: squareConfig.locationId,
      order: {
        locationId: squareConfig.locationId,
        referenceId: orderId,
        lineItems,
        taxes: [
          {
            name: "TPS + TVQ",
            percentage: "14.975",
            scope: "ORDER",
          },
        ],
      },
      invoiceNumber: orderId,
      title: `Commande ${orderId}`,
      description: notes || `Facture pour la commande ${orderId}`,
      scheduledAt: new Date().toISOString(),
      dueDate: invoiceDueDate,
      primaryRecipient: {
        emailAddress: customerEmail,
        givenName: customerName.split(" ")[0] || customerName,
        familyName: customerName.split(" ").slice(1).join(" ") || "",
      },
      paymentRequests: [
        {
          requestType: "BALANCE",
          dueDate: invoiceDueDate,
          automaticPaymentSource: "NONE",
        },
      ],
      deliveryMethod: deliveryChannel === "sms" ? "SHARE_MANUALLY" : "EMAIL",
      acceptedPaymentMethods: {
        card: true,
        squareGiftCard: false,
        bankAccount: false,
        buyNowPayLater: false,
      },
    };

    const response = await squareClient.invoices.create(invoiceRequest);
    console.log(`📦 [INVOICE] Response structure:`, Object.keys(response));
    console.log(`📦 [INVOICE] Full response:`, JSON.stringify(response, null, 2));
    const invoice = (response as any).invoice;
    const processingTime = Date.now() - startTime;

    console.log(
      `✅ [INVOICE] Invoice created successfully! ID: ${invoice?.id}, Number: ${invoice?.invoiceNumber}, Processing time: ${processingTime}ms`,
    );

    // Publish the invoice to make it active and send through selected channel.
    if (invoice?.id) {
      try {
        console.log(`📤 [INVOICE] Publishing invoice ${invoice.id} (${deliveryChannel})...`);
        const publishResponse = await squareClient.invoices.publish({
          invoiceId: invoice.id,
          version: invoice.version!,
          idempotencyKey: randomUUID(),
        });

        if (deliveryChannel === "sms") {
          const publicUrl = (publishResponse as any)?.invoice?.publicUrl || invoice.publicUrl;
          if (!customerPhone || !publicUrl) {
            throw new Error("SMS impossible: numero client ou lien facture manquant");
          }

          await sendSms({
            to: customerPhone,
            body: `Maison Fanny: votre lien de paiement pour la commande ${orderId}: ${publicUrl}`,
          });
          console.log(`✅ [INVOICE] Invoice published and SMS sent`);
        } else {
          console.log(`✅ [INVOICE] Invoice published and email sent`);
        }
      } catch (publishError: any) {
        console.error(`⚠️ [INVOICE] Failed to publish invoice:`, publishError.message);
        // Continue even if publish fails - invoice is still created
      }
    }

    res.json({
      success: true,
      data: {
        invoiceId: invoice?.id,
        invoiceNumber: invoice?.invoiceNumber,
        status: invoice?.status,
        publicUrl: invoice?.publicUrl,
        deliveryChannel,
        dueDate: invoice?.paymentRequests?.[0]?.dueDate,
      },
    });
  } catch (error: any) {
    const processingTime = Date.now() - startTime;
    console.error(`❌ [INVOICE] Invoice creation failed after ${processingTime}ms`);
    console.error(`📋 [INVOICE] Error details:`, {
      message: error.message,
      statusCode: error.statusCode,
      errorCode: error.errorCode,
      body: error.body,
      response: error.response,
      fullError: error
    });

    if (error instanceof SquareError) {
      console.error(`🚨 [INVOICE] SquareError:`, error.body);
      return res.status(error.statusCode || 400).json({
        success: false,
        error: error.message || "Failed to create invoice",
        details: (error.body as any)?.errors,
      });
    }

    res.status(500).json({
      success: false,
      error: error.message || "An error occurred while creating invoice",
    });
  }
};

const findSquarePaymentIdForOrder = async (order: any): Promise<string | null> => {
  if (order.squarePaymentId) return order.squarePaymentId;

  if (!order.squareInvoiceId) return null;

  const invoiceResponse = await squareClient.invoices.get({
    invoiceId: order.squareInvoiceId,
  });
  const squareOrderId = (invoiceResponse as any)?.invoice?.orderId;

  if (!squareOrderId) return null;

  const payments = await squareClient.payments.list({
    locationId: squareConfig.locationId,
  });

  let matchedPaymentId: string | null = null;
  for await (const payment of payments) {
    if (payment.orderId === squareOrderId && payment.status === "COMPLETED") {
      matchedPaymentId = payment.id || null;
      break;
    }
  }

  return matchedPaymentId;
};

/**
 * Refund an order through Square, preferring direct paymentId then invoice-linked payment.
 * POST /api/payments/refund-order
 */
export const refundOrderPayment = async (req: Request, res: Response) => {
  try {
    const { orderId, reason } = req.body as { orderId: string; reason?: string };

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, error: "Commande non trouvee" });
    }

    const alreadyRefunded = typeof order.notes === "string" && order.notes.includes("Square Refund ID:");
    if (alreadyRefunded) {
      return res.status(400).json({
        success: false,
        error: "Cette commande semble deja remboursee",
      });
    }

    const paymentId = await findSquarePaymentIdForOrder(order);
    if (!paymentId) {
      return res.status(400).json({
        success: false,
        error: "Aucun paiement Square remboursable trouve pour cette commande",
      });
    }

    const refundResponse = await (squareClient.refunds as any).create({
      idempotencyKey: randomUUID(),
      paymentId,
      amountMoney: {
        amount: BigInt(Math.round(order.total * 100)),
        currency: "CAD",
      },
      reason: reason || `Remboursement commande ${order.orderNumber}`,
    });

    const refund = refundResponse?.refund;

    order.status = "cancelled";
    order.paymentStatus = "unpaid";
    order.balancePaid = false;
    order.balancePaidAt = undefined;
    order.notes = `${order.notes ? `${order.notes}\n` : ""}Square Refund ID: ${refund?.id || "N/A"}`;
    order.changeHistory.push({
      changedAt: new Date(),
      changedBy: req.user?.id,
      field: "paymentStatus",
      oldValue: "paid",
      newValue: "unpaid",
      changeType: "payment_updated",
      notes: `Square refund executed (paymentId: ${paymentId})`,
    } as any);
    await order.save();

    return res.json({
      success: true,
      data: {
        orderId: order._id,
        orderNumber: order.orderNumber,
        paymentId,
        refundId: refund?.id,
        refundStatus: refund?.status,
      },
      message: "Remboursement Square effectue avec succes",
    });
  } catch (error: any) {
    console.error("❌ [REFUND-ORDER] Error refunding order:", error);

    if (error instanceof SquareError) {
      return res.status(error.statusCode || 400).json({
        success: false,
        error: error.message || "Erreur Square lors du remboursement",
        details: (error.body as any)?.errors,
      });
    }

    return res.status(500).json({
      success: false,
      error: error.message || "Erreur lors du remboursement de la commande",
    });
  }
};

/**
 * Get a Square invoice by ID
 * GET /api/payments/invoice/:invoiceId
 */
export const getInvoice = async (req: Request, res: Response) => {
  const { invoiceId } = req.params;
  const invoiceIdStr = Array.isArray(invoiceId) ? invoiceId[0] : invoiceId;
  console.log(`🔍 [INVOICE] Fetching invoice: ${invoiceIdStr}`);

  try {
    const response = await squareClient.invoices.get({
      invoiceId: invoiceIdStr,
    });
    const invoice = (response as any).invoice;

    console.log(
      `✅ [INVOICE] Invoice retrieved: ${invoiceId}, Status: ${invoice?.status}`,
    );

    res.json({
      success: true,
      data: invoice,
    });
  } catch (error: any) {
    console.error(`❌ [INVOICE] Error fetching invoice ${invoiceId}:`, error);

    if (error instanceof SquareError) {
      return res.status(error.statusCode || 404).json({
        success: false,
        error: error.message || "Invoice not found",
      });
    }

    res.status(500).json({
      success: false,
      error: "Failed to fetch invoice",
    });
  }
};

