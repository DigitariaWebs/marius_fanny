import { useState } from 'react';
import { 
  Package, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  MoreVertical, 
  LayoutDashboard, 
  LogOut,
  Settings,
  X
} from 'lucide-react';

interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  stock: number;
  status: 'En stock' | 'Rupture';
}

const MOCK_PRODUCTS: Product[] = [
  { id: 1, name: 'Rouge Velours - Teinte 302', category: 'Lèvres', price: 35, stock: 120, status: 'En stock' },
  { id: 2, name: 'Sérum Or Impérial', category: 'Visage', price: 89, stock: 45, status: 'En stock' },
  { id: 3, name: 'Palette Regard Intense', category: 'Yeux', price: 55, stock: 0, status: 'Rupture' },
  { id: 4, name: 'Set Découverte Luxe', category: 'Sets', price: 120, stock: 12, status: 'En stock' },
];

export default function AdminDashboard() {
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  
  const gold = "#C5A065";
  const dark = "#2D2A26";

  // Fonction pour supprimer (simulation)
  const handleDelete = (id: number) => {
    if (window.confirm('Voulez-vous vraiment supprimer ce produit ?')) {
      setProducts(products.filter(p => p.id !== id));
    }
  };

  // Filtrer les produits
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-gray-50 font-sans text-[#2D2A26]">
      
      {/* --- SIDEBAR (Menu Gauche) --- */}
      <aside className="w-64 bg-[#2D2A26] text-white hidden md:flex flex-col">
        <div className="p-6 border-b border-gray-700">
          <h1 className="text-2xl font-serif tracking-widest text-[#C5A065]">MARIUS & FANNY</h1>
          <p className="text-xs text-gray-400 mt-1 tracking-wider uppercase">Administration</p>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <NavItem icon={<LayoutDashboard size={20} />} label="Vue d'ensemble" active />
          <NavItem icon={<Package size={20} />} label="Produits" />
          <NavItem icon={<Settings size={20} />} label="Paramètres" />
        </nav>

        <div className="p-4 border-t border-gray-700">
          <button className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors w-full p-2">
            <LogOut size={20} />
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* --- CONTENU PRINCIPAL --- */}
      <main className="flex-1 overflow-y-auto">
        <header className="bg-white shadow-sm border-b border-gray-100 p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-3xl font-serif text-[#2D2A26]">Gestion des Produits</h2>
              <p className="text-gray-500 mt-1">Gérez votre catalogue, vos stocks et vos prix.</p>
            </div>
            
            <button 
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 bg-[#2D2A26] hover:bg-[#C5A065] text-white px-6 py-3 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <Plus size={20} />
              <span className="font-medium">Nouveau Produit</span>
            </button>
          </div>
        </header>

        <div className="p-8">
          {/* Barre de recherche */}
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex items-center gap-4">
            <Search className="text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="Rechercher un produit, une catégorie..." 
              className="flex-1 outline-none text-[#2D2A26] placeholder-gray-400"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Tableau des produits */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-xs uppercase tracking-wider text-gray-500 font-semibold border-b border-gray-100">
                    <th className="p-6">Produit</th>
                    <th className="p-6">Catégorie</th>
                    <th className="p-6">Prix</th>
                    <th className="p-6">Stock</th>
                    <th className="p-6">Statut</th>
                    <th className="p-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50 transition-colors group">
                      <td className="p-6 font-medium text-[#2D2A26]">{product.name}</td>
                      <td className="p-6">
                        <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                          {product.category}
                        </span>
                      </td>
                      <td className="p-6 font-semibold">{product.price} €</td>
                      <td className="p-6 text-gray-600">{product.stock} unités</td>
                      <td className="p-6">
                        <StatusBadge status={product.status} />
                      </td>
                      <td className="p-6 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="p-2 text-gray-400 hover:text-[#C5A065] hover:bg-orange-50 rounded-lg transition-colors">
                            <Edit size={18} />
                          </button>
                          <button 
                            onClick={() => handleDelete(product.id)}
                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
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
            
            {filteredProducts.length === 0 && (
              <div className="p-12 text-center text-gray-400">
                Aucun produit trouvé pour "{searchTerm}"
              </div>
            )}
          </div>
        </div>
      </main>

      {/* --- MODAL (Ajouter un produit) --- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="text-xl font-serif text-[#2D2A26]">Ajouter un produit</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>
            <div className="p-8 space-y-4">
               {/* Champs factices pour l'instant */}
               <div className="space-y-2">
                 <label className="text-sm font-medium text-gray-700">Nom du produit</label>
                 <input type="text" className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#C5A065]/50 outline-none" placeholder="Ex: Rouge Intense" />
               </div>
               <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                   <label className="text-sm font-medium text-gray-700">Prix (€)</label>
                   <input type="number" className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#C5A065]/50 outline-none" placeholder="0.00" />
                 </div>
                 <div className="space-y-2">
                   <label className="text-sm font-medium text-gray-700">Stock</label>
                   <input type="number" className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#C5A065]/50 outline-none" placeholder="0" />
                 </div>
               </div>
               <button 
                onClick={() => {
                  alert("Fonctionnalité Backend à venir !");
                  setIsModalOpen(false);
                }}
                className="w-full bg-[#2D2A26] hover:bg-[#C5A065] text-white font-medium py-3 rounded-lg transition-colors mt-4"
               >
                 Enregistrer le produit
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// --- Petits composants pour le style ---

function NavItem({ icon, label, active = false }: { icon: any, label: string, active?: boolean }) {
  return (
    <button className={`flex items-center gap-3 w-full p-3 rounded-lg transition-all ${
      active 
        ? 'bg-[#C5A065] text-white shadow-lg' 
        : 'text-gray-400 hover:bg-gray-800 hover:text-white'
    }`}>
      {icon}
      <span className="font-medium">{label}</span>
    </button>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles = status === 'En stock' 
    ? 'bg-green-100 text-green-700 border-green-200' 
    : 'bg-red-100 text-red-700 border-red-200';
  
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${styles}`}>
      {status}
    </span>
  );
}