import { Request, Response, NextFunction } from "express";
import { auth } from "../config/auth.js";
import { hasRolePermission, UserRole, USER_ROLES } from "../utils/roles.js";
import { User } from "../models/User.js";

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    name: string;
    emailVerified: boolean;
    image?: string | null;
    createdAt: Date;
    updatedAt: Date;
  };
  session?: {
    id: string;
    userId: string;
    expiresAt: Date;
  };
}

/**
 * Middleware to verify user authentication using Better Auth
 * Attaches user and session to request if authenticated
 */
export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const session = await auth.api.getSession({
      headers: req.headers as any,
    });

    if (!session) {
      return res.status(401).json({
        success: false,
        error: "Unauthorized",
        message: "Authentication required",
      });
    }

    // Attach user and session to request
    (req as AuthRequest).user = session.user;
    (req as AuthRequest).session = session.session;

    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    return res.status(401).json({
      success: false,
      error: "Unauthorized",
      message: "Invalid or expired session",
    });
  }
}

/**
 * Optional auth middleware - does not block if no session
 * Attaches user to request if authenticated
 */
export async function optionalAuth(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const session = await auth.api.getSession({
      headers: req.headers as any,
    });

    if (session) {
      (req as AuthRequest).user = session.user;
      (req as AuthRequest).session = session.session;
    }

    next();
  } catch (error) {
    // Silent fail for optional auth
    next();
  }
}

/**
 * Middleware to check if user has specific role (exact match)
 */
export function requireRole(...roles: string[]) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const authReq = req as AuthRequest;

    if (!authReq.user) {
      return res.status(401).json({
        success: false,
        error: "Unauthorized",
        message: "Authentication required",
      });
    }

    try {
      // Get user role from database
      const user = await User.findOne({ email: authReq.user.email });
      const userRole = user?.role || "user";

      if (!roles.includes(userRole)) {
        return res.status(403).json({
          success: false,
          error: "Forbidden",
          message: "Insufficient permissions",
        });
      }

      next();
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: "Internal Server Error",
        message: "Failed to verify permissions",
      });
    }
  };
}

/**
 * Middleware to check if user has minimum role level (hierarchical)
 * Example: requireMinRole("staff") allows staff, customerService and admin
 */
export function requireMinRole(minRole: UserRole) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const authReq = req as AuthRequest;

    if (!authReq.user) {
      return res.status(401).json({
        success: false,
        error: "Unauthorized",
        message: "Authentication required",
      });
    }

    try {
      // Get user role from database
      const user = await User.findOne({ email: authReq.user.email });
      const userRole = user?.role || "user";

      if (!hasRolePermission(userRole, minRole)) {
        return res.status(403).json({
          success: false,
          error: "Forbidden",
          message: `Minimum role required: ${minRole}`,
        });
      }

      next();
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: "Internal Server Error",
        message: "Failed to verify permissions",
      });
    }
  };
}

/**
 * Convenience middleware for common role checks
 */
export const requireUser = requireMinRole(USER_ROLES.USER);
export const requireStaff = requireMinRole(USER_ROLES.STAFF);
export const requireCustomerService = requireMinRole(USER_ROLES.CUSTOMER_SERVICE);
export const requireAdmin = requireMinRole(USER_ROLES.ADMIN);