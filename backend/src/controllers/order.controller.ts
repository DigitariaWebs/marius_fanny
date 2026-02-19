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
      deliveryDate: orderData.deliveryDate,
      deliveryTimeSlot: orderData.deliveryTimeSlot,
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
 * Get production list - orders broken down by product for kitchen staff
 * GET /api/orders/production
 */
export const getProductionList = async (
  req: Request,
  res: Response<ApiResponse>,
) => {
  try {
    const { date } = req.query as { date?: string };

    // Build query: orders that need production
    const query: any = {
      status: { $in: ["confirmed", "in_production", "pending"] },
    };

    // Filter by pickup/delivery date if provided
    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      query.$or = [
        { pickupDate: { $gte: startOfDay, $lte: endOfDay } },
        { deliveryDate: date },
        // Also include orders created on this day if no pickup/delivery date set
        { orderDate: { $gte: startOfDay, $lte: endOfDay } },
      ];
    }

    const orders = await Order.find(query).sort({ createdAt: -1 });

    // Flatten orders into production items (one per product per order)
    const productionItems = orders.flatMap((order) =>
      order.items.map((item, idx) => ({
        id: `${order._id}-${idx}`,
        orderId: order._id,
        orderNumber: order.orderNumber,
        productId: item.productId,
        productName: item.productName,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        customerName: `${order.clientInfo.firstName} ${order.clientInfo.lastName}`,
        customerPhone: order.clientInfo.phone,
        deliveryDate: order.deliveryDate || (order.pickupDate ? order.pickupDate.toISOString().split('T')[0] : order.orderDate.toISOString().split('T')[0]),
        deliveryTimeSlot: order.deliveryTimeSlot || "Non spécifié",
        deliveryType: order.deliveryType,
        pickupLocation: order.pickupLocation,
        orderStatus: order.status,
        notes: item.notes || order.notes || "",
      }))
    );

    res.json({
      success: true,
      data: {
        items: productionItems,
        totalOrders: orders.length,
        totalItems: productionItems.length,
      },
    });
  } catch (error: any) {
    console.error("Error fetching production list:", error);
    res.status(500).json({
      success: false,
      error: "Erreur lors de la récupération de la liste de production",
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
    if (req.user && req.user.role !== "admin") {
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

    // Check permissions - only admin can update orders
    if (req.user && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        error: "Vous n'avez pas la permission de modifier cette commande",
      });
    }

    const updateData = req.body;
    const changes: any[] = [];
    const userId = req.user?.id;

    // Track and update client info
    if (updateData.clientInfo) {
      const oldClientInfo = { ...order.clientInfo };
      order.clientInfo = updateData.clientInfo;
      changes.push({
        changedAt: new Date(),
        changedBy: userId,
        field: "clientInfo",
        oldValue: oldClientInfo,
        newValue: updateData.clientInfo,
        changeType: "updated",
        notes: "Client information updated"
      });
    }

    // Track and update pickup date
    if (updateData.pickupDate) {
      const oldPickupDate = order.pickupDate;
      order.pickupDate = new Date(updateData.pickupDate);
      changes.push({
        changedAt: new Date(),
        changedBy: userId,
        field: "pickupDate",
        oldValue: oldPickupDate,
        newValue: order.pickupDate,
        changeType: "updated",
        notes: "Pickup date changed"
      });
    }

    // Track and update pickup location
    if (updateData.pickupLocation) {
      const oldLocation = order.pickupLocation;
      order.pickupLocation = updateData.pickupLocation;
      changes.push({
        changedAt: new Date(),
        changedBy: userId,
        field: "pickupLocation",
        oldValue: oldLocation,
        newValue: updateData.pickupLocation,
        changeType: "updated",
        notes: "Pickup location changed"
      });
    }

    // Track and update delivery type
    if (updateData.deliveryType) {
      const oldDeliveryType = order.deliveryType;
      order.deliveryType = updateData.deliveryType;
      changes.push({
        changedAt: new Date(),
        changedBy: userId,
        field: "deliveryType",
        oldValue: oldDeliveryType,
        newValue: updateData.deliveryType,
        changeType: "updated",
        notes: "Delivery type changed"
      });
    }

    // Track and update delivery address
    if (updateData.deliveryAddress) {
      const oldAddress = order.deliveryAddress;
      order.deliveryAddress = updateData.deliveryAddress;
      changes.push({
        changedAt: new Date(),
        changedBy: userId,
        field: "deliveryAddress",
        oldValue: oldAddress,
        newValue: updateData.deliveryAddress,
        changeType: "updated",
        notes: "Delivery address updated"
      });
    }

    // Track and update items - recalculate totals if items changed
    if (updateData.items) {
      const oldItems = [...order.items];
      order.items = updateData.items;
      
      // Recalculate totals
      const subtotal = updateData.items.reduce((sum, item) => sum + item.amount, 0);
      const taxAmount = subtotal * TAX_RATE;
      let deliveryFee = order.deliveryFee;

      // Recalculate delivery fee if needed
      if (order.deliveryType === "delivery" && order.deliveryAddress) {
        const deliveryInfo = calculateDeliveryFee(order.deliveryAddress.postalCode);
        deliveryFee = deliveryInfo.fee;
      }

      const total = subtotal + taxAmount + deliveryFee;
      const depositAmount = total * 0.5;

      order.subtotal = subtotal;
      order.taxAmount = taxAmount;
      order.deliveryFee = deliveryFee;
      order.total = total;
      order.depositAmount = depositAmount;

      changes.push({
        changedAt: new Date(),
        changedBy: userId,
        field: "items",
        oldValue: oldItems,
        newValue: updateData.items,
        changeType: "items_modified",
        notes: `Order items modified. New total: ${total.toFixed(2)}$`
      });
    }

    // Track and update status
    if (updateData.status !== undefined && updateData.status !== order.status) {
      const oldStatus = order.status;
      order.status = updateData.status;
      changes.push({
        changedAt: new Date(),
        changedBy: userId,
        field: "status",
        oldValue: oldStatus,
        newValue: updateData.status,
        changeType: "status_changed",
        notes: `Status changed from ${oldStatus} to ${updateData.status}`
      });
    }

    // Track and update notes
    if (updateData.notes !== undefined) {
      const oldNotes = order.notes;
      order.notes = updateData.notes;
      changes.push({
        changedAt: new Date(),
        changedBy: userId,
        field: "notes",
        oldValue: oldNotes,
        newValue: updateData.notes,
        changeType: "updated",
        notes: "Order notes updated"
      });
    }

    // Track payment updates
    if (updateData.depositPaid !== undefined && updateData.depositPaid !== order.depositPaid) {
      const oldDepositPaid = order.depositPaid;
      order.depositPaid = updateData.depositPaid;
      if (updateData.depositPaid && !order.depositPaidAt) {
        order.depositPaidAt = new Date();
      }
      changes.push({
        changedAt: new Date(),
        changedBy: userId,
        field: "depositPaid",
        oldValue: oldDepositPaid,
        newValue: updateData.depositPaid,
        changeType: "payment_updated",
        notes: updateData.depositPaid ? "Deposit marked as paid" : "Deposit payment reverted"
      });
    }

    if (updateData.balancePaid !== undefined && updateData.balancePaid !== order.balancePaid) {
      const oldBalancePaid = order.balancePaid;
      order.balancePaid = updateData.balancePaid;
      if (updateData.balancePaid && !order.balancePaidAt) {
        order.balancePaidAt = new Date();
      }
      changes.push({
        changedAt: new Date(),
        changedBy: userId,
        field: "balancePaid",
        oldValue: oldBalancePaid,
        newValue: updateData.balancePaid,
        changeType: "payment_updated",
        notes: updateData.balancePaid ? "Balance marked as paid" : "Balance payment reverted"
      });
    }

    if (updateData.squarePaymentId && updateData.squarePaymentId !== order.squarePaymentId) {
      const oldPaymentId = order.squarePaymentId;
      order.squarePaymentId = updateData.squarePaymentId;
      changes.push({
        changedAt: new Date(),
        changedBy: userId,
        field: "squarePaymentId",
        oldValue: oldPaymentId,
        newValue: updateData.squarePaymentId,
        changeType: "payment_updated",
        notes: "Square payment ID updated"
      });
    }

    if (updateData.squareInvoiceId && updateData.squareInvoiceId !== order.squareInvoiceId) {
      const oldInvoiceId = order.squareInvoiceId;
      order.squareInvoiceId = updateData.squareInvoiceId;
      changes.push({
        changedAt: new Date(),
        changedBy: userId,
        field: "squareInvoiceId",
        oldValue: oldInvoiceId,
        newValue: updateData.squareInvoiceId,
        changeType: "payment_updated",
        notes: "Square invoice ID updated"
      });
    }

    // Add all changes to order history
    if (changes.length > 0) {
      order.changeHistory.push(...changes);
    }

    await order.save();

    console.log(`✅ Order ${order.orderNumber} updated with ${changes.length} changes`);

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
 * Get order change history
 * GET /api/orders/:id/history
 */
export const getOrderHistory = async (
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

    // Check if user has permission to view this order's history
    if (
      req.user &&
      req.user.role !== "admin" &&
      order.userId !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        error: "Accès non autorisé à l'historique de cette commande",
      });
    }

    res.json({
      success: true,
      data: {
        orderNumber: order.orderNumber,
        changeHistory: order.changeHistory || [],
      },
    });
  } catch (error: any) {
    console.error("Error fetching order history:", error);
    res.status(500).json({
      success: false,
      error: "Erreur lors de la récupération de l'historique",
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

/**
 * Update delivery status for an order (for delivery drivers)
 * PATCH /api/orders/:id/delivery-status
 */
export const updateDeliveryStatus = async (
  req: Request<{ id: string }, {}, { deliveryStatus: string }>,
  res: Response<ApiResponse>,
) => {
  try {
    const { id } = req.params;
    const { deliveryStatus } = req.body;

    // Validate delivery status
    const validStatuses = ["pending", "in_transit", "arrived", "delivered"];
    if (!validStatuses.includes(deliveryStatus)) {
      return res.status(400).json({
        success: false,
        error: "Statut de livraison invalide",
      });
    }

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        error: "Commande non trouvée",
      });
    }

    // Only allow updating delivery orders
    if (order.deliveryType !== "delivery") {
      return res.status(400).json({
        success: false,
        error: "Cette commande n'est pas une livraison",
      });
    }

    // Track change in history
    const oldDeliveryStatus = order.deliveryStatus || "pending";
    const oldStatus = order.status;
    order.deliveryStatus = deliveryStatus as
      | "pending"
      | "in_transit"
      | "arrived"
      | "delivered";

    // If delivery is completed, update order status to delivered
    if (deliveryStatus === "delivered") {
      order.status = "delivered";
    }

    const change = {
      changedAt: new Date(),
      changedBy: req.user?.id || "delivery_driver",
      field: "delivery_status",
      oldValue: oldDeliveryStatus,
      newValue: deliveryStatus,
      changeType: "updated" as const,
      notes: `Delivery status updated by driver: ${deliveryStatus}`,
    };

    order.changeHistory = order.changeHistory || [];
    order.changeHistory.push(change);

    await order.save();

    // TODO: Send notification to customer
    // This is where you would integrate with a notification service
    // to send push notifications or SMS to the customer

    res.json({
      success: true,
      message: "Statut de livraison mis à jour avec succès",
      data: {
        orderId: order._id,
        orderNumber: order.orderNumber,
        status: order.status,
        deliveryStatus: order.deliveryStatus,
        updatedAt: new Date(),
      },
    });
  } catch (error: any) {
    console.error("Error updating delivery status:", error);
    res.status(500).json({
      success: false,
      error: "Erreur lors de la mise à jour du statut de livraison",
      message: error.message,
    });
  }
};
