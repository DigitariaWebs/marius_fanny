import { z } from "zod";

/**
 * User profile schema
 */
export const userProfileSchema = z.object({
  bio: z.string().max(500).optional(),
  avatar: z.string().url().optional(),
  phoneNumber: z
    .string()
    .regex(/^\+?[1-9]\d{1,14}$/)
    .optional(),
});

/**
 * Update current user schema
 */
export const updateCurrentUserSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  profile: userProfileSchema.optional(),
});

/**
 * Update user by ID schema (admin)
 */
export const updateUserSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  role: z.enum(["user", "pro", "staff", "customerService", "admin", "deliveryDriver", "cuisinier", "patissier", "four"]).optional(),
  profile: userProfileSchema.optional(),
  // Client-specific fields
  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().max(100).optional(),
  phone: z.string().max(20).optional(),
  email: z.string().email().optional(),
  status: z.enum(["active", "inactive", "placeholder"]).optional(),
});

/**
 * Create user profile schema
 */
export const createUserProfileSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2).max(100),
  role: z.enum(["user", "pro", "staff", "customerService", "admin", "deliveryDriver", "cuisinier", "patissier", "four"]).optional().default("user"),
});

/**
 * Create client schema (for admin to create clients directly)
 */
export const createClientSchema = z.object({
  email: z.string().email(),
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  phone: z.string().min(1).max(20),
  status: z.enum(["active", "inactive", "placeholder"]).optional().default("active"),
});

/**
 * Search users query schema
 */
export const searchUsersSchema = z.object({
  q: z.string().min(1),
});

/**
 * User ID param schema
 */
export const userIdParamSchema = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid user ID format"),
});

/**
 * Type inference exports
 */
export type UpdateCurrentUserInput = z.infer<typeof updateCurrentUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type CreateUserProfileInput = z.infer<typeof createUserProfileSchema>;
export type SearchUsersQuery = z.infer<typeof searchUsersSchema>;
export type UserIdParam = z.infer<typeof userIdParamSchema>;
