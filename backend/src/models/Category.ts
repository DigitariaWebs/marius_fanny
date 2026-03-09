import { Schema, model } from 'mongoose';

export interface ICategory {
  id: number;
  name: string;
  description?: string;
  image?: string;
  parentId?: number;
  displayOrder: number;
  active: boolean;
  isBanner?: boolean;  // If true, show as special occasion banner
  bannerColor?: string; // Optional custom color for banner background
  createdAt: Date;
  updatedAt: Date;
}

const categorySchema = new Schema<ICategory>({
  id: { type: Number, required: true, unique: true },
  name: { type: String, required: true, unique: true },
  description: { type: String },
  image: { type: String },
  parentId: { type: Number },
  displayOrder: { type: Number, required: true, default: 0 },
  active: { type: Boolean, required: true, default: true },
  isBanner: { type: Boolean, default: false },
  bannerColor: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export const Category = model<ICategory>('Category', categorySchema);
