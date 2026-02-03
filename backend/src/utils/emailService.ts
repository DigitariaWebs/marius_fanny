import { sendVerificationEmail, sendPasswordResetEmail } from './mail';

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
  verificationUrl?: string
): Promise<{ code: string }> {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`📧 [sendVerificationCodeEmail] Email verification process started`);
  console.log(`📧 [sendVerificationCodeEmail] Recipient: ${email}`);
  console.log(`👤 [sendVerificationCodeEmail] User name: ${name}`);
  
  const code = generateMockVerificationCode();
  console.log(`🔐 [sendVerificationCodeEmail] Generated mock verification code: ${code}`);
  console.log(`🔗 [sendVerificationCodeEmail] Verification URL: ${verificationUrl || '#'}`);
  
  try {
    console.log(`⏳ [sendVerificationCodeEmail] Sending email via transporter...`);
    await sendVerificationEmail(email, name, verificationUrl || '#', code);
    console.log(`✅ [sendVerificationCodeEmail] Verification email sent successfully to ${email}`);
    console.log(`${'='.repeat(60)}\n`);
    return { code };
  } catch (error) {
    console.error(`❌ [sendVerificationCodeEmail] Failed to send verification email to ${email}`);
    console.error(`❌ [sendVerificationCodeEmail] Error details:`, error);
    console.log(`${'='.repeat(60)}\n`);
    throw error;
  }
}


export async function sendEmail(options: EmailOptions): Promise<void> {
  const { to, subject, template, data } = options;
  
  console.log(`📧 Sending ${template} email to: ${to}`);
  
  try {
    switch (template) {
      case 'verification':
        await sendVerificationEmail(to, data.name, data.url, data.code);
        break;
      case 'passwordReset':
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
