import { useState } from "react";
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
} from "lucide-react";
import StaffManagement from "./StaffManagement";
import ClientManagement from "./ClientManagement";
import { OrderManagement } from "./OrderManagement";
import { ProductManagement } from "./ProductManagement";

interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  sales: number;
  revenue: number;
  image?: string;
  available: boolean;
  minOrderQuantity: number;
  maxOrderQuantity: number;
}

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
  },
];

export default function AdminDashboard() {
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
  const [viewMode, setViewMode] = useState<ViewMode>("overview");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const gold = "#C5A065";
  const dark = "#2D2A26";

  // Calcul des statistiques
  const calculateStats = (): Statistics => {
    const totalProducts = products.length;
    const totalRevenue = products.reduce((sum, p) => sum + p.revenue, 0);
    const lowStock = products.filter((p) => !p.available).length;
    const totalSales = products.reduce((sum, p) => sum + p.sales, 0);

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
    .sort((a, b) => b.sales - a.sales)
    .slice(0, 5);

  return (
    <div className="flex h-screen bg-gray-50 font-sans text-[#2D2A26]">
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
        w-72 bg-linear-to-b from-[#2D2A26] to-[#1a1816] text-white flex flex-col shadow-2xl
        transform transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
      `}
      >
        {/* Brand Header */}
        <div className="p-6 border-b border-gray-700/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-xl font-serif tracking-wide text-white">
                MARIUS & FANNY
              </h1>
              <p className="text-xs text-gray-400 mt-0.5 tracking-wider uppercase">
                Admin Panel
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="md:hidden text-gray-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-6 overflow-y-auto">
          {/* Main Section */}
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-3">
              Principal
            </p>
            <div className="space-y-1">
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
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-3">
              Gestion
            </p>
            <div className="space-y-1">
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
            </div>
          </div>

          {/* Settings Section */}
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-3">
              Système
            </p>
            <div className="space-y-1">
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

        {/* User Profile & Logout */}
        <div className="p-4 border-t border-gray-700/50 bg-black/20">
          <div className="mb-3 p-3 rounded-lg bg-gray-800/50 border border-gray-700/50">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#C5A065] flex items-center justify-center">
                <UserCircle size={20} className="text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  Administrateur
                </p>
                <p className="text-xs text-gray-400 truncate">
                  admin@mariusetfanny.com
                </p>
              </div>
            </div>
          </div>
          <button className="flex items-center gap-3 w-full p-3 rounded-lg text-gray-400 hover:bg-red-900/20 hover:text-red-400 transition-all border border-transparent hover:border-red-800/50">
            <LogOut size={20} />
            <span className="font-medium">Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 overflow-auto">
        {/* Mobile Header with Hamburger */}
        <div className="md:hidden bg-white border-b border-gray-100 p-4 flex items-center justify-between sticky top-0 z-30">
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="text-gray-600 hover:text-gray-900"
          >
            <Menu size={24} />
          </button>
          <h1 className="text-lg font-serif text-[#2D2A26]">MARIUS & FANNY</h1>
          <div className="w-6" /> {/* Spacer for centering */}
        </div>

        {/* VUE D'ENSEMBLE */}
        {viewMode === "overview" && (
          <>
            <header className="bg-white shadow-sm border-b border-gray-100 p-4 md:p-8">
              <h2 className="text-2xl md:text-3xl font-serif text-[#2D2A26]">
                Vue d'ensemble
              </h2>
              <p className="text-sm md:text-base text-gray-500 mt-1">
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
                  value={`${stats.totalRevenue.toFixed(2)} €`}
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
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-6">
                  <div className="flex items-center justify-between mb-4 md:mb-6">
                    <h3 className="text-lg md:text-xl font-serif text-[#2D2A26]">
                      Produits les plus vendus
                    </h3>
                    <BarChart3 className="text-[#C5A065]" size={20} />
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
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-6">
                  <h3 className="text-lg md:text-xl font-serif text-[#2D2A26] mb-4 md:mb-6">
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

        {/* VUE PARAMÈTRES */}
        {viewMode === "settings" && (
          <>
            <header className="bg-white shadow-sm border-b border-gray-100 p-4 md:p-8">
              <h2 className="text-2xl md:text-3xl font-serif text-[#2D2A26]">
                Paramètres
              </h2>
              <p className="text-sm md:text-base text-gray-500 mt-1">
                Configuration de votre boutique
              </p>
            </header>

            <div className="p-4 md:p-8">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-8 max-w-2xl">
                <h3 className="text-lg md:text-xl font-serif text-[#2D2A26] mb-4 md:mb-6">
                  Informations générales
                </h3>
                <div className="space-y-4 md:space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Nom de la boutique
                    </label>
                    <input
                      type="text"
                      defaultValue="MARIUS & FANNY"
                      className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#C5A065]/50 outline-none text-sm md:text-base"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Email de contact
                    </label>
                    <input
                      type="email"
                      defaultValue="contact@mariusetfanny.com"
                      className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#C5A065]/50 outline-none text-sm md:text-base"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Seuil de stock bas
                    </label>
                    <input
                      type="number"
                      defaultValue="20"
                      className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#C5A065]/50 outline-none text-sm md:text-base"
                    />
                    <p className="text-xs text-gray-500">
                      Les produits avec un stock inférieur à ce seuil seront
                      marqués comme "Stock bas"
                    </p>
                  </div>
                  <button className="w-full bg-[#2D2A26] hover:bg-[#C5A065] text-white font-medium py-3 rounded-lg transition-colors text-sm md:text-base">
                    Enregistrer les modifications
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
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
                vs mois dernier
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
