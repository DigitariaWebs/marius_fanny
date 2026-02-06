import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  ClipboardList,
  FilePlus,
  Printer,
  LogOut,
  Menu,
  X,
  UserCircle,
  Package,
  Truck,
  Home,
  ChefHat, 
  MapPin, 
  CheckCircle,
  AlertCircle,
  RefreshCw,
  ShoppingCart,
  Filter
} from "lucide-react";
import { authClient } from "../lib/AuthClient";
import OrderForm from "../components/OrderForm";
import type { Order, Product } from "../types";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

type View = "dashboard" | "new-order" | "orders" | "production";

interface OrderStats {
  today: number;
  pending: number;
  inProduction: number;
  ready: number;
  delivered: number;
  cancelled: number;
}

// Interface pour la liste de production agrégée
interface ProductionItem {
  productName: string;
  totalQuantity: number;
  details: Array<{ orderNumber: string; quantity: number }>;
}

interface DashboardOrder {
  id: string;
  orderNumber: string;
  client: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
  };
  items: Array<{
    product?: {
      id: string;
      name: string;
      price: number;
    };
    quantity: number;
    unitPrice: number;
  }>;
  total: number;
  status: "pending" | "in_production" | "ready" | "delivered" | "cancelled";
  createdAt: string;
  notes?: string;
}

type OrderStatus = "pending" | "in_production" | "ready" | "delivered" | "cancelled";

const COLORS = ['#C5A065', '#2D2A26', '#4A90E2', '#50C878', '#FF6B6B'];

