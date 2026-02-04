import { useState } from 'react';
import { 
  Package, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  LayoutDashboard, 
  LogOut,
  Settings,
  X,
  TrendingUp,
  TrendingDown,
  ShoppingCart,
  DollarSign,
  AlertCircle,
  Eye,
  Filter,
  Download,
  BarChart3,
  Menu
} from 'lucide-react';

interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  stock: number;
  status: 'En stock' | 'Rupture' | 'Stock bas';
  sales: number;
  revenue: number;
  image?: string;
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

type ViewMode = 'overview' | 'products' | 'settings';

const CATEGORIES = ['Gâteaux', 'Pains', 'Viennoiseries', 'Chocolats', 'Boîtes à lunch', 'À la carte'];

const MOCK_PRODUCTS: Product[] = [
  { id: 1, name: 'La Marguerite (6 pers.)', category: 'Gâteaux', price: 37.50, stock: 120, status: 'En stock', sales: 245, revenue: 9187.50 },
  { id: 2, name: 'Tarte Citron Meringuée', category: 'Gâteaux', price: 29.95, stock: 45, status: 'En stock', sales: 189, revenue: 5660.55 },
  { id: 3, name: 'Baguette Tradition', category: 'Pains', price: 3.50, stock: 0, status: 'Rupture', sales: 312, revenue: 1092 },
  { id: 4, name: 'Pain Campagne Bio', category: 'Pains', price: 4.80, stock: 12, status: 'Stock bas', sales: 98, revenue: 470.40 },
  { id: 5, name: 'Croissant Pur Beurre', category: 'Viennoiseries', price: 2.20, stock: 78, status: 'En stock', sales: 403, revenue: 886.60 },
  { id: 6, name: 'Pain au Chocolat', category: 'Viennoiseries', price: 2.40, stock: 5, status: 'Stock bas', sales: 367, revenue: 880.80 },
  { id: 7, name: 'Macarons Assortis (12 pcs)', category: 'Chocolats', price: 24.00, stock: 34, status: 'En stock', sales: 156, revenue: 3744 },
  { id: 8, name: 'Chocolats Pralinés (250g)', category: 'Chocolats', price: 18.50, stock: 89, status: 'En stock', sales: 178, revenue: 3293 },
  { id: 9, name: 'Plateau Affaires', category: 'Boîtes à lunch', price: 22.00, stock: 45, status: 'En stock', sales: 134, revenue: 2948 },
  { id: 10, name: 'Sandwich Jambon-Beurre', category: 'À la carte', price: 6.50, stock: 67, status: 'En stock', sales: 289, revenue: 1878.50 },
  { id: 11, name: 'Quiche Lorraine', category: 'À la carte', price: 8.90, stock: 23, status: 'En stock', sales: 156, revenue: 1388.40 },
  { id: 12, name: 'Éclair au Chocolat', category: 'Gâteaux', price: 4.50, stock: 15, status: 'Stock bas', sales: 423, revenue: 1903.50 },
];

