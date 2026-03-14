import { betterAuth } from "better-auth";
import { emailOTP } from "better-auth/plugins";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import bcrypt from "bcryptjs";
import { connectMongoDB } from "./db.js";
import {
  sendVerificationCodeEmail,
  generateMockVerificationCode,
} from "../utils/emailService.js";

// Initialize MongoDB connection for better-auth with error handling
let authInstance: ReturnType<typeof betterAuth> | null = null;

async function initializeAuth() {
  try {
    const { client, db } = await connectMongoDB();

    const isProduction = process.env.NODE_ENV === "production";

    // Session settings (seconds)
    // - expiresIn: overall session lifetime
    // - updateAge: rolling refresh interval (writes to session when used after this age)
    const sessionExpiresIn = Number(
      process.env.BETTER_AUTH_SESSION_EXPIRES_IN ??
        (isProduction ? 60 * 60 * 24 * 30 : 60 * 60 * 24 * 7),
    );
    const sessionUpdateAge = Number(
      process.env.BETTER_AUTH_SESSION_UPDATE_AGE ??
        (isProduction ? 60 * 60 : 60 * 60 * 24),
    );
    
    return betterAuth({
      baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
      basePath: "/api/auth",
      database: mongodbAdapter(db, {
        client, 
      }),
      session: {
        expiresIn: sessionExpiresIn,
        updateAge: sessionUpdateAge,
      },
      advanced: {
        useSecureCookies: isProduction,
        defaultCookieAttributes: {
          sameSite: isProduction ? "none" : "lax",
          secure: isProduction,
          partitioned: isProduction,
        },
      },
      user: {
        additionalFields: {
          role: {
            type: "string",
            required: false,
            defaultValue: "user", 
          },
        },
      },
      emailAndPassword: {
        enabled: true,
        requireEmailVerification: true,
        minPasswordLength: 5,
        password: {
          hash: async (password) => {
            return await bcrypt.hash(password, 10);
          },
          verify: async ({ hash, password }) => {
            return await bcrypt.compare(password, hash);
          },
        },
      },
      plugins: [
        emailOTP({
          overrideDefaultEmailVerification: true,
          sendVerificationOnSignUp: true,
          async sendVerificationOTP({ email, otp, type }) {
            try {
              console.log(`📧 [EMAIL-OTP] Sending ${type} OTP to ${email}: ${otp}`);
              await sendVerificationCodeEmail(email, "User", undefined, otp);
            } catch (error) {
              console.error(`Failed to send ${type} OTP to ${email}:`, error);
              // Don't throw - user creation should not be blocked by email failures
            }
          },
        }),
      ],
      trustedOrigins: [
        process.env.FRONTEND_URL || "http://localhost:5173",
        // Add production frontend URLs if different
      ],
      secret:
        process.env.BETTER_AUTH_SECRET ||
        "your-secret-key-change-in-production",
      databaseHooks: {
        user: {
          create: {
            /**
             * Hook triggered after a new user is created in better-auth
             * Sends a verification email with a mock code
             */
            after: async (user) => {
              try {
                await sendVerificationCodeEmail(
                  user.email,
                  user.name || "User",
                );
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
  } catch (error) {
    console.error("❌ Failed to initialize auth:", error);
    // Re-throw so the failed init is NOT cached and the next request retries
    throw error;
  }
}

// Export a proxy that lazily initializes auth
export const auth = new Proxy({} as ReturnType<typeof betterAuth>, {
  get(target, prop) {
    if (!authInstance) {
      throw new Error("Auth not initialized. Call initializeAuth() first.");
    }
    return (authInstance as any)[prop];
  },
});

// Initialize and cache (only cache on success)
export async function getAuth() {
  if (!authInstance) {
    authInstance = await initializeAuth(); // throws on failure → not cached
  }
  return authInstance;
}
