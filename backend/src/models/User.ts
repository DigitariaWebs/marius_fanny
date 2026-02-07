import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  email: string;
  name: string;
  role: "user" | "staff" | "customerService" | "admin";
  password?: string;
  emailVerified: boolean;
  emailVerificationCode?: string;
  emailVerificationExpires?: Date;
  profile?: {
    bio?: string;
    avatar?: string;
    phoneNumber?: string;
  };
  createdAt: Date;
  updatedAt: Date;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
}

const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
      type: String,
      enum: ["user", "staff", "customerService", "admin"],
      default: "user",
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationCode: {
      type: String,
      select: false,
    },
    emailVerificationExpires: {
      type: Date,
      select: false,
    },
    profile: {
      bio: String,
      avatar: String,
      phoneNumber: String,
    },
    resetPasswordToken: {
      type: String,
      select: false,
    },
    resetPasswordExpires: {
      type: Date,
      select: false,
    },
  },
  {
    timestamps: true,
    collection: "user",
  },
);

UserSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.__v;
  return user;
};

export const User = mongoose.model<IUser>("User", UserSchema);