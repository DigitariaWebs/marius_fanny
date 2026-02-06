/**
 * Square Payment Form Component
 * Handles Square Web Payments SDK integration
 */

import React, { useState, useEffect } from "react";
import { PaymentForm, CreditCard } from "react-square-web-payments-sdk";

interface SquarePaymentFormProps {
  amount: number;
  onPaymentSuccess: (paymentResult: any) => void;
  onPaymentError: (error: any) => void;
  customerEmail?: string;
  customerName?: string;
  deliveryAddress?: {
    street: string;
    city: string;
    province: string;
    postalCode: string;
  };
}

export default function SquarePaymentForm({
  amount,
  onPaymentSuccess,
  onPaymentError,
  customerEmail,
  customerName,
  deliveryAddress,
}: SquarePaymentFormProps) {
  const [squareConfig, setSquareConfig] = useState<{
    applicationId: string;
    locationId: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch Square configuration from backend
  useEffect(() => {
    const fetchSquareConfig = async () => {
      try {
        console.log("🔧 [FRONTEND] Fetching Square payment configuration...");
        const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
        const response = await fetch(`${API_URL}/api/payments/config`);
        const data = await response.json();

        if (data.success) {
          // Validate that we actually got valid config values
          if (!data.data.applicationId || !data.data.locationId) {
            console.error(
              "❌ [FRONTEND] Square config missing required values:",
              {
                hasApplicationId: !!data.data.applicationId,
                hasLocationId: !!data.data.locationId,
              }
            );
            onPaymentError(
              new Error(
                "Payment configuration is incomplete. Please contact support."
              )
            );
            return;
          }

          console.log("✅ [FRONTEND] Square configuration loaded successfully", {
            applicationId: `${data.data.applicationId.substring(0, 10)}...`,
            locationId: `${data.data.locationId.substring(0, 10)}...`,
            environment: data.data.environment,
          });
          setSquareConfig(data.data);
        } else {
          console.error(
            "❌ [FRONTEND] Failed to fetch Square config:",
            data.error,
          );
          onPaymentError(new Error(data.error || "Failed to load payment configuration"));
        }
      } catch (error) {
        console.error("💥 [FRONTEND] Error fetching Square config:", error);
        onPaymentError(error);
      } finally {
        setLoading(false);
      }
    };

    fetchSquareConfig();
  }, [onPaymentError]);

  const handleCardTokenizeResponse = async (token: any, buyer: any) => {
    try {
      console.log(
        "💳 [FRONTEND] Tokenize response received:",
        JSON.stringify({
          status: token.status,
          hasToken: !!token.token,
          errors: token.errors,
        }),
      );

      // Check if tokenization actually succeeded
      if (token.status !== "OK" || !token.token) {
        console.error(
          "❌ [FRONTEND] Tokenization failed:",
          token.errors || token.status,
        );
        onPaymentError(new Error(`Card tokenization failed: ${token.status}`));
        return;
      }

      console.log(
        "💳 [FRONTEND] Card tokenized successfully, processing payment...",
      );
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

      const paymentData = {
        sourceId: token.token,
        amount: amount,
        currency: "CAD",
        note: `Payment for order - ${customerEmail || "Guest"}`,
      };

      console.log(
        `💰 [FRONTEND] Sending payment request: ${amount} CAD for ${customerEmail || "Guest"}`,
      );
      console.log(
        `🔧 [FRONTEND] Payment endpoint: ${API_URL}/api/payments/create`,
      );

      // Send payment token to backend
      const response = await fetch(`${API_URL}/api/payments/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(paymentData),
      });

      console.log(
        `📡 [FRONTEND] Response status: ${response.status} ${response.statusText}`,
      );

      const result = await response.json();
      console.log(
        "📦 [FRONTEND] Full response:",
        JSON.stringify(result, null, 2),
      );

      if (result.success) {
        console.log(
          "✅ [FRONTEND] Payment processed successfully:",
          result.data,
        );
        onPaymentSuccess(result.data);
      } else {
        console.error("❌ [FRONTEND] Payment failed:", result.error);
        console.error("📋 [FRONTEND] Error details:", result.details);
        onPaymentError(new Error(result.error || "Payment failed"));
      }
    } catch (error) {
      console.error("💥 [FRONTEND] Payment processing error:", error);
      onPaymentError(error);
    }
  };

  // Create verification details for Strong Customer Authentication (SCA)
  const createVerificationDetails = () => {
    // Split name into parts
    const nameParts = customerName?.trim().split(" ") || ["Customer"];
    const givenName = nameParts[0];
    const familyName =
      nameParts.length > 1 ? nameParts.slice(1).join(" ") : undefined;

    const rawPostal = deliveryAddress?.postalCode?.trim() || "";
    const caPostal = /^[A-Z]\d[A-Z]\s?\d[A-Z]\d$/i.test(rawPostal);
    const usZip = /^\d{5}(-\d{4})?$/.test(rawPostal);
    const countryCode = caPostal ? "CA" : usZip ? "US" : "CA";

    console.log(
      `🔐 [FRONTEND] Creating verification details for SCA (country: ${countryCode}, postal: ${rawPostal || "n/a"})`,
    );

    // Build billing contact with only valid fields
    const billingContact: any = {
      givenName: givenName,
      countryCode: countryCode,
    };

    // Only add familyName if we have one
    if (familyName) {
      billingContact.familyName = familyName;
    }

    // Add address fields only if they have valid non-empty values
    if (deliveryAddress?.street?.trim()) {
      billingContact.addressLines = [deliveryAddress.street.trim()];
    }

    if (deliveryAddress?.city?.trim()) {
      billingContact.city = deliveryAddress.city.trim();
    }

    if (rawPostal && (caPostal || usZip)) {
      billingContact.postalCode = rawPostal.toUpperCase();
    }

    if (deliveryAddress?.province?.trim()) {
      billingContact.region = deliveryAddress.province.trim();
    }

    return {
      amount: amount.toFixed(2),
      billingContact: billingContact,
      currencyCode: "CAD",
      intent: "CHARGE" as const,
    };
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C5A065]"></div>
      </div>
    );
  }

  if (!squareConfig) {
    return (
      <div className="text-center p-8 text-red-600">
        Failed to load payment configuration. Please try again later.
      </div>
    );
  }

  return (
    <div className="w-full">
      <PaymentForm
        applicationId={squareConfig.applicationId}
        locationId={squareConfig.locationId}
        cardTokenizeResponseReceived={handleCardTokenizeResponse}
        createVerificationDetails={createVerificationDetails}
      >
        <CreditCard
          includeInputLabels
          postalCode=""
          style={{
            input: {
              fontSize: "16px",
            },
            ".message-text": {
              color: "#999",
            },
            ".message-icon": {
              color: "#C5A065",
            },
          }}
        />
      </PaymentForm>
    </div>
  );
}
