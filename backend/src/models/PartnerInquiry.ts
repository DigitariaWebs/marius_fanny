import mongoose, { Schema, Document } from "mongoose";

export interface IPartnerInquiry extends Document {
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  businessType: string;
  message: string;
  inviteSentAt?: Date;
  activationToken?: string | null;
  activationTokenExpires?: Date | null;
  activated: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const PartnerInquirySchema = new Schema<IPartnerInquiry>(
  {
    companyName: { type: String, required: true, trim: true },
    contactName: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, required: true, trim: true },
    businessType: { type: String, required: true, trim: true },
    message: { type: String, default: "", trim: true },
    inviteSentAt: { type: Date, default: null },
    activationToken: { type: String, default: null, select: false },
    activationTokenExpires: { type: Date, default: null },
    activated: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const PartnerInquiry = mongoose.model<IPartnerInquiry>(
  "PartnerInquiry",
  PartnerInquirySchema
);
