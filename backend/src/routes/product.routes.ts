import { Router } from "express";
import {
  requireAuth,
  requireAdmin,
} from "../middleware/auth.js";
import { asyncHandler } from "../middleware/errorHandler.js";
import {
  validateBody,
  validateQuery,
  validateParams,
} from "../middleware/validation.js";
import * as productController from "../controllers/product.controller.js";
import {
  createProductSchema,
  updateProductSchema,
  productIdParamSchema,
} from "../schemas/product.schema.js";
import {
  paginationQuerySchema,
} from "../schemas/common.schema.js";

const router = Router();

/**
 * @route   GET /api/products
 * @desc    Get all products (paginated)
 * @access  Public (for customers) or Private (for admin)
 */
router.get(
  "/",
  validateQuery(paginationQuerySchema),
  asyncHandler(productController.getAllProducts),
);

/**
 * @route   GET /api/products/:id
 * @desc    Get product by ID
 * @access  Public
 */
router.get(
  "/:id",
  validateParams(productIdParamSchema),
  asyncHandler(productController.getProductById),
);

/**
 * @route   POST /api/products
 * @desc    Create a new product
 * @access  Private (Admin only)
 */
router.post(
  "/",
  requireAuth,
  requireAdmin,
  validateBody(createProductSchema),
  asyncHandler(productController.createProduct),
);

/**
 * @route   PUT /api/products/:id
 * @desc    Update product by ID
 * @access  Private (Admin only)
 */
router.put(
  "/:id",
  requireAuth,
  requireAdmin,
  validateParams(productIdParamSchema),
  validateBody(updateProductSchema),
  asyncHandler(productController.updateProduct),
);

/**
 * @route   DELETE /api/products/:id
 * @desc    Delete product by ID
 * @access  Private (Admin only)
 */
router.delete(
  "/:id",
  requireAuth,
  requireAdmin,
  validateParams(productIdParamSchema),
  asyncHandler(productController.deleteProduct),
);

/**
 * @route   PATCH /api/products/:id/toggle-availability
 * @desc    Toggle product availability
 * @access  Private (Admin only)
 */
router.patch(
  "/:id/toggle-availability",
  requireAuth,
  requireAdmin,
  validateParams(productIdParamSchema),
  asyncHandler(productController.toggleProductAvailability),
);

export default router;