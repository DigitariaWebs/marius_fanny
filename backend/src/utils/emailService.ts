import {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendFullPaymentReceipt,
  sendDepositReceipt,
  sendInvoiceOrderConfirmation,
} from "./mail.js";

export interface EmailOptions {
  to: string;
  subject: string;
  template: string;
  data: Record<string, any>;
}

/**
 * Generate a mock verification code (6 digits)
 */
export function generateMockVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Send verification email to user after signup
 * Generates a mock verification code and sends it via email
 */
export async function sendVerificationCodeEmail(
  email: string,
  name: string,
  verificationUrl?: string,
  otp?: string,
): Promise<{ code: string }> {
  console.log(`\n${"=".repeat(60)}`);
  console.log(
    `📧 [sendVerificationCodeEmail] Email verification process started`,
  );
  console.log(`📧 [sendVerificationCodeEmail] Recipient: ${email}`);
  console.log(`👤 [sendVerificationCodeEmail] User name: ${name}`);

  const code = otp || generateMockVerificationCode();
  console.log(`🔐 [sendVerificationCodeEmail] Verification code: ${code}`);
  console.log(
    `🔗 [sendVerificationCodeEmail] Verification URL: ${verificationUrl || "#"}`,
  );

  try {
    console.log(
      `⏳ [sendVerificationCodeEmail] Sending email via transporter...`,
    );
    if (otp) {
      // Send OTP email
      await sendVerificationEmail(email, name, verificationUrl || "#", code);
    } else {
      // Send link email (legacy)
      await sendVerificationEmail(email, name, verificationUrl || "#", code);
    }
    console.log(
      `✅ [sendVerificationCodeEmail] Verification email sent successfully to ${email}`,
    );
    console.log(`${"=".repeat(60)}\n`);
    return { code };
  } catch (error) {
    console.error(
      `❌ [sendVerificationCodeEmail] Failed to send verification email to ${email}`,
    );
    console.error(`❌ [sendVerificationCodeEmail] Error details:`, error);
    console.log(`${"=".repeat(60)}\n`);
    throw error;
  }
}

export async function sendEmail(options: EmailOptions): Promise<void> {
  const { to, subject, template, data } = options;

  console.log(`📧 Sending ${template} email to: ${to}`);

  try {
    switch (template) {
      case "verification":
        await sendVerificationEmail(to, data.name, data.url, data.code);
        break;
      case "passwordReset":
        await sendPasswordResetEmail(to, data.url);
        break;
      default:
        console.warn(`⚠️ Unknown email template: ${template}`);
    }
    console.log(`✅ Email sent successfully to ${to}`);
  } catch (error) {
    console.error(`❌ Failed to send ${template} email to ${to}:`, error);
    throw error;
  }
}

/**
 * Send order receipt email based on payment type
 */
export async function sendOrderReceipt(
  paymentType: "full" | "deposit" | "invoice",
  orderData: {
    email: string;
    name: string;
    orderNumber: string;
    items: Array<{ productName: string; quantity: number; amount: number }>;
    subtotal: number;
    taxAmount: number;
    deliveryFee: number;
    total: number;
    depositAmount?: number;
    paymentId?: string;
    invoiceUrl?: string;
  },
): Promise<void> {
  console.log(
    `📧 [ORDER RECEIPT] Sending ${paymentType} payment receipt to ${orderData.email}`,
  );

  try {
    switch (paymentType) {
      case "full":
        if (!orderData.paymentId) {
          throw new Error("Payment ID is required for full payment receipt");
        }
        await sendFullPaymentReceipt(
          orderData.email,
          orderData.name,
          orderData.orderNumber,
          orderData.items,
          orderData.subtotal,
          orderData.taxAmount,
          orderData.deliveryFee,
          orderData.total,
          orderData.paymentId,
        );
        console.log(
          `✅ [ORDER RECEIPT] Full payment receipt sent to ${orderData.email}`,
        );
        break;

      case "deposit":
        if (!orderData.paymentId || !orderData.depositAmount) {
          throw new Error(
            "Payment ID and deposit amount are required for deposit receipt",
          );
        }
        const balanceDue = orderData.total - orderData.depositAmount;
        await sendDepositReceipt(
          orderData.email,
          orderData.name,
          orderData.orderNumber,
          orderData.items,
          orderData.subtotal,
          orderData.taxAmount,
          orderData.deliveryFee,
          orderData.total,
          orderData.depositAmount,
          balanceDue,
          orderData.paymentId,
        );
        console.log(
          `✅ [ORDER RECEIPT] Deposit receipt sent to ${orderData.email}`,
        );
        break;

      case "invoice":
        await sendInvoiceOrderConfirmation(
          orderData.email,
          orderData.name,
          orderData.orderNumber,
          orderData.items,
          orderData.subtotal,
          orderData.taxAmount,
          orderData.deliveryFee,
          orderData.total,
          orderData.invoiceUrl,
        );
        console.log(
          `✅ [ORDER RECEIPT] Invoice order confirmation sent to ${orderData.email}`,
        );
        break;

      default:
        console.warn(`⚠️ Unknown payment type: ${paymentType}`);
    }
  } catch (error) {
    console.error(
      `❌ [ORDER RECEIPT] Failed to send ${paymentType} receipt:`,
      error,
    );
    // Don't throw error - we don't want email failure to break order creation
    // Just log it for admin to handle
  }
}
