import { Router } from "express";
import {
  requireAuth,
  requireRole,
  requireStaff,
  requireAdmin,
} from "../middleware/auth.js";
import { asyncHandler } from "../middleware/errorHandler.js";
import {
  validateBody,
  validateQuery,
  validateParams,
} from "../middleware/validation.js";
import * as userController from "../controllers/user.controller.js";
import {
  updateCurrentUserSchema,
  updateUserSchema,
  searchUsersSchema,
  userIdParamSchema,
} from "../schemas/user.schema.js";
import {
  paginationQuerySchema,
} from "../schemas/common.schema.js";

const router = Router();

/**
 * @route   GET /api/users/me
 * @desc    Get current user profile
 * @access  Private
 */
router.get("/me", requireAuth, asyncHandler(userController.getCurrentUser));

/**
 * @route   PUT /api/users/me
 * @desc    Update current user profile
 * @access  Private
 */
router.put(
  "/me",
  requireAuth,
  validateBody(updateCurrentUserSchema),
  asyncHandler(userController.updateCurrentUser),
);

/**
 * @route   GET /api/users/search
 * @desc    Search users by name or email
 * @access  Private
 */
router.get(
  "/search",
  requireAuth,
  validateQuery(searchUsersSchema),
  asyncHandler(userController.searchUsers),
);

/**
 * @route   GET /api/users
 * @desc    Get all users (paginated)
 * @access  Private (Admin only)
 */
router.get(
  "/",
  requireAuth,
  requireAdmin,
  validateQuery(paginationQuerySchema),
  asyncHandler(userController.getAllUsers),
);

/**
 * @route   GET /api/users/:id
 * @desc    Get user by ID
 * @access  Private
 */
router.get(
  "/:id",
  requireAuth,
  validateParams(userIdParamSchema),
  asyncHandler(userController.getUserById),
);

/**
 * @route   PUT /api/users/:id
 * @desc    Update user by ID
 * @access  Private (Admin only)
 */
router.put(
  "/:id",
  requireAuth,
  requireAdmin,
  validateParams(userIdParamSchema),
  validateBody(updateUserSchema),
  asyncHandler(userController.updateUser),
);

/**
 * @route   DELETE /api/users/:id
 * @desc    Delete user by ID
 * @access  Private (Admin only)
 */
router.delete(
  "/:id",
  requireAuth,
  requireAdmin,
  validateParams(userIdParamSchema),
  asyncHandler(userController.deleteUser),
);

export default router;
