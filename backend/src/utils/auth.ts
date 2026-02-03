import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { sendVerificationEmail, sendPasswordResetEmail } from './mail';
import { sendEmail, generateMockVerificationCode } from './emailService';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

if (!process.env.MONGODB_URI) {
  console.error("❌ ERREUR: MONGODB_URI n'est pas défini dans le fichier .env");
  process.exit(1);
}

export const prisma = new PrismaClient();

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "mongodb",
  }),

  baseURL: process.env.BETTER_AUTH_URL,
  secret: process.env.BETTER_AUTH_SECRET,

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
  },

  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      const verificationCode = generateMockVerificationCode();
      await sendEmail({
        to: user.email,
        subject: 'Verify your email',
        template: 'verification',
        data: { url, code: verificationCode }
      });
    },
  },

  passwordReset: {
    sendResetPasswordEmail: async ({ user, url }) => {
      console.log(`🔑 Sending password reset to: ${user.email}`);
      try {
        await sendPasswordResetEmail(user.email, url);
        console.log(`✅ Reset email sent to ${user.email}`);
      } catch (error) {
        console.error(`❌ Failed to send reset to ${user.email}:`, error);
      }
    },
  },
});