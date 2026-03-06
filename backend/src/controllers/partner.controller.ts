import { Request, Response, NextFunction } from "express";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { PartnerRequest } from "../models/PartnerRequest.js";
import { PartnerInquiry } from "../models/PartnerInquiry.js";
import { AppError } from "../middleware/errorHandler.js";
import { sendPartnerRequestEmail, sendPartnerApprovedEmail, sendPartnerInquiryEmail, sendPartnerInvitationEmail } from "../utils/mail.js";
import { connectMongoDB } from "../config/db.js";

const ADMIN_EMAIL = "fanny.chiecchio@gmail.com";

/**
 * POST /api/partner-request
 * Stores the partner application and notifies admin by email
 */
export async function submitPartnerRequest(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { businessName, contactName, email, phone, address, password } =
      req.body;

    // Basic validation
    if (!businessName || !contactName || !email || !phone || !address || !password) {
      return next(new AppError("Tous les champs sont requis.", 400));
    }
    if (password.length < 6) {
      return next(new AppError("Le mot de passe doit contenir au moins 6 caractères.", 400));
    }

    // Check if a pending or approved request already exists for this email
    const existing = await PartnerRequest.findOne({ email: email.toLowerCase() });
    if (existing) {
      if (existing.status === "approved") {
        return next(new AppError("Un compte Pro existe déjà avec cet email.", 409));
      }
      if (existing.status === "pending") {
        return next(
          new AppError(
            "Une demande est déjà en attente pour cet email. Vous serez contacté une fois approuvé.",
            409,
          ),
        );
      }
    }

    // Hash the password securely for future account creation
    const hashedPassword = await bcrypt.hash(password, 12);

    // Generate a secure approval token
    const approvalToken = crypto.randomBytes(40).toString("hex");
    const tokenExpires = new Date(Date.now() + 48 * 60 * 60 * 1000); // 48h

    // Save the pending request
    await PartnerRequest.create({
      businessName: businessName.trim(),
      contactName: contactName.trim(),
      email: email.toLowerCase().trim(),
      phone: phone.trim(),
      address: address.trim(),
      hashedPassword,
      approvalToken,
      tokenExpires,
      status: "pending",
    });

    // Build the approval link pointing to this backend endpoint
    const backendUrl =
      process.env.BACKEND_URL ||
      process.env.BETTER_AUTH_URL ||
      "http://localhost:3000";
    const approvalLink = `${backendUrl}/api/partner-request/approve/${approvalToken}`;

    // Send email to admin — catch errors so they never break the response
    try {
      await sendPartnerRequestEmail(
        ADMIN_EMAIL,
        { businessName, contactName, email, phone, address },
        approvalLink,
      );
      console.log(`✅ [PARTNER] Admin notification sent to ${ADMIN_EMAIL}`);
    } catch (emailError) {
      console.error("❌ [PARTNER] Failed to send admin notification email:", emailError);
    }

    return res.status(200).json({
      success: true,
      message:
        "Votre demande a été envoyée avec succès. Vous recevrez un email de confirmation une fois approuvé.",
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/partner-request/approve/:token
 * Called from the admin's approval email link.
 * Creates the user account and redirects the browser.
 */
export async function approvePartnerRequest(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { token } = req.params;

    // Find the request with the token (include select: false fields)
    const partnerReq = await PartnerRequest.findOne({
      approvalToken: token,
    }).select("+approvalToken");

    if (!partnerReq) {
      return next(new AppError("Lien d'approbation invalide ou expiré.", 404));
    }

    if (partnerReq.status === "approved") {
      const frontendUrl =
        process.env.FRONTEND_URL || "http://localhost:5173";
      return res.redirect(
        `${frontendUrl}/devenir-partenaire?already_approved=1`,
      );
    }

    if (partnerReq.tokenExpires < new Date()) {
      return next(new AppError("Ce lien d'approbation a expiré.", 410));
    }

    // Create the user in better-auth's MongoDB collections
    const { db } = await connectMongoDB();

    const userId = crypto.randomUUID();
    const now = new Date();

    // Check that email doesn't already exist in the user collection
    const existingUser = await db.collection("user").findOne({
      email: partnerReq.email,
    });

    if (!existingUser) {
      // Insert into better-auth "user" collection
      await db.collection("user").insertOne({
        id: userId,
        name: partnerReq.contactName,
        email: partnerReq.email,
        emailVerified: true,
        image: null,
        role: "pro",
        createdAt: now,
        updatedAt: now,
      });

      // Insert into better-auth "account" collection (credential provider)
      await db.collection("account").insertOne({
        id: crypto.randomUUID(),
        userId,
        accountId: partnerReq.email,
        providerId: "credential",
        password: partnerReq.hashedPassword,
        accessToken: null,
        refreshToken: null,
        idToken: null,
        expiresAt: null,
        scope: null,
        createdAt: now,
        updatedAt: now,
      });
    }

    // Mark the request as approved
    partnerReq.status = "approved";
    await partnerReq.save();

    // Send confirmation email to the new partner
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    const loginUrl = `${frontendUrl}/se-connecter`;
    await sendPartnerApprovedEmail(
      partnerReq.email,
      partnerReq.contactName,
      partnerReq.businessName,
      loginUrl,
    );

    // Redirect admin's browser to frontend with success param
    return res.redirect(
      `${frontendUrl}/devenir-partenaire?approved=1`,
    );
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/partner-request/inquiry
 * Handles the homepage "Devenir Partenaire" inquiry form.
 * Just emails the admin — no account creation, no approval token.
 */
export async function submitPartnerInquiry(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { companyName, contactName, email, phone, businessType, message } =
      req.body;

    if (!companyName || !contactName || !email || !phone || !businessType) {
      return next(new AppError("Veuillez remplir tous les champs obligatoires.", 400));
    }

    const normalizedEmail = email.toLowerCase().trim();
    const backendUrl =
      process.env.BACKEND_URL ||
      process.env.BETTER_AUTH_URL ||
      "http://localhost:3000";
    const encodedEmail = Buffer.from(normalizedEmail).toString("base64url");
    const inviteUrl = `${backendUrl}/api/partner-request/invite/${encodedEmail}`;

    const inquiryData = {
      companyName: companyName.trim(),
      contactName: contactName.trim(),
      email: normalizedEmail,
      phone: phone.trim(),
      businessType: businessType.trim(),
      message: (message || "").trim(),
    };

    // Save inquiry to DB (upsert by email so re-submissions update rather than duplicate)
    await PartnerInquiry.findOneAndUpdate(
      { email: normalizedEmail },
      inquiryData,
      { upsert: true, new: true },
    );

    // Send inquiry email to admin — catch so it never breaks the response
    try {
      await sendPartnerInquiryEmail(ADMIN_EMAIL, inquiryData, inviteUrl);
      console.log(`✅ [INQUIRY] Inquiry email sent to ${ADMIN_EMAIL}`);
    } catch (emailError) {
      console.error("❌ [INQUIRY] Failed to send inquiry email:", emailError);
    }

    return res.status(200).json({
      success: true,
      message: "Votre demande de renseignements a bien été transmise. Nous vous recontacterons très prochainement.",
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/partner-request/invite/:encodedEmail
 * Admin clicks this link from the inquiry email.
 * Sends an invitation email to the prospect and shows a confirmation page.
 */
export async function invitePartner(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { encodedEmail } = req.params;

    let email: string;
    try {
      email = Buffer.from(encodedEmail, "base64url").toString("utf8");
    } catch {
      return next(new AppError("Lien d'invitation invalide.", 400));
    }

    // Basic email format check
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return next(new AppError("Adresse email invalide.", 400));
    }

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    const registrationUrl = `${frontendUrl}/devenir-partenaire`;

    // Look up name/company from stored inquiry or full partner request
    let contactName = "";
    let companyName = "";
    const inquiry = await PartnerInquiry.findOne({ email: email.toLowerCase() });
    if (inquiry) {
      contactName = inquiry.contactName;
      companyName = inquiry.companyName;
    } else {
      const partnerReq = await PartnerRequest.findOne({ email: email.toLowerCase() });
      if (partnerReq) {
        contactName = partnerReq.contactName;
        companyName = partnerReq.businessName;
      }
    }

    console.log(`📧 [INVITE] Sending invitation to: ${email} (${contactName || "nom inconnu"} / ${companyName || "entreprise inconnue"})`);

    await sendPartnerInvitationEmail(
      email,
      contactName || "cher partenaire",
      companyName || "votre entreprise",
      registrationUrl,
    );

    // Mark invite as sent
    if (inquiry) {
      inquiry.inviteSentAt = new Date();
      await inquiry.save();
    }

    console.log(`✅ [INVITE] Invitation successfully sent to ${email}`);

    // Simple HTML confirmation shown in admin's browser
    return res.status(200).send(`
      <!DOCTYPE html>
      <html lang="fr">
      <head>
        <meta charset="UTF-8"/>
        <title>Invitation envoyée</title>
        <style>
          body { font-family: Arial, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; background: #F9F7F2; }
          .card { background: white; padding: 48px; border-radius: 16px; box-shadow: 0 4px 24px rgba(0,0,0,0.1); text-align: center; max-width: 460px; }
          .icon { font-size: 56px; margin-bottom: 16px; }
          h1 { color: #337957; margin: 0 0 12px; }
          p { color: #555; line-height: 1.6; }
          strong { color: #2D2A26; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="icon">✅</div>
          <h1>Invitation envoyée !</h1>
          <p>Un email d'invitation a été envoyé à <strong>${email}</strong>.</p>
          <p>Le prospect recevra un lien pour créer son compte Pro sur la plateforme.</p>
        </div>
      </body>
      </html>
    `);
  } catch (error) {
    next(error);
  }
}
