import { Router } from "express";
import { toNodeHandler } from "better-auth/node";
import { auth } from "../config/auth"; // On importe l'instance créée à l'étape 4

const router = Router();

// Cette route unique gère TOUT (login, register, verify-email, etc.)
router.all("/auth/*", toNodeHandler(auth));

export default router;
