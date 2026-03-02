import { useState, useEffect, useCallback } from "react";
import {
  CalendarDays,
  Save,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Loader2,
  ClipboardList,
  ChevronDown,
  ChevronUp,
  Info,
} from "lucide-react";
import { productAPI } from "../lib/ProductAPI";
import {
  dailyInventoryAPI,
  type DailyInventoryEntry,
} from "../lib/DailyInventoryAPI";
import type { Product } from "../types";

// ─── helpers ────────────────────────────────────────────────────────────────

function todayISO(): string {
  return new Date().toISOString().split("T")[0];
}

function calcTotal(e: RowState): number {
  return (e.stdo ?? 0) + (e.berri ?? 0) + (e.comm_berri ?? 0) + (e.client ?? 0);
}

// ─── types ──────────────────────────────────────────────────────────────────

interface RowState {
  productId: string;
  productName: string;
  stdo: number;
  berri: number;
  comm_berri: number;
  client: number;
}

type Col = "stdo" | "berri" | "comm_berri" | "client";

const COLUMNS: { key: Col; label: string; sublabel: string }[] = [
  { key: "stdo",      label: "Comm. St-do",  sublabel: "St-Dominique" },
  { key: "berri",     label: "BERRI",         sublabel: "Marché Berri"  },
  { key: "comm_berri",label: "Comm Berri",    sublabel: "Comm. Berri"   },
  { key: "client",    label: "Comm CLIENT",   sublabel: "Clients direct" },
];

// ─── component ──────────────────────────────────────────────────────────────

