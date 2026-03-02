import { Schema, model } from 'mongoose';

export interface IProduct {
  id: number;
  name: string;
  category: string;
  price: number;
  discountPercentage?: number;
  available: boolean;
  minOrderQuantity: number;
  maxOrderQuantity: number;
  description?: string;
  image?: string;
  createdAt: Date;
  updatedAt: Date;
  sales?: number;
  revenue?: number;
  preparationTimeHours?: number;
  availableDays?: number[];
  hasTaxes?: boolean;
  allergens?: string;
  productionType: "patisserie" | "cuisinier" | "four";
  targetAudience: "clients" | "pro";
  customOptions?: Array<{
    name: string;
    choices: string[];
  }>;
  recommendations?: number[]; // IDs des produits recommandés
}

const productSchema = new Schema<IProduct>({
  id: { type: Number, required: true, unique: true },
  name: { type: String, required: true },
  category: { type: String, required: true },
  price: { type: Number, required: true },
  discountPercentage: { type: Number, min: 0, max: 100, default: 0 },
  available: { type: Boolean, required: true, default: true },
  minOrderQuantity: { type: Number, required: true, default: 1 },
  maxOrderQuantity: { type: Number, required: true, default: 10 },
  description: { type: String },
  image: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  sales: { type: Number, default: 0 },
  revenue: { type: Number, default: 0 },
  preparationTimeHours: { type: Number },
  availableDays: [{ type: Number, min: 0, max: 6 }],
  hasTaxes: { type: Boolean, default: true },
  allergens: { type: String },
  productionType: { type: String, enum: ['patisserie', 'cuisinier', 'four'], required: true },
  targetAudience: { type: String, enum: ['clients', 'pro'], required: true },
  customOptions: [{
    name: { type: String, required: true },
    choices: [{ type: String, required: true }]
  }],
  recommendations: [{ type: Number }]
});

export const Product = model<IProduct>('Product', productSchema);
