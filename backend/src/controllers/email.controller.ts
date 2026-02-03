import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { sendVerificationEmail, sendPasswordResetEmail } from './email';
import prisma from './prisma'; // Votre client Prisma
import dotenv from 'dotenv';

dotenv.config();

export const auth = betterAuth({
  database: prismaAdapter(prisma),
  appName: 'Marius & Fanny',
  baseURL: process.env.BETTER_AUTH_URL,
  secret: process.env.BETTER_AUTH_SECRET,

  // Configuration Email & Password
  emailAndPassword: {
    enabled: true,
    autoSignIn: false, // L'utilisateur doit vérifier son email avant de se connecter
    minPasswordLength: 8,
    maxPasswordLength: 128,
    requireEmailVerification: true, // ✅ IMPORTANT: Requiert la vérification d'email
  },

  // Configuration de la vérification d'email
  emailVerification: {
    sendOnSignUp: true, // Envoie un email à la création du compte
    autoSignInAfterVerification: true, // Connecte automatiquement après vérification
    sendVerificationEmail: async ({ user, url, token }, request) => {
      // Ceci est appelé automatiquement par Better Auth
      try {
        await sendVerificationEmail({
          user: {
            email: user.email,
            name: user.name,
          },
          url,
          token,
        });
        console.log(`✅ Email de vérification envoyé à ${user.email}`);
      } catch (error) {
        console.error('❌ Erreur lors de l\'envoi de l\'email:', error);
        throw error;
      }
    },
  },

  // Configuration de la réinitialisation de mot de passe
  passwordReset: {
    sendResetPasswordEmail: async ({ user, url, token }, request) => {
      // Ceci est appelé automatiquement par Better Auth
      try {
        await sendPasswordResetEmail({
          user: {
            email: user.email,
            name: user.name,
          },
          url,
        });
        console.log(`✅ Email de réinitialisation envoyé à ${user.email}`);
      } catch (error) {
        console.error('❌ Erreur lors de l\'envoi de l\'email:', error);
        throw error;
      }
    },
  },

  // Configuration des sessions
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 jours
    updateAge: 60 * 60 * 24, // Mise à jour tous les jours
    absoluteExpiresIn: 60 * 60 * 24 * 30, // 30 jours max
  },

  // Configuration des URLs de redirection (optionnel)
  redirects: {
    signUp: '/user', // Redirection après inscription
    signIn: '/user', // Redirection après connexion
  },

  // Logging
  logger: {
    disabled: process.env.NODE_ENV === 'production',
  },
});