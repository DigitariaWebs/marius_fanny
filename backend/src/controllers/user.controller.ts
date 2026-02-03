import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import { User } from "../models/User";
import { AppError } from "../middleware/errorHandler";
import { canManageUser } from "../utils/roles";

/**
 * Get current user profile
 */
export async function getCurrentUser(req: AuthRequest, res: Response) {
  try {
    if (!req.user) {
      throw new AppError("User not found in request", 401);
    }

    const user = await User.findOne({ email: req.user.email });

    if (!user) {
      throw new AppError("User profile not found", 404);
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError("Failed to get user profile", 500);
  }
}

/**
 * Get user by ID
 */
export async function getUserById(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;

    const user = await User.findById(id);

    if (!user) {
      throw new AppError("User not found", 404);
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError("Failed to get user", 500);
  }
}

/**
 * Get all users (paginated)
 */
export async function getAllUsers(req: AuthRequest, res: Response) {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      User.find().skip(skip).limit(limit).sort({ createdAt: -1 }),
      User.countDocuments(),
    ]);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    throw new AppError("Failed to get users", 500);
  }
}

/**
 * Update current user profile
 */
export async function updateCurrentUser(req: AuthRequest, res: Response) {
  try {
    if (!req.user) {
      throw new AppError("User not found in request", 401);
    }

    const { name, profile } = req.body;

    const user = await User.findOneAndUpdate(
      { email: req.user.email },
      {
        $set: {
          ...(name && { name }),
          ...(profile && { profile }),
        },
      },
      { new: true, runValidators: true },
    );

    if (!user) {
      throw new AppError("User not found", 404);
    }

    res.json({
      success: true,
      data: user,
      message: "Profile updated successfully",
    });
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError("Failed to update profile", 500);
  }
}

/**
 * Update user by ID (admin only)
 */
export async function updateUser(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const { name, role, profile } = req.body;

    // Get current user's role
    const currentUser = await User.findOne({ email: req.user?.email });
    if (!currentUser) {
      throw new AppError("Current user not found", 401);
    }

    // Get target user
    const targetUser = await User.findById(id);
    if (!targetUser) {
      throw new AppError("User not found", 404);
    }

    // Check if current user can manage target user
    if (!canManageUser(currentUser.role, targetUser.role)) {
      throw new AppError("Cannot manage user with equal or higher role", 403);
    }

    // If trying to change role, verify current user can assign that role
    if (role && !canManageUser(currentUser.role, role)) {
      throw new AppError(
        "Cannot assign a role equal to or higher than your own",
        403,
      );
    }

    const user = await User.findByIdAndUpdate(
      id,
      {
        $set: {
          ...(name && { name }),
          ...(role && { role }),
          ...
          (profile && { profile }),
        },
      },
      { new: true, runValidators: true },
    );

    res.json({
      success: true,
      data: user,
      message: "User updated successfully",
    });
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError("Failed to update user", 500);
  }
}

/**
 * Delete user by ID (admin only)
 */
export async function deleteUser(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;

    // Get current user's role
    const currentUser = await User.findOne({ email: req.user?.email });
    if (!currentUser) {
      throw new AppError("Current user not found", 401);
    }

    // Get target user
    const targetUser = await User.findById(id);
    if (!targetUser) {
      throw new AppError("User not found", 404);
    }

    // Prevent self-deletion
    if (req.user && req.user.email === targetUser.email) {
      throw new AppError("Cannot delete your own account", 400);
    }

    // Check if current user can manage target user
    if (!canManageUser(currentUser.role, targetUser.role)) {
      throw new AppError("Cannot delete user with equal or higher role", 403);
    }

    await User.findByIdAndDelete(id);

    res.json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError("Failed to delete user", 500);
  }
}

/**
 * Search users by name or email
 */
export async function searchUsers(req: AuthRequest, res: Response) {
  try {
    const { q } = req.query;

    if (!q || typeof q !== "string") {
      throw new AppError("Search query is required", 400);
    }

    const users = await User.find({
      $or: [
        { name: { $regex: q, $options: "i" } },
        { email: { $regex: q, $options: "i" } },
      ],
    }).limit(20);

    res.json({
      success: true,
      data: users,
    });
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError("Failed to search users", 500);
  }
}
