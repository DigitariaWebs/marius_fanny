import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { authClient } from "../lib/AuthClient";
import { productAPI } from "../lib/ProductAPI";
import { categoryAPI } from "../lib/CategoryAPI";
import GoldenBackground from "./GoldenBackground";
import type { Product, Category } from "../types";
import {
  LogOut,
  Search,
  Package,
  ShoppingBag,
  Filter,
  Grid3X3,
  List,
  ChevronDown,
  ChevronUp,
  X,
  CheckCircle2,
  XCircle,
  Clock,
  Info,
  Briefcase,
  Menu,
} from "lucide-react";

const styles = {
  gold: "#C5A065",
  text: "#2D2A26",
  cream: "#F9F7F2",
  fontScript: '"Great Vibes", cursive',
  fontSans: '"Inter", sans-serif',
};

export default function ProDashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [availabilityFilter, setAvailabilityFilter] = useState<"all" | "available" | "unavailable">("all");
  const [sortBy, setSortBy] = useState<"name" | "price-asc" | "price-desc">("name");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [userName, setUserName] = useState("");

  const navigate = useNavigate();

  // Check auth & load data
  useEffect(() => {
    const init = async () => {
      try {
        const session = await authClient.getSession();
        if (!session?.data?.user) {
          navigate("/se-connecter");
          return;
        }
        const user: any = session.data.user;
        const role = user.role || user.user_metadata?.role;
        if (role !== "pro") {
          navigate("/");
          return;
        }
        setUserName(user.name || "Partenaire");

        await fetchData();
      } catch (error) {
        console.error("Auth check failed:", error);
        navigate("/se-connecter");
      }
    };
    init();
  }, [navigate]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch all products (paginated - get all pages)
      let page = 1;
      let allProds: Product[] = [];
      let hasMore = true;

      while (hasMore) {
        const response = await productAPI.getAllProducts(page, 100);
        allProds = [...allProds, ...response.data.products];
        if (page >= response.data.pagination.totalPages) {
          hasMore = false;
        }
        page++;
      }

      setAllProducts(allProds);
      setProducts(allProds);

      // Fetch categories
      try {
        const catResponse = await categoryAPI.getAllCategories();
        setCategories(catResponse.data.categories || []);
      } catch {
        // Categories may not be set up, continue without them
      }
    } catch (error) {
      console.error("Failed to fetch products:", error);
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort products
  useEffect(() => {
    let filtered = [...allProducts];

    // Search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.category?.toLowerCase().includes(query) ||
          p.description?.toLowerCase().includes(query)
      );
    }

    // Category filter
    if (selectedCategory !== "all") {
      filtered = filtered.filter((p) => p.category === selectedCategory);
    }

    // Availability filter
    if (availabilityFilter === "available") {
      filtered = filtered.filter((p) => p.available);
    } else if (availabilityFilter === "unavailable") {
      filtered = filtered.filter((p) => !p.available);
    }

    // Sort
    if (sortBy === "name") {
      filtered.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === "price-asc") {
      filtered.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-desc") {
      filtered.sort((a, b) => b.price - a.price);
    }

    setProducts(filtered);
  }, [searchQuery, selectedCategory, availabilityFilter, sortBy, allProducts]);

  const handleLogout = async () => {
    try {
      await authClient.signOut();
      navigate("/se-connecter");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  // Get unique category names from products
  const productCategories = Array.from(
    new Set(allProducts.map((p) => p.category).filter(Boolean))
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F9F7F2]">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 border-4 border-[#C5A065] border-t-transparent rounded-full animate-spin" />
          <p className="text-stone-500 text-sm font-medium">
            Chargement du catalogue...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex h-screen bg-[#F9F7F2] font-sans text-stone-800">
      <div className="fixed inset-0 z-0 opacity-30">
        <GoldenBackground />
      </div>

      {/* MOBILE OVERLAY */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`
          w-72 bg-white/80 backdrop-blur-md text-stone-800 flex flex-col shadow-2xl border-r border-stone-200/50 relative z-20
          transform transition-transform duration-300 ease-in-out
          ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
      >
        {/* Brand */}
        <div className="p-6 border-b border-stone-200/50 flex items-center justify-between">
          <div>
            <h1
              className="text-2xl mb-1"
              style={{ fontFamily: styles.fontScript, color: styles.gold }}
            >
              Marius & Fanny
            </h1>
            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-stone-500">
              Espace Partenaire
            </p>
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="md:hidden text-stone-400 hover:text-[#C5A065] transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* User Info */}
        <div className="p-4 border-b border-stone-200/50">
          <div className="flex items-center gap-3 p-3 bg-[#C5A065]/5 rounded-xl">
            <div className="w-10 h-10 rounded-full bg-[#C5A065] text-white flex items-center justify-center font-bold text-sm">
              {userName.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-semibold text-sm text-stone-800">{userName}</p>
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#C5A065]">
                Partenaire Pro
              </p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-6 overflow-y-auto">
          <div>
            <p className="text-[9px] font-black text-stone-400 uppercase tracking-[0.3em] mb-3 px-3">
              Catalogue
            </p>
            <div className="space-y-2">
              <button
                onClick={() => {
                  setSelectedCategory("all");
                  setIsMobileMenuOpen(false);
                }}
                className={`flex items-center gap-3 w-full p-3 rounded-xl transition-all duration-200 ${
                  selectedCategory === "all"
                    ? "bg-linear-to-r from-[#C5A065] to-[#b8935a] text-white shadow-lg shadow-[#C5A065]/30"
                    : "text-stone-600 hover:bg-stone-100 hover:text-[#C5A065]"
                }`}
              >
                <ShoppingBag size={20} />
                <span className="font-medium text-sm">Tous les produits</span>
                <span className="ml-auto text-xs opacity-70">
                  {allProducts.length}
                </span>
              </button>

              {productCategories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    setSelectedCategory(cat);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`flex items-center gap-3 w-full p-3 rounded-xl transition-all duration-200 ${
                    selectedCategory === cat
                    ? "bg-linear-to-r from-[#C5A065] to-[#b8935a] text-white shadow-lg shadow-[#C5A065]/30"
                      : "text-stone-600 hover:bg-stone-100 hover:text-[#C5A065]"
                  }`}
                >
                  <Package size={20} />
                  <span className="font-medium text-sm">{cat}</span>
                  <span className="ml-auto text-xs opacity-70">
                    {allProducts.filter((p) => p.category === cat).length}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </nav>

        {/* Back to site + Logout */}
        <div className="p-4 border-t border-stone-200/50 space-y-2">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-3 w-full p-3 rounded-xl text-stone-600 hover:bg-stone-100 hover:text-[#C5A065] transition-all border border-stone-200"
          >
            <Briefcase size={20} />
            <span className="font-medium text-sm">Retour au site</span>
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full p-3 rounded-xl text-stone-600 hover:bg-red-50 hover:text-red-600 transition-all border border-stone-200 hover:border-red-200"
          >
            <LogOut size={20} />
            <span className="font-medium">Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 overflow-auto relative z-10">
        {/* Mobile Header */}
        <div className="md:hidden bg-white/80 backdrop-blur-md border-b border-stone-200 p-4 flex items-center justify-between sticky top-0 z-30">
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="text-stone-600 hover:text-[#C5A065]"
          >
            <Menu size={24} />
          </button>
          <h1
            className="text-xl"
            style={{ fontFamily: styles.fontScript, color: styles.gold }}
          >
            Espace Pro
          </h1>
          <div className="w-6" />
        </div>

        {/* Header */}
        <header className="p-4 md:p-8">
          <h2
            className="text-4xl md:text-5xl mb-2"
            style={{ fontFamily: styles.fontScript, color: styles.gold }}
          >
            Catalogue Produits
          </h2>
          <p className="text-[9px] font-black uppercase tracking-[0.3em] text-stone-500">
            {products.length} produit{products.length !== 1 ? "s" : ""}{" "}
            {selectedCategory !== "all" ? `dans ${selectedCategory}` : "disponibles"}
          </p>
        </header>

        {/* Search & Toolbar */}
        <div className="px-4 md:px-8 mb-6">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher un produit..."
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-stone-200 bg-white/70 backdrop-blur-md focus:border-[#C5A065] focus:ring-2 focus:ring-[#C5A065]/20 outline-none text-sm"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-4 py-3 rounded-xl border border-stone-200 bg-white/70 backdrop-blur-md text-sm focus:border-[#C5A065] outline-none"
            >
              <option value="name">Trier par nom</option>
              <option value="price-asc">Prix croissant</option>
              <option value="price-desc">Prix décroissant</option>
            </select>

            {/* Availability Filter */}
            <select
              value={availabilityFilter}
              onChange={(e) => setAvailabilityFilter(e.target.value as any)}
              className="px-4 py-3 rounded-xl border border-stone-200 bg-white/70 backdrop-blur-md text-sm focus:border-[#C5A065] outline-none"
            >
              <option value="all">Tous</option>
              <option value="available">Disponibles</option>
              <option value="unavailable">Indisponibles</option>
            </select>

            {/* View toggle */}
            <div className="flex rounded-xl border border-stone-200 overflow-hidden">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-3 transition-colors ${
                  viewMode === "grid"
                    ? "bg-[#C5A065] text-white"
                    : "bg-white/70 text-stone-500 hover:text-[#C5A065]"
                }`}
              >
                <Grid3X3 size={18} />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-3 transition-colors ${
                  viewMode === "list"
                    ? "bg-[#C5A065] text-white"
                    : "bg-white/70 text-stone-500 hover:text-[#C5A065]"
                }`}
              >
                <List size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Products */}
        <div className="px-4 md:px-8 pb-8">
          {products.length === 0 ? (
            <div className="text-center py-16">
              <Package size={48} className="mx-auto text-stone-300 mb-4" />
              <p className="text-stone-500 text-lg">Aucun produit trouvé</p>
              <p className="text-stone-400 text-sm mt-1">
                Essayez de modifier vos filtres
              </p>
            </div>
          ) : viewMode === "grid" ? (
            /* GRID VIEW */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              {products.map((product) => (
                <div
                  key={product.id}
                  onClick={() => setSelectedProduct(product)}
                  className="bg-white/70 backdrop-blur-md rounded-2xl shadow-lg border border-white hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden group"
                >
                  {/* Product image or placeholder */}
                  <div className="relative h-48 bg-linear-to-br from-[#C5A065]/10 to-[#C5A065]/5 flex items-center justify-center overflow-hidden">
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <Package
                        size={48}
                        className="text-[#C5A065]/30"
                      />
                    )}
                    {/* Availability badge */}
                    <div className="absolute top-3 right-3">
                      {product.available ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold">
                          <CheckCircle2 size={12} />
                          Disponible
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-red-100 text-red-700 text-xs font-semibold">
                          <XCircle size={12} />
                          Indisponible
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="p-4">
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#C5A065] mb-1">
                      {product.category}
                    </p>
                    <h3 className="font-bold text-stone-800 mb-2 line-clamp-2">
                      {product.name}
                    </h3>
                    {product.description && (
                      <p className="text-xs text-stone-500 mb-3 line-clamp-2">
                        {product.description}
                      </p>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-[#C5A065]">
                        {product.price.toFixed(2)} $
                      </span>
                      {product.preparationTimeHours && (
                        <span className="inline-flex items-center gap-1 text-xs text-stone-400">
                          <Clock size={12} />
                          {product.preparationTimeHours}h
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* LIST VIEW */
            <div className="space-y-3">
              {products.map((product) => (
                <div
                  key={product.id}
                  onClick={() => setSelectedProduct(product)}
                  className="bg-white/70 backdrop-blur-md rounded-xl shadow-md border border-white hover:shadow-lg transition-all duration-200 cursor-pointer p-4 flex items-center gap-4"
                >
                  {/* Image */}
                  <div className="w-16 h-16 rounded-xl bg-linear-to-br from-[#C5A065]/10 to-[#C5A065]/5 flex items-center justify-center shrink-0 overflow-hidden">
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover rounded-xl"
                      />
                    ) : (
                      <Package size={24} className="text-[#C5A065]/30" />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-stone-800 text-sm truncate">
                        {product.name}
                      </h3>
                      <span className="text-[8px] font-black uppercase tracking-widest text-[#C5A065] bg-[#C5A065]/10 px-2 py-0.5 rounded-full shrink-0">
                        {product.category}
                      </span>
                    </div>
                    {product.description && (
                      <p className="text-xs text-stone-500 truncate">
                        {product.description}
                      </p>
                    )}
                  </div>

                  {/* Price & Status */}
                  <div className="text-right shrink-0 flex items-center gap-4">
                    {product.preparationTimeHours && (
                      <span className="inline-flex items-center gap-1 text-xs text-stone-400">
                        <Clock size={12} />
                        {product.preparationTimeHours}h
                      </span>
                    )}
                    <span className="text-lg font-bold text-[#C5A065]">
                      {product.price.toFixed(2)} $
                    </span>
                    {product.available ? (
                      <CheckCircle2
                        size={20}
                        className="text-green-500"
                      />
                    ) : (
                      <XCircle size={20} className="text-red-400" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* PRODUCT DETAIL MODAL */}
      {selectedProduct && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedProduct(null)}
        >
          <div
            className="bg-white rounded-3xl shadow-2xl max-w-lg w-full max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Image */}
            <div className="relative h-56 bg-linear-to-br from-[#C5A065]/10 to-[#C5A065]/5 flex items-center justify-center overflow-hidden rounded-t-3xl">
              {selectedProduct.image ? (
                <img
                  src={selectedProduct.image}
                  alt={selectedProduct.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Package size={64} className="text-[#C5A065]/20" />
              )}
              <button
                onClick={() => setSelectedProduct(null)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/80 backdrop-blur-md flex items-center justify-center text-stone-600 hover:text-stone-800 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6">
              <p className="text-[9px] font-black uppercase tracking-[0.3em] text-[#C5A065] mb-2">
                {selectedProduct.category}
              </p>
              <h2 className="text-2xl font-bold text-stone-800 mb-3">
                {selectedProduct.name}
              </h2>

              {selectedProduct.description && (
                <p className="text-stone-600 mb-4 text-sm leading-relaxed">
                  {selectedProduct.description}
                </p>
              )}

              {/* Details */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between py-2 border-b border-stone-100">
                  <span className="text-sm text-stone-500">Prix</span>
                  <span className="font-bold text-lg text-[#C5A065]">
                    {selectedProduct.price.toFixed(2)} $
                  </span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-stone-100">
                  <span className="text-sm text-stone-500">Disponibilité</span>
                  {selectedProduct.available ? (
                    <span className="inline-flex items-center gap-1.5 text-green-600 font-semibold text-sm">
                      <CheckCircle2 size={16} />
                      Disponible
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-red-500 font-semibold text-sm">
                      <XCircle size={16} />
                      Indisponible
                    </span>
                  )}
                </div>
                {selectedProduct.preparationTimeHours && (
                  <div className="flex items-center justify-between py-2 border-b border-stone-100">
                    <span className="text-sm text-stone-500">
                      Temps de préparation
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-stone-700 font-medium text-sm">
                      <Clock size={16} className="text-stone-400" />
                      {selectedProduct.preparationTimeHours}h
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between py-2 border-b border-stone-100">
                  <span className="text-sm text-stone-500">Quantité min.</span>
                  <span className="font-medium text-stone-700 text-sm">
                    {selectedProduct.minOrderQuantity}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-stone-100">
                  <span className="text-sm text-stone-500">Quantité max.</span>
                  <span className="font-medium text-stone-700 text-sm">
                    {selectedProduct.maxOrderQuantity}
                  </span>
                </div>
                {selectedProduct.allergens && (
                  <div className="flex items-center justify-between py-2 border-b border-stone-100">
                    <span className="text-sm text-stone-500">Allergènes</span>
                    <span className="font-medium text-stone-700 text-sm">
                      {selectedProduct.allergens}
                    </span>
                  </div>
                )}
                {selectedProduct.hasTaxes !== undefined && (
                  <div className="flex items-center justify-between py-2 border-b border-stone-100">
                    <span className="text-sm text-stone-500">Taxes</span>
                    <span className="font-medium text-stone-700 text-sm">
                      {selectedProduct.hasTaxes ? "Oui" : "Non"}
                    </span>
                  </div>
                )}
              </div>

              {/* Custom Options */}
              {selectedProduct.customOptions &&
                selectedProduct.customOptions.length > 0 && (
                  <div className="mb-6">
                    <h3 className="font-bold text-stone-800 text-sm mb-3">
                      Options personnalisées
                    </h3>
                    <div className="space-y-2">
                      {selectedProduct.customOptions.map((opt, idx) => (
                        <div
                          key={idx}
                          className="p-3 bg-stone-50 rounded-xl"
                        >
                          <p className="text-xs font-bold text-stone-600 mb-1">
                            {opt.name}
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {opt.choices.map((choice, cidx) => (
                              <span
                                key={cidx}
                                className="px-2 py-0.5 bg-white rounded-full text-xs text-stone-600 border border-stone-200"
                              >
                                {choice}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              <button
                onClick={() => setSelectedProduct(null)}
                className="w-full py-3 rounded-xl border-2 border-stone-200 text-stone-600 font-bold text-sm uppercase tracking-widest hover:bg-stone-50 transition-colors"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