export default function StaffManagement() {
  const navigate = useNavigate();
  const [view, setView] = useState<View>("dashboard");
  const [mobileMenu, setMobileMenu] = useState(false);
  const [lastOrder, setLastOrder] = useState<Order | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [productionList, setProductionList] = useState<ProductionItem[]>([]);
  
  // Stats simplifiées (pas de revenus)
  const [stats, setStats] = useState<OrderStats>({
    today: 0,
    pending: 0,
    inProduction: 0,
    ready: 0,
    delivered: 0,
    cancelled: 0,
  });
  
  const [loading, setLoading] = useState(true);

  /* ---------------- AUTH ---------------- */
  useEffect(() => {
    authClient.getSession().then((session) => {
      if (!session) navigate("/se-connecter");
    });
  }, [navigate]);

  /* ---------------- LOAD DATA ---------------- */
  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  // Recalcul de la liste de production à chaque changement des commandes
  useEffect(() => {
    calculateProductionList(orders);
  }, [orders]);

  const calculateProductionList = (currentOrders: Order[]) => {
    // On ne prend que les commandes qui doivent être produites (Pending ou In Production)
    const activeOrders = currentOrders.filter(o => 
      o.status === "pending" || o.status === "in_production"
    );

    const map = new Map<string, ProductionItem>();

    activeOrders.forEach(order => {
      order.items.forEach(item => {
        const pName = item.product?.name || "Produit Inconnu";
        
        const existing = map.get(pName);
        if (existing) {
          existing.totalQuantity += item.quantity;
          existing.details.push({ orderNumber: order.orderNumber, quantity: item.quantity });
        } else {
          map.set(pName, {
            productName: pName,
            totalQuantity: item.quantity,
            details: [{ orderNumber: order.orderNumber, quantity: item.quantity }]
          });
        }
      });
    });

    // Conversion en tableau et tri par quantité décroissante
    setProductionList(Array.from(map.values()).sort((a, b) => b.totalQuantity - a.totalQuantity));
  };

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Mock data (similaire à avant mais nettoyé)
      const mockOrders: DashboardOrder[] = Array.from({ length: 20 }, (_, i) => ({
        id: `ORD${1000 + i}`,
        orderNumber: `ORD${1000 + i}`,
        client: {
          id: `CLI${100 + (i % 10)}`,
          firstName: ["Jean", "Marie", "Pierre", "Sophie", "Luc"][i % 5],
          lastName: ["Dupont", "Martin", "Bernard", "Petit", "Durand"][i % 5],
          email: `client${i % 10}@example.com`,
          phone: `06${Math.floor(Math.random() * 100000000)}`,
          address: `${Math.floor(Math.random() * 100)} Rue de la République, 1300${i%9} laval`,
        },
        items: [
          {
            product: {
              id: `PROD${(i % 5) + 1}`,
              name: ["Croissant", "Pain au Chocolat", "Baguette Tradition", "Brioche", "Tarte aux Pommes"][i % 5],
              price: 0, // Prix osef pour le staff
            },
            quantity: Math.floor(Math.random() * 10) + 1,
            unitPrice: 0,
          },
        ],
        total: 0,
        status: ["pending", "in_production", "ready", "delivered"][i % 4] as OrderStatus,
        createdAt: new Date(Date.now() - Math.random() * 2 * 24 * 60 * 60 * 1000).toISOString(),
        notes: i % 3 === 0 ? "Bien cuit svp" : undefined,
      }));

      // Conversion
      const convertedOrders: Order[] = mockOrders.map(order => ({
        id: order.id,
        orderNumber: order.orderNumber,
        clientId: 0,
        client: {
          id: 0,
          firstName: order.client.firstName,
          lastName: order.client.lastName,
          email: order.client.email,
          phone: order.client.phone,
          status: "active",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          addresses: [{
            id: 1,
            type: "shipping",
            street: order.client.address,
            city: "Laval",
            province: "",
            postalCode: "",
            isDefault: true,
          }],
          orders: [],
        },
        orderDate: order.createdAt,
        pickupDate: order.createdAt,
        pickupLocation: "Laval",
        deliveryType: "pickup",
        items: order.items.map((item, idx) => ({
          id: idx,
          orderId: 0,
          productId: 0,
          product: item.product ? {
            id: 0,
            name: item.product.name,
            category: 'Viennoiserie',
            price: 0,
            available: true,
            minOrderQuantity: 1,
            maxOrderQuantity: 100,
            createdAt: "",
            updatedAt: "",
          } : undefined,
          quantity: item.quantity,
          unitPrice: 0,
          subtotal: 0,
          productionStatus: "pending",
        })),
        subtotal: 0,
        taxAmount: 0,
        deliveryFee: 0,
        total: 0,
        depositAmount: 0,
        depositPaid: false,
        balancePaid: false,
        paymentStatus: "unpaid",
        status: order.status,
        source: "in_store",
        notes: order.notes,
        createdAt: order.createdAt,
        updatedAt: order.createdAt,
      }));

      setOrders(convertedOrders);

      // Stats simplifiées pour l'opérationnel
      const today = new Date();
      const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      
      setStats({
        today: convertedOrders.filter(o => new Date(o.createdAt) >= todayStart).length,
        pending: convertedOrders.filter(o => o.status === "pending").length,
        inProduction: convertedOrders.filter(o => o.status === "in_production").length,
        ready: convertedOrders.filter(o => o.status === "ready").length,
        delivered: convertedOrders.filter(o => o.status === "delivered").length,
        cancelled: convertedOrders.filter(o => o.status === "cancelled").length,
      });

    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await authClient.signOut();
    navigate("/se-connecter");
  };

  /* ---------------- ACTIONS ---------------- */
  const updateOrderStatus = async (orderId: string, newStatus: Order['status']) => {
    setOrders(prev => prev.map(order =>
      order.id === orderId ? { ...order, status: newStatus } : order
    ));
    // Dans une vraie app, appel API ici
  };

  const handleOrderCreated = (formData: any) => {
    // Création de la commande avec l'adresse
    const newOrder: Order = {
      id: `ORD${Date.now()}`,
      orderNumber: `ORD${Date.now()}`,
      clientId: 0,
      client: {
        id: 0,
        firstName: formData.client?.firstName || "Client",
        lastName: formData.client?.lastName || "Comptoir",
        email: "",
        phone: formData.client?.phone || "",
        status: "active",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        addresses: [{
          id: 1,
          type: "shipping",
          street: formData.client?.address || "Retrait boutique", // On capture l'adresse ici
          city: "",
          province: "",
          postalCode: "",
          isDefault: true
        }],
        orders: []
      },
      orderDate: new Date().toISOString(),
      pickupDate: new Date().toISOString(),
      pickupLocation: "Laval",
      deliveryType: "pickup",
      items: formData.items?.map((item: any, idx: number) => ({
        id: idx,
        orderId: 0,
        productId: 0,
        product: item.product,
        quantity: item.quantity,
        unitPrice: 0,
        subtotal: 0,
        productionStatus: "pending"
      })) || [],
      subtotal: 0, taxAmount: 0, deliveryFee: 0, total: 0,
      depositAmount: 0, depositPaid: false, balancePaid: false, paymentStatus: "unpaid",
      status: "pending", 
      source: "in_store",
      notes: formData.notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setLastOrder(newOrder);
    setOrders(prev => [newOrder, ...prev]);
    setView("production"); // On redirige vers la prod pour voir ce qu'il y a à faire
  };

  const printOrderPDF = (order: Order) => {
    // Logique d'impression (inchangée mais pourrait être allégée des prix si besoin)
    // Pour simplifier ici, je garde la fonction existante mais j'insiste sur l'affichage de l'adresse
    const address = order.client.addresses?.[0]?.street || "Pas d'adresse";
    const win = window.open("", "_blank");
    if(!win) return;
    
    // ... (Génération HTML simplifié pour le staff)
    win.document.write(`
      <html>
        <head><title>Bon de Production ${order.orderNumber}</title></head>
        <body style="font-family:sans-serif; padding:20px;">
          <h1>${order.orderNumber}</h1>
          <p><strong>Client:</strong> ${order.client.firstName} ${order.client.lastName}</p>
          <p><strong>Adresse:</strong> ${address}</p>
          <p><strong>Notes:</strong> ${order.notes || '-'}</p>
          <hr/>
          <ul>
            ${order.items.map(i => `<li><strong>${i.quantity}x</strong> ${i.product?.name}</li>`).join('')}
          </ul>
          <script>setTimeout(()=>{window.print();window.close()},500);</script>
        </body>
      </html>
    `);
    win.document.close();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <RefreshCw className="w-12 h-12 text-[#C5A065] animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* SIDEBAR */}
      <aside
        className={`fixed md:relative inset-y-0 left-0 z-50 w-72
        bg-[#2D2A26] text-white flex flex-col shadow-2xl transition-transform duration-300
        ${mobileMenu ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
      >
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#C5A065] flex items-center justify-center">
              <ChefHat size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-serif text-white">MARIUS & FANNY</h1>
              <p className="text-xs text-gray-400 uppercase">Espace Production</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <SidebarItem
            icon={<LayoutDashboard size={20} />}
            label="Vue d'ensemble"
            active={view === "dashboard"}
            onClick={() => setView("dashboard")}
          />
          <SidebarItem
            icon={<FilePlus size={20} />}
            label="Nouvelle Commande"
            active={view === "new-order"}
            onClick={() => setView("new-order")}
          />
          <div className="my-4 border-t border-gray-700/50" />
          <SidebarItem
            icon={<ChefHat size={20} />}
            label="Liste de Production"
            active={view === "production"}
            onClick={() => setView("production")}
          />
          <SidebarItem
            icon={<ClipboardList size={20} />}
            label="Toutes les Commandes"
            active={view === "orders"}
            onClick={() => setView("orders")}
          />
        </nav>

        <div className="p-4 bg-black/20">
            <button onClick={logout} className="flex items-center gap-3 w-full p-3 rounded-lg text-gray-400 hover:text-white transition-all">
                <LogOut size={20} /> Déconnexion
            </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 overflow-auto bg-gray-100">
        {/* Mobile Header */}
        <div className="md:hidden bg-white p-4 flex justify-between items-center shadow-sm">
            <button onClick={() => setMobileMenu(true)}><Menu/></button>
            <span className="font-serif">Staff Panel</span>
            <div className="w-6"/>
        </div>

        {/* --- VIEW: DASHBOARD --- */}
        {view === "dashboard" && (
          <div className="p-6 max-w-7xl mx-auto">
            <h2 className="text-3xl font-serif text-[#2D2A26] mb-6">Bonjour, l'équipe !</h2>
            
            {/* KPI Operationnels uniquement */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <StatCard title="À Produire" value={stats.pending.toString()} color="orange" icon={<ChefHat/>} />
              <StatCard title="En cours" value={stats.inProduction.toString()} color="blue" icon={<RefreshCw/>} />
              <StatCard title="Prêtes" value={stats.ready.toString()} color="green" icon={<CheckCircle/>} />
              <StatCard title="Livrées (24h)" value={stats.delivered.toString()} color="purple" icon={<Truck/>} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Répartition Status (Pie Chart) - Utile pour voir la charge */}
                <div className="bg-white p-6 rounded-xl shadow-sm">
                    <h3 className="text-lg font-bold mb-4">Charge de travail actuelle</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={[
                                        { name: 'À faire', value: stats.pending },
                                        { name: 'Au four', value: stats.inProduction },
                                        { name: 'Fini', value: stats.ready }
                                    ]}
                                    cx="50%" cy="50%" innerRadius={60} outerRadius={80}
                                    dataKey="value"
                                >
                                    <Cell fill="#F59E0B" /> {/* Orange */}
                                    <Cell fill="#3B82F6" /> {/* Bleu */}
                                    <Cell fill="#10B981" /> {/* Vert */}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Raccourci vers la Prod */}
                <div className="bg-[#2D2A26] text-white p-6 rounded-xl shadow-sm flex flex-col justify-center items-center text-center">
                    <ChefHat size={48} className="text-[#C5A065] mb-4"/>
                    <h3 className="text-2xl font-bold mb-2">Production Prioritaire</h3>
                    <p className="text-gray-400 mb-6">
                        Il y a {productionList.length} types de produits différents à préparer.
                    </p>
                    <button 
                        onClick={() => setView("production")}
                        className="bg-[#C5A065] text-white px-6 py-3 rounded-lg font-bold hover:bg-[#b8935a] transition"
                    >
                        Voir la liste de production
                    </button>
                </div>
            </div>
          </div>
        )}

        {/* --- VIEW: PRODUCTION LIST (NOUVEAU) --- */}
        {view === "production" && (
          <div className="p-6 max-w-5xl mx-auto">
            <header className="mb-8 flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-serif text-[#2D2A26]">Liste de Production</h2>
                    <p className="text-gray-500">Agrégation des commandes "En attente" et "En production"</p>
                </div>
                <button onClick={() => window.print()} className="bg-white border border-gray-300 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-50">
                    <Printer size={18}/> Imprimer la liste
                </button>
            </header>

            <div className="grid gap-4">
                {productionList.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-xl text-gray-500">
                        <CheckCircle size={48} className="mx-auto mb-4 text-green-500"/>
                        <p className="text-lg">Tout est calme ! Aucune production en attente.</p>
                    </div>
                ) : (
                    productionList.map((item, index) => (
                        <div key={index} className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-[#C5A065] flex justify-between items-center">
                            <div>
                                <h3 className="text-xl font-bold text-[#2D2A26]">{item.productName}</h3>
                                <p className="text-sm text-gray-500 mt-1">
                                    Commandes : {item.details.map(d => `#${d.orderNumber} (${d.quantity})`).join(', ')}
                                </p>
                            </div>
                            <div className="text-right">
                                <span className="block text-4xl font-black text-[#2D2A26]">{item.totalQuantity}</span>
                                <span className="text-xs uppercase tracking-wider text-gray-400">Unités à faire</span>
                            </div>
                        </div>
                    ))
                )}
            </div>
          </div>
        )}

        {/* --- VIEW: NEW ORDER --- */}
        {view === "new-order" && (
          <div className="p-6 max-w-4xl mx-auto">
            <h2 className="text-3xl font-serif text-[#2D2A26] mb-6">Prise de Commande</h2>
            {/* Note: OrderForm doit inclure un champ adresse. Comme je ne peux pas modifier OrderForm ici,
                je suppose qu'il retourne l'adresse dans l'objet client lors du submit */}
            <OrderForm onSubmit={handleOrderCreated} onCancel={() => setView("dashboard")} />
          </div>
        )}

        {/* --- VIEW: ALL ORDERS --- */}
        {view === "orders" && (
            <div className="p-6 max-w-7xl mx-auto">
                <header className="mb-8 flex justify-between items-center">
                    <h2 className="text-3xl font-serif text-[#2D2A26]">Journal des Commandes</h2>
                </header>

                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="p-4 font-semibold text-gray-600">N°</th>
                                <th className="p-4 font-semibold text-gray-600">Client & Adresse</th>
                                <th className="p-4 font-semibold text-gray-600">Détail</th>
                                <th className="p-4 font-semibold text-gray-600">Notes</th>
                                <th className="p-4 font-semibold text-gray-600">Statut</th>
                                <th className="p-4 font-semibold text-gray-600">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {orders.map(order => (
                                <tr key={order.id} className="hover:bg-gray-50">
                                    <td className="p-4 font-medium">{order.orderNumber}</td>
                                    <td className="p-4">
                                        <div className="font-bold">{order.client.firstName} {order.client.lastName}</div>
                                        <div className="flex items-start gap-1 text-sm text-gray-500 mt-1">
                                            <MapPin size={14} className="mt-0.5 shrink-0"/>
                                            <span>{order.client.addresses[0]?.street || "Sur place"}</span>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <ul className="text-sm list-disc list-inside">
                                            {order.items.map((item, i) => (
                                                <li key={i}>{item.quantity}x {item.product?.name}</li>
                                            ))}
                                        </ul>
                                    </td>
                                    <td className="p-4 text-sm italic text-gray-500">
                                        {order.notes || "-"}
                                    </td>
                                    <td className="p-4">
                                        <StatusBadge status={order.status}/>
                                    </td>
                                    <td className="p-4 flex gap-2">
                                        <button title="Imprimer" onClick={() => printOrderPDF(order)} className="p-2 hover:bg-gray-200 rounded"><Printer size={16}/></button>
                                        
                                        {order.status === 'pending' && (
                                            <button 
                                                onClick={() => updateOrderStatus(order.id, 'in_production')}
                                                className="p-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                                                title="Lancer en production"
                                            >
                                                <ChefHat size={16}/>
                                            </button>
                                        )}
                                        
                                        {order.status === 'in_production' && (
                                            <button 
                                                onClick={() => updateOrderStatus(order.id, 'ready')}
                                                className="p-2 bg-green-100 text-green-700 rounded hover:bg-green-200"
                                                title="Marquer prêt"
                                            >
                                                <CheckCircle size={16}/>
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        )}
      </main>
    </div>
  );
}

/* --- SUB COMPONENTS --- */

function SidebarItem({ icon, label, active, onClick }: { icon: any, label: string, active: boolean, onClick: () => void }) {
    return (
        <button onClick={onClick} className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${active ? "bg-[#C5A065] text-white" : "text-gray-400 hover:text-white hover:bg-gray-800"}`}>
            {icon}
            <span className="font-medium">{label}</span>
        </button>
    )
}

function StatCard({ title, value, color, icon }: any) {
    const colors: any = { orange: "bg-orange-100 text-orange-600", blue: "bg-blue-100 text-blue-600", green: "bg-green-100 text-green-600", purple: "bg-purple-100 text-purple-600" };
    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
            <div>
                <p className="text-sm text-gray-500 mb-1">{title}</p>
                <p className="text-3xl font-bold text-[#2D2A26]">{value}</p>
            </div>
            <div className={`p-3 rounded-full ${colors[color] || "bg-gray-100"}`}>{icon}</div>
        </div>
    )
}

function StatusBadge({ status }: { status: string }) {
    const styles: any = {
        pending: "bg-yellow-100 text-yellow-800",
        in_production: "bg-blue-100 text-blue-800",
        ready: "bg-green-100 text-green-800",
        delivered: "bg-gray-100 text-gray-600",
        cancelled: "bg-red-100 text-red-600"
    };
    const labels: any = {
        pending: "En attente",
        in_production: "En production",
        ready: "Prêt",
        delivered: "Livré",
        cancelled: "Annulé"
    };
    return (
        <span className={`px-2 py-1 rounded-full text-xs font-bold ${styles[status] || styles.delivered}`}>
            {labels[status] || status}
        </span>
    );
}