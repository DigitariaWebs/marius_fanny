import { Router } from "express";
import {
  createOrder,
  getOrders,
  getOrderById,
  getProductionList,
  updateOrder,
  deleteOrder,
  validateDelivery,
  getDeliveryZones,
  getOrderHistory,
  updateDeliveryStatus,
} from "../controllers/order.controller.js";
import { validateBody, validateQuery } from "../middleware/validation.js";
import {
  createOrderSchema,
  updateOrderSchema,
  validateDeliverySchema,
  orderQuerySchema,
} from "../schemas/order.schema.js";
import { requireAuth, requireAdmin } from "../middleware/auth.js";

const router = Router();

/**
 * Public routes
 */

// Get all delivery zones - public endpoint
router.get("/delivery-zones", getDeliveryZones);

// Validate delivery fee and minimum order - public endpoint
router.post(
  "/validate-delivery",
  validateBody(validateDeliverySchema),
  validateDelivery,
);

/**
 * Order management routes
 * Authentication required for creating and managing orders
 */

// Create a new order (requires authentication)
router.post("/", requireAuth, validateBody(createOrderSchema), createOrder);

// Get production list for kitchen (requires authentication)
router.get("/production", requireAuth, getProductionList);

// Get all orders with pagination and filters (requires authentication)
router.get("/", requireAuth, validateQuery(orderQuerySchema), getOrders);

// Get a single order by ID (requires authentication)
router.get("/:id", requireAuth, getOrderById);

// Get order change history (requires authentication)
router.get("/:id/history", requireAuth, getOrderHistory);

// Update delivery status (for delivery drivers)
router.patch("/:id/delivery-status", requireAuth, updateDeliveryStatus);

// Update an order (admin only)
router.patch(
  "/:id",
  requireAdmin,
  validateBody(updateOrderSchema),
  updateOrder,
);

// Delete an order (admin only)
router.delete("/:id", requireAdmin, deleteOrder);

export default router;
