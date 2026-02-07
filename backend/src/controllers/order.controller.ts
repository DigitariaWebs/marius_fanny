import { Request, Response } from "express";
import Order from "../models/Order.js";
import type { ApiResponse, PaginatedResponse } from "../types.js";
import type {
  CreateOrderInput,
  UpdateOrderInput,
  OrderQueryParams,
} from "../schemas/order.schema.js";
import {
  calculateDeliveryFee,
  validateMinimumOrder,
  getAllDeliveryZones,
} from "../utils/deliveryZones.js";
import { sendOrderReceipt } from "../utils/emailService.js";

// Tax rate for Quebec (TPS + TVQ)
const TAX_RATE = 0.14975;

/**
 * Create a new order
 * POST /api/orders
 */
export const createOrder = async (
  req: Request<{}, {}, CreateOrderInput>,
  res: Response<ApiResponse>,
) => {
  try {
    const orderData = req.body;

    // Calculate totals
    const subtotal = orderData.items.reduce(
      (sum, item) => sum + item.amount,
      0,
    );
    const taxAmount = subtotal * TAX_RATE;
    let deliveryFee = 0;

    // If delivery, calculate and validate delivery fee
    if (orderData.deliveryType === "delivery" && orderData.deliveryAddress) {
      const deliveryInfo = calculateDeliveryFee(
        orderData.deliveryAddress.postalCode,
      );

      if (!deliveryInfo.isValid) {
        return res.status(400).json({
          success: false,
          error: "Code postal non valide pour la livraison",
        });
      }

      deliveryFee = deliveryInfo.fee;

      // Validate minimum order
      const minimumValidation = validateMinimumOrder(
        orderData.deliveryAddress.postalCode,
        subtotal,
      );

      if (!minimumValidation.isValid) {
        return res.status(400).json({
          success: false,
          error: `Montant minimum de commande non atteint. Minimum requis: ${minimumValidation.minimumOrder.toFixed(2)}$ pour ${minimumValidation.postalCode}. Il manque ${minimumValidation.shortfall.toFixed(2)}$.`,
        });
      }
    }

    const total = subtotal + taxAmount + deliveryFee;
    const depositAmount = total * 0.5; // 50% deposit

    // Determine payment status based on payment type and depositPaid flag
    let depositPaid = false;
    let balancePaid = false;

    if (orderData.paymentType === "full" && orderData.depositPaid) {
      // Full payment made upfront
      depositPaid = true;
      balancePaid = true;
    } else if (orderData.paymentType === "deposit" && orderData.depositPaid) {
      // Deposit payment made
      depositPaid = true;
      balancePaid = false;
    } else if (orderData.paymentType === "invoice") {
      // Invoice - no payment yet
      depositPaid = false;
      balancePaid = false;
    }

    // Create order
    const order = new Order({
      userId: req.user?.id,
      clientInfo: orderData.clientInfo,
      pickupDate: orderData.pickupDate
        ? new Date(orderData.pickupDate)
        : undefined,
      pickupLocation: orderData.pickupLocation,
      deliveryType: orderData.deliveryType,
      deliveryAddress: orderData.deliveryAddress,
      items: orderData.items,
      subtotal,
      taxAmount,
      deliveryFee,
      total,
      depositAmount,
      paymentType: orderData.paymentType || "full",
      depositPaid,
      balancePaid,
      squarePaymentId: orderData.squarePaymentId,
      notes: orderData.notes,
    });

    await order.save();

    // Send order receipt email based on payment type
    try {
      const customerName = `${orderData.clientInfo.firstName} ${orderData.clientInfo.lastName}`;

      await sendOrderReceipt(orderData.paymentType || "full", {
        email: orderData.clientInfo.email,
        name: customerName,
        orderNumber: order.orderNumber,
        items: orderData.items.map((item) => ({
          productName: item.productName,
          quantity: item.quantity,
          amount: item.amount,
        })),
        subtotal,
        taxAmount,
        deliveryFee,
        total,
        depositAmount: depositPaid ? depositAmount : undefined,
        paymentId: orderData.squarePaymentId,
        invoiceUrl: undefined, // Will be updated via webhook or separate call
      });

      console.log(
        `✅ Order receipt email sent to ${orderData.clientInfo.email}`,
      );
    } catch (emailError: any) {
      // Log email error but don't fail the order creation
      console.error(
        `⚠️ Failed to send order receipt email:`,
        emailError.message,
      );
    }

    res.status(201).json({
      success: true,
      data: order,
      message: "Commande créée avec succès",
    });
  } catch (error: any) {
    console.error("Error creating order:", error);
    res.status(500).json({
      success: false,
      error: "Erreur lors de la création de la commande",
      message: error.message,
    });
  }
};

/**
 * Get all orders with pagination and filters
 * GET /api/orders
 */
