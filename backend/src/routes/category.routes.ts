import { Router } from "express";
import {
  requireAuth,
  requireAdmin,
} from "../middleware/auth.js";
import { asyncHandler } from "../middleware/errorHandler.js";
import {
  validateBody,
  validateParams,
} from "../middleware/validation.js";
import * as categoryController from "../controllers/category.controller.js";
import {
  createCategorySchema,
  updateCategorySchema,
  categoryIdParamSchema,
} from "../schemas/category.schema.js";

const router = Router();

/**
 * @route   GET /api/categories
 * @desc    Get all active categories (public)
 * @access  Public
 */
router.get(
  "/",
  asyncHandler(categoryController.getAllCategories),
);

/**
 * @route   GET /api/categories/admin/all
 * @desc    Get all categories including inactive (admin only)
 * @access  Private (Admin only)
 */
router.get(
  "/admin/all",
  requireAuth,
  requireAdmin,
  asyncHandler(categoryController.getAllCategoriesAdmin),
);

/**
 * @route   GET /api/categories/:id
 * @desc    Get category by ID
 * @access  Public
 */
router.get(
  "/:id",
  validateParams(categoryIdParamSchema),
  asyncHandler(categoryController.getCategoryById),
);

/**
 * @route   POST /api/categories
 * @desc    Create a new category
 * @access  Private (Admin only)
 */
router.post(
  "/",
  requireAuth,
  requireAdmin,
  validateBody(createCategorySchema),
  asyncHandler(categoryController.createCategory),
);

/**
 * @route   PUT /api/categories/:id
 * @desc    Update category by ID
 * @access  Private (Admin only)
 */
router.put(
  "/:id",
  requireAuth,
  requireAdmin,
  validateParams(categoryIdParamSchema),
  validateBody(updateCategorySchema),
  asyncHandler(categoryController.updateCategory),
);

/**
 * @route   DELETE /api/categories/:id
 * @desc    Delete category by ID
 * @access  Private (Admin only)
 */
router.delete(
  "/:id",
  requireAuth,
  requireAdmin,
  validateParams(categoryIdParamSchema),
  asyncHandler(categoryController.deleteCategory),
);

/**
 * @route   PATCH /api/categories/:id/toggle-status
 * @desc    Toggle category active status
 * @access  Private (Admin only)
 */
router.patch(
  "/:id/toggle-status",
  requireAuth,
  requireAdmin,
  validateParams(categoryIdParamSchema),
  asyncHandler(categoryController.toggleCategoryStatus),
);

export default router;
