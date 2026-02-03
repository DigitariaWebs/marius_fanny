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
  selectedSize?: string;
  userAllergies?: string;
}

interface ProductSelectionProps {
  categoryId?: number;
  categoryTitle?: string;
  onBack?: () => void;
  onAddToCart: (product: any) => void; 
}

const LUNCH_SUBCATEGORIES = [
  { id: 51, title: "Boite à lunch", image: "./boite.jpg" }, 
  { id: 52, title: "Salade repas", image: "./salade1.jpg" },
  { id: 53, title: "Plateau repas", image: "./salade2.jpg" },
  { id: 54, title: "Option végétarienne", image: "./salade3.jpg" },
];

const ALL_PRODUCTS: Product[] = [
  { 
    id: 101, categoryId: 1, name: "La Marguerite", description: "Mousse mascarpone légère, cœur framboise intense, biscuit roulé nature.", price: 37.50, image: "./gateau.jpg", tag: "en stock", allergens: ["Gluten", "Lait", "Oeufs"],
  },
  { 
    id: 102, categoryId: 1, name: "Tarte Citron Meringuée", description: "L'équilibre parfait entre l'acidité du citron et la douceur de la meringue italienne.", price: 29.95, image: "./fav4.jpg", tag: "en stock", allergens: ["Lait", "Oeufs", "Gluten"]
  },
  {
    id: 103, categoryId: 1, name: "Le Croustillant" , description: "Praliné noisette, feuilletine croquante, enrobage chocolat au lait.", price: 37.50, image: "./fav3.jpg", tag: "en stock", allergens: ["Lait", "Gluten"]
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
  const [cakeSize, setCakeSize] = useState<'6' | '12'>('6');
  const [allergyNote, setAllergyNote] = useState('');

  useEffect(() => { window.scrollTo(0, 0); }, [currentCategory, subCategory]);

  useEffect(() => {
    setQuantity(1);
    setCakeSize('6');
    setAllergyNote('');
  }, [selectedProduct]);

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

  const getCurrentPrice = () => {
    if (!selectedProduct) return 0;
    let price = selectedProduct.price;
    if ((selectedProduct.id === 101 || selectedProduct.id === 103) && cakeSize === '12') {
      price += 21.50;
    }
    return price;
  };

  const handleAddToCart = () => {
    if (selectedProduct) {
      let productToAdd = { ...selectedProduct };

      if (selectedProduct.id === 101 || selectedProduct.id === 103) {
        if (cakeSize === '12') {
          productToAdd.price += 21.50;
          productToAdd.name = `${productToAdd.name} (12 pers.)`;
          productToAdd.selectedSize = "12 personnes";
        } else {
          productToAdd.name = `${productToAdd.name} (6 pers.)`;
          productToAdd.selectedSize = "6 personnes";
        }
      }

      if (selectedProduct.categoryId === 51 && allergyNote.trim() !== '') {
        productToAdd.userAllergies = allergyNote;
      }

      for (let i = 0; i < quantity; i++) {
        onAddToCart(productToAdd);
      }
      setSelectedProduct(null);
      setQuantity(1);
    }
  };

  // Empêcher le scroll de la page principale quand le modal est ouvert
  useEffect(() => {
    if (selectedProduct) {
      document.body.style.overflow = 'hidden';
      // Sur mobile, cela aide parfois à bloquer le défilement de fond
      document.documentElement.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
      document.documentElement.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
      document.documentElement.style.overflow = 'unset';
    };
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
        // z-[9999] assure que le modal est au dessus de tout header/footer
        <div className="fixed inset-0 z-[9999] flex items-end md:items-center justify-center md:p-4">
          
          {/* Fond flouté */}
          <div className="absolute inset-0 bg-[#2D2A26]/90 backdrop-blur-md transition-opacity" onClick={() => setSelectedProduct(null)} />
          
          {/* Conteneur Principal : 
              - Mobile: h-full (plein écran), rounded-none
              - Desktop: rounded-2xl, hauteur auto, max-h-[90vh]
          */}
          <div className="relative bg-white w-full md:max-w-4xl h-full md:h-auto md:max-h-[90vh] md:rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row">
            
            {/* Bouton Fermer */}
            <button 
              onClick={() => setSelectedProduct(null)} 
              className="absolute top-4 right-4 z-20 w-10 h-10 bg-white/80 backdrop-blur rounded-full flex items-center justify-center shadow-md hover:bg-[#C5A065] hover:text-white transition-all text-lg font-bold"
            >
              ✕
            </button>
            
            {/* Colonne Image (Hauteur réduite sur mobile) */}
            <div className="w-full md:w-1/2 h-56 md:h-auto shrink-0 relative">
               <img src={selectedProduct.image} alt={selectedProduct.name} className="w-full h-full object-cover" />
               <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent md:hidden"></div>
            </div>

            {/* Colonne Contenu */}
            <div className="w-full md:w-1/2 flex flex-col h-full overflow-hidden">
              
              {/* Zone défilante (Scrollable) */}
              <div className="flex-1 overflow-y-auto p-6 md:p-12 pb-32 md:pb-12">
                <span className="text-[#C5A065] text-xs font-bold uppercase tracking-widest mb-2 block">Artisan Pâtissier</span>
                <h2 className="text-3xl md:text-4xl font-serif mb-2 text-[#2D2A26]">{selectedProduct.name}</h2>
                <div className="text-2xl font-medium text-[#C5A065] mb-6">{getCurrentPrice().toFixed(2)} $</div>
                
                <p className="text-stone-600 mb-6 font-light leading-relaxed text-sm md:text-base">{selectedProduct.description}</p>

                {/* --- OPTIONS GÂTEAUX --- */}
                {(selectedProduct.id === 101 || selectedProduct.id === 103) && (
                  <div className="mb-6 bg-stone-50 p-4 rounded-lg border border-stone-100">
                    <h4 className="text-xs font-bold uppercase mb-3 text-stone-500">Choisissez la taille</h4>
                    <div className="flex gap-3">
                      <button 
                        onClick={() => setCakeSize('6')}
                        className={`flex-1 py-3 px-3 rounded text-sm font-medium transition-all ${cakeSize === '6' ? 'bg-[#C5A065] text-white shadow-md' : 'bg-white border border-stone-200 text-stone-600'}`}
                      >
                        6 Pers.
                      </button>
                      <button 
                        onClick={() => setCakeSize('12')}
                        className={`flex-1 py-3 px-3 rounded text-sm font-medium transition-all ${cakeSize === '12' ? 'bg-[#C5A065] text-white shadow-md' : 'bg-white border border-stone-200 text-stone-600'}`}
                      >
                        12 Pers. <span className="text-[10px] block opacity-80">+21.50$</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* --- INPUT ALLERGIES --- */}
                {selectedProduct.categoryId === 51 && (
                  <div className="mb-6">
                     <h4 className="text-xs font-bold uppercase mb-2 text-stone-500 flex items-center gap-2">
                       <span className="w-1 h-4 bg-red-400 rounded-full"></span>
                       Allergies ?
                     </h4>
                     <textarea 
                       value={allergyNote}
                       onChange={(e) => setAllergyNote(e.target.value)}
                       placeholder="Ex: Arachides, Sans gluten..."
                       className="w-full p-3 border border-stone-200 rounded-lg text-sm focus:outline-none focus:border-[#C5A065] bg-stone-50"
                       rows={2}
                     />
                  </div>
                )}

                {selectedProduct.allergens && (
                  <div className="mb-4">
                    <h4 className="text-xs font-bold uppercase mb-2">Allergènes</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedProduct.allergens.map((a, i) => <span key={i} className="px-2 py-1 bg-stone-100 text-[10px] rounded text-stone-500">{a}</span>)}
                    </div>
                  </div>
                )}
              </div>

              {/* Zone Boutons (FIXE EN BAS sur mobile) 
                 md:relative -> redevient normal sur desktop
              */}
              <div className="absolute bottom-0 left-0 right-0 md:relative bg-white border-t border-stone-100 p-4 md:p-0 md:border-t-0 z-10 shadow-[0_-5px_15px_rgba(0,0,0,0.05)] md:shadow-none">
                <div className="flex gap-4 md:p-12 md:pt-0">
                  <div className="flex items-center border border-stone-200 rounded-lg h-14">
                    <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-4 h-full hover:bg-stone-50 text-xl text-stone-500">-</button>
                    <span className="px-2 font-bold min-w-[30px] text-center">{quantity}</span>
                    <button onClick={() => setQuantity(quantity + 1)} className="px-4 h-full hover:bg-stone-50 text-xl text-stone-500">+</button>
                  </div>
                  <button 
                    onClick={handleAddToCart}
                    className="flex-1 bg-[#2D2A26] text-white h-14 rounded-lg font-bold uppercase tracking-widest text-xs hover:bg-[#C5A065] transition-all shadow-lg active:scale-95"
                  >
                    Ajouter
                    <span className="ml-2 opacity-70 font-normal normal-case hidden sm:inline">au panier</span>
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