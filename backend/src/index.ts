import express from "express";
import cors from "cors";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./config/auth";
import apiRoutes from "./routes";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";
import { sanitizeBody } from "./middleware/validation";

const app = express();
const PORT = process.env.PORT || 3000;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

// 1. Configuration CORS
app.use(
  cors({
    origin: FRONTEND_URL,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    credentials: true,
  })
);

// 2. Parser le JSON
app.use(express.json());

// 3. Middleware de sécurité
app.use(sanitizeBody);

// 4. Route Spéciale Better Auth
app.use("/api/auth", toNodeHandler(auth));

// 5. Tes autres routes API
app.use("/api", apiRoutes);

// Route de base pour tester si le serveur est en vie
app.get("/", (req, res) => {
  res.json({ message: "Server is running", status: "ok" });
});

// 6. Gestion des erreurs (404 et erreurs globales)
app.use(notFoundHandler);
app.use(errorHandler);

// 7. Démarrage du serveur
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`🔐 Auth routes: http://localhost:${PORT}/api/auth/*`);
});