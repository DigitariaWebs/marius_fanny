import mongoose, { Schema, Document } from "mongoose";

export interface IAddress {
  street: string;
  city: string;
  province: string;
  postalCode: string;
}

export interface IOrderItem {
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  notes?: string;
  productionStatus?: "pending" | "in_progress" | "ready";
}

export interface IClientInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

export interface IOrderChange {
  changedAt: Date;
  changedBy?: string; // User ID who made the change
  field: string; // Field that was changed
  oldValue: any;
  newValue: any;
  changeType: "created" | "updated" | "status_changed" | "payment_updated" | "items_modified";
  notes?: string;
}

export interface IOrder extends Document {
  orderNumber: string;
  userId?: string; // Reference to better-auth user
  clientInfo: IClientInfo;
  orderDate: Date;
  pickupDate?: Date;
  pickupLocation: "Montreal" | "Laval";
  deliveryType: "pickup" | "delivery";
  deliveryDate?: string;
  deliveryTimeSlot?: string;
  deliveryAddress?: IAddress;
  items: IOrderItem[];
  subtotal: number;
  taxAmount: number;
  deliveryFee: number;
  total: number;
  depositAmount: number;
  depositPaid: boolean;
  depositPaidAt?: Date;
  balancePaid: boolean;
  balancePaidAt?: Date;
  paymentType: "full" | "deposit"; // Payment option chosen by customer
  paymentLinkChannel?: "email" | "sms";
  paymentStatus: "unpaid" | "deposit_paid" | "paid";
  squarePaymentId?: string; // Square payment ID for tracking
  squareInvoiceId?: string; // Square invoice ID for invoice payments
  status:
    | "pending"
    | "confirmed"
    | "in_production"
    | "ready"
    | "completed"
    | "cancelled"
    | "delivered";
  deliveryStatus?: "pending" | "in_transit" | "arrived" | "delivered";
  notes?: string;
  changeHistory: IOrderChange[]; // Track all changes to the order
  createdAt: Date;
  updatedAt: Date;
}

const AddressSchema = new Schema<IAddress>(
  {
    street: {
      type: String,
      required: true,
      trim: true,
    },
    city: {
      type: String,
      required: true,
      trim: true,
    },
    province: {
      type: String,
      required: true,
      trim: true,
    },
    postalCode: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },
  },
  { _id: false },
);

const OrderItemSchema = new Schema<IOrderItem>(
  {
    productId: {
      type: Number,
      required: true,
    },
    productName: {
      type: String,
      required: true,
      trim: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    unitPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    notes: {
      type: String,
      trim: true,
    },
    productionStatus: {
      type: String,
      enum: ["pending", "in_progress", "ready"],
      default: "pending",
    },
  },
  { _id: false },
);

const ClientInfoSchema = new Schema<IClientInfo>(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { _id: false },
);

const OrderSchema = new Schema<IOrder>(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    userId: {
      type: String,
      index: true,
    },
    clientInfo: {
      type: ClientInfoSchema,
      required: true,
    },
    orderDate: {
      type: Date,
      default: Date.now,
      index: true,
    },
    pickupDate: {
      type: Date,
      index: true,
    },
    pickupLocation: {
      type: String,
      enum: ["Montreal", "Laval"],
      required: true,
    },
    deliveryType: {
      type: String,
      enum: ["pickup", "delivery"],
      required: true,
      index: true,
    },
    deliveryDate: {
      type: String,
      trim: true,
    },
    deliveryTimeSlot: {
      type: String,
      trim: true,
    },
    deliveryAddress: {
      type: AddressSchema,
    },
    items: {
      type: [OrderItemSchema],
      required: true,
      validate: {
        validator: function (v: IOrderItem[]) {
          return v && v.length > 0;
        },
        message: "Au moins un article est requis",
      },
    },
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
    taxAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    deliveryFee: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    total: {
      type: Number,
      required: true,
      min: 0,
    },
    depositAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    depositPaid: {
      type: Boolean,
      default: false,
    },
    depositPaidAt: {
      type: Date,
    },
    balancePaid: {
      type: Boolean,
      default: false,
    },
    balancePaidAt: {
      type: Date,
    },
    paymentType: {
      type: String,
      enum: ["full", "deposit"],
      required: true,
      default: "full",
      index: true,
    },
    paymentLinkChannel: {
      type: String,
      enum: ["email", "sms"],
      default: "email",
    },
    paymentStatus: {
      type: String,
      enum: ["unpaid", "deposit_paid", "paid"],
      default: "unpaid",
      index: true,
    },
    squarePaymentId: {
      type: String,
      trim: true,
    },
    squareInvoiceId: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "in_production",
        "ready",
        "completed",
        "cancelled",
        "delivered",
      ],
      default: "pending",
      index: true,
    },
    deliveryStatus: {
      type: String,
      enum: ["pending", "in_transit", "arrived", "delivered"],
      default: "pending",
    },
    notes: {
      type: String,
      trim: true,
    },
    changeHistory: {
      type: [
        {
          changedAt: { type: Date, required: true },
          changedBy: { type: String },
          field: { type: String, required: true },
          oldValue: { type: Schema.Types.Mixed },
          newValue: { type: Schema.Types.Mixed },
          changeType: {
            type: String,
            enum: [
              "created",
              "updated",
              "status_changed",
              "payment_updated",
              "items_modified",
            ],
            required: true,
          },
          notes: { type: String },
        },
      ],
      default: [],
    },
  },
  {
    timestamps: true,
  },
);

