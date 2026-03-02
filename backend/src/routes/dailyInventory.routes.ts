import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { validateBody, validateQuery } from "../middleware/validation.js";
import {
  dailyInventoryQuerySchema,
  saveDailyInventorySchema,
} from "../schemas/dailyInventory.schema.js";
import {
  getDailyInventory,
  saveDailyInventory,
} from "../controllers/dailyInventory.controller.js";

const router = Router();

// GET /daily-inventory?date=YYYY-MM-DD
router.get(
  "/",
  requireAuth,
  validateQuery(dailyInventoryQuerySchema),
  getDailyInventory,
);

// POST /daily-inventory
router.post(
  "/",
  requireAuth,
  validateBody(saveDailyInventorySchema),
  saveDailyInventory,
);

export default router;
