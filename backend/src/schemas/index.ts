/**
 * Central export file for all Zod validation schemas
 */

// Auth schemas
export * from "./auth.schema.js";

// User schemas
export * from "./user.schema.js";

// Product schemas
export * from "./product.schema.js";

// Common schemas
export {
  objectIdSchema,
  emailSchema,
  passwordSchema,
  phoneNumberSchema,
  urlSchema,
  paginationQuerySchema,
  searchQuerySchema,
  dateRangeSchema,
  idParamSchema,
  bulkIdsSchema,
  type SearchQuery,
  type DateRange,
  type IdParam,
  type BulkIds,
} from "./common.schema.js";
