import * as nodemailer from "nodemailer";
import { Resend } from "resend";
import dotenv from "dotenv";

dotenv.config();

// Resend client — only used when RESEND_FROM_EMAIL is also set (Resend requires a verified domain)
const resend =
  process.env.RESEND_API_KEY && process.env.RESEND_FROM_EMAIL
    ? new Resend(process.env.RESEND_API_KEY)
    : null;

// When using Resend, FROM must come from a verified domain (set RESEND_FROM_EMAIL).
// When using Nodemailer (Gmail SMTP), FROM is EMAIL_USER.
const FROM_EMAIL = resend
  ? (process.env.RESEND_FROM_EMAIL as string)
  : (process.env.EMAIL_USER || "noreply@marius-fanny.com");

// Display name for outgoing emails
const DISPLAY_FROM = `"Marius & Fanny" <${process.env.EMAIL_USER || FROM_EMAIL}>`;

// Public logo URL (hosted on Cloudinary)
const LOGO_URL = "https://res.cloudinary.com/deyjooxbi/image/upload/v1773330080/branding/marius_fanny_logo.avif";

// Google review link for post-order feedback.
const GOOGLE_REVIEW_URL =
  process.env.GOOGLE_REVIEW_URL ||
  "https://www.google.com/maps/search/?api=1&query=Marius%20%26%20Fanny";

const buildGoogleReviewSection = () => `
  <div style="background-color: #FFF8E7; padding: 18px; border-radius: 8px; margin-top: 24px; border-left: 4px solid #C5A065; text-align: center;">
    <p style="color: #2D2A26; margin: 0; font-weight: bold;">
      Votre commande vous a plu ?
    </p>
    <p style="color: #555; margin: 8px 0 14px 0; font-size: 14px; line-height: 1.5;">
      Laissez-nous un avis sur Google, cela aide beaucoup Marius & Fanny.
    </p>
    <a href="${GOOGLE_REVIEW_URL}"
       style="display: inline-block; padding: 12px 22px; background-color: #C5A065; color: white; text-decoration: none; border-radius: 999px; font-weight: bold;">
      Laisser un avis Google
    </a>
  </div>
`;

/**
 * Send an email via Resend if API key is set, else fall back to Nodemailer.
 */
async function sendEmail(opts: {
  from: string;
  to: string;
  subject: string;
  html: string;
}): Promise<void> {
  if (resend) {
    const { error } = await resend.emails.send(opts);
    if (error) throw new Error(`Resend error: ${error.message}`);
  } else {
    await transporter.sendMail({ ...opts, replyTo: opts.from });
  }
}

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT || "587"),
  secure: process.env.EMAIL_PORT === "465", // true pour 465, false pour 587
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Tester la connexion
transporter.verify((error, success) => {
  if (error) {
    console.error("❌ Erreur de configuration email:", error);
  } else {
    console.log("✅ Serveur email prêt à envoyer");
  }
});