export default function InventaireJournalier() {
  const gold = "#C5A065";

  // ── state ──
  const [date, setDate] = useState<string>(todayISO());
  const [rows, setRows] = useState<RowState[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [savedBy, setSavedBy] = useState<string | null>(null);
  const [sortAsc, setSortAsc] = useState<boolean>(true);

  // ── auto-dismiss toast ──
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  // ── load products once ──
  useEffect(() => {
    productAPI
      .getAllProducts(1, 1000)
      .then((res) => setProducts(res.data.products))
      .catch(() => setToast({ type: "error", msg: "Impossible de charger les produits." }));
  }, []);

  // ── build / reload rows whenever date or products change ──
  const loadInventory = useCallback(async () => {
    if (!products.length) return;
    setLoading(true);
    try {
      const res = await dailyInventoryAPI.getByDate(date);
      const existingMap = new Map<string, DailyInventoryEntry>(
        res.data.entries.map((e) => [e.productId, e]),
      );

      const built: RowState[] = products.map((p) => {
        const saved = existingMap.get(String(p.id));
        return {
          productId: String(p.id),
          productName: p.name,
          stdo:       saved?.stdo       ?? 0,
          berri:      saved?.berri      ?? 0,
          comm_berri: saved?.comm_berri ?? 0,
          client:     saved?.client     ?? 0,
        };
      });

      setRows(sortAsc ? built : [...built].reverse());
      setLastSaved(res.data.updatedAt);
      setSavedBy(res.data.savedBy);
    } catch {
      setToast({ type: "error", msg: "Erreur lors du chargement de l'inventaire." });
    } finally {
      setLoading(false);
    }
  }, [date, products, sortAsc]);

  useEffect(() => {
    loadInventory();
  }, [loadInventory]);

  // ── cell change handler ──
  const handleCellChange = (productId: string, col: Col, raw: string) => {
    const val = raw === "" ? 0 : Math.max(0, parseInt(raw, 10) || 0);
    setRows((prev) =>
      prev.map((r) => (r.productId === productId ? { ...r, [col]: val } : r)),
    );
  };

  // ── save ──
  const handleSave = async () => {
    setSaving(true);
    try {
      const entries: DailyInventoryEntry[] = rows.map((r) => ({
        productId:   r.productId,
        productName: r.productName,
        stdo:        r.stdo,
        berri:       r.berri,
        comm_berri:  r.comm_berri,
        client:      r.client,
        total:       calcTotal(r),
      }));

      const res = await dailyInventoryAPI.save({ date, entries });
      setLastSaved(res.data.updatedAt);
      setSavedBy(res.data.savedBy);
      setToast({ type: "success", msg: res.message ?? "Inventaire sauvegardé." });
    } catch (err: any) {
      setToast({ type: "error", msg: err?.message ?? "Erreur lors de la sauvegarde." });
    } finally {
      setSaving(false);
    }
  };

  // ── column totals (for the footer summary bar) ──
  const colTotals = COLUMNS.reduce<Record<Col, number>>(
    (acc, c) => {
      acc[c.key] = rows.reduce((s, r) => s + (r[c.key] ?? 0), 0);
      return acc;
    },
    { stdo: 0, berri: 0, comm_berri: 0, client: 0 },
  );
  const grandTotal = COLUMNS.reduce((s, c) => s + colTotals[c.key], 0);

  // ── date format for display ──
  const displayDate = new Date(date + "T00:00:00").toLocaleDateString("fr-CA", {
    weekday: "long",
    year:    "numeric",
    month:   "long",
    day:     "numeric",
  });

  // ─── render ───────────────────────────────────────────────────────────────
  return (
    <div className="min-h-full p-4 md:p-8">
      {/* ── Header ── */}
      <header className="mb-6">
        <h2
          className="text-4xl md:text-5xl mb-1"
          style={{ fontFamily: '"Great Vibes", cursive', color: gold }}
        >
          Inventaire Journalier
        </h2>
        <p className="text-[9px] font-black uppercase tracking-[0.3em] text-stone-500">
          Gestion quotidienne des stocks
        </p>
      </header>

      {/* ── Control bar ── */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        {/* Date picker */}
        <div className="flex items-center gap-3 bg-white/80 backdrop-blur-md border border-stone-200 rounded-2xl px-4 py-3 shadow-sm hover:shadow-md transition-shadow">
          <CalendarDays size={20} style={{ color: gold }} />
          <div>
            <label className="text-[9px] font-black uppercase tracking-widest text-stone-400 block">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="text-sm font-semibold text-stone-800 bg-transparent outline-none cursor-pointer"
            />
          </div>
        </div>

        {/* Refresh button */}
        <button
          onClick={loadInventory}
          disabled={loading}
          title="Recharger"
          className="flex items-center gap-2 px-4 py-3 bg-white/80 backdrop-blur-md border border-stone-200 rounded-2xl text-stone-600 hover:text-[#C5A065] hover:border-[#C5A065] shadow-sm hover:shadow-md transition-all disabled:opacity-50"
        >
          <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
          <span className="text-sm font-medium hidden sm:inline">Recharger</span>
        </button>

        {/* Save button */}
        <button
          onClick={handleSave}
          disabled={saving || loading || !rows.length}
          className="ml-auto flex items-center gap-2 px-6 py-3 rounded-2xl text-white font-semibold shadow-lg shadow-[#C5A065]/25 hover:shadow-xl hover:shadow-[#C5A065]/40 transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
          style={{ background: `linear-gradient(135deg, ${gold}, #b8935a)` }}
        >
          {saving ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <Save size={18} />
          )}
          <span>{saving ? "Sauvegarde…" : "Sauvegarder l'inventaire"}</span>
        </button>
      </div>

      {/* ── Date display + last-save info ── */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <p className="text-sm font-semibold text-stone-600 capitalize">{displayDate}</p>
        {lastSaved && (
          <div className="flex items-center gap-1.5 text-xs text-stone-400">
            <Info size={13} />
            <span>
              Dernière sauvegarde : {new Date(lastSaved).toLocaleString("fr-CA")}
              {savedBy ? ` — par ${savedBy}` : ""}
            </span>
          </div>
        )}
      </div>

      {/* ── Toast notification ── */}
      {toast && (
        <div
          className={`flex items-center gap-3 px-5 py-3 mb-5 rounded-2xl text-sm font-medium shadow-lg animate-fade-in
            ${toast.type === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : "bg-red-50 text-red-800 border border-red-200"}`}
        >
          {toast.type === "success" ? (
            <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
          ) : (
            <XCircle size={18} className="text-red-500 shrink-0" />
          )}
          {toast.msg}
        </div>
      )}

      {/* ── Summary cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
        {COLUMNS.map((col) => (
          <SummaryCard
            key={col.key}
            label={col.label}
            sub={col.sublabel}
            value={colTotals[col.key]}
            gold={gold}
          />
        ))}
        <SummaryCard
          label="TOTAL GÉNÉRAL"
          sub="tous canaux"
          value={grandTotal}
          gold={gold}
          highlight
        />
      </div>

      {/* ── Table ── */}
      <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-xl border border-white overflow-hidden">
        {/* Table header-bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100">
          <div className="flex items-center gap-2">
            <ClipboardList size={18} style={{ color: gold }} />
            <span className="font-bold text-stone-800 text-sm">
              {rows.length} produit{rows.length !== 1 ? "s" : ""}
            </span>
          </div>
          <button
            onClick={() => setSortAsc((v) => !v)}
            className="flex items-center gap-1 text-xs text-stone-400 hover:text-[#C5A065] transition-colors"
          >
            {sortAsc ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            {sortAsc ? "A → Z" : "Z → A"}
          </button>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center py-20 gap-3 text-stone-400">
              <Loader2 size={22} className="animate-spin" style={{ color: gold }} />
              <span className="text-sm">Chargement de l'inventaire…</span>
            </div>
          ) : rows.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3 text-stone-400">
              <ClipboardList size={40} className="opacity-30" />
              <p className="text-sm">Aucun produit disponible.</p>
            </div>
          ) : (
            <table className="w-full min-w-[700px] text-sm">
              <thead>
                <tr className="bg-stone-50 border-b border-stone-100">
                  <th className="text-left px-5 py-3 text-[10px] font-black uppercase tracking-widest text-stone-400 w-56">
                    Produit
                  </th>
                  {COLUMNS.map((col) => (
                    <th
                      key={col.key}
                      className="px-3 py-3 text-center text-[10px] font-black uppercase tracking-widest text-stone-400"
                    >
                      <div>{col.label}</div>
                      <div className="text-[8px] font-normal text-stone-300 mt-0.5 normal-case tracking-normal">
                        {col.sublabel}
                      </div>
                    </th>
                  ))}
                  <th className="px-3 py-3 text-center text-[10px] font-black uppercase tracking-widest text-stone-400 min-w-[80px]">
                    Total
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-stone-50">
                {rows.map((row, idx) => {
                  const total = calcTotal(row);
                  return (
                    <tr
                      key={row.productId}
                      className={`group transition-colors hover:bg-amber-50/30 ${
                        idx % 2 === 0 ? "bg-white" : "bg-stone-50/40"
                      }`}
                    >
                      {/* Product name */}
                      <td className="px-5 py-2.5 font-medium text-stone-800 max-w-[220px]">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0"
                            style={{ background: gold }}
                          >
                            {idx + 1}
                          </span>
                          <span className="truncate">{row.productName}</span>
                        </div>
                      </td>

                      {/* Editable columns */}
                      {COLUMNS.map((col) => (
                        <td key={col.key} className="px-2 py-2">
                          <input
                            type="number"
                            min={0}
                            value={row[col.key] === 0 ? "" : row[col.key]}
                            placeholder="0"
                            onChange={(e) =>
                              handleCellChange(row.productId, col.key, e.target.value)
                            }
                            onFocus={(e) => e.target.select()}
                            className="w-full text-center px-2 py-1.5 rounded-xl border border-stone-200 bg-white text-stone-800 font-semibold
                              focus:outline-none focus:border-[#C5A065] focus:ring-2 focus:ring-[#C5A065]/20
                              hover:border-stone-300 transition-colors text-sm
                              [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          />
                        </td>
                      ))}

                      {/* Total (read-only) */}
                      <td className="px-3 py-2 text-center">
                        <span
                          className={`inline-block min-w-[52px] px-3 py-1.5 rounded-xl font-bold text-sm
                            ${total > 0
                              ? "text-white shadow-sm"
                              : "text-stone-300 bg-stone-100"
                            }`}
                          style={total > 0 ? { background: gold } : undefined}
                        >
                          {total}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>

              {/* Footer totals row */}
              <tfoot>
                <tr className="border-t-2 border-stone-200 bg-stone-50">
                  <td className="px-5 py-3 text-[10px] font-black uppercase tracking-widest text-stone-500">
                    Totaux
                  </td>
                  {COLUMNS.map((col) => (
                    <td key={col.key} className="px-2 py-3 text-center">
                      <span className="font-bold text-stone-700">{colTotals[col.key]}</span>
                    </td>
                  ))}
                  <td className="px-3 py-3 text-center">
                    <span
                      className="inline-block min-w-[52px] px-3 py-1.5 rounded-xl font-black text-sm text-white shadow"
                      style={{ background: gold }}
                    >
                      {grandTotal}
                    </span>
                  </td>
                </tr>
              </tfoot>
            </table>
          )}
        </div>
      </div>

      {/* ── Bottom save button (convenience) ── */}
      {rows.length > 6 && (
        <div className="flex justify-end mt-6">
          <button
            onClick={handleSave}
            disabled={saving || loading}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed"
            style={{ background: `linear-gradient(135deg, ${gold}, #b8935a)` }}
          >
            {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            <span>{saving ? "Sauvegarde…" : "Sauvegarder l'inventaire"}</span>
          </button>
        </div>
      )}
    </div>
  );
}

// ─── SummaryCard sub-component ───────────────────────────────────────────────

interface SummaryCardProps {
  label: string;
  sub: string;
  value: number;
  gold: string;
  highlight?: boolean;
}

function SummaryCard({ label, sub, value, gold, highlight = false }: SummaryCardProps) {
  return (
    <div
      className={`rounded-2xl p-4 border shadow-sm transition-all hover:shadow-md
        ${highlight
          ? "text-white border-transparent shadow-lg"
          : "bg-white/70 backdrop-blur-md border-white text-stone-800"
        }`}
      style={highlight ? { background: `linear-gradient(135deg, ${gold}, #b8935a)` } : undefined}
    >
      <p
        className={`text-[9px] font-black uppercase tracking-widest mb-1 ${
          highlight ? "text-white/70" : "text-stone-400"
        }`}
      >
        {label}
      </p>
      <p className={`text-2xl font-bold ${highlight ? "text-white" : "text-stone-800"}`}>
        {value}
      </p>
      <p className={`text-[10px] mt-1 ${highlight ? "text-white/60" : "text-stone-400"}`}>
        {sub}
      </p>
    </div>
  );
}
