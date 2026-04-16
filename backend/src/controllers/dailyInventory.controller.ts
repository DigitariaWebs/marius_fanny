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

  // Recalculate totals server-side based on inventory type
  // - Daily inventory (journalier): total = stdo + client
  // - Four inventory (date contains "__four"): total = stdo + comm_berri + client
  const isFourInventory = date.includes("__four");

  // Normalize a value: keep strings as-is (for SUPPLÉMENT row), convert numbers to non-negative
  const normalize = (value: any): number | string => {
    if (typeof value === "string") return value;
    return Math.max(0, Number(value) || 0);
  };
  const numOnly = (value: any): number => {
    if (typeof value === "string") return 0;
    return Math.max(0, Number(value) || 0);
  };

  const sanitizedEntries = (entries as any[]).map((entry) => ({
    ...entry,
    stock_stdo: normalize(entry.stock_stdo),
    stdo: normalize(entry.stdo),
    berri: normalize(entry.berri),
    comm_berri: normalize(entry.comm_berri),
    client: normalize(entry.client),
    total: isFourInventory
      ? numOnly(entry.stdo) + numOnly(entry.comm_berri) + numOnly(entry.client)
      : numOnly(entry.stdo) + numOnly(entry.client),
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
