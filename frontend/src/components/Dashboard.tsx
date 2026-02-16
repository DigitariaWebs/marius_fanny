import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Package,
  LayoutDashboard,
  LogOut,
  Settings,
  X,
  Menu,
  DollarSign,
  ShoppingCart,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Users,
  UserCircle,
  ClipboardList,
  Truck,
} from "lucide-react";
import StaffManagement from "./StaffManagement";
import ClientManagement from "./ClientManagement";
import { OrderManagement } from "./OrderManagement";
import { ProductManagement } from "./ProductManagement";
import SettingsManagement from "./SettingsManagement";
import DeliveryAssignment from "./DeliveryAssignment";
import { authClient } from "../lib/AuthClient";
import GoldenBackground from "./GoldenBackground";
import type { Product } from "../types";

interface Statistics {
  totalProducts: number;
  totalRevenue: number;
  lowStock: number;
  totalSales: number;
  revenueChange: number;
  salesChange: number;
}

interface FormData {
  name: string;
  category: string;
  price: string;
  stock: string;
}

type ViewMode =
  | "overview"
  | "staff"
  | "clients"
  | "orders"
  | "products"
  | "delivery"
  | "settings";

const CATEGORIES = [
  "Gâteaux",
  "Pains",
  "Viennoiseries",
  "Chocolats",
  "Boîtes à lunch",
  "À la carte",
];

const MOCK_PRODUCTS: Product[] = [
  {
    id: 1,
    name: "La Marguerite (6 pers.)",
    category: "Gâteaux",
    price: 37.5,
    sales: 245,
    revenue: 9187.5,
    available: true,
    minOrderQuantity: 1,
    maxOrderQuantity: 5,
    preparationTimeHours: 24,
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-01-15T10:00:00Z",
  },
  {
    id: 2,
    name: "Tarte Citron Meringuée",
    category: "Gâteaux",
    price: 29.95,
    sales: 189,
    revenue: 5660.55,
    available: true,
    minOrderQuantity: 1,
    maxOrderQuantity: 3,
    preparationTimeHours: 24,
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-01-15T10:00:00Z",
  },
  {
    id: 3,
    name: "Baguette Tradition",
    category: "Pains",
    price: 3.5,
    sales: 312,
    revenue: 1092,
    available: false,
    minOrderQuantity: 1,
    maxOrderQuantity: 20,
    preparationTimeHours: 2,
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-01-15T10:00:00Z",
  },
  {
    id: 4,
    name: "Pain Campagne Bio",
    category: "Pains",
    price: 4.8,
    sales: 98,
    revenue: 470.4,
    available: true,
    minOrderQuantity: 1,
    maxOrderQuantity: 10,
    preparationTimeHours: 4,
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-01-15T10:00:00Z",
  },
  {
    id: 5,
    name: "Croissant Pur Beurre",
    category: "Viennoiseries",
    price: 2.2,
    sales: 403,
    revenue: 886.6,
    available: true,
    minOrderQuantity: 1,
    maxOrderQuantity: 50,
    preparationTimeHours: 2,
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-01-15T10:00:00Z",
  },
  {
    id: 6,
    name: "Pain au Chocolat",
    category: "Viennoiseries",
    price: 2.4,
    sales: 367,
    revenue: 880.8,
    available: true,
    minOrderQuantity: 1,
    maxOrderQuantity: 30,
    preparationTimeHours: 2,
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-01-15T10:00:00Z",
  },
  {
    id: 7,
    name: "Macarons Assortis (12 pcs)",
    category: "Chocolats",
    price: 24.0,
    sales: 156,
    revenue: 3744,
    available: true,
    minOrderQuantity: 1,
    maxOrderQuantity: 10,
    preparationTimeHours: 24,
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-01-15T10:00:00Z",
  },
  {
    id: 8,
    name: "Chocolats Pralinés (250g)",
    category: "Chocolats",
    price: 18.5,
    sales: 178,
    revenue: 3293,
    available: true,
    minOrderQuantity: 1,
    maxOrderQuantity: 15,
    preparationTimeHours: 24,
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-01-15T10:00:00Z",
  },
  {
    id: 9,
    name: "Plateau Affaires",
    category: "Boîtes à lunch",
    price: 22.0,
    sales: 134,
    revenue: 2948,
    available: true,
    minOrderQuantity: 1,
    maxOrderQuantity: 20,
    preparationTimeHours: 12,
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-01-15T10:00:00Z",
  },
  {
    id: 10,
    name: "Sandwich Jambon-Beurre",
    category: "À la carte",
    price: 6.5,
    sales: 289,
    revenue: 1878.5,
    available: true,
    minOrderQuantity: 1,
    maxOrderQuantity: 25,
    preparationTimeHours: 1,
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-01-15T10:00:00Z",
  },
  {
    id: 11,
    name: "Quiche Lorraine",
    category: "À la carte",
    price: 8.9,
    sales: 156,
    revenue: 1388.4,
    available: true,
    minOrderQuantity: 1,
    maxOrderQuantity: 15,
    preparationTimeHours: 2,
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-01-15T10:00:00Z",
  },
  {
    id: 12,
    name: "Éclair au Chocolat",
    category: "Gâteaux",
    price: 4.5,
    sales: 423,
    revenue: 1903.5,
    available: true,
    minOrderQuantity: 1,
    maxOrderQuantity: 30,
    preparationTimeHours: 4,
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-01-15T10:00:00Z",
  },
];