export default function AdminDashboard() {
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('Tous');
  const [viewMode, setViewMode] = useState<ViewMode>('overview');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    category: 'Gâteaux',
    price: '',
    stock: ''
  });

  const gold = "#C5A065";
  const dark = "#2D2A26";

  // Calcul des statistiques
  const calculateStats = (): Statistics => {
    const totalProducts = products.length;
    const totalRevenue = products.reduce((sum, p) => sum + p.revenue, 0);
    const lowStock = products.filter(p => p.status === 'Stock bas' || p.status === 'Rupture').length;
    const totalSales = products.reduce((sum, p) => sum + p.sales, 0);
    
    return {
      totalProducts,
      totalRevenue,
      lowStock,
      totalSales,
      revenueChange: 12.5,
      salesChange: 8.3
    };
  };

  const stats = calculateStats();

  // Gestion du formulaire
  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setFormData({ name: '', category: 'Gâteaux', price: '', stock: '' });
    setEditingProduct(null);
  };

  const handleSubmit = () => {
    const price = parseFloat(formData.price);
    const stock = parseInt(formData.stock);

    if (!formData.name || isNaN(price) || isNaN(stock)) {
      alert('Veuillez remplir tous les champs correctement.');
      return;
    }

    if (editingProduct) {
      // Modifier un produit existant
      setProducts(products.map(p => 
        p.id === editingProduct.id 
          ? {
              ...p,
              name: formData.name,
              category: formData.category,
              price,
              stock,
              status: stock === 0 ? 'Rupture' : stock < 20 ? 'Stock bas' : 'En stock'
            }
          : p
      ));
    } else {
      // Ajouter un nouveau produit
      const newProduct: Product = {
        id: Math.max(...products.map(p => p.id)) + 1,
        name: formData.name,
        category: formData.category,
        price,
        stock,
        status: stock === 0 ? 'Rupture' : stock < 20 ? 'Stock bas' : 'En stock',
        sales: 0,
        revenue: 0
      };
      setProducts([...products, newProduct]);
    }

    setIsModalOpen(false);
    resetForm();
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      category: product.category,
      price: product.price.toString(),
      stock: product.stock.toString()
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Voulez-vous vraiment supprimer ce produit ?')) {
      setProducts(products.filter(p => p.id !== id));
    }
  };

  // Filtrage des produits
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'Tous' || product.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

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
      <aside className={`
        fixed md:static inset-y-0 left-0 z-50
        w-64 bg-[#2D2A26] text-white flex flex-col
        transform transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="p-6 border-b border-gray-700 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-serif tracking-widest text-[#C5A065]">MARIUS & FANNY</h1>
            <p className="text-xs text-gray-400 mt-1 tracking-wider uppercase">Administration</p>
          </div>
          <button 
            onClick={() => setIsMobileMenuOpen(false)}
            className="md:hidden text-gray-400 hover:text-white"
          >
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <NavItem 
            icon={<LayoutDashboard size={20} />} 
            label="Vue d'ensemble" 
            active={viewMode === 'overview'}
            onClick={() => {
              setViewMode('overview');
              setIsMobileMenuOpen(false);
            }}
          />
          <NavItem 
            icon={<Package size={20} />} 
            label="Produits" 
            active={viewMode === 'products'}
            onClick={() => {
              setViewMode('products');
              setIsMobileMenuOpen(false);
            }}
          />
          <NavItem 
            icon={<Settings size={20} />} 
            label="Paramètres" 
            active={viewMode === 'settings'}
            onClick={() => {
              setViewMode('settings');
              setIsMobileMenuOpen(false);
            }}
          />
        </nav>

        <div className="p-4 border-t border-gray-700">
          <button className="flex items-center gap-3 w-full p-3 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white transition-all">
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
        {viewMode === 'overview' && (
          <>
            <header className="bg-white shadow-sm border-b border-gray-100 p-4 md:p-8">
              <h2 className="text-2xl md:text-3xl font-serif text-[#2D2A26]">Vue d'ensemble</h2>
              <p className="text-sm md:text-base text-gray-500 mt-1">Tableau de bord administrateur</p>
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
                    <h3 className="text-lg md:text-xl font-serif text-[#2D2A26]">Produits les plus vendus</h3>
                    <BarChart3 className="text-[#C5A065]" size={20} />
                  </div>
                  <div className="space-y-3 md:space-y-4">
                    {topProducts.map((product, index) => (
                      <div key={product.id} className="flex items-center gap-3 md:gap-4">
                        <div className="w-8 h-8 rounded-full bg-[#C5A065] text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
                          {index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-[#2D2A26] text-sm md:text-base truncate">{product.name}</p>
                          <p className="text-xs md:text-sm text-gray-500">{product.category}</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="font-bold text-[#2D2A26] text-sm md:text-base">{product.sales}</p>
                          <p className="text-xs text-gray-500">ventes</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-6">
                  <h3 className="text-lg md:text-xl font-serif text-[#2D2A26] mb-4 md:mb-6">Activité récente</h3>
                  <div className="space-y-3 md:space-y-4">
                    {[
                      { action: 'Nouveau produit ajouté', item: 'Éclair au Chocolat', time: 'Il y a 2h' },
                      { action: 'Stock mis à jour', item: 'Baguette Tradition', time: 'Il y a 4h' },
                      { action: 'Produit modifié', item: 'Croissant Pur Beurre', time: 'Il y a 5h' },
                      { action: 'Alerte stock bas', item: 'Pain au Chocolat', time: 'Il y a 6h' },
                    ].map((activity, idx) => (
                      <div key={idx} className="flex items-start gap-3 pb-3 md:pb-4 border-b border-gray-100 last:border-0">
                        <div className="w-2 h-2 rounded-full bg-[#C5A065] mt-2 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm md:text-base text-[#2D2A26] font-medium">{activity.action}</p>
                          <p className="text-xs md:text-sm text-gray-500 truncate">{activity.item}</p>
                        </div>
                        <span className="text-xs text-gray-400 flex-shrink-0">{activity.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* LISTE DES PRODUITS */}
        {viewMode === 'products' && (
          <>
            <header className="bg-white shadow-sm border-b border-gray-100 p-4 md:p-8">
              <div className="flex flex-col gap-4">
                <div>
                  <h2 className="text-2xl md:text-3xl font-serif text-[#2D2A26]">Gestion des Produits</h2>
                  <p className="text-sm md:text-base text-gray-500 mt-1">Catalogue et inventaire</p>
                </div>
                
                {/* Search and Filter - Responsive Layout */}
                <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input 
                      type="text" 
                      placeholder="Rechercher un produit..."
                      className="w-full pl-10 pr-4 py-2.5 md:py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#C5A065]/50 outline-none text-sm md:text-base"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  
                  <div className="flex gap-2">
                    <select 
                      className="flex-1 sm:flex-none px-3 md:px-4 py-2.5 md:py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#C5A065]/50 outline-none text-sm md:text-base"
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                    >
                      <option value="Tous">Toutes les catégories</option>
                      {CATEGORIES.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>

                    <button 
                      onClick={() => {
                        resetForm();
                        setIsModalOpen(true);
                      }}
                      className="flex items-center gap-2 bg-[#2D2A26] hover:bg-[#C5A065] text-white px-4 md:px-6 py-2.5 md:py-3 rounded-lg transition-colors text-sm md:text-base whitespace-nowrap"
                    >
                      <Plus size={20} />
                      <span className="hidden sm:inline">Ajouter</span>
                    </button>
                  </div>
                </div>
              </div>
            </header>

            <div className="p-4 md:p-8">
              {/* Desktop Table View */}
              <div className="hidden lg:block bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="text-left p-4 text-sm font-semibold text-gray-600">Produit</th>
                        <th className="text-left p-4 text-sm font-semibold text-gray-600">Catégorie</th>
                        <th className="text-left p-4 text-sm font-semibold text-gray-600">Prix</th>
                        <th className="text-left p-4 text-sm font-semibold text-gray-600">Stock</th>
                        <th className="text-left p-4 text-sm font-semibold text-gray-600">Statut</th>
                        <th className="text-left p-4 text-sm font-semibold text-gray-600">Ventes</th>
                        <th className="text-left p-4 text-sm font-semibold text-gray-600">Revenus</th>
                        <th className="text-right p-4 text-sm font-semibold text-gray-600">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredProducts.map((product) => (
                        <tr key={product.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                          <td className="p-4">
                            <p className="font-medium text-[#2D2A26]">{product.name}</p>
                          </td>
                          <td className="p-4">
                            <span className="text-sm text-gray-600">{product.category}</span>
                          </td>
                          <td className="p-4">
                            <span className="font-semibold text-[#2D2A26]">{product.price.toFixed(2)} €</span>
                          </td>
                          <td className="p-4">
                            <span className="text-sm text-gray-600">{product.stock}</span>
                          </td>
                          <td className="p-4">
                            <StatusBadge status={product.status} />
                          </td>
                          <td className="p-4">
                            <span className="text-sm text-gray-600">{product.sales}</span>
                          </td>
                          <td className="p-4">
                            <span className="font-semibold text-green-600">{product.revenue.toFixed(2)} €</span>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center justify-end gap-2">
                              <button 
                                onClick={() => handleEdit(product)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              >
                                <Edit size={18} />
                              </button>
                              <button 
                                onClick={() => handleDelete(product.id)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Mobile Card View */}
              <div className="lg:hidden space-y-4">
                {filteredProducts.map((product) => (
                  <div key={product.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-[#2D2A26] mb-1">{product.name}</h3>
                        <p className="text-sm text-gray-500">{product.category}</p>
                      </div>
                      <StatusBadge status={product.status} />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 mb-3 text-sm">
                      <div>
                        <p className="text-gray-500">Prix</p>
                        <p className="font-semibold text-[#2D2A26]">{product.price.toFixed(2)} €</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Stock</p>
                        <p className="font-semibold text-[#2D2A26]">{product.stock}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Ventes</p>
                        <p className="font-semibold text-[#2D2A26]">{product.sales}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Revenus</p>
                        <p className="font-semibold text-green-600">{product.revenue.toFixed(2)} €</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 pt-3 border-t border-gray-100">
                      <button 
                        onClick={() => handleEdit(product)}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors text-sm font-medium"
                      >
                        <Edit size={16} />
                        <span>Modifier</span>
                      </button>
                      <button 
                        onClick={() => handleDelete(product.id)}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors text-sm font-medium"
                      >
                        <Trash2 size={16} />
                        <span>Supprimer</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* PARAMÈTRES */}
        {viewMode === 'settings' && (
          <>
            <header className="bg-white shadow-sm border-b border-gray-100 p-4 md:p-8">
              <h2 className="text-2xl md:text-3xl font-serif text-[#2D2A26]">Paramètres</h2>
              <p className="text-sm md:text-base text-gray-500 mt-1">Configuration de votre boutique</p>
            </header>

            <div className="p-4 md:p-8">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-8 max-w-2xl">
                <h3 className="text-lg md:text-xl font-serif text-[#2D2A26] mb-4 md:mb-6">Informations générales</h3>
                <div className="space-y-4 md:space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Nom de la boutique</label>
                    <input 
                      type="text" 
                      defaultValue="MARIUS & FANNY"
                      className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#C5A065]/50 outline-none text-sm md:text-base" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Email de contact</label>
                    <input 
                      type="email" 
                      defaultValue="contact@mariusetfanny.com"
                      className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#C5A065]/50 outline-none text-sm md:text-base" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Seuil de stock bas</label>
                    <input 
                      type="number" 
                      defaultValue="20"
                      className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#C5A065]/50 outline-none text-sm md:text-base" 
                    />
                    <p className="text-xs text-gray-500">Les produits avec un stock inférieur à ce seuil seront marqués comme "Stock bas"</p>
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

      {/* --- MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
            <div className="p-4 md:p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50 sticky top-0">
              <h3 className="text-lg md:text-xl font-serif text-[#2D2A26]">
                {editingProduct ? 'Modifier le produit' : 'Ajouter un produit'}
              </h3>
              <button 
                onClick={() => {
                  setIsModalOpen(false);
                  resetForm();
                }} 
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>
            <div className="p-4 md:p-8 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Nom du produit</label>
                <input 
                  type="text" 
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#C5A065]/50 outline-none text-sm md:text-base" 
                  placeholder="Ex: Croissant aux Amandes"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Catégorie</label>
                <select 
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#C5A065]/50 outline-none text-sm md:text-base"
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Prix (€)</label>
                  <input 
                    type="number" 
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#C5A065]/50 outline-none text-sm md:text-base" 
                    placeholder="0.00"
                    value={formData.price}
                    onChange={(e) => handleInputChange('price', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Stock</label>
                  <input 
                    type="number" 
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#C5A065]/50 outline-none text-sm md:text-base" 
                    placeholder="0"
                    value={formData.stock}
                    onChange={(e) => handleInputChange('stock', e.target.value)}
                  />
                </div>
              </div>

              <button 
                onClick={handleSubmit}
                className="w-full bg-[#2D2A26] hover:bg-[#C5A065] text-white font-medium py-3 rounded-lg transition-colors mt-4 text-sm md:text-base"
              >
                {editingProduct ? 'Enregistrer les modifications' : 'Créer le produit'}
              </button>
            </div>
          </div>
        </div>
      )}
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
      className={`flex items-center gap-3 w-full p-3 rounded-lg transition-all ${
        active 
          ? 'bg-[#C5A065] text-white shadow-lg' 
          : 'text-gray-400 hover:bg-gray-800 hover:text-white'
      }`}
    >
      {icon}
      <span className="font-medium">{label}</span>
    </button>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles = 
    status === 'En stock' 
      ? 'bg-green-100 text-green-700 border-green-200' 
      : status === 'Stock bas'
      ? 'bg-orange-100 text-orange-700 border-orange-200'
      : 'bg-red-100 text-red-700 border-red-200';
  
  return (
    <span className={`px-2 md:px-3 py-1 rounded-full text-xs font-semibold border ${styles} whitespace-nowrap`}>
      {status}
    </span>
  );
}

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'purple' | 'red';
  alert?: boolean;
}

function StatCard({ title, value, change, icon, color, alert }: StatCardProps) {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
    red: 'bg-red-100 text-red-600'
  };

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-6 ${alert ? 'ring-2 ring-red-200' : ''}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs md:text-sm text-gray-500 mb-1">{title}</p>
          <h3 className="text-2xl md:text-3xl font-bold text-[#2D2A26]">{value}</h3>
          {change !== undefined && (
            <div className="flex items-center gap-1 mt-2">
              {change >= 0 ? (
                <TrendingUp size={14} className="text-green-600" />
              ) : (
                <TrendingDown size={14} className="text-red-600" />
              )}
              <span className={`text-xs md:text-sm font-medium ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {change >= 0 ? '+' : ''}{change}%
              </span>
              <span className="text-xs text-gray-400 hidden sm:inline">vs mois dernier</span>
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
