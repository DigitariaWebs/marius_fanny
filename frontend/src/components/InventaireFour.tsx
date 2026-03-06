import { useState, useEffect, useCallback } from "react";
import {
  CalendarDays,
  Save,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Loader2,
  ClipboardList,
  Info,
  Plus,
  Trash2
} from "lucide-react";
import { dailyInventoryAPI } from "../lib/DailyInventoryAPI";

// ─── LISTE DES PRODUITS DE LA FEUILLE FOUR ──────────────────────────────────
const PRODUITS_FOUR_DEFAUT = [
  "Éclair chantilly", "Éclair chocolat", "Éclair pistache", "Millefeuille",
  "Tartelette fraise", "Tartelette fruits", "Crème brulée", "Tarte fraise",
  "Tarte fruits", "Tropézienne", "Trop. fraise", "Mini pâtisserie",
  "Carotte ind.", "Cake carotte", "st honoré 12 pers", "paris-brest 6p",
  "paris-brest 12p", "st honore 6 p", "GALETTE DES ROIS", "Pithivier 6 pers",
  "Pithivier 10 pers", "Pithivier chocolat", "Couronne briochée"
];

function todayISO(): string {
  return new Date().toISOString().split("T")[0];
}

export default function InventaireFour() {
  const gold = "#C5A065";
  const [date, setDate] = useState(todayISO());
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  // Gestion de la liste locale pour le Four
  const [products, setProducts] = useState<string[]>(() => {
    const saved = localStorage.getItem("produits_inventaire_four");
    return saved ? JSON.parse(saved) : PRODUITS_FOUR_DEFAUT;
  });
  const [newProd, setNewProd] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      // On utilise un préfixe "four_" pour différencier les données en base de données
      const res = await dailyInventoryAPI.getByDate(`${date}__four`);
      const map = new Map(res.data.entries.map((e: any) => [e.productId, e]));

      const built = products.map(name => {
        const s = map.get(name);
        return {
          id: name,
          name: name,
          stdo: s?.stdo ?? 0,
          comm: s?.berri ?? 0, // Utilise les colonnes existantes de ton API
          client: s?.client ?? 0
        };
      });
      setRows(built);
    } catch {
      setToast({ type: "error", msg: "Erreur de chargement" });
    } finally { setLoading(false); }
  }, [date, products]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const entries = rows.map(r => ({
        productId: r.id,
        productName: r.name,
        stdo: r.stdo,
        berri: r.comm,
        comm_berri: 0,
        client: r.client,
        total: r.stdo + r.comm + r.client
      }));
      await dailyInventoryAPI.save({ date: `${date}__four`, entries });
      setToast({ type: "success", msg: "Production four enregistrée !" });
    } catch {
      setToast({ type: "error", msg: "Erreur sauvegarde" });
    } finally { setSaving(false); }
  };

  return (
    <div className="p-4 md:p-8">
      <header className="mb-6">
        <h2 className="text-4xl md:text-5xl mb-1" style={{ fontFamily: '"Great Vibes", cursive', color: gold }}>
          Inventaire Four & Pâtisserie
        </h2>
        <p className="text-[9px] font-black uppercase tracking-[0.3em] text-stone-500">Registre de production quotidienne</p>
      </header>

      {/* Barre de contrôle */}
      <div className="flex flex-wrap items-center gap-4 mb-6 bg-white p-4 rounded-2xl shadow-sm border border-stone-100">
        <div className="flex items-center gap-2">
          <CalendarDays size={20} style={{ color: gold }} />
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="font-bold text-stone-800 outline-none" />
        </div>
        
        <div className="flex items-center gap-2 ml-auto">
          <input 
            type="text" 
            placeholder="Ajouter pâtisserie..." 
            value={newProd}
            onChange={(e) => setNewProd(e.target.value)}
            className="border rounded-xl px-3 py-2 text-sm outline-none focus:border-[#C5A065]"
          />
          <button 
            onClick={() => {
              if(!newProd) return;
              const up = [...products, newProd];
              setProducts(up);
              localStorage.setItem("produits_inventaire_four", JSON.stringify(up));
              setNewProd("");
            }}
            className="p-2 rounded-xl text-white" style={{ background: gold }}
          ><Plus size={20}/></button>
        </div>

        <button onClick={handleSave} disabled={saving} className="px-6 py-2 rounded-xl text-white font-bold flex items-center gap-2" style={{ background: gold }}>
          {saving ? <Loader2 className="animate-spin" size={18}/> : <Save size={18}/>}
          Sauvegarder
        </button>
      </div>

      {/* Tableau simplifié pour le Four */}
      <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-stone-100">
        <table className="w-full text-left">
          <thead className="bg-stone-50 border-b">
            <tr className="text-[10px] uppercase tracking-widest text-stone-400">
              <th className="px-6 py-4">Pâtisserie</th>
              <th className="text-center">ST-DO</th>
              <th className="text-center">Comm. ST</th>
              <th className="text-center">Boites Lunch</th>
              <th className="text-center">Total</th>
              <th className="w-10"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-50">
            {rows.map((row, idx) => (
              <tr key={row.id} className="hover:bg-amber-50/20 transition-colors">
                <td className="px-6 py-3 font-medium text-stone-800">{row.name}</td>
                <td className="px-2 py-2 text-center">
                  <input 
                    type="number" 
                    value={row.stdo || ""} 
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 0;
                      setRows(rows.map(r => r.id === row.id ? {...r, stdo: val} : r));
                    }}
                    className="w-16 text-center bg-stone-50 rounded-lg py-1 border focus:border-[#C5A065] outline-none"
                  />
                </td>
                <td className="px-2 py-2 text-center">
                  <input 
                    type="number" 
                    value={row.comm || ""} 
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 0;
                      setRows(rows.map(r => r.id === row.id ? {...r, comm: val} : r));
                    }}
                    className="w-16 text-center bg-stone-50 rounded-lg py-1 border focus:border-[#C5A065] outline-none"
                  />
                </td>
                <td className="px-2 py-2 text-center">
                  <input 
                    type="number" 
                    value={row.client || ""} 
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 0;
                      setRows(rows.map(r => r.id === row.id ? {...r, client: val} : r));
                    }}
                    className="w-16 text-center bg-stone-50 rounded-lg py-1 border focus:border-[#C5A065] outline-none"
                  />
                </td>
                <td className="text-center font-bold text-stone-800">
                  {row.stdo + row.comm + row.client}
                </td>
                <td className="pr-4">
                  <button onClick={() => {
                    const up = products.filter(p => p !== row.id);
                    setProducts(up);
                    localStorage.setItem("produits_inventaire_four", JSON.stringify(up));
                  }} className="text-stone-300 hover:text-red-500"><Trash2 size={16}/></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}