export const getOrders = async (
  req: Request,
  res: Response<PaginatedResponse<any> | ApiResponse>,
) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      deliveryType,
      paymentStatus,
      fromDate,
      toDate,
    } = req.query as any;

    // Build query
    const query: any = {};

    if (status) query.status = status;
    if (deliveryType) query.deliveryType = deliveryType;
    if (paymentStatus) query.paymentStatus = paymentStatus;

    // Date range filter
    if (fromDate || toDate) {
      query.orderDate = {};
      if (fromDate) query.orderDate.$gte = new Date(fromDate);
      if (toDate) query.orderDate.$lte = new Date(toDate);
    }

    // If user is authenticated and not admin, only show their orders
    if (req.user && req.user.role !== "admin" && req.user.role !== "superuser") {
      query.userId = req.user.id;
    }

    // Execute query with pagination
    const skip = (Number(page) - 1) * Number(limit);
    const [orders, total] = await Promise.all([
      Order.find(query).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      Order.countDocuments(query),
    ]);

    const totalPages = Math.ceil(total / Number(limit));

    res.json({
      success: true,
      data: {
        items: orders,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          totalPages,
        },
      },
    });
  } catch (error: any) {
    console.error("Error fetching orders:", error);
    res.status(500).json({
      success: false,
      error: "Erreur lors de la récupération des commandes",
      message: error.message,
    });
  }
};

/**
 * Get a single order by ID
 * GET /api/orders/:id
 */
export const getOrderById = async (
  req: Request<{ id: string }>,
  res: Response<ApiResponse>,
) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        error: "Commande non trouvée",
      });
    }

    // Check if user has permission to view this order
    if (
      req.user &&
      req.user.role !== "admin" &&
      req.user.role !== "superuser" &&
      order.userId !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        error: "Accès non autorisé à cette commande",
      });
    }

    res.json({
      success: true,
      data: order,
    });
  } catch (error: any) {
    console.error("Error fetching order:", error);
    res.status(500).json({
      success: false,
      error: "Erreur lors de la récupération de la commande",
      message: error.message,
    });
  }
};

/**
 * Update an order
 * PATCH /api/orders/:id
 */
export const updateOrder = async (
  req: Request<{ id: string }, {}, UpdateOrderInput>,
  res: Response<ApiResponse>,
) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        error: "Commande non trouvée",
      });
    }

    // Check permissions - only admin/superuser can update orders
    if (req.user && req.user.role !== "admin" && req.user.role !== "superuser") {
      return res.status(403).json({
        success: false,
        error: "Vous n'avez pas la permission de modifier cette commande",
      });
    }

    const updateData = req.body;

    // Update fields
    if (updateData.status !== undefined) order.status = updateData.status;
    if (updateData.notes !== undefined) order.notes = updateData.notes;

    // Handle payment updates
    if (updateData.depositPaid !== undefined) {
      order.depositPaid = updateData.depositPaid;
      if (updateData.depositPaid && !order.depositPaidAt) {
        order.depositPaidAt = new Date();
      }
    }

    if (updateData.balancePaid !== undefined) {
      order.balancePaid = updateData.balancePaid;
      if (updateData.balancePaid && !order.balancePaidAt) {
        order.balancePaidAt = new Date();
      }
    }

    await order.save();

    res.json({
      success: true,
      data: order,
      message: "Commande mise à jour avec succès",
    });
  } catch (error: any) {
    console.error("Error updating order:", error);
    res.status(500).json({
      success: false,
      error: "Erreur lors de la mise à jour de la commande",
      message: error.message,
    });
  }
};

/**
 * Delete an order
 * DELETE /api/orders/:id
 */
export const deleteOrder = async (
  req: Request<{ id: string }>,
  res: Response<ApiResponse>,
) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        error: "Commande non trouvée",
      });
    }

    // Only admin can delete orders
    if (req.user && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        error: "Vous n'avez pas la permission de supprimer cette commande",
      });
    }

    await order.deleteOne();

    res.json({
      success: true,
      message: "Commande supprimée avec succès",
    });
  } catch (error: any) {
    console.error("Error deleting order:", error);
    res.status(500).json({
      success: false,
      error: "Erreur lors de la suppression de la commande",
      message: error.message,
    });
  }
};

/**
 * Validate delivery fee and minimum order
 * POST /api/orders/validate-delivery
 */
export const validateDelivery = async (
  req: Request<{}, {}, { postalCode: string; subtotal: number }>,
  res: Response<ApiResponse>,
) => {
  try {
    const { postalCode, subtotal } = req.body;

    const deliveryInfo = calculateDeliveryFee(postalCode);

    if (!deliveryInfo.isValid) {
      return res.status(400).json({
        success: false,
        error: "Code postal non valide pour la livraison",
        data: deliveryInfo,
      });
    }

    const minimumValidation = validateMinimumOrder(postalCode, subtotal);

    res.json({
      success: true,
      data: {
        deliveryFee: deliveryInfo.fee,
        minimumOrder: deliveryInfo.minimumOrder,
        postalCode: postalCode,
        isValid: deliveryInfo.isValid,
        meetsMinimum: minimumValidation.isValid,
        shortfall: minimumValidation.shortfall,
      },
    });
  } catch (error: any) {
    console.error("Error validating delivery:", error);
    res.status(500).json({
      success: false,
      error: "Erreur lors de la validation de la livraison",
      message: error.message,
    });
  }
};

/**
 * Get all delivery zones
 * GET /api/orders/delivery-zones
 */
export const getDeliveryZones = async (
  req: Request,
  res: Response<ApiResponse>,
) => {
  try {
    const zones = getAllDeliveryZones();

    res.json({
      success: true,
      data: zones,
    });
  } catch (error: any) {
    console.error("Error fetching delivery zones:", error);
    res.status(500).json({
      success: false,
      error: "Erreur lors de la récupération des zones de livraison",
      message: error.message,
    });
  }
};
