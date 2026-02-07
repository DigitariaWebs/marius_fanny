import 'dotenv/config';
import "express-async-errors";

import express, { Express, Request, Response } from "express";
import cors from "cors";
import mongoose from "mongoose";
import { toNodeHandler } from "better-auth/node";
import { getAuth } from "../src/config/auth.js";
import apiRoutes from "../src/routes/index.js";
import { errorHandler, notFoundHandler } from "../src/middleware/errorHandler.js";
import { sanitizeBody } from "../src/middleware/validation.js";
import { validateSquareConfig } from "../src/config/square.js";
import dns from "node:dns";
import dnsPromises from "node:dns/promises";

// DNS configuration for MongoDB Atlas SRV record resolution
dns.setServers(["1.1.1.1", "8.8.8.8"]);
dnsPromises.setServers(["1.1.1.1", "8.8.8.8"]);

// Initialize the application
const initializeApp = async () => {
  try {
    const app = express();
    const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
    const MONGODB_URI = process.env.MONGODB_URI;
    if (!MONGODB_URI) {
      throw new Error("MONGODB_URI is not set");
    }

    // MongoDB connection (non-blocking)
    mongoose.set("strictQuery", true);
    const mongooseOptions = {
      family: 4,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    };

    // Connect to MongoDB in background
    mongoose
      .connect(MONGODB_URI, mongooseOptions)
      .then(() => {
        console.log("✅ MONGOOSE CONNECTÉ");
        validateSquareConfig();
      })
      .catch((err) => {
        console.error("❌ ERREUR CONNEXION MONGOOSE:", err);
      });

    // CORS
    app.use(
      cors({
        origin: FRONTEND_URL,
        methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
        credentials: true,
      }),
    );

    // Better Auth routes
    let authHandler: any = null;

    app.use("/api/auth", async (req, res, next) => {
      try {
        if (!authHandler) {
          const auth = await getAuth();
          authHandler = toNodeHandler(auth);
        }
        return authHandler(req, res);
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        const errorStack = error instanceof Error ? error.stack : "";
        console.error("❌ [AUTH] Better Auth error:", errorMsg);
        console.error("❌ [AUTH] Stack:", errorStack);
        res.status(500).json({
          success: false,
          error: "Auth service error",
          details: errorMsg,
        });
      }
    });

    app.use(express.json());
    app.use(sanitizeBody);

    // API routes
    app.use("/api", apiRoutes);

    // Root route
    app.get("/", (req, res) => {
      res.json({
        message: "Server is running",
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || "development",
      });
    });

    // Error handling
    app.use(notFoundHandler);
    app.use(errorHandler);

    return app;
  } catch (error) {
    console.error("❌ Failed to initialize app:", error);
    throw error;
  }
};

// Cache for serverless
let appPromise: Promise<Express> | null = null;

// Export handler for Vercel
export default async (req: Request, res: Response) => {
  if (!appPromise) {
    appPromise = initializeApp();
  }

  try {
    const app = await appPromise;
    return app(req, res);
  } catch (error) {
    console.error("❌ Serverless function error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
