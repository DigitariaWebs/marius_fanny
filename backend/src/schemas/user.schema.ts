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
  role: z.enum(["user", "superuser", "admin"]).optional(),
  profile: userProfileSchema.optional(),
});

/**
 * Create user profile schema
 */
export const createUserProfileSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2).max(100),
  role: z.enum(["user", "superuser", "admin"]).optional().default("user"),
});

/**
 * Search users query schema
 */
export const searchUsersSchema = z.object({
  q: z.string().min(1),
});

/**
 * Pagination query schema
 */
export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
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
export type PaginationQuery = z.infer<typeof paginationSchema>;
export type UserIdParam = z.infer<typeof userIdParamSchema>;