// Template pour email de vérification
export async function sendVerificationEmail(
  email: string,
  name: string,
  verificationUrl: string,
  verificationCode?: string,
): Promise<void> {
  // Use the provided code or generate a mock one
  const code =
    verificationCode || Math.floor(100000 + Math.random() * 900000).toString();

  try {
    const mailOptions = {
      from: DISPLAY_FROM,
      to: email,
      subject: "✨ Confirmez votre email - Marius & Fanny",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #F9F7F2; border-radius: 10px;">

          <div style="text-align: center; margin-bottom: 30px;">
            <img src="${LOGO_URL}" alt="Marius & Fanny" style="max-width: 120px; margin-bottom: 10px;" />
            <h1 style="color: #C5A065; font-family: 'Great Vibes', cursive; font-size: 40px; margin: 0;">
              Marius & Fanny
            </h1>
          </div>

          <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h2 style="color: #2D2A26; text-align: center; margin-bottom: 20px;">
              Bienvenue ${name || "ami"} ! 👋
            </h2>

            <p style="color: #555; line-height: 1.6; text-align: center; margin-bottom: 30px;">
              Merci de vous être inscrit. Pour activer votre compte et commencer à utiliser nos services,
              veuillez confirmer votre adresse email en utilisant le code de vérification ci-dessous.
            </p>

            <div style="text-align: center; margin: 30px 0;">
              <div style="background-color: #F9F7F2; padding: 20px; border-radius: 8px; border: 2px solid #C5A065;">
                <p style="color: #999; margin: 0 0 10px 0; font-size: 12px;">Votre code de vérification :</p>
                <p style="color: #C5A065; font-size: 28px; font-weight: bold; letter-spacing: 3px; margin: 0; font-family: monospace;">
                  ${code}
                </p>
              </div>
            </div>

            <p style="color: #999; text-align: center; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
              Ce code expire dans <strong>24 heures</strong>.
            </p>

            <p style="color: #999; text-align: center; font-size: 12px; margin-top: 10px;">
              Si vous n'avez pas créé ce compte, ignorez cet email.
            </p>
          </div>

          <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
            <p>© 2026 Marius & Fanny. Tous droits réservés.</p>
          </div>

        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Email de vérification envoyé:", info.response);
    return { success: true } as any;
  } catch (error) {
    console.error("❌ Erreur lors de l'envoi de l'email:", error);
    throw error;
  }
}

// Template pour email de réinitialisation de mot de passe
export async function sendPasswordResetEmail(
  email: string,
  resetUrl: string,
): Promise<void> {
  try {
    const mailOptions = {
      from: DISPLAY_FROM,
      to: email,
      subject: "🔐 Réinitialiser votre mot de passe - Marius & Fanny",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #F9F7F2; border-radius: 10px;">

          <div style="text-align: center; margin-bottom: 30px;">
            <img src="${LOGO_URL}" alt="Marius & Fanny" style="max-width: 120px; margin-bottom: 10px;" />
            <h1 style="color: #C5A065; font-family: 'Great Vibes', cursive; font-size: 40px; margin: 0;">
              Marius & Fanny
            </h1>
          </div>

          <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h2 style="color: #2D2A26; text-align: center; margin-bottom: 20px;">
              Réinitialiser votre mot de passe
            </h2>

            <p style="color: #555; line-height: 1.6; text-align: center; margin-bottom: 30px;">
              Vous avez demandé la réinitialisation de votre mot de passe.
              Cliquez sur le bouton ci-dessous pour créer un nouveau mot de passe.
            </p>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${URL}"
                 style="display: inline-block; padding: 15px 40px; background-color: #C5A065; color: white;
                        text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px; transition: opacity 0.3s;">
                🔐 Réinitialiser le mot de passe
              </a>
            </div>

            <p style="color: #999; text-align: center; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
              Ce lien expire dans <strong>1 heure</strong>.
            </p>

            <p style="color: #999; text-align: center; font-size: 12px; margin-top: 10px;">
              Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.
            </p>
          </div>

        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Email de réinitialisation envoyé:", info.response);
  } catch (error) {
    console.error("❌ Erreur lors de l'envoi de l'email:", error);
    throw error;
  }
}

export default transporter;

/**
 * Send partner request notification email to admin
 */
export async function sendPartnerRequestEmail(
  adminEmail: string,
  applicant: {
    businessName: string;
    contactName: string;
    email: string;
    phone: string;
    address: string;
  },
  approvalLink: string,
): Promise<void> {
  try {
    const mailOptions = {
      from: FROM_EMAIL,
      to: adminEmail,
      subject: `🤝 Nouvelle demande partenaire Pro - ${applicant.businessName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #F9F7F2; border-radius: 10px;">

          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #337957; font-size: 32px; margin: 0;">
              Marius &amp; Fanny
            </h1>
            <p style="color: #888; font-size: 13px; margin-top: 4px;">Panneau d'administration</p>
          </div>

          <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h2 style="color: #2D2A26; margin-bottom: 20px; border-bottom: 2px solid #337957; padding-bottom: 10px;">
              📋 Nouvelle demande de compte Pro
            </h2>

            <table style="width: 100%; border-collapse: collapse; margin-bottom: 25px;">
              <tr>
                <td style="padding: 8px 12px; background: #F9F7F2; border-radius: 4px; color: #888; font-size: 12px; font-weight: bold; width: 40%;">ENTREPRISE</td>
                <td style="padding: 8px 12px; color: #2D2A26; font-size: 15px; font-weight: bold;">${applicant.businessName}</td>
              </tr>
              <tr>
                <td style="padding: 8px 12px; color: #888; font-size: 12px; font-weight: bold;">CONTACT</td>
                <td style="padding: 8px 12px; color: #2D2A26; font-size: 15px;">${applicant.contactName}</td>
              </tr>
              <tr>
                <td style="padding: 8px 12px; background: #F9F7F2; border-radius: 4px; color: #888; font-size: 12px; font-weight: bold;">EMAIL</td>
                <td style="padding: 8px 12px; background: #F9F7F2; color: #337957; font-size: 15px;">${applicant.email}</td>
              </tr>
              <tr>
                <td style="padding: 8px 12px; color: #888; font-size: 12px; font-weight: bold;">TÉLÉPHONE</td>
                <td style="padding: 8px 12px; color: #2D2A26; font-size: 15px;">${applicant.phone}</td>
              </tr>
              <tr>
                <td style="padding: 8px 12px; background: #F9F7F2; border-radius: 4px; color: #888; font-size: 12px; font-weight: bold;">ADRESSE</td>
                <td style="padding: 8px 12px; background: #F9F7F2; color: #2D2A26; font-size: 15px;">${applicant.address}</td>
              </tr>
            </table>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${approvalLink}"
                 style="display: inline-block; padding: 15px 40px; background-color: #337957; color: white;
                        text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
                ✅ Approuver ce partenaire
              </a>
            </div>

            <p style="color: #999; text-align: center; font-size: 12px; margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee;">
              Ce lien d'approbation est valide pendant <strong>48 heures</strong>.
            </p>
            <p style="color: #bbb; text-align: center; font-size: 11px;">
              Si vous ne reconnaissez pas cette demande, ignorez simplement cet email.
            </p>
          </div>

          <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
            <p>© 2026 Marius &amp; Fanny. Tous droits réservés.</p>
          </div>

        </div>
      `,
    };

    await sendEmail(mailOptions);
    console.log("✅ Email demande partenaire envoyé à l'admin");
  } catch (error) {
    console.error("❌ Erreur lors de l'envoi de l'email admin:", error);
    throw error;
  }
}

/**
 * Send approval confirmation email to the new partner
 */
export async function sendPartnerApprovedEmail(
  email: string,
  contactName: string,
  businessName: string,
  loginUrl: string,
): Promise<void> {
  try {
    const mailOptions = {
      from: FROM_EMAIL,
      to: email,
      subject: `🎉 Votre compte Pro a été approuvé - Marius & Fanny`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #F9F7F2; border-radius: 10px;">

          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #337957; font-size: 32px; margin: 0;">Marius &amp; Fanny</h1>
          </div>

          <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 20px;">
              <div style="display: inline-block; background-color: #337957; color: white; padding: 10px 20px; border-radius: 20px; font-weight: bold; font-size: 14px;">
                ✅ COMPTE PRO APPROUVÉ
              </div>
            </div>

            <h2 style="color: #2D2A26; text-align: center; margin-bottom: 20px;">
              Félicitations ${contactName} ! 🎉
            </h2>

            <p style="color: #555; line-height: 1.6; text-align: center; margin-bottom: 25px;">
              Votre demande de compte professionnel pour <strong>${businessName}</strong> a été approuvée.
              Vous pouvez maintenant vous connecter et accéder à tous les avantages partenaires.
            </p>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${loginUrl}"
                 style="display: inline-block; padding: 15px 40px; background-color: #337957; color: white;
                        text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
                🚀 Accéder à mon espace Pro
              </a>
            </div>

            <p style="color: #999; text-align: center; font-size: 12px; margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee;">
              Connectez-vous avec l'email <strong>${email}</strong> et le mot de passe que vous avez choisi lors de votre inscription.
            </p>
          </div>

          <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
            <p>© 2026 Marius &amp; Fanny. Tous droits réservés.</p>
          </div>

        </div>
      `,
    };

    await sendEmail(mailOptions);
    console.log("✅ Email confirmation partenaire approuvé envoyé");
  } catch (error) {
    console.error("❌ Erreur envoi email approbation partenaire:", error);
    // Don't throw - approval should not fail because of email
  }
}

/**
 * Send partner inquiry notification email to admin (from homepage wholesale form)
 * This is a contact/inquiry — no account creation, just notification.
 */
export async function sendPartnerInquiryEmail(
  adminEmail: string,
  data: {
    companyName: string;
    contactName: string;
    email: string;
    phone: string;
    businessType: string;
    message: string;
  },
  inviteUrl: string,
): Promise<void> {
  try {
    const mailOptions = {
      from: `"Marius & Fanny - Espace Pro" <${FROM_EMAIL}>`,
      to: adminEmail,
      subject: `Nouvelle demande de renseignements Pro - ${data.companyName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #F9F7F2; border-radius: 10px;">

          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #337957; font-size: 32px; margin: 0;">Marius &amp; Fanny</h1>
            <p style="color: #888; font-size: 13px; margin-top: 4px;">Espace Professionnel</p>
          </div>

          <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h2 style="color: #2D2A26; margin-bottom: 20px; border-bottom: 2px solid #337957; padding-bottom: 10px;">
              📋 Demande de renseignements Pro
            </h2>

            <table style="width: 100%; border-collapse: collapse; margin-bottom: 25px;">
              <tr>
                <td style="padding: 8px 12px; background: #F9F7F2; border-radius: 4px; color: #888; font-size: 12px; font-weight: bold; width: 40%;">ENTREPRISE</td>
                <td style="padding: 8px 12px; color: #2D2A26; font-size: 15px; font-weight: bold;">${data.companyName}</td>
              </tr>
              <tr>
                <td style="padding: 8px 12px; color: #888; font-size: 12px; font-weight: bold;">CONTACT</td>
                <td style="padding: 8px 12px; color: #2D2A26; font-size: 15px;">${data.contactName}</td>
              </tr>
              <tr>
                <td style="padding: 8px 12px; background: #F9F7F2; color: #888; font-size: 12px; font-weight: bold;">EMAIL</td>
                <td style="padding: 8px 12px; background: #F9F7F2; color: #337957; font-size: 15px;">${data.email}</td>
              </tr>
              <tr>
                <td style="padding: 8px 12px; color: #888; font-size: 12px; font-weight: bold;">TÉLÉPHONE</td>
                <td style="padding: 8px 12px; color: #2D2A26; font-size: 15px;">${data.phone}</td>
              </tr>
              <tr>
                <td style="padding: 8px 12px; background: #F9F7F2; color: #888; font-size: 12px; font-weight: bold;">TYPE D'ACTIVITÉ</td>
                <td style="padding: 8px 12px; background: #F9F7F2; color: #2D2A26; font-size: 15px;">${data.businessType}</td>
              </tr>
              ${data.message ? `
              <tr>
                <td style="padding: 8px 12px; color: #888; font-size: 12px; font-weight: bold; vertical-align: top;">MESSAGE</td>
                <td style="padding: 8px 12px; color: #2D2A26; font-size: 15px;">${data.message}</td>
              </tr>` : ""}
            </table>

            <div style="text-align: center; margin: 25px 0;">
              <a href="${inviteUrl}"
                 style="display: inline-block; padding: 14px 36px; background-color: #337957; color: white;
                        text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 15px;">
                ✅ Approuver le partenaire &amp; envoyer l'invitation
              </a>
            </div>

            <p style="color: #555; font-size: 13px; margin-top: 16px; padding-top: 16px; border-top: 1px solid #eee; text-align: center;">
              En cliquant ce bouton, le prospect recevra automatiquement un email l'invitant à compléter son inscription sur votre plateforme.
            </p>
          </div>

          <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
            <p>© 2026 Marius &amp; Fanny. Tous droits réservés.</p>
          </div>

        </div>
      `,
    };

    await sendEmail(mailOptions);
    console.log("✅ Email demande renseignements pro envoyé à l'admin");
  } catch (error) {
    console.error("❌ Erreur lors de l'envoi de l'email demande pro:", error);
    throw error;
  }
}

/**
 * Send partner invitation email to the prospect (triggered by admin approval of an inquiry)
 */
export async function sendPartnerInvitationEmail(
  prospectEmail: string,
  contactName: string,
  companyName: string,
  registrationUrl: string,
): Promise<void> {
  try {
    const mailOptions = {
      from: `"Marius & Fanny" <${FROM_EMAIL}>`,
      replyTo: "fanny.chiecchio@gmail.com",
      to: prospectEmail,
      subject: `Votre demande partenaire a été approuvée - Marius & Fanny`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #F9F7F2; border-radius: 10px;">

          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #337957; font-size: 32px; margin: 0;">Marius &amp; Fanny</h1>
            <p style="color: #888; font-size: 13px; margin-top: 4px;">Espace Professionnel</p>
          </div>

          <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 20px;">
              <div style="display: inline-block; background-color: #337957; color: white; padding: 10px 20px; border-radius: 20px; font-weight: bold; font-size: 14px;">
                ✅ DEMANDE APPROUVÉE
              </div>
            </div>

            <h2 style="color: #2D2A26; text-align: center; margin-bottom: 16px;">
              Bonjour ${contactName} 👋
            </h2>

            <p style="color: #555; line-height: 1.7; text-align: center; margin-bottom: 25px;">
              Nous avons examiné votre demande de partenariat pour <strong>${companyName}</strong> et nous sommes ravis de vous inviter à rejoindre notre réseau professionnel.
            </p>

            <p style="color: #555; line-height: 1.7; text-align: center; margin-bottom: 30px;">
              Pour finaliser la création de votre compte Pro, cliquez sur le bouton ci-dessous et complétez le formulaire d'inscription :
            </p>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${registrationUrl}"
                 style="display: inline-block; padding: 15px 40px; background-color: #337957; color: white;
                        text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
                🚀 Créer mon compte Pro
              </a>
            </div>

            <p style="color: #999; text-align: center; font-size: 12px; margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee;">
              Si vous avez des questions, contactez-nous à <a href="mailto:fanny.chiecchio@gmail.com" style="color: #337957;">fanny.chiecchio@gmail.com</a>
            </p>
          </div>

          <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
            <p>© 2026 Marius &amp; Fanny. Tous droits réservés.</p>
          </div>

        </div>
      `,
    };

    await sendEmail(mailOptions);
    console.log("✅ Email invitation partenaire envoyé vers:", prospectEmail);
  } catch (error) {
    console.error("❌ Erreur envoi email invitation partenaire:", error);
    throw error;
  }
}

/**
 * Send full payment receipt email
 */
export async function sendFullPaymentReceipt(
  email: string,
  name: string,
  orderNumber: string,
  items: Array<{ productName: string; quantity: number; amount: number }>,
  subtotal: number,
  taxAmount: number,
  deliveryFee: number,
  total: number,
  paymentId: string,
  orderDate?: Date,
): Promise<void> {
  try {
    const itemsHtml = items
      .map(
        (item) => `
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #eee; color: #555;">
            ${item.productName}
          </td>
          <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center; color: #555;">
            ${item.quantity}
          </td>
          <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right; color: #555;">
            ${item.amount.toFixed(2)}$
          </td>
        </tr>
      `
      )
      .join("");

    const orderDateObj = orderDate ? new Date(orderDate) : new Date();
    const formattedDate = orderDateObj.toLocaleDateString("fr-CA", { year: "numeric", month: "long", day: "numeric" });
    const formattedTime = orderDateObj.toLocaleTimeString("fr-CA", { hour: "2-digit", minute: "2-digit" });
    const paddedNumber = orderNumber.replace(/^ORD-/, "#");

    const mailOptions = {
      from: DISPLAY_FROM,
      to: email,
      subject: `✅ Confirmation de paiement - Commande ${paddedNumber}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #F9F7F2; border-radius: 10px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <img src="${LOGO_URL}" alt="Marius & Fanny" style="max-width: 180px; height: auto;" />
          </div>

          <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 20px;">
              <div style="display: inline-block; background-color: #4CAF50; color: white; padding: 10px 20px; border-radius: 20px; font-weight: bold;">
                ✅ PAIEMENT COMPLET REÇU
              </div>
            </div>

            <h2 style="color: #2D2A26; text-align: center; margin-bottom: 20px;">
              Merci ${name} ! 🎉
            </h2>

            <p style="color: #555; line-height: 1.6; text-align: center; margin-bottom: 30px;">
              Votre commande a été confirmée et votre paiement complet a été reçu avec succès.
            </p>

            <div style="background-color: #F9F7F2; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
              <p style="color: #999; margin: 0 0 5px 0; font-size: 12px;">Numéro de commande</p>
              <p style="color: #C5A065; font-size: 24px; font-weight: bold; margin: 0;">${paddedNumber}</p>
              <p style="color: #999; margin: 10px 0 5px 0; font-size: 12px;">Date de commande</p>
              <p style="color: #555; margin: 0; font-size: 14px;">${formattedDate} à ${formattedTime}</p>
              <p style="color: #999; margin: 10px 0 0 0; font-size: 12px;">ID de paiement: ${paymentId}</p>
            </div>

            <h3 style="color: #2D2A26; border-bottom: 2px solid #C5A065; padding-bottom: 10px;">
              Détails de la commande
            </h3>

            <table style="width: 100%; margin-bottom: 20px; border-collapse: collapse;">
              <thead>
                <tr style="background-color: #F9F7F2;">
                  <th style="padding: 10px; text-align: left; color: #2D2A26;">Produit</th>
                  <th style="padding: 10px; text-align: center; color: #2D2A26;">Qté</th>
                  <th style="padding: 10px; text-align: right; color: #2D2A26;">Prix</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>

            <div style="text-align: right; margin-top: 20px;">
              <p style="color: #555; margin: 5px 0;">
                <span style="display: inline-block; width: 150px;">Sous-total:</span>
                <strong>${subtotal.toFixed(2)}$</strong>
              </p>
              <p style="color: #555; margin: 5px 0;">
                <span style="display: inline-block; width: 150px;">Taxes (TPS+TVQ):</span>
                <strong>${taxAmount.toFixed(2)}$</strong>
              </p>
              ${
                deliveryFee > 0
                  ? `
              <p style="color: #555; margin: 5px 0;">
                <span style="display: inline-block; width: 150px;">Livraison:</span>
                <strong>${deliveryFee.toFixed(2)}$</strong>
              </p>
              `
                  : ""
              }
              <p style="color: #C5A065; font-size: 20px; margin: 15px 0 0 0; padding-top: 10px; border-top: 2px solid #C5A065;">
                <span style="display: inline-block; width: 150px;">Total payé:</span>
                <strong>${total.toFixed(2)}$</strong>
              </p>
            </div>

            <div style="background-color: #E8F5E9; padding: 15px; border-radius: 8px; margin-top: 30px; border-left: 4px solid #4CAF50;">
              <p style="color: #2D7D32; margin: 0; font-weight: bold;">
                💚 Paiement complet effectué
              </p>
              <p style="color: #555; margin: 5px 0 0 0; font-size: 14px;">
                Votre commande est maintenant en cours de préparation. Nous vous contacterons pour la livraison ou le ramassage.
              </p>
            </div>

            ${buildGoogleReviewSection()}
          </div>

          <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
            <p>Des questions ? Contactez-nous à <a href="mailto:mariusetfanny@gmail.com" style="color: #C5A065;">mariusetfanny@gmail.com</a></p>
            <p>© 2026 Marius & Fanny. Tous droits réservés.</p>
          </div>
        </div>
      `,
    };

    await sendEmail(mailOptions);
    console.log("✅ Reçu de paiement complet envoyé vers:", email);
  } catch (error) {
    console.error("❌ Erreur lors de l'envoi du reçu:", error);
    throw error;
  }
}

/**
 * Send deposit payment receipt email
 */
export async function sendDepositReceipt(
  email: string,
  name: string,
  orderNumber: string,
  items: Array<{ productName: string; quantity: number; amount: number }>,
  subtotal: number,
  taxAmount: number,
  deliveryFee: number,
  total: number,
  depositPaid: number,
  balanceDue: number,
  paymentId: string,
  orderDate?: Date,
): Promise<void> {
  try {
    const itemsHtml = items
      .map(
        (item) => `
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #eee; color: #555;">
            ${item.productName}
          </td>
          <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center; color: #555;">
            ${item.quantity}
          </td>
          <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right; color: #555;">
            ${item.amount.toFixed(2)}$
          </td>
        </tr>
      `
      )
      .join("");

    const orderDateObj = orderDate ? new Date(orderDate) : new Date();
    const formattedDate = orderDateObj.toLocaleDateString("fr-CA", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    const formattedTime = orderDateObj.toLocaleTimeString("fr-CA", {
      hour: "2-digit",
      minute: "2-digit",
    });
    const paddedNumber = orderNumber.replace(/^ORD-/, "#");

    const mailOptions = {
      from: DISPLAY_FROM,
      to: email,
      subject: `✅ Acompte reçu - Commande ${paddedNumber}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #F9F7F2; border-radius: 10px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <img src="${LOGO_URL}" alt="Marius & Fanny" style="max-width: 180px; height: auto;" />
          </div>

          <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 20px;">
              <div style="display: inline-block; background-color: #FF9800; color: white; padding: 10px 20px; border-radius: 20px; font-weight: bold;">
                💰 ACOMPTE REÇU (50%)
              </div>
            </div>

            <h2 style="color: #2D2A26; text-align: center; margin-bottom: 20px;">
              Merci ${name} ! 🎉
            </h2>

            <p style="color: #555; line-height: 1.6; text-align: center; margin-bottom: 30px;">
              Votre commande a été confirmée et votre acompte de 50% a été reçu avec succès.
            </p>

            <div style="background-color: #F9F7F2; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
              <p style="color: #999; margin: 0 0 5px 0; font-size: 12px;">Numéro de commande</p>
              <p style="color: #C5A065; font-size: 24px; font-weight: bold; margin: 0;">${paddedNumber}</p>
              <p style="color: #999; margin: 10px 0 5px 0; font-size: 12px;">Date de commande</p>
              <p style="color: #555; margin: 0; font-size: 14px;">${formattedDate} à ${formattedTime}</p>
              <p style="color: #999; margin: 10px 0 0 0; font-size: 12px;">ID de paiement: ${paymentId}</p>
            </div>

            <h3 style="color: #2D2A26; border-bottom: 2px solid #C5A065; padding-bottom: 10px;">
              Détails de la commande
            </h3>

            <table style="width: 100%; margin-bottom: 20px; border-collapse: collapse;">
              <thead>
                <tr style="background-color: #F9F7F2;">
                  <th style="padding: 10px; text-align: left; color: #2D2A26;">Produit</th>
                  <th style="padding: 10px; text-align: center; color: #2D2A26;">Qté</th>
                  <th style="padding: 10px; text-align: right; color: #2D2A26;">Prix</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>

            <div style="text-align: right; margin-top: 20px;">
              <p style="color: #555; margin: 5px 0;">
                <span style="display: inline-block; width: 180px;">Sous-total:</span>
                <strong>${subtotal.toFixed(2)}$</strong>
              </p>
              <p style="color: #555; margin: 5px 0;">
                <span style="display: inline-block; width: 180px;">Taxes (TPS+TVQ):</span>
                <strong>${taxAmount.toFixed(2)}$</strong>
              </p>
              ${
                deliveryFee > 0
                  ? `
              <p style="color: #555; margin: 5px 0;">
                <span style="display: inline-block; width: 180px;">Livraison:</span>
                <strong>${deliveryFee.toFixed(2)}$</strong>
              </p>
              `
                  : ""
              }
              <p style="color: #2D2A26; font-size: 18px; margin: 15px 0 0 0; padding-top: 10px; border-top: 2px solid #C5A065;">
                <span style="display: inline-block; width: 180px;">Total:</span>
                <strong>${total.toFixed(2)}$</strong>
              </p>
              <p style="color: #4CAF50; font-size: 16px; margin: 10px 0 0 0;">
                <span style="display: inline-block; width: 180px;">Acompte payé (50%):</span>
                <strong>${depositPaid.toFixed(2)}$</strong>
              </p>
              <p style="color: #FF9800; font-size: 20px; margin: 10px 0 0 0; padding-top: 10px; border-top: 1px solid #eee;">
                <span style="display: inline-block; width: 180px;">Solde dû:</span>
                <strong>${balanceDue.toFixed(2)}$</strong>
              </p>
            </div>

            <div style="background-color: #FFF3E0; padding: 15px; border-radius: 8px; margin-top: 30px; border-left: 4px solid #FF9800;">
              <p style="color: #E65100; margin: 0; font-weight: bold;">
                ⚠️ Solde à payer lors du ramassage/livraison
              </p>
              <p style="color: #555; margin: 5px 0 0 0; font-size: 14px;">
                Un montant de <strong>${balanceDue.toFixed(2)}$</strong> sera dû lors de la récupération ou de la livraison de votre commande.
              </p>
            </div>

            ${buildGoogleReviewSection()}
          </div>

          <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
            <p>Des questions ? Contactez-nous à <a href="mailto:mariusetfanny@gmail.com" style="color: #C5A065;">mariusetfanny@gmail.com</a></p>
            <p>© 2026 Marius & Fanny. Tous droits réservés.</p>
          </div>
        </div>
      `,
    };

    await sendEmail(mailOptions);
    console.log("✅ Reçu d'acompte envoyé vers:", email);
  } catch (error) {
    console.error("❌ Erreur lors de l'envoi du reçu d'acompte:", error);
    throw error;
  }
}

/**
 * Send order confirmation for invoice payment
 */
export async function sendInvoiceOrderConfirmation(
  email: string,
  name: string,
  orderNumber: string,
  items: Array<{ productName: string; quantity: number; amount: number }>,
  subtotal: number,
  taxAmount: number,
  deliveryFee: number,
  total: number,
  invoiceUrl?: string,
  orderDate?: Date,
): Promise<void> {
  try {
    const itemsHtml = items
      .map(
        (item) => `
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #eee; color: #555;">
            ${item.productName}
          </td>
          <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center; color: #555;">
            ${item.quantity}
          </td>
          <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right; color: #555;">
            ${item.amount.toFixed(2)}$
          </td>
        </tr>
      `
      )
      .join("");

    const orderDateObj = orderDate ? new Date(orderDate) : new Date();
    const formattedDate = orderDateObj.toLocaleDateString("fr-CA", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    const formattedTime = orderDateObj.toLocaleTimeString("fr-CA", {
      hour: "2-digit",
      minute: "2-digit",
    });
    const paddedNumber = orderNumber.replace(/^ORD-/, "#");

    const mailOptions = {
      from: DISPLAY_FROM,
      to: email,
      subject: `📋 Confirmation de commande - ${paddedNumber}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #F9F7F2; border-radius: 10px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <img src="${LOGO_URL}" alt="Marius & Fanny" style="max-width: 180px; height: auto;" />
          </div>

          <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 20px;">
              <div style="display: inline-block; background-color: #2196F3; color: white; padding: 10px 20px; border-radius: 20px; font-weight: bold;">
                📋 COMMANDE CONFIRMÉE
              </div>
            </div>

            <h2 style="color: #2D2A26; text-align: center; margin-bottom: 20px;">
              Merci ${name} ! 🎉
            </h2>

            <p style="color: #555; line-height: 1.6; text-align: center; margin-bottom: 30px;">
              Votre commande a été confirmée. Une facture Square vous a été envoyée séparément pour effectuer le paiement.
            </p>

            <div style="background-color: #F9F7F2; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
              <p style="color: #999; margin: 0 0 5px 0; font-size: 12px;">Numéro de commande</p>
              <p style="color: #C5A065; font-size: 24px; font-weight: bold; margin: 0;">${paddedNumber}</p>
              <p style="color: #999; margin: 10px 0 5px 0; font-size: 12px;">Date de commande</p>
              <p style="color: #555; margin: 0; font-size: 14px;">${formattedDate} à ${formattedTime}</p>
            </div>

            <h3 style="color: #2D2A26; border-bottom: 2px solid #C5A065; padding-bottom: 10px;">
              Détails de la commande
            </h3>

            <table style="width: 100%; margin-bottom: 20px; border-collapse: collapse;">
              <thead>
                <tr style="background-color: #F9F7F2;">
                  <th style="padding: 10px; text-align: left; color: #2D2A26;">Produit</th>
                  <th style="padding: 10px; text-align: center; color: #2D2A26;">Qté</th>
                  <th style="padding: 10px; text-align: right; color: #2D2A26;">Prix</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>

            <div style="text-align: right; margin-top: 20px;">
              <p style="color: #555; margin: 5px 0;">
                <span style="display: inline-block; width: 150px;">Sous-total:</span>
                <strong>${subtotal.toFixed(2)}$</strong>
              </p>
              <p style="color: #555; margin: 5px 0;">
                <span style="display: inline-block; width: 150px;">Taxes (TPS+TVQ):</span>
                <strong>${taxAmount.toFixed(2)}$</strong>
              </p>
              ${
                deliveryFee > 0
                  ? `
              <p style="color: #555; margin: 5px 0;">
                <span style="display: inline-block; width: 150px;">Livraison:</span>
                <strong>${deliveryFee.toFixed(2)}$</strong>
              </p>
              `
                  : ""
              }
              <p style="color: #C5A065; font-size: 20px; margin: 15px 0 0 0; padding-top: 10px; border-top: 2px solid #C5A065;">
                <span style="display: inline-block; width: 150px;">Total:</span>
                <strong>${total.toFixed(2)}$</strong>
              </p>
            </div>

            <div style="background-color: #E3F2FD; padding: 15px; border-radius: 8px; margin-top: 30px; border-left: 4px solid #2196F3;">
              <p style="color: #0D47A1; margin: 0; font-weight: bold;">
                🧾 Facture envoyée par email
              </p>
              <p style="color: #555; margin: 5px 0 0 0; font-size: 14px;">
                Vous allez recevoir un email séparé de Square avec votre facture et un lien pour effectuer le paiement en ligne de manière sécurisée.
              </p>
              ${
                invoiceUrl
                  ? `
              <div style="text-align: center; margin-top: 15px;">
                <a href="${invoiceUrl}" 
                   style="display: inline-block; padding: 12px 30px; background-color: #2196F3; color: white;
                          text-decoration: none; border-radius: 5px; font-weight: bold;">
                  💳 Voir la facture
                </a>
              </div>
              `
                  : ""
              }
            </div>

            ${buildGoogleReviewSection()}
          </div>

          <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
            <p>Des questions ? Contactez-nous à <a href="mailto:mariusetfanny@gmail.com" style="color: #C5A065;">mariusetfanny@gmail.com</a></p>
            <p>© 2026 Marius & Fanny. Tous droits réservés.</p>
          </div>
        </div>
      `,
    };

    await sendEmail(mailOptions);
    console.log("✅ Confirmation de commande envoyée vers:", email);
  } catch (error) {
    console.error("❌ Erreur lors de l'envoi de la confirmation:", error);
    throw error;
  }
}
