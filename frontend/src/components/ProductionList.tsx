import React, { useState, useEffect } from "react";
import { 
  ChefHat, 
  Clock, 
  Package, 
  CheckCircle2, 
  AlertCircle,
  Filter,
  Calendar,
  Search,
  Printer,
  Download,
  Eye,
  MapPin,
  Phone,
  RefreshCw,
  LayoutGrid,
  List
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const getLocalDateYYYYMMDD = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

interface ProductionItem {
  id: string;
  orderId: string;
  orderNumber: string;
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  customerName: string;
  customerPhone: string;
  deliveryDate: string;
  deliveryTimeSlot: string;
  deliveryType: "pickup" | "delivery";
  pickupLocation: string;
  orderStatus: string;
  notes: string;
  allergies?: string; // Ajout des allergies
  // Simple statut: fait ou pas fait
  done: boolean;
}

interface GroupedProduct {
  productId: number;
  productName: string;
  totalQuantity: number;
  items: ProductionItem[];
  allergies: string[]; // Liste des allergies uniques pour ce produit
}

const ProductionList: React.FC = () => {
  const [productionItems, setProductionItems] = useState<ProductionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDate, setSelectedDate] = useState<string>(
    getLocalDateYYYYMMDD()
  );
  const [viewMode, setViewMode] = useState<"list" | "orders">("list"); // Deux vues

  // Fetch production data from API
  useEffect(() => {
    fetchProductionData();
  }, [selectedDate]);

  const fetchProductionData = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${API_URL}/api/orders/production?date=${selectedDate}`,
        {
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        }
      );

      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      const apiItems = result.data?.items || [];


      const items: ProductionItem[] = apiItems.map((item: any) => ({
        ...item,
        // Extraire les allergies si présentes dans les notes ou un champ dédié
        allergies: item.allergies || item.notes?.match(/allergie?[^.]*/i)?.[0] || null,
        done: !!item.done,
      }));

      setProductionItems(items);
    } catch (err: any) {
      console.error("❌ Erreur chargement production:", err);
      setError(err.message || "Impossible de charger la liste de production");
    } finally {
      setLoading(false);
    }
  };

  const toggleDone = async (itemId: string) => {
    const item = productionItems.find((i) => i.id === itemId);
    if (!item) return;

    const nextDone = !item.done;

    setProductionItems((prev) =>
      prev.map((i) => (i.id === itemId ? { ...i, done: nextDone } : i)),
    );

    try {
      const response = await fetch(`${API_URL}/api/orders/production/status`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productionItemId: item.id,
          date: selectedDate,
          done: nextDone,
          productId: item.productId,
          productName: item.productName,
          quantity: item.quantity,
          location: item.pickupLocation,
        }),
      });

      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }
    } catch (err: any) {
      console.error("❌ Erreur mise à jour statut:", err);
      setProductionItems((prev) =>
        prev.map((i) => (i.id === itemId ? { ...i, done: !nextDone } : i)),
      );
      setError(err.message || "Impossible de mettre à jour le statut");
    }
  };

  // Align order number display with the Commandes page formatting
  const formatOrderNumber = (orderNumber: string) => {
    const trimmed = orderNumber.trim();
    const mfMatch = trimmed.match(/^(MF-\d{8}-)(\d{1,4})$/i);
    if (mfMatch) {
      return mfMatch[2].padStart(4, "0");
    }

    if (!/^\d+$/.test(trimmed)) return orderNumber;
    const numeric = Number(trimmed);
    if (Number.isNaN(numeric) || numeric < 0 || numeric > 1000) return orderNumber;
    return String(numeric).padStart(4, "0");
  };

  // Grouper les produits pour la vue liste
  const groupedProducts: GroupedProduct[] = React.useMemo(() => {
    const groups = new Map<number, GroupedProduct>();
    
    productionItems.forEach(item => {
      if (!groups.has(item.productId)) {
        groups.set(item.productId, {
          productId: item.productId,
          productName: item.productName,
          totalQuantity: 0,
          items: [],
          allergies: []
        });
      }
      
      const group = groups.get(item.productId)!;
      group.totalQuantity += item.quantity;
      group.items.push(item);
      
      // Collecter les allergies uniques
      if (item.allergies) {
        const allergies = item.allergies.split(',').map(a => a.trim());
        allergies.forEach(allergy => {
          if (!group.allergies.includes(allergy)) {
            group.allergies.push(allergy);
          }
        });
      }
    });
    
    return Array.from(groups.values());
  }, [productionItems]);

  // Filtrer les articles
  const filteredItems = productionItems.filter(item => {
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        item.productName.toLowerCase().includes(term) ||
        item.orderNumber.toLowerCase().includes(term) ||
        formatOrderNumber(item.orderNumber).toLowerCase().includes(term) ||
        item.customerName.toLowerCase().includes(term)
      );
    }
    return true;
  });

  const filteredGroups = groupedProducts.filter(group => {
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return group.productName.toLowerCase().includes(term);
    }
    return true;
  });

  const doneItems = filteredItems.filter(item => item.done);
  const notDoneItems = filteredItems.filter(item => !item.done);

  // Inventory adjustments are handled elsewhere (not from the production list).

  // Vue par commandes (comme avant mais avec checkbox)
  const OrdersView = () => (
    <div className="space-y-4">
      {notDoneItems.length > 0 && (
        <div>
          <h3 className="text-lg font-bold text-amber-700 mb-3">Non Fait ({notDoneItems.length})</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {notDoneItems.map(item => (
              <ProductionCard key={item.id} item={item} onToggle={toggleDone} />
            ))}
          </div>
        </div>
      )}

      {doneItems.length > 0 && (
        <div>
          <h3 className="text-lg font-bold text-green-700 mb-3">Fait ({doneItems.length})</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {doneItems.map(item => (
              <ProductionCard key={item.id} item={item} onToggle={toggleDone} />
            ))}
          </div>
        </div>
      )}

      {filteredItems.length === 0 && (
        <div className="bg-stone-50 rounded-2xl p-12 text-center border border-stone-200">
          <ChefHat size={48} className="mx-auto mb-4 text-stone-400" />
          <h3 className="text-xl font-serif text-stone-500 mb-2">
            Aucun article à produire
          </h3>
          <p className="text-stone-400">
            {searchTerm 
              ? "Aucun résultat ne correspond à votre recherche" 
              : "Toutes les commandes sont à jour pour cette date"}
          </p>
        </div>
      )}
    </div>
  );

  const ListView = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-stone-50 border-b border-stone-200">
            <tr>
              <th className="text-left py-3 px-4 text-xs font-bold text-stone-400 uppercase tracking-wider">Produit</th>
              <th className="text-left py-3 px-4 text-xs font-bold text-stone-400 uppercase tracking-wider">Quantité totale</th>
              <th className="text-left py-3 px-4 text-xs font-bold text-stone-400 uppercase tracking-wider">Allergies</th>
              <th className="text-left py-3 px-4 text-xs font-bold text-stone-400 uppercase tracking-wider">Non fait / fait</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {filteredGroups.map(group => {
              const totalCount = group.items.length;
              
              return (
                <tr key={group.productId} className="hover:bg-stone-50/50 transition-colors">
                  <td className="py-3 px-4">
                    <div className="font-medium text-[#2D2A26]">{group.productName}</div>
                    <div className="text-xs text-stone-400 mt-1">
                      {totalCount} commande{totalCount > 1 ? 's' : ''}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-lg font-bold text-[#C5A065]">
                      {group.totalQuantity}
                    </span>
                    <span className="text-xs text-stone-400 ml-1">unités</span>
                  </td>
                  <td className="py-3 px-4">
                    {group.allergies.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {group.allergies.map((allergy, idx) => (
                          <span 
                            key={idx}
                            className="px-2 py-0.5 bg-red-50 text-red-600 rounded-full text-xs border border-red-200"
                          >
                            ⚠️ {allergy}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-xs text-stone-400">-</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    {/* En-tête avec les labels Non remis / Remis */}
                    <div className="flex items-center gap-4 mb-2 text-xs font-medium">
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-amber-500 rounded"></div>
                        <span>Non fait</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-green-500 rounded"></div>
                        <span>Fait</span>
                      </div>
                    </div>
                    
                    {/* Liste des commandes individuelles avec checkbox */}
                    <div className="space-y-2">
                      {group.items.map(item => (
                        <div key={item.id} className="flex items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            checked={item.done}
                            onChange={() => toggleDone(item.id)}
                            className="w-4 h-4 rounded border-stone-300 text-[#C5A065] focus:ring-[#C5A065]"
                          />
                          <span className={item.done ? "line-through text-stone-400" : "text-stone-700 font-medium"}>
                            {formatOrderNumber(item.orderNumber)} - {item.customerName}
                          </span>
                          {item.allergies && (
                            <span className="text-red-500 text-xs" title={item.allergies}>⚠️</span>
                          )}
                          {/* Petit indicateur de statut */}
                          <span className={`text-xs px-1.5 py-0.5 rounded-full ${item.done ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                            {item.done ? 'Remis' : 'Non remis'}
                          </span>
                        </div>
                      ))}
                    </div>
                    
                    {/* Indicateur global du groupe */}
                    <div className="mt-3 text-xs text-stone-500 border-t border-stone-100 pt-2">
                      {group.items.filter(i => i.done).length} sur {totalCount} fait
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {filteredGroups.length === 0 && (
        <div className="bg-stone-50 rounded-2xl p-12 text-center border border-stone-200">
          <Package size={48} className="mx-auto mb-4 text-stone-400" />
          <h3 className="text-xl font-serif text-stone-500 mb-2">
            Aucun produit à fabriquer
          </h3>
          <p className="text-stone-400">
            {searchTerm 
              ? "Aucun résultat ne correspond à votre recherche" 
              : "Toutes les commandes sont à jour pour cette date"}
          </p>
        </div>
      )}
    </div>
  );

  const ProductionCard = ({ item, onToggle }: { item: ProductionItem; onToggle: (id: string) => void }) => (
    <div className="bg-white rounded-xl border border-stone-200 p-4 hover:shadow-md transition-all">
      <div className="flex items-start gap-3">
        {/* Checkbox */}
        <input
          type="checkbox"
          checked={item.done}
          onChange={() => onToggle(item.id)}
          className="mt-1 w-5 h-5 rounded border-stone-300 text-[#C5A065] focus:ring-[#C5A065]"
        />
        
        <div className="flex-1">
          <div className="flex items-start justify-between mb-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">
                  {formatOrderNumber(item.orderNumber)}
                </span>
                {item.done ? (
                  <span className="px-2 py-0.5 rounded-full text-xs font-medium border bg-green-100 text-green-700 border-green-200">
                    <span className="flex items-center gap-1">
                      <CheckCircle2 size={16} />
                      Remis
                    </span>
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-xs font-medium border bg-amber-100 text-amber-700 border-amber-200">
                    <span className="flex items-center gap-1">
                      <Clock size={16} />
                      Non remis
                    </span>
                  </span>
                )}
              </div>
              <h3 className="text-lg font-serif text-[#2D2A26]">{item.productName}</h3>
              <p className="text-sm text-stone-500">× {item.quantity}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-stone-400">Client</p>
              <p className="text-sm font-medium text-[#2D2A26]">{item.customerName}</p>
              {item.customerPhone && (
                <p className="text-xs text-stone-400 flex items-center gap-1 justify-end mt-0.5">
                  <Phone size={10} />
                  {item.customerPhone}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4 mb-3 text-sm flex-wrap">
            <div className="flex items-center gap-1 text-stone-500">
              <Calendar size={14} />
              <span>{new Date(item.deliveryDate).toLocaleDateString('fr-CA')}</span>
            </div>
            <div className="flex items-center gap-1 text-stone-500">
              <Clock size={14} />
              <span>{item.deliveryTimeSlot}</span>
            </div>
            <div className="flex items-center gap-1 text-stone-500">
              <MapPin size={14} />
              <span>{item.deliveryType === "pickup" ? `Cueillette - ${item.pickupLocation}` : "Livraison"}</span>
            </div>
          </div>

          {/* Allergies */}
          {item.allergies && (
            <div className="mb-2 p-2 bg-red-50 rounded-lg text-xs text-red-700 border border-red-200">
              <span className="font-bold">⚠️ Allergie: </span>
              {item.allergies}
            </div>
          )}

          {item.notes && !item.allergies && (
            <div className="mb-2 p-2 bg-stone-50 rounded-lg text-xs text-stone-600 border border-stone-100">
              📝 {item.notes}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <ChefHat size={48} className="mx-auto mb-4 text-[#C5A065] animate-pulse" />
          <p className="text-stone-500">Chargement de la liste de production...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle size={48} className="mx-auto mb-4 text-red-400" />
          <p className="text-stone-600 mb-4">{error}</p>
          <button
            onClick={fetchProductionData}
            className="px-6 py-2 bg-[#C5A065] text-white rounded-lg hover:bg-[#b08a50] transition-colors"
          >
            <RefreshCw size={14} className="inline mr-2" />
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8">
      <header className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h2
              className="text-4xl md:text-5xl mb-2"
              style={{
                fontFamily: '"Great Vibes", cursive',
                color: "#C5A065",
              }}
            >
              Liste de Production
            </h2>
            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-stone-500">
              Gestion des articles à produire
            </p>
          </div>
          <div className="flex gap-2">
            {/* Toggle vue liste/commandes */}
            <div className="flex border border-stone-200 rounded-lg overflow-hidden mr-2">
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 transition-colors ${
                  viewMode === "list" 
                    ? "bg-[#C5A065] text-white" 
                    : "bg-white text-stone-600 hover:bg-stone-50"
                }`}
                title="Vue par produit"
              >
                <LayoutGrid size={20} />
              </button>
              <button
                onClick={() => setViewMode("orders")}
                className={`p-2 transition-colors ${
                  viewMode === "orders" 
                    ? "bg-[#C5A065] text-white" 
                    : "bg-white text-stone-600 hover:bg-stone-50"
                }`}
                title="Vue par commande"
              >
                <List size={20} />
              </button>
            </div>
            <button
              onClick={fetchProductionData}
              className="p-2 border border-stone-200 rounded-lg text-stone-600 hover:bg-stone-50 transition-colors"
              title="Rafraîchir"
            >
              <RefreshCw size={20} />
            </button>
            <button className="p-2 border border-stone-200 rounded-lg text-stone-600 hover:bg-stone-50 transition-colors">
              <Printer size={20} />
            </button>
            <button className="p-2 border border-stone-200 rounded-lg text-stone-600 hover:bg-stone-50 transition-colors">
              <Download size={20} />
            </button>
          </div>
        </div>
      </header>

      <div className="bg-white/70 backdrop-blur-md rounded-2xl p-4 mb-6 border border-white shadow-lg">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">
              Date de production
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-4 py-2 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C5A065]"
            />
          </div>

          <div className="flex-1">
            <label className="block text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">
              Rechercher
            </label>
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={viewMode === "list" ? "Produit..." : "Produit, commande, client..."}
                className="w-full pl-10 pr-4 py-2 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C5A065]"
              />
            </div>
          </div>

          {viewMode === "orders" && (
            <div className="flex-1">
              <label className="block text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">
                Statut
              </label>
              <select
                className="w-full px-4 py-2 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C5A065]"
              >
                <option value="all">Tous</option>
                <option value="notdone">Non remis</option>
                <option value="done">Remis</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Statistiques simplifiées */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-amber-50 rounded-xl p-3 border border-amber-200">
          <p className="text-xs text-amber-600 font-bold">Non Fait</p>
          <p className="text-2xl font-bold text-amber-700">
            {productionItems.filter(i => !i.done).length}
          </p>
        </div>
        <div className="bg-green-50 rounded-xl p-3 border border-green-200">
          <p className="text-xs text-green-600 font-bold">Fait</p>
          <p className="text-2xl font-bold text-green-700">
            {productionItems.filter(i => i.done).length}
          </p>
        </div>
      </div>



      {/* Affichage selon la vue */}
      {viewMode === "list" ? <ListView /> : <OrdersView />}
    </div>
  );
};

export default ProductionList;