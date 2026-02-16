import { createAuthClient } from "better-auth/react";
import { emailOTPClient } from "better-auth/client/plugins";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

// Ensure API_URL has protocol
export const normalizedApiUrl = API_URL.startsWith('http') ? API_URL : `https://${API_URL}`;

export const authClient = createAuthClient({
  baseURL: normalizedApiUrl,
  fetchOptions: {
    credentials: 'include', // Important: Send cookies with cross-origin requests
  },
  plugins: [emailOTPClient()],
  user: {
    additionalFields: {
      role: {
        type: "string"
      }
    }
  }
});

export const forgotPassword = async (email: string) => {
  const response = await fetch(`${normalizedApiUrl}/api/auth-password/forgot_password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email }),
  });

  const contentType = response.headers.get("content-type");
  
  if (!response.ok) {
    const errorData = contentType?.includes("application/json") 
      ? await response.json() 
      : { message: "Route introuvable (404)" };

    throw new Error(errorData.message || "Une erreur est survenue");
  }

  return response.json();
};

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