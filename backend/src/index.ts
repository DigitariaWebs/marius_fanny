import "dotenv/config";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import { toNodeHandler } from "better-auth/node";
import { getAuth } from "./config/auth";
import apiRoutes from "./routes";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";
import { sanitizeBody } from "./middleware/validation";
import { validateSquareConfig } from "./config/square";

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
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/marius_fanny";

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
  .then(() => {
    console.log("✅ MONGOOSE CONNECTÉ");
    validateSquareConfig();
  })
  .catch((err) => {
    console.error("❌ ERREUR CONNEXION MONGOOSE:", err);
    console.log("⚠️  Server will continue without database connection");
    console.log("⚠️  Better Auth will not be available");
  });

// 2. MIDDLEWARES

// Global request logger - logs ALL incoming requests
app.use((req, res, next) => {
  const start = Date.now();
  console.log(`\n➡️  [REQUEST] ${req.method} ${req.originalUrl} from ${req.headers.origin || req.ip}`);
  
  // Log response when finished
  res.on('finish', () => {
    const duration = Date.now() - start;
    const statusIcon = res.statusCode < 400 ? '✅' : '❌';
    console.log(`${statusIcon} [RESPONSE] ${req.method} ${req.originalUrl} → ${res.statusCode} (${duration}ms)`);
  });
  
  next();
});

app.use(
  cors({
    origin: FRONTEND_URL,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    credentials: true,
  }),
);

// 3. BETTER AUTH (REGISTER BEFORE JSON BODY PARSING)
app.all("/api/auth/{*any}", async (req, res) => {
  try {
    const auth = await getAuth();
    return toNodeHandler(auth)(req, res);
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

app.listen(PORT, () => {
  // Server startup message removed
});