export default function AdminDashboard() {
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
  const [viewMode, setViewMode] = useState<ViewMode>("overview");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const gold = "#C5A065";
  const dark = "#2D2A26";

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const session = await authClient.getSession();
        if (!session) {
          navigate("/se-connecter");
        }
      } catch (error) {
        console.error("Session check error:", error);
        // Redirect to login on error
        navigate("/se-connecter");
      }
    };
    checkAuth();
  }, [navigate]);

  // Handle logout
  const handleLogout = async () => {
    try {
      await authClient.signOut();
      navigate("/se-connecter");
    } catch (error) {
      console.error("Logout error:", error);
      // Navigate anyway to ensure user sees login page
      navigate("/se-connecter");
    }
  };

  // Calcul des statistiques
  const calculateStats = (): Statistics => {
    const totalProducts = products.length;
    const totalRevenue = products.reduce((sum, p) => sum + (p.revenue || 0), 0);
    const lowStock = products.filter((p) => !p.available).length;
    const totalSales = products.reduce((sum, p) => sum + (p.sales || 0), 0);

    return {
      totalProducts,
      totalRevenue,
      lowStock,
      totalSales,
      revenueChange: 12.5,
      salesChange: 8.3,
    };
  };

  const stats = calculateStats();

  // Produits les plus vendus
  const topProducts = [...products]
    .sort((a, b) => (b.sales || 0) - (a.sales || 0))
    .slice(0, 5);

  return (
    <div className="relative flex h-screen bg-[#F9F7F2] font-sans text-stone-800">
      <div className="fixed inset-0 z-0 opacity-30">
        <GoldenBackground />
      </div>

      {/* --- MOBILE MENU OVERLAY --- */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* --- SIDEBAR --- */}
      <aside
        className={`
        w-72 bg-white/80 backdrop-blur-md text-stone-800 flex flex-col shadow-2xl border-r border-stone-200/50 relative z-20
        transform transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
      `}
      >
        {/* Brand Header */}
        <div className="p-6 border-b border-stone-200/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div>
              <h1
                className="text-2xl mb-1"
                style={{
                  fontFamily: '"Great Vibes", cursive',
                  color: "#C5A065",
                }}
              >
                Marius & Fanny
              </h1>
              <p className="text-[9px] font-black uppercase tracking-[0.3em] text-stone-500">
                Admin Panel
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="md:hidden text-stone-400 hover:text-[#C5A065] transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-6 overflow-y-auto">
          {/* Main Section */}
          <div className="pb-4">
            <p className="text-[9px] font-black text-stone-400 uppercase tracking-[0.3em] mb-3 px-3">
              Principal
            </p>
            <div className="space-y-2">
              <NavItem
                icon={<LayoutDashboard size={20} />}
                label="Vue d'ensemble"
                active={viewMode === "overview"}
                onClick={() => {
                  setViewMode("overview");
                  setIsMobileMenuOpen(false);
                }}
              />
            </div>
          </div>

          {/* Management Section */}
          <div className="pb-4 border-t border-stone-200/50 pt-4">
            <p className="text-[9px] font-black text-stone-400 uppercase tracking-[0.3em] mb-3 px-3">
              Gestion
            </p>
            <div className="space-y-2">
              <NavItem
                icon={<Users size={20} />}
                label="Personnel"
                active={viewMode === "staff"}
                onClick={() => {
                  setViewMode("staff");
                  setIsMobileMenuOpen(false);
                }}
              />
              <NavItem
                icon={<UserCircle size={20} />}
                label="Clients"
                active={viewMode === "clients"}
                onClick={() => {
                  setViewMode("clients");
                  setIsMobileMenuOpen(false);
                }}
              />
              <NavItem
                icon={<ClipboardList size={20} />}
                label="Commandes"
                active={viewMode === "orders"}
                onClick={() => {
                  setViewMode("orders");
                  setIsMobileMenuOpen(false);
                }}
              />
              <NavItem
                icon={<Package size={20} />}
                label="Produits"
                active={viewMode === "products"}
                onClick={() => {
                  setViewMode("products");
                  setIsMobileMenuOpen(false);
                }}
              />
              <NavItem
                icon={<Truck size={20} />}
                label="Livraisons"
                active={viewMode === "delivery"}
                onClick={() => {
                  setViewMode("delivery");
                  setIsMobileMenuOpen(false);
                }}
              />
            </div>
          </div>

          {/* Settings Section */}
          <div className="border-t border-stone-200/50 pt-4">
            <p className="text-[9px] font-black text-stone-400 uppercase tracking-[0.3em] mb-3 px-3">
              Système
            </p>
            <div className="space-y-2">
              <NavItem
                icon={<Settings size={20} />}
                label="Paramètres"
                active={viewMode === "settings"}
                onClick={() => {
                  setViewMode("settings");
                  setIsMobileMenuOpen(false);
                }}
              />
            </div>
          </div>
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-stone-200/50">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full p-3 rounded-xl text-stone-600 hover:bg-red-50 hover:text-red-600 transition-all border border-stone-200 hover:border-red-200"
          >
            <LogOut size={20} />
            <span className="font-medium">Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 overflow-auto relative z-10">
        {/* Mobile Header with Hamburger */}
        <div className="md:hidden bg-white/80 backdrop-blur-md border-b border-stone-200 p-4 flex items-center justify-between sticky top-0 z-30">
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="text-stone-600 hover:text-[#C5A065]"
          >
            <Menu size={24} />
          </button>
          <h1
            className="text-xl"
            style={{ fontFamily: '"Great Vibes", cursive', color: "#C5A065" }}
          >
            Marius & Fanny
          </h1>
          <div className="w-6" /> {/* Spacer for centering */}
        </div>

        {/* VUE D'ENSEMBLE */}
        {viewMode === "overview" && (
          <>
            <header className="p-4 md:p-8">
              <h2
                className="text-4xl md:text-5xl mb-2"
                style={{
                  fontFamily: '"Great Vibes", cursive',
                  color: "#C5A065",
                }}
              >
                Vue d'ensemble
              </h2>
              <p className="text-[9px] font-black uppercase tracking-[0.3em] text-stone-500">
                Tableau de bord administrateur
              </p>
            </header>

            <div className="p-4 md:p-8">
              {/* Stats Grid - Responsive */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
                <StatCard
                  title="Produits"
                  value={stats.totalProducts}
                  icon={<Package size={24} />}
                  color="blue"
                />
                <StatCard
                  title="Chiffre d'affaires"
                  value={`${stats.totalRevenue.toFixed(2)} $`}
                  change={stats.revenueChange}
                  icon={<DollarSign size={24} />}
                  color="green"
                />
                <StatCard
                  title="Ventes totales"
                  value={stats.totalSales}
                  change={stats.salesChange}
                  icon={<ShoppingCart size={24} />}
                  color="purple"
                />
                <StatCard
                  title="Alertes stock"
                  value={stats.lowStock}
                  icon={<AlertCircle size={24} />}
                  color="red"
                  alert={stats.lowStock > 0}
                />
              </div>

              {/* Top Products & Charts - Responsive Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                {/* Top Products */}
                <div className="bg-white/70 backdrop-blur-md rounded-3xl shadow-xl border border-white p-6 md:p-8 hover:shadow-2xl transition-all duration-300">
                  <div className="flex items-center justify-between mb-4 md:mb-6">
                    <h3 className="text-xl md:text-2xl font-bold text-stone-800">
                      Produits les plus vendus
                    </h3>
                    <BarChart3 className="text-[#C5A065]" size={24} />
                  </div>
                  <div className="space-y-3 md:space-y-4">
                    {topProducts.map((product, index) => (
                      <div
                        key={product.id}
                        className="flex items-center gap-3 md:gap-4"
                      >
                        <div className="w-8 h-8 rounded-full bg-[#C5A065] text-white flex items-center justify-center font-bold text-sm shrink-0">
                          {index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-[#2D2A26] text-sm md:text-base truncate">
                            {product.name}
                          </p>
                          <p className="text-xs md:text-sm text-gray-500">
                            {product.category}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="font-bold text-[#2D2A26] text-sm md:text-base">
                            {product.sales}
                          </p>
                          <p className="text-xs text-gray-500">ventes</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white/70 backdrop-blur-md rounded-3xl shadow-xl border border-white p-6 md:p-8 hover:shadow-2xl transition-all duration-300">
                  <h3 className="text-xl md:text-2xl font-bold text-stone-800 mb-4 md:mb-6">
                    Activité récente
                  </h3>
                  <div className="space-y-3 md:space-y-4">
                    {[
                      {
                        action: "Nouveau produit ajouté",
                        item: "Éclair au Chocolat",
                        time: "Il y a 2h",
                      },
                      {
                        action: "Stock mis à jour",
                        item: "Baguette Tradition",
                        time: "Il y a 4h",
                      },
                      {
                        action: "Produit modifié",
                        item: "Croissant Pur Beurre",
                        time: "Il y a 5h",
                      },
                      {
                        action: "Alerte stock bas",
                        item: "Pain au Chocolat",
                        time: "Il y a 6h",
                      },
                    ].map((activity, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-3 pb-3 md:pb-4 border-b border-gray-100 last:border-0"
                      >
                        <div className="w-2 h-2 rounded-full bg-[#C5A065] mt-2 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm md:text-base text-[#2D2A26] font-medium">
                            {activity.action}
                          </p>
                          <p className="text-xs md:text-sm text-gray-500 truncate">
                            {activity.item}
                          </p>
                        </div>
                        <span className="text-xs text-gray-400 shrink-0">
                          {activity.time}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* GESTION DU PERSONNEL */}
        {/* VUE PERSONNEL */}
        {viewMode === "staff" && <StaffManagement />}

        {/* VUE CLIENTS */}
        {viewMode === "clients" && <ClientManagement />}

        {/* VUE COMMANDES */}
        {viewMode === "orders" && <OrderManagement />}

        {/* VUE PRODUITS */}
        {viewMode === "products" && <ProductManagement />}

        {/* VUE LIVRAISONS */}
        {viewMode === "delivery" && <DeliveryAssignment />}

        {/* VUE PARAMÈTRES */}
        {viewMode === "settings" && <SettingsManagement />}
      </main>
    </div>
  );
}

// --- Composants ---

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
}

function NavItem({ icon, label, active = false, onClick }: NavItemProps) {
  return (
    <button
      onClick={onClick}
      className={`
        flex items-center gap-3 w-full p-3 rounded-xl transition-all duration-200
        relative group
        ${
          active
            ? "bg-linear-to-r from-[#C5A065] to-[#b8935a] text-white shadow-lg shadow-[#C5A065]/30"
            : "text-stone-600 hover:bg-stone-100 hover:text-[#C5A065]"
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
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-[#C5A065] rounded-r-full" />
      )}
    </button>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles =
    status === "En stock"
      ? "bg-green-100 text-green-700 border-green-200"
      : status === "Stock bas"
        ? "bg-orange-100 text-orange-700 border-orange-200"
        : "bg-red-100 text-red-700 border-red-200";

  return (
    <span
      className={`px-2 md:px-3 py-1 rounded-full text-xs font-semibold border ${styles} whitespace-nowrap`}
    >
      {status}
    </span>
  );
}

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ReactNode;
  color: "blue" | "green" | "purple" | "red";
  alert?: boolean;
}

function StatCard({ title, value, change, icon, color, alert }: StatCardProps) {
  const colorClasses = {
    blue: "bg-blue-100 text-blue-600",
    green: "bg-green-100 text-green-600",
    purple: "bg-purple-100 text-purple-600",
    red: "bg-red-100 text-red-600",
  };

  return (
    <div
      className={`bg-white/70 backdrop-blur-md rounded-2xl border border-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 p-5 md:p-6 ${alert ? "ring-2 ring-red-300" : ""}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-bold opacity-60 uppercase tracking-widest mb-1">
            {title}
          </p>
          <h3 className="text-2xl md:text-3xl font-bold text-stone-800">
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
                className={`text-xs md:text-sm font-bold ${change >= 0 ? "text-green-600" : "text-red-600"}`}
              >
                {change >= 0 ? "+" : ""}
                {change}%
              </span>
              <span className="text-xs text-stone-400 hidden sm:inline">
                vs mois dernier
              </span>
            </div>
          )}
        </div>
        <div className={`p-2.5 rounded-lg ${colorClasses[color]}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}
