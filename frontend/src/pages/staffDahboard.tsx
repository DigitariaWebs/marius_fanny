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
  Users,
  DollarSign,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Clock,
  CheckCircle,
  AlertCircle,
  Calendar,
  Filter,
  Download,
  RefreshCw,
  ShoppingCart,
  CreditCard,
  Truck,
  Home,
} from "lucide-react";
import { authClient } from "../lib/AuthClient";
import OrderForm from "../components/OrderForm";
import type { Order, Product, Client } from "../types";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

type View = "dashboard" | "new-order" | "orders" | "clients";

interface OrderStats {
  today: number;
  thisWeek: number;
  pending: number;
  inProduction: number;
  ready: number;
  delivered: number;
  cancelled: number;
  totalRevenue: number;
  averageOrderValue: number;
}

interface TimeSeriesData {
  date: string;
  orders: number;
  revenue: number;
}

interface ProductSales {
  product: string;
  sales: number;
  revenue: number;
}

interface ClientActivity {
  client: string;
  orders: number;
  totalSpent: number;
}

const COLORS = ['#C5A065', '#2D2A26', '#4A90E2', '#50C878', '#FF6B6B'];

export default function StaffManagement() {
  const navigate = useNavigate();
  const [view, setView] = useState<View>("dashboard");
  const [mobileMenu, setMobileMenu] = useState(false);
  const [lastOrder, setLastOrder] = useState<Order | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<OrderStats>({
    today: 0,
    thisWeek: 0,
    pending: 0,
    inProduction: 0,
    ready: 0,
    delivered: 0,
    cancelled: 0,
    totalRevenue: 0,
    averageOrderValue: 0,
  });
  const [timeSeriesData, setTimeSeriesData] = useState<TimeSeriesData[]>([]);
  const [topProducts, setTopProducts] = useState<ProductSales[]>([]);
  const [activeClients, setActiveClients] = useState<ClientActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState<"today" | "week" | "month">("week");

  /* ---------------- AUTH ---------------- */
  useEffect(() => {
    authClient.getSession().then((session) => {
      if (!session) navigate("/se-connecter");
    });
  }, [navigate]);

  /* ---------------- LOAD DATA ---------------- */
  useEffect(() => {
    fetchDashboardData();
    // Simuler un rafraîchissement toutes les 30 secondes
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, [dateFilter]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Simuler des données pour la démo
      const mockOrders: Order[] = Array.from({ length: 50 }, (_, i) => ({
        id: `ORD${1000 + i}`,
        orderNumber: `ORD${1000 + i}`,
        client: {
          id: `CLI${100 + (i % 10)}`,
          firstName: ["Jean", "Marie", "Pierre", "Sophie", "Luc"][i % 5],
          lastName: ["Dupont", "Martin", "Bernard", "Petit", "Durand"][i % 5],
          email: `client${i % 10}@example.com`,
          phone: `06${Math.floor(Math.random() * 100000000)}`,
          address: `${Math.floor(Math.random() * 100)} Rue de la Boulangerie, Paris`,
        },
        items: [
          {
            product: {
              id: `PROD${(i % 12) + 1}`,
              name: ["Croissant", "Pain au Chocolat", "Baguette", "Éclair", "Tarte Citron"][i % 5],
              price: [2.2, 2.4, 3.5, 4.5, 29.95][i % 5],
            },
            quantity: Math.floor(Math.random() * 5) + 1,
            unitPrice: [2.2, 2.4, 3.5, 4.5, 29.95][i % 5],
          },
        ],
        total: Math.random() * 100 + 20,
        status: ["pending", "in_production", "ready", "delivered", "cancelled"][i % 5] as any,
        createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
        notes: i % 3 === 0 ? "Livraison avant 10h" : undefined,
      }));

      setOrders(mockOrders);

      // Calculer les statistiques
      const today = new Date();
      const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      
      const statsData: OrderStats = {
        today: mockOrders.filter(o => new Date(o.createdAt) >= todayStart).length,
        thisWeek: mockOrders.filter(o => {
          const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
          return new Date(o.createdAt) >= weekAgo;
        }).length,
        pending: mockOrders.filter(o => o.status === "pending").length,
        inProduction: mockOrders.filter(o => o.status === "in_production").length,
        ready: mockOrders.filter(o => o.status === "ready").length,
        delivered: mockOrders.filter(o => o.status === "delivered").length,
        cancelled: mockOrders.filter(o => o.status === "cancelled").length,
        totalRevenue: mockOrders.reduce((sum, o) => sum + o.total, 0),
        averageOrderValue: mockOrders.length > 0 
          ? mockOrders.reduce((sum, o) => sum + o.total, 0) / mockOrders.length 
          : 0,
      };

      setStats(statsData);

      // Données série temporelle
      const timeData: TimeSeriesData[] = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        const dateStr = date.toLocaleDateString('fr-FR', { weekday: 'short' });
        
        const dayOrders = mockOrders.filter(o => {
          const orderDate = new Date(o.createdAt);
          return orderDate.getDate() === date.getDate() &&
                 orderDate.getMonth() === date.getMonth() &&
                 orderDate.getFullYear() === date.getFullYear();
        });

        return {
          date: dateStr,
          orders: dayOrders.length,
          revenue: dayOrders.reduce((sum, o) => sum + o.total, 0),
        };
      });

      setTimeSeriesData(timeData);

      // Top produits
      const productMap = new Map<string, { sales: number; revenue: number }>();
      mockOrders.forEach(order => {
        order.items.forEach(item => {
          const productName = item.product?.name || "Inconnu";
          const existing = productMap.get(productName) || { sales: 0, revenue: 0 };
          productMap.set(productName, {
            sales: existing.sales + item.quantity,
            revenue: existing.revenue + (item.quantity * item.unitPrice),
          });
        });
      });

      const topProductsData = Array.from(productMap.entries())
        .map(([product, data]) => ({ product, ...data }))
        .sort((a, b) => b.sales - a.sales)
        .slice(0, 5);

      setTopProducts(topProductsData);

      // Clients actifs
      const clientMap = new Map<string, { orders: number; totalSpent: number }>();
      mockOrders.forEach(order => {
        const clientName = `${order.client.firstName} ${order.client.lastName}`;
        const existing = clientMap.get(clientName) || { orders: 0, totalSpent: 0 };
        clientMap.set(clientName, {
          orders: existing.orders + 1,
          totalSpent: existing.totalSpent + order.total,
        });
      });

      const activeClientsData = Array.from(clientMap.entries())
        .map(([client, data]) => ({ client, ...data }))
        .sort((a, b) => b.orders - a.orders)
        .slice(0, 5);

      setActiveClients(activeClientsData);

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

  /* ---------------- PDF ---------------- */
  const printOrderPDF = (order: Order) => {
    const win = window.open("", "_blank");
    if (!win) return;

    const itemsHTML = order.items.map(item => `
      <tr>
        <td>${item.product?.name || "Produit inconnu"}</td>
        <td>${item.quantity}</td>
        <td>${item.unitPrice.toFixed(2)} €</td>
        <td>${(item.quantity * item.unitPrice).toFixed(2)} €</td>
      </tr>
    `).join("");

    win.document.write(`
      <html>
        <head>
          <title>Commande ${order.orderNumber}</title>
          <style>
            body { font-family: 'Arial', sans-serif; padding: 40px; color: #2D2A26; }
            .header { text-align: center; margin-bottom: 40px; border-bottom: 2px solid #C5A065; padding-bottom: 20px; }
            h1 { color: #2D2A26; margin: 0; font-size: 28px; }
            .subtitle { color: #666; font-size: 14px; margin-top: 5px; }
            .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin: 30px 0; }
            .info-card { background: #f9f9f9; padding: 15px; border-radius: 8px; border-left: 4px solid #C5A065; }
            .info-card h3 { margin: 0 0 10px 0; font-size: 16px; color: #2D2A26; }
            .info-card p { margin: 5px 0; color: #555; }
            table { width: 100%; border-collapse: collapse; margin: 30px 0; }
            th { background: #2D2A26; color: white; padding: 12px; text-align: left; font-weight: 600; }
            td { padding: 12px; border-bottom: 1px solid #eee; }
            tr:hover { background: #f5f5f5; }
            .total { text-align: right; font-size: 20px; font-weight: bold; color: #2D2A26; margin-top: 30px; }
            .footer { margin-top: 50px; text-align: center; color: #888; font-size: 12px; border-top: 1px solid #eee; padding-top: 20px; }
            .status { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; }
            .status-pending { background: #FFF3CD; color: #856404; }
            .status-ready { background: #D4EDDA; color: #155724; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>MARIUS & FANNY</h1>
            <p class="subtitle">Boulangerie-Pâtisserie Artisanale</p>
            <p class="subtitle">${new Date(order.createdAt).toLocaleDateString('fr-FR', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}</p>
          </div>

          <div class="info-grid">
            <div class="info-card">
              <h3>Informations Commande</h3>
              <p><strong>Numéro :</strong> ${order.orderNumber}</p>
              <p><strong>Date :</strong> ${new Date(order.createdAt).toLocaleDateString('fr-FR')}</p>
              <p><strong>Heure :</strong> ${new Date(order.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</p>
              <p><strong>Statut :</strong> 
                <span class="status status-${order.status}">
                  ${order.status === 'pending' ? 'En attente' : 
                    order.status === 'in_production' ? 'En production' :
                    order.status === 'ready' ? 'Prête' :
                    order.status === 'delivered' ? 'Livrée' : 'Annulée'}
                </span>
              </p>
            </div>

            <div class="info-card">
              <h3>Informations Client</h3>
              <p><strong>Nom :</strong> ${order.client.firstName} ${order.client.lastName}</p>
              <p><strong>Email :</strong> ${order.client.email}</p>
              <p><strong>Téléphone :</strong> ${order.client.phone}</p>
              <p><strong>Adresse :</strong> ${order.client.address}</p>
            </div>
          </div>

          <h2>Détails de la commande</h2>
          <table>
            <thead>
              <tr>
                <th>Produit</th>
                <th>Quantité</th>
                <th>Prix unitaire</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHTML}
            </tbody>
          </table>

          <div class="total">
            <p>Total HT: ${(order.total / 1.1).toFixed(2)} €</p>
            <p>TVA (10%): ${(order.total * 0.1 / 1.1).toFixed(2)} €</p>
            <p style="font-size: 24px; margin-top: 10px;">Total TTC: ${order.total.toFixed(2)} €</p>
          </div>

          ${order.notes ? `
            <div class="info-card" style="margin-top: 30px;">
              <h3>Notes spéciales</h3>
              <p>${order.notes}</p>
            </div>
          ` : ''}

          <div class="footer">
            <p>Merci pour votre commande !</p>
            <p>MARIUS & FANNY • 123 Rue de la Boulangerie, 75000 Paris • 01 23 45 67 89</p>
            <p>Document généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}</p>
          </div>

          <script>
            setTimeout(() => {
              window.print();
              window.close();
            }, 1000);
          </script>
        </body>
      </html>
    `);

    win.document.close();
  };

  /* ---------------- ORDER ACTIONS ---------------- */
  const updateOrderStatus = async (orderId: string, newStatus: Order['status']) => {
    try {
      // Ici, vous feriez un appel API réel
      setOrders(prev => prev.map(order =>
        order.id === orderId ? { ...order, status: newStatus } : order
      ));
      fetchDashboardData(); // Rafraîchir les stats
    } catch (error) {
      console.error("Error updating order:", error);
    }
  };

  const cancelOrder = async (orderId: string) => {
    if (window.confirm("Êtes-vous sûr de vouloir annuler cette commande ?")) {
      try {
        // Ici, vous feriez un appel API réel
        setOrders(prev => prev.map(order =>
          order.id === orderId ? { ...order, status: 'cancelled' } : order
        ));
        fetchDashboardData(); // Rafraîchir les stats
      } catch (error) {
        console.error("Error cancelling order:", error);
      }
    }
  };

  const handleOrderCreated = (order: Order) => {
    setLastOrder(order);
    setOrders(prev => [order, ...prev]);
    setView("dashboard");
    fetchDashboardData();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 text-[#C5A065] animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Chargement du tableau de bord...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* OVERLAY */}
      {mobileMenu && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setMobileMenu(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`fixed md:relative inset-y-0 left-0 z-50 w-72
        bg-gradient-to-b from-[#2D2A26] to-[#1a1816] text-white
        transform transition-transform duration-300 ease-in-out
        ${mobileMenu ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        flex flex-col shadow-2xl`}
      >
        <div className="p-6 border-b border-gray-700/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#C5A065] flex items-center justify-center">
                <Home size={20} className="text-white" />
              </div>
              <div>
                <h1 className="text-xl font-serif tracking-wide text-white">
                  MARIUS & FANNY
                </h1>
                <p className="text-xs text-gray-400 mt-0.5 tracking-wider uppercase">
                  Panel Staff
                </p>
              </div>
            </div>
            <button 
              className="md:hidden text-gray-400 hover:text-white transition-colors"
              onClick={() => setMobileMenu(false)}
            >
              <X size={24} />
            </button>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-6 overflow-y-auto">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-3">
              Tableau de bord
            </p>
            <div className="space-y-1">
              <SidebarItem
                icon={<LayoutDashboard size={20} />}
                label="Dashboard"
                active={view === "dashboard"}
                onClick={() => {
                  setView("dashboard");
                  setMobileMenu(false);
                }}
              />
              <SidebarItem
                icon={<FilePlus size={20} />}
                label="Nouvelle commande"
                active={view === "new-order"}
                onClick={() => {
                  setView("new-order");
                  setMobileMenu(false);
                }}
              />
              <SidebarItem
                icon={<ClipboardList size={20} />}
                label="Commandes"
                active={view === "orders"}
                onClick={() => {
                  setView("orders");
                  setMobileMenu(false);
                }}
              />
              <SidebarItem
                icon={<Users size={20} />}
                label="Clients"
                active={view === "clients"}
                onClick={() => {
                  setView("clients");
                  setMobileMenu(false);
                }}
              />
            </div>
          </div>
        </nav>

        <div className="p-4 border-t border-gray-700/50 bg-black/20">
          <div className="mb-3 p-3 rounded-lg bg-gray-800/50 border border-gray-700/50">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#C5A065] flex items-center justify-center">
                <UserCircle size={20} className="text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  Staff Membre
                </p>
                <p className="text-xs text-gray-400 truncate">
                  staff@mariusetfanny.com
                </p>
              </div>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-3 w-full p-3 rounded-lg text-gray-400 hover:bg-red-900/20 hover:text-red-400 transition-all border border-transparent hover:border-red-800/50"
          >
            <LogOut size={20} />
            <span className="font-medium">Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 overflow-auto">
        {/* Mobile Header */}
        <div className="md:hidden bg-white border-b border-gray-100 p-4 flex items-center justify-between sticky top-0 z-30">
          <button
            onClick={() => setMobileMenu(true)}
            className="text-gray-600 hover:text-gray-900"
          >
            <Menu size={24} />
          </button>
          <h1 className="text-lg font-serif text-[#2D2A26]">MARIUS & FANNY Staff</h1>
          <div className="w-6" />
        </div>

        {/* DASHBOARD VIEW */}
        {view === "dashboard" && (
          <div className="p-4 md:p-8">
            <header className="mb-6 md:mb-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl md:text-3xl font-serif text-[#2D2A26]">
                    Tableau de bord Staff
                  </h2>
                  <p className="text-sm md:text-base text-gray-500 mt-1">
                    Statistiques et gestion des commandes en temps réel
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value as any)}
                    className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#C5A065]/50 outline-none"
                  >
                    <option value="today">Aujourd'hui</option>
                    <option value="week">Cette semaine</option>
                    <option value="month">Ce mois</option>
                  </select>
                  <button
                    onClick={fetchDashboardData}
                    className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
                    title="Rafraîchir"
                  >
                    <RefreshCw size={18} />
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 bg-[#C5A065] text-white rounded-lg hover:bg-[#b8935a] transition-colors text-sm">
                    <Download size={16} />
                    Exporter
                  </button>
                </div>
              </div>
            </header>

            {/* STATS CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
              <StatCard
                title="Commandes aujourd'hui"
                value={stats.today}
                change={stats.today > 5 ? 12 : -5}
                icon={<ShoppingCart size={24} />}
                color="blue"
              />
              <StatCard
                title="Chiffre d'affaires"
                value={`${stats.totalRevenue.toFixed(2)} €`}
                change={8.3}
                icon={<DollarSign size={24} />}
                color="green"
              />
              <StatCard
                title="En production"
                value={stats.inProduction}
                icon={<Package size={24} />}
                color="purple"
              />
              <StatCard
                title="À livrer"
                value={stats.ready}
                icon={<Truck size={24} />}
                color="orange"
                alert={stats.ready > 3}
              />
            </div>

            {/* CHARTS SECTION */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8">
              {/* Orders Trend */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-serif text-[#2D2A26]">
                    Évolution des commandes
                  </h3>
                  <BarChart3 className="text-[#C5A065]" size={20} />
                </div>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={timeSeriesData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="date" stroke="#666" />
                      <YAxis stroke="#666" />
                      <Tooltip 
                        formatter={(value) => [`${value}`, "Valeur"]}
                        labelFormatter={(label) => `Jour: ${label}`}
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="orders"
                        stroke="#C5A065"
                        strokeWidth={2}
                        name="Commandes"
                        dot={{ r: 4 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="revenue"
                        stroke="#2D2A26"
                        strokeWidth={2}
                        name="CA (€)"
                        dot={{ r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Order Status Distribution */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-serif text-[#2D2A26]">
                    Répartition des commandes
                  </h3>
                  <PieChartIcon className="text-[#C5A065]" size={20} />
                </div>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'En attente', value: stats.pending },
                          { name: 'En production', value: stats.inProduction },
                          { name: 'Prêtes', value: stats.ready },
                          { name: 'Livrées', value: stats.delivered },
                          { name: 'Annulées', value: stats.cancelled },
                        ]}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {[
                          { name: 'En attente', value: stats.pending },
                          { name: 'En production', value: stats.inProduction },
                          { name: 'Prêtes', value: stats.ready },
                          { name: 'Livrées', value: stats.delivered },
                          { name: 'Annulées', value: stats.cancelled },
                        ].map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value} commandes`, "Quantité"]} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* TABLES SECTION */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
              {/* Top Products */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-6">
                <div className="flex items-center justify-between mb-4 md:mb-6">
                  <h3 className="text-lg md:text-xl font-serif text-[#2D2A26]">
                    Produits populaires
                  </h3>
                  <BarChart3 className="text-[#C5A065]" size={20} />
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Produit</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Ventes</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">CA</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topProducts.map((product, index) => (
                        <tr key={index} className="border-b border-gray-50 last:border-0 hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-[#C5A065]/20 flex items-center justify-center">
                                <span className="text-[#C5A065] font-bold text-sm">{index + 1}</span>
                              </div>
                              <span className="font-medium text-[#2D2A26]">{product.product}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-medium">{product.sales}</div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-bold text-[#2D2A26]">{product.revenue.toFixed(2)} €</div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Active Clients */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-6">
                <div className="flex items-center justify-between mb-4 md:mb-6">
                  <h3 className="text-lg md:text-xl font-serif text-[#2D2A26]">
                    Clients actifs
                  </h3>
                  <Users className="text-[#C5A065]" size={20} />
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Client</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Commandes</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Total dépensé</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activeClients.map((client, index) => (
                        <tr key={index} className="border-b border-gray-50 last:border-0 hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-[#2D2A26] text-white flex items-center justify-center">
                                <span className="text-xs font-bold">
                                  {client.client.split(' ').map(n => n[0]).join('')}
                                </span>
                              </div>
                              <span className="font-medium text-[#2D2A26]">{client.client}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-medium">{client.orders}</div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-bold text-[#2D2A26]">{client.totalSpent.toFixed(2)} €</div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* RECENT ORDERS */}
            <div className="mt-6 md:mt-8">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-6">
                <div className="flex items-center justify-between mb-4 md:mb-6">
                  <h3 className="text-lg md:text-xl font-serif text-[#2D2A26]">
                    Commandes récentes
                  </h3>
                  <ClipboardList className="text-[#C5A065]" size={20} />
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Commande</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Client</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Date</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Total</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Statut</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.slice(0, 5).map((order) => (
                        <tr key={order.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <div className="font-medium text-[#2D2A26]">{order.orderNumber}</div>
                          </td>
                          <td className="py-3 px-4">
                            <div>
                              <div className="font-medium">{order.client.firstName} {order.client.lastName}</div>
                              <div className="text-xs text-gray-500">{order.client.email}</div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="text-sm">
                              {new Date(order.createdAt).toLocaleDateString('fr-FR')}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-bold text-[#2D2A26]">{order.total.toFixed(2)} €</div>
                          </td>
                          <td className="py-3 px-4">
                            <StatusBadge status={order.status} />
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => printOrderPDF(order)}
                                className="p-2 text-gray-600 hover:text-[#C5A065] transition-colors"
                                title="Imprimer PDF"
                              >
                                <Printer size={16} />
                              </button>
                              <button
                                onClick={() => updateOrderStatus(order.id, 'in_production')}
                                className="p-2 text-gray-600 hover:text-green-600 transition-colors"
                                title="Passer en production"
                              >
                                <Package size={16} />
                              </button>
                              <button
                                onClick={() => cancelOrder(order.id)}
                                className="p-2 text-gray-600 hover:text-red-600 transition-colors"
                                title="Annuler"
                              >
                                <X size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="mt-4 text-center">
                  <button
                    onClick={() => setView("orders")}
                    className="text-[#C5A065] hover:text-[#b8935a] font-medium text-sm"
                  >
                    Voir toutes les commandes →
                  </button>
                </div>
              </div>
            </div>

            {/* Last Order Created */}
            {lastOrder && (
              <div className="mt-6 md:mt-8">
                <div className="bg-gradient-to-r from-[#C5A065]/10 to-transparent border border-[#C5A065]/20 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-serif text-[#2D2A26]">
                        Dernière commande créée
                      </h3>
                      <p className="text-gray-500">Commande #{lastOrder.orderNumber}</p>
                    </div>
                    <button
                      onClick={() => printOrderPDF(lastOrder)}
                      className="flex items-center gap-2 bg-[#C5A065] text-white px-4 py-2 rounded-lg hover:bg-[#b8935a] transition-colors"
                    >
                      <Printer size={18} />
                      Imprimer le PDF
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-3 bg-white rounded-lg">
                      <p className="text-sm text-gray-500">Client</p>
                      <p className="font-medium">{lastOrder.client.firstName} {lastOrder.client.lastName}</p>
                    </div>
                    <div className="p-3 bg-white rounded-lg">
                      <p className="text-sm text-gray-500">Total</p>
                      <p className="font-bold text-[#2D2A26]">{lastOrder.total.toFixed(2)} €</p>
                    </div>
                    <div className="p-3 bg-white rounded-lg">
                      <p className="text-sm text-gray-500">Statut</p>
                      <StatusBadge status={lastOrder.status} />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* NEW ORDER VIEW */}
        {view === "new-order" && (
          <div className="p-4 md:p-8">
            <header className="mb-6 md:mb-8">
              <h2 className="text-2xl md:text-3xl font-serif text-[#2D2A26]">
                Nouvelle commande
              </h2>
              <p className="text-sm md:text-base text-gray-500 mt-1">
                Créez une nouvelle commande pour un client
              </p>
            </header>

            <OrderForm
              onOrderCreated={handleOrderCreated}
              onCancel={() => setView("dashboard")}
            />
          </div>
        )}

        {/* ORDERS VIEW */}
        {view === "orders" && (
          <div className="p-4 md:p-8">
            <header className="mb-6 md:mb-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl md:text-3xl font-serif text-[#2D2A26]">
                    Gestion des commandes
                  </h2>
                  <p className="text-sm md:text-base text-gray-500 mt-1">
                    {orders.length} commandes au total
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setView("new-order")}
                    className="flex items-center gap-2 bg-[#C5A065] text-white px-4 py-2 rounded-lg hover:bg-[#b8935a] transition-colors"
                  >
                    <FilePlus size={18} />
                    Nouvelle commande
                  </button>
                </div>
              </div>
            </header>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <th className="text-left py-4 px-6 text-sm font-medium text-gray-500">Commande</th>
                      <th className="text-left py-4 px-6 text-sm font-medium text-gray-500">Client</th>
                      <th className="text-left py-4 px-6 text-sm font-medium text-gray-500">Date</th>
                      <th className="text-left py-4 px-6 text-sm font-medium text-gray-500">Produits</th>
                      <th className="text-left py-4 px-6 text-sm font-medium text-gray-500">Total</th>
                      <th className="text-left py-4 px-6 text-sm font-medium text-gray-500">Statut</th>
                      <th className="text-left py-4 px-6 text-sm font-medium text-gray-500">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50">
                        <td className="py-4 px-6">
                          <div className="font-medium text-[#2D2A26]">{order.orderNumber}</div>
                        </td>
                        <td className="py-4 px-6">
                          <div>
                            <div className="font-medium">{order.client.firstName} {order.client.lastName}</div>
                            <div className="text-xs text-gray-500">{order.client.email}</div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="text-sm">
                            {new Date(order.createdAt).toLocaleDateString('fr-FR')}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="text-sm">
                            {order.items.length} produit(s)
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="font-bold text-[#2D2A26]">{order.total.toFixed(2)} €</div>
                        </td>
                        <td className="py-4 px-6">
                          <StatusBadge status={order.status} />
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => printOrderPDF(order)}
                              className="p-2 text-gray-600 hover:text-[#C5A065] transition-colors"
                              title="Imprimer PDF"
                            >
                              <Printer size={16} />
                            </button>
                            <button
                              onClick={() => updateOrderStatus(order.id, 'in_production')}
                              className="p-2 text-gray-600 hover:text-green-600 transition-colors"
                              title="Passer en production"
                              disabled={order.status === 'cancelled' || order.status === 'delivered'}
                            >
                              <Package size={16} />
                            </button>
                            <button
                              onClick={() => updateOrderStatus(order.id, 'ready')}
                              className="p-2 text-gray-600 hover:text-blue-600 transition-colors"
                              title="Marquer comme prête"
                              disabled={order.status === 'cancelled' || order.status === 'delivered'}
                            >
                              <CheckCircle size={16} />
                            </button>
                            <button
                              onClick={() => updateOrderStatus(order.id, 'delivered')}
                              className="p-2 text-gray-600 hover:text-purple-600 transition-colors"
                              title="Marquer comme livrée"
                              disabled={order.status === 'cancelled'}
                            >
                              <Truck size={16} />
                            </button>
                            <button
                              onClick={() => cancelOrder(order.id)}
                              className="p-2 text-gray-600 hover:text-red-600 transition-colors"
                              title="Annuler"
                              disabled={order.status === 'cancelled' || order.status === 'delivered'}
                            >
                              <X size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* CLIENTS VIEW */}
        {view === "clients" && (
          <div className="p-4 md:p-8">
            <header className="mb-6 md:mb-8">
              <h2 className="text-2xl md:text-3xl font-serif text-[#2D2A26]">
                Gestion des clients
              </h2>
              <p className="text-sm md:text-base text-gray-500 mt-1">
                {activeClients.length} clients actifs
              </p>
            </header>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <th className="text-left py-4 px-6 text-sm font-medium text-gray-500">Client</th>
                      <th className="text-left py-4 px-6 text-sm font-medium text-gray-500">Contact</th>
                      <th className="text-left py-4 px-6 text-sm font-medium text-gray-500">Commandes</th>
                      <th className="text-left py-4 px-6 text-sm font-medium text-gray-500">Total dépensé</th>
                      <th className="text-left py-4 px-6 text-sm font-medium text-gray-500">Dernière commande</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeClients.map((client) => {
                      const lastOrder = orders
                        .filter(o => `${o.client.firstName} ${o.client.lastName}` === client.client)
                        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
                      
                      return (
                        <tr key={client.client} className="border-b border-gray-50 last:border-0 hover:bg-gray-50">
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-[#2D2A26] text-white flex items-center justify-center">
                                <span className="text-sm font-bold">
                                  {client.client.split(' ').map(n => n[0]).join('')}
                                </span>
                              </div>
                              <div>
                                <div className="font-medium text-[#2D2A26]">{client.client}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <div className="text-sm">
                              <div className="text-gray-500">Email/Téléphone</div>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <div className="font-medium">{client.orders}</div>
                          </td>
                          <td className="py-4 px-6">
                            <div className="font-bold text-[#2D2A26]">{client.totalSpent.toFixed(2)} €</div>
                          </td>
                          <td className="py-4 px-6">
                            {lastOrder ? (
                              <div className="text-sm">
                                <div>{new Date(lastOrder.createdAt).toLocaleDateString('fr-FR')}</div>
                                <div className="text-gray-500">#{lastOrder.orderNumber}</div>
                              </div>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

/* ---------------- COMPONENTS ---------------- */

function SidebarItem({ icon, label, active, onClick }: any) {
  return (
    <button
      onClick={onClick}
      className={`
        flex items-center gap-3 w-full p-3 rounded-lg transition-all duration-200
        relative group
        ${
          active
            ? "bg-linear-to-r from-[#C5A065] to-[#b8935a] text-white shadow-lg shadow-[#C5A065]/20"
            : "text-gray-400 hover:bg-gray-800/50 hover:text-white"
        }
      `}
    >
      <span
        className={`${active ? "scale-110" : "group-hover:scale-110"} transition-transform`}
      >
        {icon}
      </span>
      <span className="font-medium text-sm">{label}</span>
      {active && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-r-full" />
      )}
    </button>
  );
}

function StatCard({ title, value, change, icon, color, alert }: any) {
  const colorClasses = {
    blue: "bg-blue-100 text-blue-600",
    green: "bg-green-100 text-green-600",
    purple: "bg-purple-100 text-purple-600",
    orange: "bg-orange-100 text-orange-600",
    red: "bg-red-100 text-red-600",
  };

  return (
    <div
      className={`bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-6 ${alert ? "ring-2 ring-red-200" : ""}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs md:text-sm text-gray-500 mb-1">{title}</p>
          <h3 className="text-2xl md:text-3xl font-bold text-[#2D2A26]">
            {value}
          </h3>
          {change !== undefined && (
            <div className="flex items-center gap-1 mt-2">
              {change >= 0 ? (
                <TrendingUp size={14} className="text-green-600" />
              ) : (
                <TrendingDown size={14} className="text-red-600" />
              )}
              <span
                className={`text-xs md:text-sm font-medium ${change >= 0 ? "text-green-600" : "text-red-600"}`}
              >
                {change >= 0 ? "+" : ""}
                {change}%
              </span>
              <span className="text-xs text-gray-400 hidden sm:inline">
                vs hier
              </span>
            </div>
          )}
        </div>
        <div className={`p-2 md:p-3 rounded-xl ${colorClasses[color]}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'pending':
        return { text: 'En attente', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' };
      case 'in_production':
        return { text: 'En production', color: 'bg-blue-100 text-blue-700 border-blue-200' };
      case 'ready':
        return { text: 'Prête', color: 'bg-green-100 text-green-700 border-green-200' };
      case 'delivered':
        return { text: 'Livrée', color: 'bg-purple-100 text-purple-700 border-purple-200' };
      case 'cancelled':
        return { text: 'Annulée', color: 'bg-red-100 text-red-700 border-red-200' };
      default:
        return { text: 'Inconnu', color: 'bg-gray-100 text-gray-700 border-gray-200' };
    }
  };

  const info = getStatusInfo(status);

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-semibold border ${info.color} whitespace-nowrap`}
    >
      {info.text}
    </span>
  );
}

function PieChartIcon({ className, size }: { className?: string; size?: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size || 20}
      height={size || 20}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M21.21 15.89A10 10 0 1 1 8 2.83" />
      <path d="M22 12A10 10 0 0 0 12 2v10z" />
    </svg>
  );
}