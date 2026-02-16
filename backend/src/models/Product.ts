import { Schema, model } from 'mongoose';

export interface IProduct {
  id: number;
  name: string;
  category: string;
  price: number;
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
}

const productSchema = new Schema<IProduct>({
  id: { type: Number, required: true, unique: true },
  name: { type: String, required: true },
  category: { type: String, required: true },
  price: { type: Number, required: true },
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
});

export const Product = model<IProduct>('Product', productSchema);