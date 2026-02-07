import { Request, Response, NextFunction } from "express";
import { ZodError, ZodType, z } from "zod";

/**
 * Validate request body against Zod schema
 */
export function validateBody<T extends ZodType<any>>(schema: T) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      console.log(
        "🔍 [VALIDATION] Validating request body:",
        JSON.stringify(req.body, null, 2),
      );
      const validated = await schema.parseAsync(req.body);
      req.body = validated;
      console.log("✅ [VALIDATION] Request body validated successfully");
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        console.error("❌ [VALIDATION] Validation failed:", error.issues);
        return res.status(400).json({
          success: false,
          error: "Validation Error",
          message: "Invalid request data",
          details: error.issues.map((err) => ({
            field: err.path.join("."),
            message: err.message,
          })),
        });
      }
      next(error);
    }
  };
}

/**
 * Validate request query parameters against Zod schema
 */
export function validateQuery<T extends ZodType<any>>(schema: T) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validated = await schema.parseAsync(req.query);
      // Use Object.assign instead of direct assignment (req.query is readonly)
      Object.assign(req.query, validated);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          success: false,
          error: "Validation Error",
          message: "Invalid query parameters",
          details: error.issues.map((err) => ({
            field: err.path.join("."),
            message: err.message,
          })),
        });
      }
      next(error);
    }
  };
}

/**
 * Validate request params against Zod schema
 */
export function validateParams<T extends ZodType<any>>(schema: T) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validated = await schema.parseAsync(req.params);
      req.params = validated as any;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          success: false,
          error: "Validation Error",
          message: "Invalid URL parameters",
          details: error.issues.map((err) => ({
            field: err.path.join("."),
            message: err.message,
          })),
        });
      }
      next(error);
    }
  };
}

/**
 * Validate multiple parts of request (body, query, params)
 */
export function validate<
  T extends {
    body?: ZodType<any>;
    query?: ZodType<any>;
    params?: ZodType<any>;
  },
>(schemas: T) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (schemas.body) {
        req.body = await schemas.body.parseAsync(req.body);
      }
      if (schemas.query) {
        req.query = (await schemas.query.parseAsync(req.query)) as any;
      }
      if (schemas.params) {
        req.params = (await schemas.params.parseAsync(req.params)) as any;
      }
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          success: false,
          error: "Validation Error",
          message: "Invalid request data",
          details: error.issues.map((err) => ({
            field: err.path.join("."),
            message: err.message,
          })),
        });
      }
      next(error);
    }
  };
}

/**
 * Simple email validation
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Simple MongoDB ObjectId validation
 */
export function isValidObjectId(id: string): boolean {
  return /^[0-9a-fA-F]{24}$/.test(id);
}

/**
 * Validate MongoDB ObjectId param using Zod
 */
export function validateObjectId(paramName: string = "id") {
  const schema = z.object({
    [paramName]: z
      .string()
      .regex(/^[0-9a-fA-F]{24}$/, `Invalid ${paramName} format`),
  });

  return validateParams(schema as ZodType<any>);
}

/**
 * Sanitize user input to prevent XSS
 */
export function sanitizeInput(input: string): string {
  if (typeof input !== "string") return input;

  return input
    .replace(/[<>]/g, "") // Remove < and >
    .trim();
}

/**
 * Middleware to sanitize request body
 */
export function sanitizeBody(req: Request, res: Response, next: NextFunction) {
  if (req.body && typeof req.body === "object") {
    Object.keys(req.body).forEach((key) => {
      if (typeof req.body[key] === "string") {
        req.body[key] = sanitizeInput(req.body[key]);
      }
    });
  }
  next();
}

/**
 * Validate email field
 */
export const validateEmail = (req: Request, res: Response, next: NextFunction) => {
  const { email } = req.body;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!email || !emailRegex.test(email)) {
    return res.status(400).json({ message: "Invalid email address" });
  }

  next();
};

/**
 * Validate password field
 */
export const validatePassword = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { newPassword } = req.body;

  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({ message: "Password must be at least 6 characters long" });
  }

  next();
};
