import { z } from "zod";

/**
 * Common MongoDB ObjectId schema
 */
export const objectIdSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, "Invalid ObjectId format");

/**
 * Email schema
 */
export const emailSchema = z.string().email("Invalid email address");

/**
 * Password schema with strong validation
 */
export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(100, "Password is too long")
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    "Password must contain at least one uppercase letter, one lowercase letter, and one number"
  );

/**
 * Phone number schema (international format)
 */
export const phoneNumberSchema = z
  .string()
  .regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number format");

/**
 * URL schema
 */
export const urlSchema = z.string().url("Invalid URL format");

/**
 * Pagination query schema
 */
export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  sort: z.string().optional(),
  order: z.enum(["asc", "desc"]).default("desc"),
});

/**
 * Search query schema
 */
export const searchQuerySchema = z.object({
  q: z.string().min(1, "Search query is required"),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

/**
 * Date range schema
 */
export const dateRangeSchema = z.object({
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
});

/**
 * ID param schema
 */
export const idParamSchema = z.object({
  id: objectIdSchema,
});

/**
 * Bulk IDs schema
 */
export const bulkIdsSchema = z.object({
  ids: z.array(objectIdSchema).min(1, "At least one ID is required"),
});

/**
 * Type inference exports
 */
export type PaginationQuery = z.infer<typeof paginationQuerySchema>;
export type SearchQuery = z.infer<typeof searchQuerySchema>;
export type DateRange = z.infer<typeof dateRangeSchema>;
export type IdParam = z.infer<typeof idParamSchema>;
export type BulkIds = z.infer<typeof bulkIdsSchema>;
