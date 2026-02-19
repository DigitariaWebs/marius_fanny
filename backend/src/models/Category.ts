import { Schema, model } from 'mongoose';

export interface ICategory {
  id: number;
  name: string;
  description?: string;
  image?: string;
  parentId?: number;
  displayOrder: number;
  active: boolean;
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
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export const Category = model<ICategory>('Category', categorySchema);
