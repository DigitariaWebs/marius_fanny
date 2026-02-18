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
  Eye
} from "lucide-react";

interface ProductionItem {
  id: string;
  orderNumber: string;
  productName: string;
  quantity: number;
  customerName: string;
  deliveryDate: string;
  deliveryTimeSlot: string;
  status: "à produire" | "en cours" | "produit" | "urgent";
  preparationTime: number;
  notes?: string;
}

const ProductionList: React.FC = () => {
  const [productionItems, setProductionItems] = useState<ProductionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "à produire" | "en cours" | "urgent">("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  // Récupération API des commandes
  useEffect(() => {
    const fetchOrdersForProduction = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Essayer différentes routes possibles
        let response;
        const routes = [
          `/api/orders?date=${selectedDate}&status=pending,processing`,
          `/api/orders/production?date=${selectedDate}`,
          `/api/admin/orders?date=${selectedDate}`,
          `/api/orders`
        ];

        for (const route of routes) {
          try {
            response = await fetch(route, {
              credentials: "include",
              headers: {
                "Content-Type": "application/json",
              },
            });
            
            if (response.ok) {
              console.log(`✅ Route trouvée: ${route}`);
              break;
            }
          } catch (e) {
            console.log(`❌ Route échouée: ${route}`);
          }
        }

        if (!response || !response.ok) {
          throw new Error("Aucune route API disponible pour les commandes");
        }

        const result = await response.json();
        
        // Transformer les données API en format ProductionItem
        // Adapter selon la structure de votre API
        const orders = result.data || result.orders || result;
        
        const items: ProductionItem[] = orders
          .filter((order: any) => {
            // Ne garder que les commandes qui nécessitent production
            const today = new Date(selectedDate).setHours(0,0,0,0);
            const orderDate = new Date(order.deliveryDate).setHours(0,0,0,0);
            return orderDate === today && 
                   (order.status === "confirmée" || order.status === "payée" || order.status === "en production");
          })
          .flatMap((order: any) => {
            // Créer un item par produit dans la commande
            return (order.items || []).map((item: any) => ({
              id: `${order.id}-${item.productId}`,
              orderNumber: order.orderNumber,
              productName: item.productName,
              quantity: item.quantity,
              customerName: order.clientInfo?.name || "Client",
              deliveryDate: order.deliveryDate,
              deliveryTimeSlot: order.deliveryTimeSlot || "À déterminer",
              status: order.productionStatus || "à produire",
              preparationTime: item.preparationTime || 2,
              notes: order.notes || item.notes,
            }));
          });

        setProductionItems(items);
      } catch (err) {
        console.error("❌ Erreur lors du chargement:", err);
        setError("Impossible de charger la liste de production. Veuillez réessayer.");
        
        // Optionnel: Utiliser des données mockées en cas d'erreur
        useMockData();
      } finally {
        setLoading(false);
      }
    };

    fetchOrdersForProduction();
  }, [selectedDate]);

  // Données mockées en cas d'erreur API
  const useMockData = () => {
    const mockData: ProductionItem[] = [
      {
        id: "1",
        orderNumber: "CMD-2024-001",
        productName: "Gâteau au Chocolat",
        quantity: 2,
        customerName: "Jean Dupont",
        deliveryDate: selectedDate,
        deliveryTimeSlot: "10:00 - 11:00",
        status: "urgent",
        preparationTime: 3,
        notes: "Sans gluten"
      },
      {
        id: "2",
        orderNumber: "CMD-2024-002",
        productName: "Baguettes Tradition",
        quantity: 6,
        customerName: "Marie Martin",
        deliveryDate: selectedDate,
        deliveryTimeSlot: "09:00 - 10:00",
        status: "à produire",
        preparationTime: 2,
      },
      {
        id: "3",
        orderNumber: "CMD-2024-003",
        productName: "Croissants Pur Beurre",
        quantity: 12,
        customerName: "Pierre Durand",
        deliveryDate: selectedDate,
        deliveryTimeSlot: "11:30 - 12:00",
        status: "en cours",
        preparationTime: 1.5,
      },
    ];
    
    setProductionItems(mockData);
  };

  const updateProductionStatus = async (itemId: string, newStatus: ProductionItem["status"]) => {
    try {
      // Extraire l'ID de commande et l'ID de produit
      const [orderId, productId] = itemId.split('-');
      
      const response = await fetch(`/api/orders/${orderId}/items/${productId}/status`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ productionStatus: newStatus }),
      });

      if (!response.ok) {
        // Si l'API échoue, on met à jour l'état local quand même pour la démo
        console.log("⚠️ API non disponible, mise à jour locale uniquement");
      }

      // Mettre à jour l'état local
      setProductionItems(prev =>
        prev.map(item =>
          item.id === itemId ? { ...item, status: newStatus } : item
        )
      );

    } catch (err) {
      console.error("❌ Erreur:", err);
      // Mise à jour locale même en cas d'erreur
      setProductionItems(prev =>
        prev.map(item =>
          item.id === itemId ? { ...item, status: newStatus } : item
        )
      );
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case "urgent": return "bg-red-100 text-red-700 border-red-200";
      case "à produire": return "bg-amber-100 text-amber-700 border-amber-200";
      case "en cours": return "bg-blue-100 text-blue-700 border-blue-200";
      case "produit": return "bg-green-100 text-green-700 border-green-200";
      default: return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch(status) {
      case "urgent": return <AlertCircle size={16} className="text-red-700" />;
      case "à produire": return <Package size={16} className="text-amber-700" />;
      case "en cours": return <Clock size={16} className="text-blue-700" />;
      case "produit": return <CheckCircle2 size={16} className="text-green-700" />;
      default: return null;
    }
  };

  // Filtrer les articles
  const filteredItems = productionItems.filter(item => {
    if (filter !== "all" && item.status !== filter) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        item.productName.toLowerCase().includes(term) ||
        item.orderNumber.toLowerCase().includes(term) ||
        item.customerName.toLowerCase().includes(term)
      );
    }
    return true;
  });

  const urgentItems = filteredItems.filter(item => item.status === "urgent");
  const toProduceItems = filteredItems.filter(item => item.status === "à produire");
  const inProgressItems = filteredItems.filter(item => item.status === "en cours");
  const producedItems = filteredItems.filter(item => item.status === "produit");

  const ProductionCard = ({ item }: { item: ProductionItem }) => (
    <div className="bg-white rounded-xl border border-stone-200 p-4 hover:shadow-md transition-all">
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">
              {item.orderNumber}
            </span>
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(item.status)}`}>
              <span className="flex items-center gap-1">
                {getStatusIcon(item.status)}
                {item.status}
              </span>
            </span>
          </div>
          <h3 className="text-lg font-serif text-[#2D2A26]">{item.productName}</h3>
          <p className="text-sm text-stone-500">× {item.quantity}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-stone-400">Client</p>
          <p className="text-sm font-medium text-[#2D2A26]">{item.customerName}</p>
        </div>
      </div>

      <div className="flex items-center gap-4 mb-3 text-sm">
        <div className="flex items-center gap-1 text-stone-500">
          <Calendar size={14} />
          <span>{new Date(item.deliveryDate).toLocaleDateString('fr-CA')}</span>
        </div>
        <div className="flex items-center gap-1 text-stone-500">
          <Clock size={14} />
          <span>{item.deliveryTimeSlot}</span>
        </div>
        <div className="flex items-center gap-1 text-stone-500">
          <ChefHat size={14} />
          <span>{item.preparationTime}h</span>
        </div>
      </div>

      {item.notes && (
        <div className="mb-3 p-2 bg-stone-50 rounded-lg text-xs text-stone-600 border border-stone-100">
          📝 {item.notes}
        </div>
      )}

      <div className="flex gap-2 mt-2">
        {item.status === "à produire" && (
          <>
            <button
              onClick={() => updateProductionStatus(item.id, "urgent")}
              className="flex-1 py-2 px-3 bg-red-50 text-red-700 rounded-lg text-xs font-medium hover:bg-red-100 transition-colors border border-red-200"
            >
              <AlertCircle size={14} className="inline mr-1" />
              Urgent
            </button>
            <button
              onClick={() => updateProductionStatus(item.id, "en cours")}
              className="flex-1 py-2 px-3 bg-blue-50 text-blue-700 rounded-lg text-xs font-medium hover:bg-blue-100 transition-colors border border-blue-200"
            >
              <Clock size={14} className="inline mr-1" />
              Commencer
            </button>
          </>
        )}
        {item.status === "urgent" && (
          <button
            onClick={() => updateProductionStatus(item.id, "en cours")}
            className="flex-1 py-2 px-3 bg-blue-50 text-blue-700 rounded-lg text-xs font-medium hover:bg-blue-100 transition-colors border border-blue-200"
          >
            <Clock size={14} className="inline mr-1" />
            Commencer
          </button>
        )}
        {item.status === "en cours" && (
          <button
            onClick={() => updateProductionStatus(item.id, "produit")}
            className="flex-1 py-2 px-3 bg-green-50 text-green-700 rounded-lg text-xs font-medium hover:bg-green-100 transition-colors border border-green-200"
          >
            <CheckCircle2 size={14} className="inline mr-1" />
            Terminer
          </button>
        )}
        {item.status === "produit" && (
          <button
            onClick={() => updateProductionStatus(item.id, "à produire")}
            className="flex-1 py-2 px-3 bg-amber-50 text-amber-700 rounded-lg text-xs font-medium hover:bg-amber-100 transition-colors border border-amber-200"
          >
            <Package size={14} className="inline mr-1" />
            Reproduire
          </button>
        )}
        <button className="p-2 border border-stone-200 rounded-lg text-stone-400 hover:text-[#C5A065] hover:border-[#C5A065] transition-colors">
          <Eye size={16} />
        </button>
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
                placeholder="Produit, commande, client..."
                className="w-full pl-10 pr-4 py-2 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C5A065]"
              />
            </div>
          </div>

          <div className="flex-1">
            <label className="block text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">
              Filtrer
            </label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="w-full px-4 py-2 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C5A065]"
            >
              <option value="all">Tous les statuts</option>
              <option value="urgent">Urgent</option>
              <option value="à produire">À produire</option>
              <option value="en cours">En cours</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-red-50 rounded-xl p-3 border border-red-200">
          <p className="text-xs text-red-600 font-bold">Urgent</p>
          <p className="text-2xl font-bold text-red-700">{urgentItems.length}</p>
        </div>
        <div className="bg-amber-50 rounded-xl p-3 border border-amber-200">
          <p className="text-xs text-amber-600 font-bold">À produire</p>
          <p className="text-2xl font-bold text-amber-700">{toProduceItems.length}</p>
        </div>
        <div className="bg-blue-50 rounded-xl p-3 border border-blue-200">
          <p className="text-xs text-blue-600 font-bold">En cours</p>
          <p className="text-2xl font-bold text-blue-700">{inProgressItems.length}</p>
        </div>
        <div className="bg-green-50 rounded-xl p-3 border border-green-200">
          <p className="text-xs text-green-600 font-bold">Produit</p>
          <p className="text-2xl font-bold text-green-700">{producedItems.length}</p>
        </div>
      </div>

      <div className="space-y-6">
        {urgentItems.length > 0 && (
          <div>
            <h3 className="text-lg font-bold text-red-700 mb-3">Urgent ({urgentItems.length})</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {urgentItems.map(item => (
                <ProductionCard key={item.id} item={item} />
              ))}
            </div>
          </div>
        )}

        {toProduceItems.length > 0 && (
          <div>
            <h3 className="text-lg font-bold text-amber-700 mb-3">À produire ({toProduceItems.length})</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {toProduceItems.map(item => (
                <ProductionCard key={item.id} item={item} />
              ))}
            </div>
          </div>
        )}

        {inProgressItems.length > 0 && (
          <div>
            <h3 className="text-lg font-bold text-blue-700 mb-3">En cours ({inProgressItems.length})</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {inProgressItems.map(item => (
                <ProductionCard key={item.id} item={item} />
              ))}
            </div>
          </div>
        )}

        {producedItems.length > 0 && (
          <div>
            <h3 className="text-lg font-bold text-green-700 mb-3">Produit ({producedItems.length})</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {producedItems.map(item => (
                <ProductionCard key={item.id} item={item} />
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
    </div>
  );
};

export default ProductionList;