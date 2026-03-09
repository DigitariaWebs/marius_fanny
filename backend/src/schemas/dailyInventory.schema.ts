import { z } from "zod";

export const dailyInventoryQuerySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}(__\w+)?$/, "Date must be YYYY-MM-DD or YYYY-MM-DD__section"),
});

const entrySchema = z.object({
  productId: z.string().min(1),
  productName: z.string().min(1),
  stock_stdo: z.number().min(0).default(0),
  stdo: z.number().min(0).default(0),
  berri: z.number().min(0).default(0),
  comm_berri: z.number().min(0).default(0),
  client: z.number().min(0).default(0),
  total: z.number().min(0).default(0),
});

export const saveDailyInventorySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}(__\w+)?$/, "Date must be YYYY-MM-DD or YYYY-MM-DD__section"),
  entries: z.array(entrySchema).min(1, "At least one product entry is required"),
});

export type SaveDailyInventoryInput = z.infer<typeof saveDailyInventorySchema>;
