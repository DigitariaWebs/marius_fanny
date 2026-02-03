import { Router } from "express";
import { requireAuth, optionalAuth } from "../middleware/auth";
import { asyncHandler } from "../middleware/errorHandler";
import { validateBody } from "../middleware/validation";
import * as authController from "../controllers/auth.controller";
import { createUserProfileSchema } from "../schemas/user.schema";

const router = Router();

/**
 * @route   GET /api/profile/session
 * @desc    Get current session info
 * @access  Private
 */
router.get("/session", requireAuth, asyncHandler(authController.getSession));

/**
 * @route   GET /api/profile/verify-email
 * @desc    Check email verification status
 * @access  Private
 */
router.get(
  "/verify-email",
  requireAuth,
  asyncHandler(authController.checkEmailVerification),
);

/**
 * @route   POST /api/profile/sync
 * @desc    Sync Better Auth user with Mongoose User model
 * @access  Private
 */
router.post("/sync", requireAuth, asyncHandler(authController.syncUserProfile));

/**
 * @route   GET /api/profile/stats
 * @desc    Get user stats for dashboard
 * @access  Private
 */
router.get("/stats", requireAuth, asyncHandler(authController.getUserStats));

/**
 * @route   POST /api/profile/create
 * @desc    Create user profile after authentication
 * @access  Public
 */
router.post(
  "/create",
  validateBody(createUserProfileSchema),
  asyncHandler(authController.createUserProfile),
);

export default router;
