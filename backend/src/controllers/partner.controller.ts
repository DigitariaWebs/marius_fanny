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
    const normalizedEmail = (email || "").toLowerCase().trim();

    // Basic validation
    if (!businessName || !contactName || !email || !phone || !address || !password) {
      return next(new AppError("Tous les champs sont requis.", 400));
    }
    if (password.length < 6) {
      return next(new AppError("Le mot de passe doit contenir au moins 6 caractères.", 400));
    }

    // Check if a pending or approved request already exists for this email
    const existing = await PartnerRequest.findOne({ email: normalizedEmail });
    if (existing) {
      if (existing.status === "approved") {
        const { db } = await connectMongoDB();
        const authUser = await db.collection("user").findOne({ email: normalizedEmail });
        const authUserObjectId = (authUser as any)?._id;
        const authUserId = authUserObjectId ? String(authUserObjectId) : null;
        const authAccountByUserId = authUserId
          ? await db.collection("account").findOne({
              userId: authUserObjectId,
              providerId: "credential",
            })
          : null;
        const authAccountByEmail = await db.collection("account").findOne({
          accountId: normalizedEmail,
          providerId: "credential",
        });

        // Better Auth links account to user by userId (Mongo _id string).
        if (authUserId && authAccountByUserId && !authAccountByEmail) {
          await db.collection("account").updateOne(
            { _id: authAccountByUserId._id },
            { $set: { accountId: authUserId, userId: authUserObjectId, updatedAt: new Date() } },
          );
        }

        // Migrate legacy accountId=email records to Better Auth expected accountId=userId.
        if (authUserId && authAccountByEmail && !authAccountByUserId) {
          await db.collection("account").updateOne(
            { _id: authAccountByEmail._id },
            { $set: { accountId: authUserId, userId: authUserObjectId, updatedAt: new Date() } },
          );
        }

        // Recovery path: manual deletion left only an orphan account.
        if (!authUser && authAccountByEmail) {
          await db.collection("account").deleteOne({ _id: authAccountByEmail._id });
        }

        if (authUser) {
          return next(new AppError("Un compte Pro existe déjà avec cet email.", 409));
        }
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

    // Save (or refresh) the pending request
    if (existing && existing.status !== "pending") {
      existing.businessName = businessName.trim();
      existing.contactName = contactName.trim();
      existing.email = normalizedEmail;
      existing.phone = phone.trim();
      existing.address = address.trim();
      existing.hashedPassword = hashedPassword;
      existing.approvalToken = approvalToken;
      existing.tokenExpires = tokenExpires;
      existing.status = "pending";
      await existing.save();
    } else {
      await PartnerRequest.create({
        businessName: businessName.trim(),
        contactName: contactName.trim(),
        email: normalizedEmail,
        phone: phone.trim(),
        address: address.trim(),
        hashedPassword,
        approvalToken,
        tokenExpires,
        status: "pending",
      });
    }

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
        { businessName, contactName, email: normalizedEmail, phone, address },
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

    const now = new Date();

    // Check that email doesn't already exist in the user collection
    const existingUser = await db.collection("user").findOne({ email: partnerReq.email });
    const existingUserObjectId = (existingUser as any)?._id;
    const existingUserId = existingUserObjectId ? String(existingUserObjectId) : null;
    if (existingUserId) {
      await db.collection("user").updateOne(
        { _id: existingUser?._id },
        {
          $set: {
            role: "pro",
            emailVerified: true,
            updatedAt: now,
          },
        },
      );
    }
    const existingAccountByUserId = existingUserId
      ? await db.collection("account").findOne({
          userId: existingUserObjectId,
          providerId: "credential",
        })
      : null;
    const accountByEmail = await db.collection("account").findOne({
      accountId: partnerReq.email,
      providerId: "credential",
    });

    // Migrate legacy account record linked by email to Better Auth shape.
    if (existingUserId && accountByEmail && !existingAccountByUserId) {
      await db.collection("account").updateOne(
        { _id: accountByEmail._id },
        { $set: { accountId: existingUserId, userId: existingUserObjectId, updatedAt: now } },
      );
    }

    if (existingUserId && existingAccountByUserId && !accountByEmail) {
      await db.collection("account").updateOne(
        { _id: existingAccountByUserId._id },
        { $set: { accountId: existingUserId, userId: existingUserObjectId, updatedAt: now } },
      );
    }

    // Repair inconsistent states caused by manual DB edits.
    if (!existingUser && accountByEmail) {
      await db.collection("account").deleteOne({ _id: accountByEmail._id });
    }

    if (!existingUser) {
      // Insert into better-auth "user" collection
      const insertUserResult = await db.collection("user").insertOne({
        name: partnerReq.contactName,
        email: partnerReq.email,
        emailVerified: true,
        image: null,
        role: "pro",
        createdAt: now,
        updatedAt: now,
      });

      const createdUserId = String(insertUserResult.insertedId);

      // Insert into better-auth "account" collection (credential provider)
      await db.collection("account").insertOne({
        userId: insertUserResult.insertedId,
        accountId: createdUserId,
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
    } else if (!existingAccountByUserId && !accountByEmail) {
      const userIdForAccount = (existingUser as any)._id;
      await db.collection("account").insertOne({
        userId: userIdForAccount,
        accountId: String(userIdForAccount),
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

    // Final consistency check: ensure user + credential account are both present and linked.
    let ensuredUser = await db.collection("user").findOne({ email: partnerReq.email });
    const ensuredUserObjectId = (ensuredUser as any)?._id;
    const ensuredUserId = ensuredUserObjectId ? String(ensuredUserObjectId) : null;

    if (ensuredUserId) {
      await db.collection("account").updateMany(
        { providerId: "credential", $or: [{ accountId: partnerReq.email }, { userId: partnerReq.email }] },
        { $set: { userId: ensuredUserObjectId, accountId: ensuredUserId, updatedAt: new Date() } },
      );

      // Also migrate string userId records to ObjectId for Better Auth joins.
      await db.collection("account").updateMany(
        { providerId: "credential", userId: ensuredUserId },
        { $set: { userId: ensuredUserObjectId, updatedAt: new Date() } },
      );
    }

    const ensuredAccount = await db.collection("account").findOne({
      userId: ensuredUserId,
      providerId: "credential",
    });

    if (!ensuredAccount) {
      await db.collection("account").insertOne({
        userId: ensuredUserObjectId,
        accountId: ensuredUserId,
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
    email = email.toLowerCase().trim();

    // Basic email format check
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return next(new AppError("Adresse email invalide.", 400));
    }

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";

    // Look up name/company from stored inquiry or full partner request
    let contactName = "";
    let companyName = "";
    let inquiry = await PartnerInquiry.findOne({ email }).select("+activationToken");
    let partnerReq = null as any;

    if (inquiry) {
      contactName = inquiry.contactName;
      companyName = inquiry.companyName;
    } else {
      partnerReq = await PartnerRequest.findOne({ email });
      if (partnerReq) {
        contactName = partnerReq.contactName;
        companyName = partnerReq.businessName;
      }
    }

    // Generate an activation token so the partner can create their account
    const activationToken = crypto.randomBytes(32).toString("hex");
    const activationTokenExpires = new Date(Date.now() + 48 * 60 * 60 * 1000); // 48 hours

    if (!inquiry) {
      if (!partnerReq) {
        return next(new AppError("Aucune demande partenaire trouvée pour cet email.", 404));
      }

      // Ensure activation token is persisted even when the flow starts from PartnerRequest.
      inquiry = await PartnerInquiry.create({
        companyName: partnerReq.businessName,
        contactName: partnerReq.contactName,
        email: partnerReq.email,
        phone: partnerReq.phone,
        businessType: "partenaire",
        message: "",
        activationToken,
        activationTokenExpires,
        activated: false,
        inviteSentAt: new Date(),
      });
    } else {
      // If admin re-sends invitation, allow re-activation flow.
      inquiry.activationToken = activationToken;
      inquiry.activationTokenExpires = activationTokenExpires;
      inquiry.activated = false;
      inquiry.inviteSentAt = new Date();
      await inquiry.save();
    }

    const registrationUrl = `${frontendUrl}/devenir-partenaire?token=${activationToken}`;

    console.log(`📧 [INVITE] Sending invitation to: ${email} (${contactName || "nom inconnu"} / ${companyName || "entreprise inconnue"})`);

    await sendPartnerInvitationEmail(
      email,
      contactName || "cher partenaire",
      companyName || "votre entreprise",
      registrationUrl,
    );

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

/**
 * POST /api/partner-request/activate
 * Partner clicks the link from the invitation email, sets their password, and creates their pro account.
 */
export async function activatePartner(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return next(new AppError("Token et mot de passe requis.", 400));
    }
    if (password.length < 6) {
      return next(new AppError("Le mot de passe doit contenir au moins 6 caractères.", 400));
    }

    // Find the inquiry using the activation token
    const inquiry = await PartnerInquiry.findOne({
      activationToken: token,
    }).select("+activationToken");

    if (!inquiry) {
      return next(new AppError("Lien d'activation invalide ou expiré.", 404));
    }

    if (!inquiry.activationTokenExpires || inquiry.activationTokenExpires < new Date()) {
      return next(new AppError("Ce lien d'activation a expiré. Contactez l'administrateur.", 410));
    }

    // Create the user in better-auth's MongoDB collections
    const { db } = await connectMongoDB();

    const existingUser = await db.collection("user").findOne({ email: inquiry.email });
    const existingUserObjectId = (existingUser as any)?._id;
    const existingUserId = existingUserObjectId ? String(existingUserObjectId) : null;
    const existingAccountByUserId = existingUserId
      ? await db.collection("account").findOne({
          userId: existingUserObjectId,
          providerId: "credential",
        })
      : null;
    const accountByEmail = await db.collection("account").findOne({
      accountId: inquiry.email,
      providerId: "credential",
    });

    // Migrate legacy account record linked by email to Better Auth shape.
    if (existingUserId && accountByEmail && !existingAccountByUserId) {
      await db.collection("account").updateOne(
        { _id: accountByEmail._id },
        { $set: { accountId: existingUserId, userId: existingUserObjectId, updatedAt: new Date() } },
      );
    }

    if (existingUserId && existingAccountByUserId && !accountByEmail) {
      await db.collection("account").updateOne(
        { _id: existingAccountByUserId._id },
        { $set: { accountId: existingUserId, userId: existingUserObjectId, updatedAt: new Date() } },
      );
    }

    const now = new Date();
    const hashedPassword = await bcrypt.hash(password, 12);

    if (existingUserId) {
      await db.collection("user").updateOne(
        { _id: existingUser?._id },
        {
          $set: {
            role: "pro",
            emailVerified: true,
            updatedAt: now,
          },
        },
      );
    }

    // If account already exists, finalize inquiry state and return success.
    // This keeps the flow idempotent and unblocks login after account self-heal.
    if (existingUser && (existingAccountByUserId || accountByEmail)) {
      if (existingUserId) {
        await db.collection("account").updateMany(
          {
            providerId: "credential",
            $or: [
              { userId: existingUserId },
              { accountId: existingUserId },
              { accountId: inquiry.email },
            ],
          },
          {
            $set: {
              userId: existingUserObjectId,
              accountId: existingUserId,
              password: hashedPassword,
              updatedAt: now,
            },
          },
        );

        await db.collection("account").updateMany(
          { providerId: "credential", userId: existingUserId },
          { $set: { userId: existingUserObjectId, updatedAt: now } },
        );
      }

      inquiry.activated = true;
      inquiry.activationToken = null;
      inquiry.activationTokenExpires = null;
      await inquiry.save();

      return res.status(200).json({
        success: true,
        message: "Compte Pro déjà actif. Vous pouvez vous connecter.",
      });
    }

    // Recovery path for partially deleted data.
    if (!existingUser && accountByEmail) {
      await db.collection("account").deleteOne({ _id: accountByEmail._id });
    }

    if (!existingUser) {
      const insertUserResult = await db.collection("user").insertOne({
        name: inquiry.contactName,
        email: inquiry.email,
        emailVerified: true,
        image: null,
        role: "pro",
        createdAt: now,
        updatedAt: now,
      });

      const createdUserId = String(insertUserResult.insertedId);

      await db.collection("account").insertOne({
        userId: insertUserResult.insertedId,
        accountId: createdUserId,
        providerId: "credential",
        password: hashedPassword,
        accessToken: null,
        refreshToken: null,
        idToken: null,
        expiresAt: null,
        scope: null,
        createdAt: now,
        updatedAt: now,
      });
    } else {
      const userIdForAccount = (existingUser as any)._id;
      await db.collection("account").insertOne({
        userId: userIdForAccount,
        accountId: String(userIdForAccount),
        providerId: "credential",
        password: hashedPassword,
        accessToken: null,
        refreshToken: null,
        idToken: null,
        expiresAt: null,
        scope: null,
        createdAt: now,
        updatedAt: now,
      });
    }

    // Final consistency check: ensure user + credential account are both present and linked.
    let ensuredUser = await db.collection("user").findOne({ email: inquiry.email });
    const ensuredUserObjectId = (ensuredUser as any)?._id;
    const ensuredUserId = ensuredUserObjectId ? String(ensuredUserObjectId) : null;

    if (ensuredUserId) {
      await db.collection("account").updateMany(
        { providerId: "credential", $or: [{ accountId: inquiry.email }, { userId: inquiry.email }] },
        { $set: { userId: ensuredUserObjectId, accountId: ensuredUserId, updatedAt: new Date() } },
      );

      await db.collection("account").updateMany(
        { providerId: "credential", userId: ensuredUserId },
        { $set: { userId: ensuredUserObjectId, updatedAt: new Date() } },
      );
    }

    const ensuredAccount = await db.collection("account").findOne({
      userId: ensuredUserId,
      providerId: "credential",
    });

    if (!ensuredAccount) {
      await db.collection("account").insertOne({
        userId: ensuredUserObjectId,
        accountId: ensuredUserId,
        providerId: "credential",
        password: hashedPassword,
        accessToken: null,
        refreshToken: null,
        idToken: null,
        expiresAt: null,
        scope: null,
        createdAt: now,
        updatedAt: now,
      });
    }

    // Mark inquiry as activated and clear the token
    inquiry.activated = true;
    inquiry.activationToken = null;
    inquiry.activationTokenExpires = null;
    await inquiry.save();

    return res.status(201).json({
      success: true,
      message: "Votre compte Pro a été créé avec succès ! Vous pouvez maintenant vous connecter.",
    });
  } catch (error) {
    next(error);
  }
}
