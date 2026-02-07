import { z } from "zod";

// Address schema
export const addressSchema = z.object({
  street: z.string().min(1, "L'adresse est requise"),
  city: z.string().min(1, "La ville est requise"),
  province: z.string().min(2, "La province est requise").max(2),
  postalCode: z
    .string()
    .min(3, "Le code postal doit contenir au moins 3 caractères")
    .max(7, "Le code postal ne peut pas dépasser 7 caractères")
    .regex(
      /^[A-Z]\d[A-Z](\s?\d[A-Z]\d)?$/i,
      "Format de code postal invalide (ex: H7X ou H2L 3Y5)",
    ),
});

// Order item schema
export const orderItemSchema = z.object({
  productId: z.number().int().positive("L'ID du produit doit être positif"),
  productName: z.string().min(1, "Le nom du produit est requis"),
  quantity: z.number().int().positive("La quantité doit être positive"),
  unitPrice: z.number().nonnegative("Le prix unitaire doit être non négatif"),
  amount: z.number().nonnegative("Le montant doit être non négatif"),
  notes: z.string().optional(),
});

// Client info schema
export const clientInfoSchema = z.object({
  firstName: z.string().min(1, "Le prénom est requis"),
  lastName: z.string().min(1, "Le nom de famille est requis"),
  email: z.string().email("Format d'email invalide"),
  phone: z
    .string()
    .min(7, "Le numéro de téléphone doit contenir au moins 7 chiffres")
    .regex(
      /^[\d\s\-().+]+$/,
      "Le numéro de téléphone contient des caractères invalides",
    ),
});

// Create order schema - for POST /api/orders
export const createOrderSchema = z
  .object({
    clientInfo: clientInfoSchema,
    pickupDate: z.string().datetime().optional(),
    pickupLocation: z.enum(["Montreal", "Laval"], {
      message: "Le lieu de ramassage doit être Montreal ou Laval",
    }),
    deliveryType: z.enum(["pickup", "delivery"], {
      message: "Le type de livraison doit être pickup ou delivery",
    }),
    deliveryAddress: addressSchema.optional(),
    items: z
      .array(orderItemSchema)
      .min(1, "Au moins un article est requis")
      .refine(
        (items) => items.every((item) => item.quantity > 0),
        "Tous les articles doivent avoir une quantité positive",
      ),
    notes: z.string().optional(),
    paymentType: z
      .enum(["full", "deposit", "invoice"], {
        message: "Le type de paiement doit être full, deposit ou invoice",
      })
      .default("full"),
    depositPaid: z.boolean().optional().default(false),
    squarePaymentId: z.string().optional(),
  })
  .refine(
    (data) => {
      // If delivery type is delivery, deliveryAddress is required
      if (data.deliveryType === "delivery") {
        return !!data.deliveryAddress;
      }
      return true;
    },
    {
      message: "L'adresse de livraison est requise pour une livraison",
      path: ["deliveryAddress"],
    },
  );

// Update order schema - for PATCH /api/orders/:id
export const updateOrderSchema = z.object({
  status: z
    .enum([
      "pending",
      "confirmed",
      "in_production",
      "ready",
      "completed",
      "cancelled",
      "delivered",
    ])
    .optional(),
  depositPaid: z.boolean().optional(),
  balancePaid: z.boolean().optional(),
  squarePaymentId: z.string().optional(),
  squareInvoiceId: z.string().optional(),
  notes: z.string().optional(),
});

// Validate delivery fee schema - for POST /api/orders/validate-delivery
export const validateDeliverySchema = z.object({
  postalCode: z.string().min(3, "Le code postal doit contenir au moins 3 caractères"),
  subtotal: z.number().nonnegative("Le sous-total doit être non négatif"),
});

// Query parameters for listing orders
export const orderQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
  status: z
    .enum([
      "pending",
      "confirmed",
      "in_production",
      "ready",
      "completed",
      "cancelled",
      "delivered",
    ])
    .optional(),
  deliveryType: z.enum(["pickup", "delivery"]).optional(),
  paymentStatus: z.enum(["unpaid", "deposit_paid", "paid"]).optional(),
  fromDate: z.string().datetime().optional(),
  toDate: z.string().datetime().optional(),
});

// Export types inferred from schemas
export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type UpdateOrderInput = z.infer<typeof updateOrderSchema>;
export type ValidateDeliveryInput = z.infer<typeof validateDeliverySchema>;
export type OrderQueryParams = z.infer<typeof orderQuerySchema>;
