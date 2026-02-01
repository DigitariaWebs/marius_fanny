import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const styles = {
  gold: '#C5A065',
  dark: '#2D2A26',
  fontScript: '"Great Vibes", cursive',
  fontSans: '"Inter", sans-serif',
};

interface Product {
  id: number;
  categoryId: number; 
  name: string;
  description: string;
  price: number;
  image: string;
  tag?: string;
  allergens?: string[];
}

interface ProductSelectionProps {
  categoryId?: number;
  categoryTitle?: string;
  onBack?: () => void;
  onAddToCart: (product: any) => void; // Prop ajoutée pour le panier
}

const LUNCH_SUBCATEGORIES = [
  { id: 51, title: "Boite à lunch", image: "./boite.jpg" }, 
  { id: 52, title: "Salade repas", image: "./salade1.jpg" },
  { id: 53, title: "Plateau repas", image: "./salade2.jpg" },
  { id: 54, title: "Option végétarienne", image: "./salade3.jpg" },
];

const ALL_PRODUCTS: Product[] = [
  { 
    id: 101, categoryId: 1, name: "La Marguerite", description: "Mousse mascarpone légère, cœur framboise intense, biscuit roulé nature.", price: 37.50, image: "./gateau.jpg", tag: "Best Seller", allergens: ["Gluten", "Lait", "Oeufs"]
  },
  { 
    id: 102, categoryId: 1, name: "Tarte Citron Meringuée", description: "L'équilibre parfait entre l'acidité du citron et la douceur de la meringue italienne.", price: 29.95, image: "./fav4.jpg", tag: "Frais", allergens: ["Lait", "Oeufs", "Gluten"]
  },
  { 
    id: 201, categoryId: 2, name: "Baguette Tradition", description: "Croustillante et alvéolée. Farine blanche, levain naturel.", price: 3.50, image: "./pain1.jpg", allergens: ["Gluten (Blé)"]
  },
  {
    id: 202, categoryId: 2, name: "Le Carré Blanc", description: "Pain de mie moelleux, idéal pour vos tartines du matin.", price: 5.95, image: "./pain2.jpg", allergens: ["Gluten (Blé)"] 
  },
  {
    id: 301, categoryId: 3, name: "Croissant au Beurre", description: "Feuilletage pur beurre AOP, doré à souhait.", price: 2.75, image: "./croi1.jpg", tag: "Matin", allergens: ["Gluten", "Lait"]
  },
  { id: 5101, categoryId: 51, name: "Le Parisien", description: "Jambon blanc supérieur, beurre de baratte, emmental.", price: 12.50, image: "./boite.jpg", allergens: ["Gluten", "Lait"] },
  { id: 5201, categoryId: 52, name: "Salade César", description: "Poulet grillé, copeaux de parmesan, croûtons à l'ail.", price: 14.00, image: "./salade1.jpg", allergens: ["Lait", "Gluten", "Oeufs"] },
  { id: 5301, categoryId: 53, name: "Plateau Affaires", description: "Repas complet pour vos réunions : entrée, plat, fromage, dessert.", price: 22.00, image: "./salade2.jpg", allergens: ["Lait", "Gluten"] },
  { id: 5401, categoryId: 54, name: "Wrap Végétarien", description: "Légumes du soleil grillés, houmous maison, feta.", price: 11.50, image: "./salade3.jpg", tag: "Végé", allergens: ["Gluten", "Lait"] },
];

