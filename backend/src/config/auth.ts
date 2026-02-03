import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import bcrypt from "bcryptjs";
import { connectMongoDB } from "./db";
import { sendVerificationCodeEmail, generateMockVerificationCode } from "../utils/emailService";

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
  hooks: {
    /**
     * Hook triggered when a new user is created in better-auth
     * Sends a verification email with a mock code
     */
    onUserCreate: {
      async after(user) {
        try {
          console.log(`\n🎯 [auth.hooks.onUserCreate] User created via better-auth`);
          console.log(`📝 [auth.hooks.onUserCreate] User ID: ${user.id}`);
          console.log(`📧 [auth.hooks.onUserCreate] Email: ${user.email}`);
          console.log(`👤 [auth.hooks.onUserCreate] Name: ${user.name || "N/A"}`);

          // Generate mock verification code
          const verificationCode = generateMockVerificationCode();
          const expirationTime = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

          console.log(`🔐 [auth.hooks.onUserCreate] Generated verification code: ${verificationCode}`);
          console.log(`⏰ [auth.hooks.onUserCreate] Code expires at: ${expirationTime.toISOString()}`);

          // Send verification email
          console.log(`📧 [auth.hooks.onUserCreate] Sending verification email to: ${user.email}`);
          await sendVerificationCodeEmail(user.email, user.name || "User");
          console.log(`✅ [auth.hooks.onUserCreate] Verification email sent successfully`);
        } catch (error) {
          console.error(
            `❌ [auth.hooks.onUserCreate] Failed to send verification email for user ${user.email}:`,
            error
          );
          // Don't throw - user creation should not be blocked by email failures
        }
      },
    },
  },
});