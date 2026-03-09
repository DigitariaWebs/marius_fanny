import { Schema, model } from "mongoose";

export interface IDailyInventoryEntry {
  productId: string;
  productName: string;
  stock_stdo: number; // ST-do (stock)
  stdo: number;       // Comm. St-do
  berri: number;      // BERRI
  comm_berri: number; // Comm Berri
  client: number;     // Comm CLIENT
  total: number;      // auto-calculated: stdo + client only
}

export interface IDailyInventory {
  date: string; 
  entries: IDailyInventoryEntry[];
  savedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

const DailyInventoryEntrySchema = new Schema<IDailyInventoryEntry>(
  {
    productId: { type: String, required: true },
    productName: { type: String, required: true, trim: true },
    stock_stdo: { type: Number, required: true, min: 0, default: 0 },
    stdo: { type: Number, required: true, min: 0, default: 0 },
    berri: { type: Number, required: true, min: 0, default: 0 },
    comm_berri: { type: Number, required: true, min: 0, default: 0 },
    client: { type: Number, required: true, min: 0, default: 0 },
    total: { type: Number, required: true, min: 0, default: 0 },
  },
  { _id: false },
);

const DailyInventorySchema = new Schema<IDailyInventory>(
  {
    date: {
      type: String,
      required: true,
      match: /^\d{4}-\d{2}-\d{2}(__\w+)?$/,
      index: true,
      unique: true,
    },
    entries: { type: [DailyInventoryEntrySchema], default: [] },
    savedBy: { type: String },
  },
  { timestamps: true },
);

export const DailyInventory = model<IDailyInventory>(
  "DailyInventory",
  DailyInventorySchema,
);
