import { z } from "zod";

/**
 * Product schema
 */
export const productSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1).max(100),
  category: z.string().min(1).max(50),
  price: z.number().positive(),
  available: z.boolean().default(true),
  minOrderQuantity: z.number().int().positive().default(1),
  maxOrderQuantity: z.number().int().positive().default(10),
  description: z.string().max(500).optional(),
  image: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
  sales: z.number().int().nonnegative().default(0),
  revenue: z.number().nonnegative().default(0),
  preparationTimeHours: z.number().int().positive().optional(),
  hasTaxes: z.boolean().default(true),
  allergens: z.string().optional(),
  customOptions: z.array(z.object({
    name: z.string().min(1),
    choices: z.array(z.string().min(1)),
  })).optional(),
});

/**
 * Create product schema
 */
export const createProductSchema = z.object({
  name: z.string().min(1).max(100),
  category: z.string().min(1).max(50),
  price: z.number().positive(),
  available: z.boolean().optional().default(true),
  minOrderQuantity: z.number().int().positive().optional().default(1),
  maxOrderQuantity: z.number().int().positive().optional().default(10),
  description: z.string().max(500).optional(),
  image: z.string().optional(),
  preparationTimeHours: z.number().int().positive().optional(),
  hasTaxes: z.boolean().optional().default(true),
  allergens: z.string().optional(),
  customOptions: z.array(z.object({
    name: z.string().min(1),
    choices: z.array(z.string().min(1)),
  })).optional(),
});

/**
 * Update product schema
 */
export const updateProductSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  category: z.string().min(1).max(50).optional(),
  price: z.number().positive().optional(),
  available: z.boolean().optional(),
  minOrderQuantity: z.number().int().positive().optional(),
  maxOrderQuantity: z.number().int().positive().optional(),
  description: z.string().max(500).optional(),
  image: z.string().optional(),
  preparationTimeHours: z.number().int().positive().optional(),
  hasTaxes: z.boolean().optional(),
  allergens: z.string().optional(),
  customOptions: z.array(z.object({
    name: z.string().min(1),
    choices: z.array(z.string().min(1)),
  })).optional(),
});

/**
 * Product ID param schema
 */
export const productIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

/**
 * Type inference exports
 */
export type ProductInput = z.infer<typeof productSchema>;
export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type ProductIdParam = z.infer<typeof productIdParamSchema>;