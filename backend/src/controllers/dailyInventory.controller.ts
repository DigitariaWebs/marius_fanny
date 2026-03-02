import { Request, Response } from "express";
import type { ApiResponse } from "../types/api.js";
import { DailyInventory } from "../models/DailyInventory.js";
import type { SaveDailyInventoryInput } from "../schemas/dailyInventory.schema.js";

/**
 * GET /daily-inventory?date=YYYY-MM-DD
 * Returns the daily inventory record for the given date, or empty entries if none exists.
 */
export const getDailyInventory = async (
  req: Request,
  res: Response<ApiResponse>,
) => {
  const { date } = req.query as { date: string };

  const record = await DailyInventory.findOne({ date }).lean();

  res.json({
    success: true,
    data: {
      date,
      entries: record?.entries ?? [],
      savedBy: record?.savedBy ?? null,
      updatedAt: record?.updatedAt ?? null,
    },
  });
};

/**
 * POST /daily-inventory
 * Upserts (create or replace) the daily inventory for a given date.
 * The total for each entry is recalculated server-side to prevent tampering.
 */
export const saveDailyInventory = async (
  req: Request<unknown, ApiResponse, SaveDailyInventoryInput>,
  res: Response<ApiResponse>,
) => {
  const { date, entries } = req.body;

  // Recalculate totals server-side
  const sanitizedEntries = entries.map((entry) => ({
    ...entry,
    stdo: Math.max(0, entry.stdo),
    berri: Math.max(0, entry.berri),
    comm_berri: Math.max(0, entry.comm_berri),
    client: Math.max(0, entry.client),
    total: Math.max(0, entry.stdo) + Math.max(0, entry.berri) + Math.max(0, entry.comm_berri) + Math.max(0, entry.client),
  }));

  // @ts-ignore – user injected by requireAuth middleware
  const savedBy: string | undefined = req.user?.email ?? req.user?.id ?? undefined;

  const record = await DailyInventory.findOneAndUpdate(
    { date },
    { date, entries: sanitizedEntries, savedBy },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );

  res.json({
    success: true,
    message: `Inventaire du ${date} sauvegardé avec succès.`,
    data: {
      date: record.date,
      entries: record.entries,
      savedBy: record.savedBy,
      updatedAt: record.updatedAt,
    },
  });
};
