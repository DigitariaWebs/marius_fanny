import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import bcrypt from "bcryptjs";
import { connectMongoDB } from "./db";
import {
  sendVerificationCodeEmail,
  generateMockVerificationCode,
} from "../utils/emailService";

// Initialize MongoDB connection for better-auth
const { client, db } = await connectMongoDB();

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
  database: mongodbAdapter(db, {
    client, // Enable transactions
  }),
  emailAndPassword: {
    enabled: true,
    password: {
      hash: async (password) => {
        return await bcrypt.hash(password, 10);
      },
      verify: async ({ hash, password }) => {
        return await bcrypt.compare(password, hash);
      },
    },
  },
  trustedOrigins: [process.env.FRONTEND_URL || "http://localhost:5173"],
  secret:
    process.env.BETTER_AUTH_SECRET || "your-secret-key-change-in-production",
  databaseHooks: {
    user: {
      create: {
        /**
         * Hook triggered after a new user is created in better-auth
         * Sends a verification email with a mock code
         */
        after: async (user) => {
          try {
            await sendVerificationCodeEmail(user.email, user.name || "User");
          } catch (error) {
            console.error(
              `Failed to send verification email for user ${user.email}:`,
              error,
            );
            // Don't throw - user creation should not be blocked by email failures
          }
        },
      },
    },
  },
});
