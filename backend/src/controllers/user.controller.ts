import { Response } from "express";
import { AuthRequest } from "../middleware/auth.js";
import { User } from "../models/User.js";
import { AppError } from "../middleware/errorHandler.js";
import { canManageUser } from "../utils/roles.js";

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
 * Create a new client (admin/staff only)
 */
export async function createClient(req: AuthRequest, res: Response) {
  try {
    const { email, firstName, lastName, phone, status } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new AppError("A user with this email already exists", 400);
    }

    // Create user with client data - use MongoDB _id converted to number
    const user = new User({
      email,
      name: `${firstName} ${lastName}`,
      role: "user",
      status: status || "active",
      emailVerified: true, // Admin-created accounts are verified
      profile: {
        phoneNumber: phone,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await user.save();

    // Convert MongoDB _id to a number for frontend compatibility
    const numericId = parseInt(user._id.toString().slice(-8), 16);

    res.status(201).json({
      success: true,
      data: {
        id: numericId,
        email: user.email,
        firstName,
        lastName,
        phone,
        status: status || "active",
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      message: "Client created successfully",
    });
  } catch (error) {
    if (error instanceof AppError) throw error;
    console.error("Create client error:", error);
    throw new AppError("Failed to create client", 500);
  }
}

/**
 * Get all clients (admin/staff only)
 */
export async function getAllClients(req: AuthRequest, res: Response) {
  try {
    console.log("📥 getAllClients called, query:", req.query);
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const search = req.query.search as string || "";
    console.log("📊 Parsed params - page:", page, "limit:", limit, "search:", search);
    const skip = (page - 1) * limit;

    // Always filter by role: "user" to get only clients
    const query: any = { role: "user" };
    
    // If search is provided, filter by name or email (combined with role filter)
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const [users, total] = await Promise.all([
      User.find(query).skip(skip).limit(limit).sort({ createdAt: -1 }),
      User.countDocuments(query),
    ]);

    // Transform users to client format
    const clients = users.map((user) => {
      const numericId = user.id || parseInt(user._id.toString().slice(-8), 16);
      const nameParts = (user.name || "").split(" ");
      return {
        id: numericId,
        firstName: nameParts[0] || "",
        lastName: nameParts.slice(1).join(" "),
        email: user.email,
        phone: user.profile?.phoneNumber || "",
        status: (user.status || "active") as "active" | "inactive" | "placeholder",
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        addresses: [],
        orders: [],
      };
    });

    res.json({
      success: true,
      data: {
        clients,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    throw new AppError("Failed to get clients", 500);
  }
}

/**
 * Search clients by email (for autocomplete)
 */
export async function searchClients(req: AuthRequest, res: Response) {
  try {
    const q = req.query.q as string;
    if (!q || q.length < 2) {
      return res.json({ success: true, data: [] });
    }

    // Only search users with role "user" (clients)
    const users = await User.find({
      role: "user",
      $or: [
        { email: { $regex: q, $options: "i" } },
        { name: { $regex: q, $options: "i" } },
      ],
    })
      .limit(10)
      .select("id email name profile.phoneNumber");

    const clients = users.map((user) => {
      const numericId = user.id || parseInt(user._id.toString().slice(-8), 16);
      return {
        id: numericId,
        firstName: user.name.split(" ")[0],
        lastName: user.name.split(" ").slice(1).join(" "),
        email: user.email,
        phone: user.profile?.phoneNumber || "",
      };
    });

    res.json({
      success: true,
      data: clients,
    });
  } catch (error) {
    throw new AppError("Failed to search clients", 500);
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
