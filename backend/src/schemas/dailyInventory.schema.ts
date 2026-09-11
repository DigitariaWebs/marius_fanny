import { z } from "zod";

/**
 * Une « date » d'inventaire est soit un jour (2026-09-11, éventuellement suffixé
 * d'une section), soit l'une des deux CLÉS DE CONFIGURATION sous lesquelles sont
 * rangées les listes de produits que Fanny tient à l'écran.
 *
 * Ces clés étaient refusées par le motif purement calendaire : la liste ne
 * partait donc jamais au serveur (erreur 400 avalée en silence côté écran), elle
 * ne vivait que dans le navigateur, et le serveur continuait de rapprocher les
 * commandes de sa liste codée en dur. Un produit ajouté à la main — « torsade
 * pomme », le 11 septembre 2026 — ne pouvait donc JAMAIS récolter de commandes.
 */
const INVENTORY_DATE_KEY =
  /^(\d{4}-\d{2}-\d{2}(__\w+)?|__products_config_(daily|four))$/;
const INVENTORY_DATE_MESSAGE =
  "Date must be YYYY-MM-DD, YYYY-MM-DD__section, or a product-list config key";

export const dailyInventoryQuerySchema = z.object({
  date: z.string().regex(INVENTORY_DATE_KEY, INVENTORY_DATE_MESSAGE),
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
  date: z.string().regex(INVENTORY_DATE_KEY, INVENTORY_DATE_MESSAGE),
  entries: z.array(entrySchema).min(1, "At least one product entry is required"),
});

export type SaveDailyInventoryInput = z.infer<typeof saveDailyInventorySchema>;