// Generate order number before validation to satisfy required field
OrderSchema.pre("validate", async function () {
  if (this.isNew && !this.orderNumber) {
    // Generate order number format: MF-YYYYMMDD-XXXX
    // Sequence is global, limited to 0000-1000 and loops only after 1000.
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, "");
    const maxSequence = 1000;

    // Find the latest generated order number to continue a global sequence.
    const OrderModel = this.constructor as mongoose.Model<IOrder>;
    const latestOrder = await OrderModel.findOne({
      orderNumber: /^MF-\d{8}-\d{4}$/i,
    })
      .select("orderNumber")
      .sort({ createdAt: -1 })
      .lean();

    let lastSequence = -1;
    const latestMatch = latestOrder?.orderNumber?.match(/-(\d{4})$/);
    if (latestMatch) {
      const parsed = parseInt(latestMatch[1], 10);
      if (!Number.isNaN(parsed) && parsed >= 0 && parsed <= maxSequence) {
        lastSequence = parsed;
      }
    }

    let sequence = (lastSequence + 1) % (maxSequence + 1);

    // Ensure uniqueness for the current date when sequence loops.
    let attempts = 0;
    while (attempts <= maxSequence) {
      const candidate = `MF-${dateStr}-${sequence.toString().padStart(4, "0")}`;
      const exists = await OrderModel.exists({ orderNumber: candidate });
      if (!exists) {
        this.orderNumber = candidate;
        break;
      }
      sequence = (sequence + 1) % (maxSequence + 1);
      attempts += 1;
    }

    if (!this.orderNumber) {
      throw new Error(`Order number limit reached for date ${dateStr} (0000-1000).`);
    }
  }
  
  // Add creation entry to change history for new orders
  if (this.isNew) {
    this.changeHistory = [{
      changedAt: new Date(),
      field: "order",
      oldValue: null,
      newValue: "created",
      changeType: "created",
      notes: "Order created"
    }];
  }
});

// Update payment status based on deposit and balance
OrderSchema.pre("save", function () {
  if (this.depositPaid && this.balancePaid) {
    this.paymentStatus = "paid";
  } else if (this.depositPaid) {
    this.paymentStatus = "deposit_paid";
  } else {
    this.paymentStatus = "unpaid";
  }
});

// Indexes for common queries
OrderSchema.index({ "clientInfo.email": 1 });
OrderSchema.index({ "clientInfo.phone": 1 });
OrderSchema.index({ createdAt: -1 });
OrderSchema.index({ status: 1, orderDate: -1 });
OrderSchema.index({ deliveryType: 1, status: 1 });

const Order = mongoose.model<IOrder>("Order", OrderSchema);

export default Order;
