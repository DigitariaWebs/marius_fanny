import { z } from "zod";

export const dailyInventoryQuerySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}(__\w+)?$/, "Date must be YYYY-MM-DD or YYYY-MM-DD__section"),
});

// Accept either a non-negative number or a string (for the SUPPLÉMENT text row)
const numOrText = z.union([z.number().min(0), z.string()]).default(0);

const entrySchema = z.object({
  productId: z.string().min(1),
  productName: z.string().min(1),
  stock_stdo: numOrText,
  stdo: numOrText,
  berri: numOrText,
  comm_berri: numOrText,
  client: numOrText,
  total: numOrText,
});

export const saveDailyInventorySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}(__\w+)?$/, "Date must be YYYY-MM-DD or YYYY-MM-DD__section"),
  entries: z.array(entrySchema).min(1, "At least one product entry is required"),
});

export type SaveDailyInventoryInput = z.infer<typeof saveDailyInventorySchema>;
