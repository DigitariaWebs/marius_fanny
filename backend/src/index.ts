import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "..", ".env") });

import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import { toNodeHandler } from "better-auth/node";
import { getAuth } from "./config/auth.js";
import apiRoutes from "./routes/index.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";
import { sanitizeBody } from "./middleware/validation.js";
import { validateSquareConfig } from "./config/square.js";

// DNS configuration for MongoDB Atlas SRV record resolution
import dns from "node:dns";

// Use Cloudflare + Google DNS (very reliable for SRV records)
dns.setServers(["1.1.1.1", "8.8.8.8"]);

// Optional: also do promises version if your code uses dns.promises somewhere
import dnsPromises from "node:dns/promises";
dnsPromises.setServers(["1.1.1.1", "8.8.8.8"]);

const app = express();
const PORT = process.env.PORT || 3000;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

// --- AJOUTE CETTE LIGNE ICI (AVANT LA CONNEXION) ---
const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  throw new Error("MONGODB_URI is not set");
}

// 1. CONNEXION MONGOOSE
mongoose.set("strictQuery", true);

// Add DNS resolution options for Bun compatibility
const mongooseOptions = {
  family: 4, // Use IPv4, skip trying IPv6
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
};

mongoose
  .connect(MONGODB_URI, mongooseOptions)
  .then(async () => {
    console.log("✅ MONGOOSE CONNECTÉ");
    validateSquareConfig();

    // Initialize auth after database connection
    try {
      const auth = await getAuth();
      authHandler = toNodeHandler(auth);
      console.log("✅ Better Auth initialized");
    } catch (error) {
      console.error("❌ Failed to initialize Better Auth:", error);
    }
  })
  .catch((err) => {
    console.error("❌ ERREUR CONNEXION MONGOOSE:", err);
    console.log("⚠️  Server will continue without database connection");
    console.log("⚠️  Better Auth will not be available");
  });

// 2. MIDDLEWARES

// Global request logger - logs ALL incoming requests
// Removed request logger for production cleanliness

// CORS configuration - accepte localhost sur n'importe quel port en développement
const corsOptions = {
  origin: function (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
    // Allow requests from localhost (any port) in development
    if (process.env.NODE_ENV === "development" && origin?.includes("localhost")) {
      callback(null, true);
    }
    // Allow from FRONTEND_URL
    else if (origin === FRONTEND_URL) {
      callback(null, true);
    }
    // Allow requests with no origin (like mobile apps or curl requests)
    else if (!origin) {
      callback(null, true);
    }
    // Deny others
    else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  credentials: true,
};

app.use(cors(corsOptions));

// 3. BETTER AUTH (REGISTER BEFORE JSON BODY PARSING)
// Initialize auth handler once
let authHandler: any = null;

app.all(/^\/api\/auth\/.*/, async (req, res) => {
  try {
    if (!authHandler) {
      console.log("⚠️ Auth handler not initialized yet");
      return res.status(503).json({ error: "Auth service not ready" });
    }
    return authHandler(req, res);
  } catch (error) {
    console.error("❌ [AUTH] Better Auth error:", error);
    res.status(500).json({ success: false, error: "Auth service error" });
  }
});

app.use(express.json());
app.use(sanitizeBody);

// 4. TES ROUTES PERSONNALISÉES (EN PREMIER)
// On monte apiRoutes sur /api.
// Il va intercepter /api/auth/forgot_password avant Better Auth.
app.use("/api", apiRoutes);

app.get("/", (req, res) => {
  res.json({ message: "Server is running" });
});

// 5. GESTION DES ERREURS
app.use(notFoundHandler);
app.use(errorHandler);

// Export for programmatic use
export default app;

// Only start server when running locally (not imported as module)
if (process.env.NODE_ENV !== "production" && !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
}