const ProductSelection: React.FC<ProductSelectionProps> = ({ 
  categoryId, 
  categoryTitle, 
  onBack,
  onAddToCart 
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const [currentCategory, setCurrentCategory] = useState<{ id: number; title: string } | null>(null);
  const [subCategory, setSubCategory] = useState<{ id: number; title: string } | null>(null);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => { window.scrollTo(0, 0); }, [currentCategory, subCategory]);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const urlCategoryId = searchParams.get('category');
    const urlCategoryTitle = searchParams.get('title');
    
    let activeId: number | null = null;
    let activeTitle: string = '';

    if (categoryId && categoryTitle) {
      activeId = categoryId;
      activeTitle = categoryTitle;
    } else if (urlCategoryId && urlCategoryTitle) {
      activeId = parseInt(urlCategoryId);
      activeTitle = decodeURIComponent(urlCategoryTitle);
    }

    if (activeId) {
      setCurrentCategory({ id: activeId, title: activeTitle });
      setSubCategory(null);
    }
  }, [location.search, categoryId, categoryTitle]);

  useEffect(() => {
    if (!currentCategory) return;
    let targetId = currentCategory.id;
    if (currentCategory.id === 5 && subCategory) targetId = subCategory.id;
    const products = ALL_PRODUCTS.filter(p => p.categoryId === targetId);
    setFilteredProducts(products);
  }, [currentCategory, subCategory]);

  const handleBack = () => {
    if (currentCategory?.id === 5 && subCategory) {
      setSubCategory(null);
      return;
    }
    if (onBack) onBack();
    else navigate(-1);
  };

  const handleAddToCart = () => {
    if (selectedProduct) {
      // On boucle pour ajouter la quantité sélectionnée
      for (let i = 0; i < quantity; i++) {
        onAddToCart(selectedProduct);
      }
      setSelectedProduct(null);
      setQuantity(1);
    }
  };

  useEffect(() => {
    document.body.style.overflow = selectedProduct ? 'hidden' : 'unset';
  }, [selectedProduct]);

  if (!currentCategory) return <div className="min-h-screen flex items-center justify-center text-[#C5A065]">Chargement des délices...</div>;

  const showSubCategories = currentCategory.id === 5 && !subCategory;

  return (
    <div className="min-h-screen py-16 px-4 md:px-8 relative fade-in bg-transparent" style={{ fontFamily: styles.fontSans, color: styles.dark }}>
      
      <div className="max-w-7xl mx-auto">
        <nav className="flex items-center gap-3 mb-8 text-sm uppercase tracking-widest font-medium text-stone-500">
          <button onClick={handleBack} className="hover:text-[#C5A065] transition-colors flex items-center gap-2 group">
            <span className="w-8 h-px bg-stone-400 group-hover:bg-[#C5A065] transition-colors"></span> Retour
          </button>
          <span className="opacity-30">|</span>
          <span className="text-[#C5A065]">
            {subCategory ? subCategory.title : currentCategory.title}
          </span>
        </nav>

        <header className="mb-20 text-center relative">
          <h1 className="text-6xl md:text-7xl mb-6" style={{ fontFamily: styles.fontScript, color: styles.dark }}>
            {subCategory ? subCategory.title : currentCategory.title}
          </h1>
          <div className="w-24 h-1 mx-auto bg-[#C5A065] mb-6 rounded-full"></div>
          <p className="max-w-2xl mx-auto text-lg text-stone-600 font-light italic">
            {showSubCategories 
              ? "Une sélection gourmande pour vos pauses déjeuner." 
              : "Découvrez nos créations artisanales, faites avec passion."}
          </p>
        </header>
        
        {showSubCategories ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {LUNCH_SUBCATEGORIES.map((sub) => (
              <div 
                key={sub.id}
                onClick={() => setSubCategory({ id: sub.id, title: sub.title })}
                className="group relative h-80 overflow-hidden rounded-xl cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-500 border-4 border-white"
              >
                <img src={sub.image} alt={sub.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-colors" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <h3 className="text-white text-4xl font-serif drop-shadow-lg">{sub.title}</h3>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredProducts.map((product) => (
              <div 
                key={product.id} 
                className="group bg-white/90 backdrop-blur-sm rounded-xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 cursor-pointer flex flex-col"
                onClick={() => setSelectedProduct(product)}
              >
                <div className="relative h-64 overflow-hidden">
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  {product.tag && <span className="absolute top-3 left-3 bg-[#C5A065] text-white px-3 py-1 text-[10px] font-bold uppercase tracking-widest">{product.tag}</span>}
                </div>
                <div className="p-6 text-center flex-grow">
                  <h3 className="text-xl font-serif mb-2 text-[#2D2A26] group-hover:text-[#C5A065] transition-colors">{product.name}</h3>
                  <p className="text-sm text-stone-500 line-clamp-2 mb-4 font-light">{product.description}</p>
                  <div className="mt-auto pt-4 border-t border-stone-100">
                    <span className="text-lg font-bold text-[#C5A065]">{product.price.toFixed(2)} $</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* --- MODAL PRODUIT --- */}
      {selectedProduct && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#2D2A26]/80 backdrop-blur-md" onClick={() => setSelectedProduct(null)} />
          <div className="relative bg-white w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col md:row max-h-[90vh]">
            <button onClick={() => setSelectedProduct(null)} className="absolute top-6 right-6 z-20 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-[#C5A065] hover:text-white transition-all">✕</button>
            
            <div className="flex flex-col md:flex-row h-full">
              <div className="w-full md:w-1/2 h-64 md:h-auto">
                <img src={selectedProduct.image} alt={selectedProduct.name} className="w-full h-full object-cover" />
              </div>

              <div className="w-full md:w-1/2 p-8 md:p-12 overflow-y-auto flex flex-col">
                <span className="text-[#C5A065] text-xs font-bold uppercase tracking-widest mb-2">Artisan Pâtissier</span>
                <h2 className="text-4xl font-serif mb-4 text-[#2D2A26]">{selectedProduct.name}</h2>
                <div className="text-2xl font-medium text-[#C5A065] mb-6">{selectedProduct.price.toFixed(2)} $</div>
                
                <p className="text-stone-600 mb-8 font-light leading-relaxed">{selectedProduct.description}</p>

                {selectedProduct.allergens && (
                  <div className="mb-8">
                    <h4 className="text-xs font-bold uppercase mb-2">Allergènes</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedProduct.allergens.map((a, i) => <span key={i} className="px-2 py-1 bg-stone-100 text-[10px] rounded">{a}</span>)}
                    </div>
                  </div>
                )}

                <div className="mt-auto flex gap-4">
                  <div className="flex items-center border border-stone-200 rounded-lg">
                    <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-4 py-2 hover:bg-stone-50">-</button>
                    <span className="px-4 font-bold">{quantity}</span>
                    <button onClick={() => setQuantity(quantity + 1)} className="px-4 py-2 hover:bg-stone-50">+</button>
                  </div>
                  <button 
                    onClick={handleAddToCart}
                    className="flex-1 bg-[#2D2A26] text-white py-4 rounded-lg font-bold uppercase tracking-widest text-xs hover:bg-[#C5A065] transition-all shadow-lg"
                  >
                    Ajouter au panier
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductSelection;