import { Request, Response } from "express";
import { AuthRequest } from "../middleware/auth";
import { User } from "../models/User";
import { AppError } from "../middleware/errorHandler";
import { sendVerificationCodeEmail, generateMockVerificationCode } from "../utils/emailService";


export async function getSession(req: AuthRequest, res: Response) {
  try {
    if (!req.user || !req.session) {
      throw new AppError("No active session", 401);
    }

    res.json({
      success: true,
      data: {
        user: req.user,
        session: req.session,
      },
    });
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError("Failed to get session", 500);
  }
}

/**
 * Verify email status
 */
export async function checkEmailVerification(req: AuthRequest, res: Response) {
  try {
    if (!req.user) {
      throw new AppError("User not authenticated", 401);
    }

    res.json({
      success: true,
      data: {
        email: req.user.email,
        emailVerified: req.user.emailVerified,
      },
    });
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError("Failed to check email verification", 500);
  }
}

/**
 * Create user profile after authentication
 * This is called after successful sign-up to create the Mongoose user document
 * Sends a verification email with a mock code
 */
export async function createUserProfile(req: Request, res: Response) {
  try {
    const { email, name } = req.body;
    console.log(`🔍 [createUserProfile] Starting user creation for email: ${email}, name: ${name}`);

    if (!email || !name) {
      console.warn(`⚠️ [createUserProfile] Missing required fields - email: ${email}, name: ${name}`);
      throw new AppError("Email and name are required", 400);
    }

    console.log(`🔍 [createUserProfile] Checking if user exists with email: ${email}`);
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log(`ℹ️ [createUserProfile] User already exists with email: ${email}`);
      return res.json({
        success: true,
        data: existingUser,
        message: "User profile already exists",
      });
    }

    // Generate mock verification code (6 digits)
    const verificationCode = generateMockVerificationCode();
    const expirationTime = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    console.log(`🔐 [createUserProfile] Generated verification code: ${verificationCode}`);
    console.log(`⏰ [createUserProfile] Verification code expires at: ${expirationTime.toISOString()}`);

    // Create new user profile with verification code
    console.log(`💾 [createUserProfile] Creating new user in database with email: ${email}`);
    const user = await User.create({
      email,
      name,
      role: "user",
      emailVerified: false,
      emailVerificationCode: verificationCode,
      emailVerificationExpires: expirationTime,
    });
    console.log(`✅ [createUserProfile] User created successfully with ID: ${user._id}`);

    // Send verification email with mock code
    try {
      console.log(`📧 [createUserProfile] Starting email send process for: ${email}`);
      await sendVerificationCodeEmail(email, name);
      console.log(`📧 [createUserProfile] Verification email sent successfully for user: ${email}`);
    } catch (emailError) {
      console.error(`❌ [createUserProfile] Failed to send verification email for ${email}:`, emailError);
      // Don't throw - user account is created, email sending failure shouldn't block signup
    }

    console.log(`🎉 [createUserProfile] User profile creation process completed for: ${email}`);
    res.status(201).json({
      success: true,
      data: user,
      message: "User profile created successfully. Verification email sent.",
    });
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError("Failed to create user profile", 500);
  }
}

/**
 * Sync Better Auth user with Mongoose User model
 * This ensures that authenticated users have a corresponding Mongoose document
 */
export async function syncUserProfile(req: AuthRequest, res: Response) {
  try {
    if (!req.user) {
      throw new AppError("User not authenticated", 401);
    }

    let user = await User.findOne({ email: req.user.email });

    if (!user) {
      // Create user if doesn't exist
      user = await User.create({
        email: req.user.email,
        name: req.user.name,
        role: "user",
      });

      return res.status(201).json({
        success: true,
        data: user,
        message: "User profile created and synced",
      });
    }

    res.json({
      success: true,
      data: user,
      message: "User profile already synced",
    });
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError("Failed to sync user profile", 500);
  }
}


export async function getUserStats(req: AuthRequest, res: Response) {
  try {
    if (!req.user) {
      throw new AppError("User not authenticated", 401);
    }

    const user = await User.findOne({ email: req.user.email });

    if (!user) {
      throw new AppError("User profile not found", 404);
    }

    const stats = {
      email: user.email,
      name: user.name,
      role: user.role,
      emailVerified: req.user.emailVerified,
      accountCreated: user.createdAt,
      lastUpdated: user.updatedAt,
    };

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError("Failed to get user stats", 500);
  }
}
