import { createAuthClient } from "better-auth/react";
import { emailOTPClient } from "better-auth/client/plugins";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export const authClient = createAuthClient({
  baseURL: API_URL,
  plugins: [emailOTPClient()],
});

export const forgotPassword = async (email: string) => {
  const response = await fetch(`${API_URL}/api/auth-password/forgot_password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email }),
  });

  const contentType = response.headers.get("content-type");
  
  if (!response.ok) {
    // On essaie de lire le message d'erreur JSON envoyé par ton auth.controller.ts
    const errorData = contentType?.includes("application/json") 
      ? await response.json() 
      : { message: "Route introuvable (404)" };
      
    throw new Error(errorData.message || "Une erreur est survenue");
  }

  return response.json();
};

// Email verification helper functions
export const sendVerificationEmail = async (email: string, callbackURL?: string) => {
  return await authClient.sendVerificationEmail({
    email,
    callbackURL: callbackURL || "/",
  });
};

export const verifyEmail = async (token: string) => {
  return await authClient.verifyEmail({
    query: { token },
  });
};

// Email OTP helper functions
export const sendVerificationOTP = async (email: string, type: "email-verification" | "sign-in" | "forget-password" = "email-verification") => {
  return await authClient.emailOtp.sendVerificationOtp({
    email,
    type,
  });
};

export const verifyEmailOTP = async (email: string, otp: string) => {
  return await authClient.emailOtp.verifyEmail({
    email,
    otp,
  });
};