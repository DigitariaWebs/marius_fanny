import React, { useEffect, useMemo, useState } from "react";
import { Plus, Search, Trash2, Pencil } from "lucide-react";
import { promoAPI, type PromoCodeDto } from "../lib/PromoAPI";
import type { Product } from "../types";

export default function PromoManagement({ products }: { products: Product[] }) {
  const [promos, setPromos] = useState<PromoCodeDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const [promoPendingDelete, setPromoPendingDelete] = useState<PromoCodeDto | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState<PromoCodeDto | null>(null);

  const [code, setCode] = useState("");
  const [discountPercent, setDiscountPercent] = useState<number>(10);
  const [isActive, setIsActive] = useState(true);
  const [applyToAll, setApplyToAll] = useState(true);
  const [selectedProductIds, setSelectedProductIds] = useState<number[]>([]);
  const [productSearch, setProductSearch] = useState("");
  const [saving, setSaving] = useState(false);

  const productById = useMemo(() => {
    const map = new Map<number, Product>();
    for (const p of products) map.set(p.id, p);
    return map;
  }, [products]);

  const filteredProducts = useMemo(() => {
    const q = productSearch.trim().toLowerCase();
    if (!q) return products;
    return products.filter((p) => {
      const name = (p.name || "").toLowerCase();
      const category = (Array.isArray((p as any).category) ? (p as any).category.join(", ") : String((p as any).category || "")).toLowerCase();
      return name.includes(q) || category.includes(q) || String(p.id).includes(q);
    });
  }, [products, productSearch]);

  const fetchPromos = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await promoAPI.listPromos({
        page: 1,
        limit: 100,
        includeInactive: true,
        includeDeleted: false,
        q: query.trim() || undefined,
      });
      setPromos(res.data.promos);
    } catch (err: any) {
      setError(err?.message || "Erreur lors du chargement des codes promo");
    } finally {
      setLoading(false);
    }
  };

  const getPromoId = (promo: PromoCodeDto | null) =>
    (promo as any)?._id || (promo as any)?.id || "";

  useEffect(() => {
    fetchPromos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setError(null);
    setEditing(null);
    setCode("");
    setDiscountPercent(10);
    setIsActive(true);
    setApplyToAll(true);
    setSelectedProductIds([]);
    setProductSearch("");
    setIsModalOpen(true);
  };

  const openEdit = (promo: PromoCodeDto) => {
    setError(null);
    setEditing(promo);
    setCode(promo.code || "");
    setDiscountPercent(promo.discountPercent ?? 0);
    setIsActive(!!promo.isActive);
    const ids = promo.appliesToProductIds || [];
    setApplyToAll(ids.length === 0);
    setSelectedProductIds(ids);
    setProductSearch("");
    setIsModalOpen(true);
  };

  const toggleProduct = (id: number) => {
    setSelectedProductIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const handleSave = async () => {
    const trimmedCode = code.trim().toUpperCase();
    if (!trimmedCode) return;
    if (discountPercent < 0 || discountPercent > 100) return;

    setError(null);
    setSaving(true);
    try {
      const payload = {
        code: trimmedCode,
        discountPercent,
        isActive,
        appliesToProductIds: applyToAll ? [] : selectedProductIds,
      };
      if (editing) {
        await promoAPI.updatePromo(editing._id, payload);
      } else {
        await promoAPI.createPromo(payload);
      }
      setIsModalOpen(false);
      await fetchPromos();
    } catch (err: any) {
      setError(err?.message || "Erreur lors de l'enregistrement");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (promo: PromoCodeDto) => {
    setPromoPendingDelete(promo);
  };

  const confirmDelete = async () => {
    const promo = promoPendingDelete;
    if (!promo) return;
    const id = getPromoId(promo);
    if (!id) {
      setError("Impossible de supprimer: identifiant du code promo manquant.");
      setPromoPendingDelete(null);
      return;
    }
    try {
      setError(null);
      setDeletingId(id);
      await promoAPI.deletePromo(id);
      await fetchPromos();
    } catch (err: any) {
      setError(err?.message || "Erreur lors de la suppression");
    } finally {
      setDeletingId(null);
      setPromoPendingDelete(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 pt-6 md:pt-8 pb-10 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl md:text-2xl font-serif text-[#2D2A26]">Codes promo</h2>
          <p className="text-sm text-stone-500">
            Créez des codes promo par pourcentage et choisissez les produits concernés.
          </p>
        </div>
        <button
          onClick={openCreate}
          type="button"
          className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-[#337957] text-white font-semibold hover:bg-[#2a6448] transition-colors text-sm"
        >
          <Plus size={18} /> Nouveau
        </button>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher un code…"
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-stone-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#337957]/30"
          />
        </div>
        <button
          onClick={fetchPromos}
          className="px-4 py-2 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 transition-colors"
        >
          Rechercher
        </button>
      </div>

      {error && (
        <div className="p-3 rounded-xl border border-red-200 bg-red-50 text-red-700 text-sm">
          {error}
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-lg border border-stone-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-stone-50 border-b border-stone-100">
              <tr className="text-left text-stone-500">
                <th className="px-3 py-2">Code</th>
                <th className="px-3 py-2">% </th>
                <th className="px-3 py-2">Produits</th>
                <th className="px-3 py-2">Statut</th>
                <th className="px-3 py-2">Utilisations</th>
                <th className="px-3 py-2 w-32"></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td className="px-3 py-5 text-stone-500" colSpan={6}>
                    Chargement…
                  </td>
                </tr>
              ) : promos.length === 0 ? (
                <tr>
                  <td className="px-3 py-5 text-stone-500" colSpan={6}>
                    Aucun code promo.
                  </td>
                </tr>
              ) : (
                promos.map((p) => {
                  const promoId = getPromoId(p);
                  const applies = p.appliesToProductIds || [];
                  const productLabel =
                    applies.length === 0
                      ? "Tous les produits"
                      : `${applies.length} produit(s)`;
                  return (
                    <tr key={promoId || p.code} className="border-b last:border-b-0">
                      <td className="px-3 py-2 font-semibold text-stone-800">
                        {p.code}
                      </td>
                      <td className="px-3 py-2 text-stone-700">
                        {p.discountPercent}%
                      </td>
                      <td className="px-3 py-2 text-stone-600">
                        {productLabel}
                      </td>
                      <td className="px-3 py-2">
                        <span
                          className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${
                            p.isActive
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-stone-100 text-stone-600 border border-stone-200"
                          }`}
                        >
                          {p.isActive ? "Actif" : "Inactif"}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-stone-600">
                        {p.timesUsed}
                        {p.usageLimit !== undefined ? ` / ${p.usageLimit}` : ""}
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEdit(p)}
                            type="button"
                            className="p-2 rounded-lg border border-stone-200 hover:bg-stone-50 transition-colors"
                            title="Modifier"
                            disabled={!promoId}
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(p)}
                            type="button"
                            className="p-2 rounded-lg border border-stone-200 hover:bg-red-50 hover:border-red-200 hover:text-red-700 transition-colors"
                            title="Supprimer"
                            disabled={!promoId || deletingId === promoId}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[2000] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-stone-800">
                {editing ? `Modifier ${editing.code}` : "Nouveau code promo"}
              </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  type="button"
                  className="px-3 py-1.5 rounded-lg hover:bg-stone-100 transition-colors"
                >
                  Fermer
                </button>
            </div>

            <div className="p-6 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">
                    Code
                  </label>
                  <input
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="EX: BIENVENUE10"
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-[#337957]/30"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">
                    Pourcentage
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={discountPercent}
                    onChange={(e) => setDiscountPercent(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-[#337957]/30"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <input
                  id="promo-active"
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                />
                <label htmlFor="promo-active" className="text-sm text-stone-700">
                  Actif
                </label>
              </div>

              <div className="flex items-center gap-3">
                <input
                  id="promo-all"
                  type="checkbox"
                  checked={applyToAll}
                  onChange={(e) => setApplyToAll(e.target.checked)}
                />
                <label htmlFor="promo-all" className="text-sm text-stone-700">
                  Appliquer à tous les produits
                </label>
              </div>

              {!applyToAll && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">
                      Produits concernés
                    </label>
                    <input
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                      placeholder="Rechercher un produit…"
                      className="w-full px-3 py-2 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-[#337957]/30"
                    />
                  </div>
                  <div className="max-h-64 overflow-y-auto rounded-xl border border-stone-200">
                    {filteredProducts.map((p) => (
                      <label
                        key={p.id}
                        className="flex items-center gap-3 px-3 py-2 border-b last:border-b-0 hover:bg-stone-50 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={selectedProductIds.includes(p.id)}
                          onChange={() => toggleProduct(p.id)}
                        />
                        <div className="min-w-0">
                          <div className="text-sm text-stone-800 truncate">
                            {p.name}
                          </div>
                          <div className="text-xs text-stone-500">
                            #{p.id} • {Array.isArray(p.category) ? p.category.join(", ") : String(p.category || "")}
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                  <div className="text-xs text-stone-500">
                    Sélectionnés: {selectedProductIds.length}
                  </div>
                </div>
              )}

              {!applyToAll && selectedProductIds.length > 0 && (
                <div className="text-xs text-stone-500">
                  Exemple: {selectedProductIds
                    .slice(0, 3)
                    .map((id) => productById.get(id)?.name || `#${id}`)
                    .join(", ")}
                  {selectedProductIds.length > 3 ? "…" : ""}
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-stone-100 flex items-center justify-end gap-3">
                <button
                  onClick={() => setIsModalOpen(false)}
                  type="button"
                  className="px-4 py-2 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 transition-colors"
                  disabled={saving}
                >
                  Annuler
                </button>
                <button
                  onClick={handleSave}
                  type="button"
                  className="px-4 py-2 rounded-xl bg-[#337957] text-white font-semibold hover:bg-[#2a6448] transition-colors disabled:opacity-50"
                  disabled={saving || !code.trim()}
                >
                  {saving ? "Enregistrement…" : "Enregistrer"}
                </button>
              </div>
          </div>
        </div>
      )}

      {promoPendingDelete && (
        <div className="fixed inset-0 z-[2000] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-stone-100">
              <h3 className="text-lg font-semibold text-stone-800">
                Supprimer un code promo
              </h3>
              <p className="text-sm text-stone-500 mt-1">
                Supprimer <span className="font-semibold">{promoPendingDelete.code}</span> ?
              </p>
            </div>
            <div className="px-6 py-4 flex items-center justify-end gap-3">
              <button
                type="button"
                className="px-4 py-2 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 transition-colors"
                onClick={() => setPromoPendingDelete(null)}
                disabled={!!deletingId}
              >
                Annuler
              </button>
              <button
                type="button"
                className="px-4 py-2 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700 transition-colors disabled:opacity-50"
                onClick={confirmDelete}
                disabled={!!deletingId}
              >
                {deletingId ? "Suppression…" : "Supprimer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
