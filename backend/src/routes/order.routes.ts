import { Router } from "express";
import {
  createOrder,
  getOrders,
  getOrderById,
  updateOrder,
  deleteOrder,
  validateDelivery,
  getDeliveryZones,
} from "../controllers/order.controller";
import { validateBody, validateQuery } from "../middleware/validation";
import {
  createOrderSchema,
  updateOrderSchema,
  validateDeliverySchema,
  orderQuerySchema,
} from "../schemas/order.schema";

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
 * Note: Authentication middleware should be added in the main routes file
 */

// Create a new order
router.post(
  "/",
  validateBody(createOrderSchema),
  createOrder,
);

// Get all orders with pagination and filters
router.get(
  "/",
  validateQuery(orderQuerySchema),
  getOrders,
);

// Get a single order by ID
router.get("/:id", getOrderById);

// Update an order (admin/superuser only)
router.patch(
  "/:id",
  validateBody(updateOrderSchema),
  updateOrder,
);

// Delete an order (admin only)
router.delete("/:id", deleteOrder);

export default router;
