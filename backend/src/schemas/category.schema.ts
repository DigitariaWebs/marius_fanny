import { z } from "zod";

export const createCategorySchema = z.object({
  name: z.string().min(1, "Category name is required").max(100),
  description: z.string().optional().default(""),
  image: z.string().optional().default(""),
  parentId: z.number().int().optional(),
  displayOrder: z.number().int().optional().default(0),
});

export const updateCategorySchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().optional(),
  image: z.string().optional(),
  parentId: z.number().int().optional(),
  displayOrder: z.number().int().optional(),
  active: z.boolean().optional(),
});

export const categoryIdParamSchema = z.object({
  id: z.string().regex(/^\d+$/, "ID must be a number"),
});
