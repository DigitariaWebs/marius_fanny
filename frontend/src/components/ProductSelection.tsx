import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { productAPI } from '../lib/ProductAPI';
import { categoryAPI } from '../lib/CategoryAPI';
import type { Product, Category as CategoryType } from '../types';
import { getImageUrl } from '../utils/api';
import { formatChoiceDisplay, getChoicePrice } from '../utils/customOptions';

const styles = {
  gold: '#337957',
  dark: '#2D2A26',
  fontSans: '"Century Gothic", sans-serif',
};

interface ApiCategoryNode extends CategoryType {
  children?: ApiCategoryNode[];
}

interface ProductSelectionProps {
  categoryId?: number;
  categoryTitle?: string;
  onBack?: () => void;
  onAddToCart: (product: any) => void;
}

const ProductSelection: React.FC<ProductSelectionProps> = ({
  categoryId,
  categoryTitle = '',
  onBack,
  onAddToCart,
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categoryTree, setCategoryTree] = useState<ApiCategoryNode[]>([]);
  const [subCategory, setSubCategory] = useState<{id: number; title: string;} | null>(null);
  const [childCategories, setChildCategories] = useState<ApiCategoryNode[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [recommendationNotif, setRecommendationNotif] = useState<Product[]>([]);
  const [showRecommendationNotif, setShowRecommendationNotif] = useState(false);
  const [modalMainImage, setModalMainImage] = useState('');

  // States pour les options
  const [quantity, setQuantity] = useState(1);
  const [allergyNote, setAllergyNote] = useState("");
  const [selectedBread, setSelectedBread] = useState<string>("Baguette");
  const [isSliced, setIsSliced] = useState<boolean>(false);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const currentWeekDay = new Date().getDay();

  // Logique de filtrage (Backend-logic preserved)
  const normalizeStr = (s: string) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const isLunchCategory = (category: string) => {
    const n = normalizeStr(category);
    return n.includes("lunch") || n.includes("salade repas") || n.includes("plateau repas");
  };

  const flattenTree = (nodes: ApiCategoryNode[]): ApiCategoryNode[] => {
    const result: ApiCategoryNode[] = [];
    const walk = (items: ApiCategoryNode[]) => {
      items.forEach((item) => {
        result.push(item);
        if (item.children?.length) walk(item.children);
      });
    };
    walk(nodes);
    return result;
  };

  // Fetch data ONCE on mount — switching categories only re-filters locally (instant)
  useEffect(() => {
    fetchData();
  }, []);

  // Reset subcategory when parent category changes
  useEffect(() => {
    setSubCategory(null);
  }, [categoryId, categoryTitle]);

  useEffect(() => {
    if (selectedProduct) setModalMainImage(selectedProduct.image || '');
  }, [selectedProduct]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [catRes, prodRes, allProdRes] = await Promise.all([
        categoryAPI.getAllCategories(),
        productAPI.getAllProducts(1, 1000, "clients"),
        productAPI.getAllProducts(1, 1000),
      ]);

      const rawNodes = (catRes.data.categories || []) as ApiCategoryNode[];
      const allFlat = flattenTree(rawNodes);
      const byId = new Map<number, ApiCategoryNode>();
      allFlat.forEach((n) => { if (typeof n.id === 'number') byId.set(n.id, { ...n, children: [] }); });
      byId.forEach((node) => {
        if (node.parentId && byId.has(node.parentId)) byId.get(node.parentId)!.children!.push(node);
      });
      const roots = Array.from(byId.values()).filter(n => !n.parentId || !byId.has(n.parentId));
      
      setCategoryTree(roots);
      setProducts(prodRes.data.products);
      setAllProducts(allProdRes.data.products);
      setSubCategory(null);
    } catch (err) {
      setError('Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  // Filtrage des produits
  useEffect(() => {
    const currentName = (subCategory?.title || categoryTitle || "").toLowerCase();
    const allNodes = flattenTree(categoryTree);
    const currentNode = allNodes.find(c => c.name.toLowerCase() === currentName);
    const children = currentNode?.children || [];
    setChildCategories(children);

    // Si on est au niveau parent avec des sous-catégories → vide, l'user doit choisir
    if (!subCategory && children.length > 0) {
      setFilteredProducts([]);
      return;
    }

    if (products.length === 0) return;

    const filtered = currentName
      ? products.filter(p => p.available && p.category.toLowerCase() === currentName)
      : products.filter(p => p.available);

    setFilteredProducts(filtered);
  }, [categoryId, categoryTitle, subCategory, products, categoryTree]);

  const getCurrentPrice = () => {
    if (!selectedProduct) return 0;
    
    // Prix de base du produit
    let totalPrice = selectedProduct.price;
    
    // CORRECTION : Dictionnaire des prix ADDITIONNELS (pas les prix totaux)
    const optionAdditionalPrices: Record<string, number> = {
      "10 personnes": 5.00,   // 25$ - 20$ = 5$
      "13 personnes": 10.00,  // 30$ - 20$ = 10$
      "Baguette": 0,
      "Roulé pita": 0,
      "Croissant": 0,
      "Tranché": 0,
      "Non tranché": 0,
    };
    
    // Ajouter les prix additionnels des options sélectionnées
    Object.values(selectedOptions).forEach(choice => {
      if (optionAdditionalPrices[choice] !== undefined) {
        totalPrice += optionAdditionalPrices[choice];
      } else {
        // Fallback: utiliser getChoicePrice mais en le convertissant en prix additionnel
        const price = getChoicePrice(choice);
        if (price && price > selectedProduct.price) {
          // Si le prix est plus grand que le prix de base, c'est probablement le prix total
          totalPrice += (price - selectedProduct.price);
        } else if (price) {
          totalPrice += price;
        }
      }
    });
    
    return totalPrice;
  };

  const getDiscountedPrice = (price: number, discount: number = 0) => {
    return price * (1 - discount / 100);
  };

  const getRelatedProducts = (product: Product): Product[] => {
    if (!product.recommendations || product.recommendations.length === 0) return [];
    return product.recommendations
      .map((id) => allProducts.find((p) => p.id === id))
      .filter((p): p is Product => !!p);
  };

  const getPreparationBadge = (hours: number) => {
    if (hours >= 168) {
      return {
        text: '7j',
        bgColor: 'bg-amber-100',
        textColor: 'text-amber-800',
        borderColor: 'border-amber-300',
      };
    } else if (hours >= 48) {
      return {
        text: `${hours}h`,
        bgColor: 'bg-amber-100',
        textColor: 'text-amber-800',
        borderColor: 'border-amber-300',
      };
    } else if (hours >= 24) {
      return {
        text: '24h',
        bgColor: 'bg-yellow-100',
        textColor: 'text-yellow-800',
        borderColor: 'border-yellow-300',
      };
    }
    return null;
  };

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    // Réinitialiser toutes les options
    setQuantity(1);
    setAllergyNote("");
    setSelectedBread("Baguette");
    setIsSliced(false);
    setSelectedOptions({});
  };

  const handleAddToCart = () => {
    if (selectedProduct) {
      const totalPrice = getCurrentPrice();
      const discountedPrice = totalPrice * (1 - (selectedProduct.discountPercentage || 0) / 100);
      const p: any = { 
        ...selectedProduct, 
        price: discountedPrice,
        selectedOptions: selectedOptions 
      };
      for (let i = 0; i < quantity; i++) onAddToCart(p);

      // Afficher les recommandations comme notification
      const related = getRelatedProducts(selectedProduct);
      if (related.length > 0) {
        setRecommendationNotif(related);
        setShowRecommendationNotif(true);
        setTimeout(() => setShowRecommendationNotif(false), 1000000);
      }

      setSelectedProduct(null);
    }
  };

  if (loading) return <div className="py-10 text-center">Chargement des produits...</div>;

  return (
    <div className="py-8 px-4 md:px-8 bg-white/50 backdrop-blur-sm animate-in fade-in duration-500" style={{ fontFamily: '"Century Gothic", sans-serif' }}>

      {/* NOTIFICATION RECOMMANDATIONS */}
      {showRecommendationNotif && recommendationNotif.length > 0 && (
        <div className="fixed inset-0 z-99999 flex items-start justify-center pt-8 pointer-events-none">
        <div className="pointer-events-auto w-80 bg-white rounded-2xl shadow-2xl border border-stone-100 overflow-hidden animate-in slide-in-from-bottom-4 fade-in duration-300">
          <div className="bg-[#2D2A26] px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg">✨</span>
              <p className="text-white text-xs font-bold uppercase tracking-widest">Vous aimerez aussi</p>
            </div>
            <button
              onClick={() => setShowRecommendationNotif(false)}
              className="text-white/60 hover:text-white transition-colors text-lg leading-none"
            >
              ✕
            </button>
          </div>
          <div className="p-3 space-y-2 max-h-72 overflow-y-auto">
            {recommendationNotif.map((rec) => {
              const recPrice = getDiscountedPrice(rec.price, rec.discountPercentage);
              return (
                <div key={rec.id} className="flex items-center gap-3 bg-stone-50 rounded-xl p-2 hover:bg-stone-100 transition-colors">
                  <img
                    src={getImageUrl(rec.image)}
                    alt={rec.name}
                    className="w-14 h-14 rounded-lg object-cover shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#2D2A26] truncate">{rec.name}</p>
                    <p className="text-sm font-bold text-[#337957]">{recPrice.toFixed(2)} $</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      onAddToCart({ ...rec, price: recPrice });
                      setShowRecommendationNotif(false);
                    }}
                    className="shrink-0 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg bg-[#337957] text-white hover:bg-[#2D2A26] transition-colors"
                  >
                    + Panier
                  </button>
                </div>
              );
            })}
          </div>
        </div>
        </div>
      )}
      <div className="max-w-7xl mx-auto">
        
        {/* Navigation interne */}
        <div className="flex justify-between items-center mb-10">
          <button onClick={onBack} className="text-xs uppercase tracking-widest text-stone-400 hover:text-gold transition-colors">
            ← Fermer la sélection
          </button>
          {subCategory && (
            <button onClick={() => setSubCategory(null)} className="text-xs font-bold text-gold uppercase">
              Voir tout {categoryTitle}
            </button>
          )}
        </div>

        <header className="mb-12 text-center">
          <h2 className="text-2xl md:text-3xl font-medium text-dark mb-2" style={{ fontFamily: '"Century Gothic", sans-serif' }}>
            {subCategory ? subCategory.title : categoryTitle}
          </h2>
          <div className="w-16 h-1 bg-gold mx-auto rounded-full"></div>
        </header>

        {/* Sous-catégories si existantes */}
        {childCategories.length > 0 && !subCategory && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            {childCategories.map(child => (
              <div 
                key={child.id} 
                onClick={() => setSubCategory({id: child.id, title: child.name})}
                className="cursor-pointer group relative h-24 rounded-lg overflow-hidden border border-stone-100"
              >
                <img src={getImageUrl(child.image)} className="w-full h-full object-cover group-hover:scale-110 transition-transform" alt=""/>
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <span className="text-white text-xs font-bold uppercase">{child.name}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Liste des produits */}
        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
          {filteredProducts.map(product => {
            const prepBadge = product.preparationTimeHours ? getPreparationBadge(product.preparationTimeHours) : null;
            const hasDiscount = Number(product.discountPercentage) > 0;
            const discountedPrice = hasDiscount
              ? product.price * (1 - product.discountPercentage! / 100)
              : product.price;
            const showPrice = product.price > 0;

            return (
              <div
                key={product.id}
                onClick={() => handleProductClick(product)}
                className="group relative overflow-hidden rounded-xl cursor-pointer shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 bg-stone-200"
                style={{ aspectRatio: '4/5' }}
              >
                <img
                  src={getImageUrl(product.image)}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 brightness-105 contrast-[1.03]"
                  alt={product.name}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/5 to-transparent" />
                <div className="absolute top-2 left-2 flex flex-col gap-1">
                  {hasDiscount && (
                    <span className="text-[9px] font-bold bg-red-500 text-white px-1.5 py-0.5 rounded-full shadow tracking-wide">
                      -{product.discountPercentage}%
                    </span>
                  )}
                  {prepBadge && (
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full shadow tracking-wide ${prepBadge.bgColor} ${prepBadge.textColor}`}>
                      ⏱ {prepBadge.text}
                    </span>
                  )}
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-2 md:p-3">
                  <h3
                    className="text-white font-semibold text-[11px] md:text-xs leading-tight mb-1 drop-shadow-md line-clamp-2"
                    style={{ fontFamily: '"Century Gothic", sans-serif' }}
                  >
                    {product.name}
                  </h3>
                  {showPrice && (
                    <div className="flex items-center gap-1.5">
                      {hasDiscount && (
                        <span className="text-white/50 line-through text-[10px]">
                          {product.price.toFixed(2)}$
                        </span>
                      )}
                      <span className="text-white font-bold text-xs drop-shadow">
                        {discountedPrice.toFixed(2)} $
                      </span>
                    </div>
                  )}
                </div>
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <span className="bg-white/90 text-[#2D2A26] text-[10px] font-bold uppercase tracking-widest px-3 py-2 rounded-full shadow-lg">
                    Voir
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* MODAL PRODUIT - SANS FOND NOIR */}

      {selectedProduct && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          {/* Fond transparent au lieu de noir */}
          <div
            className="absolute inset-0 bg-transparent"
            onClick={() => setSelectedProduct(null)}
          />

          <div className="relative bg-white w-full md:max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row">
            
            <button
              onClick={() => setSelectedProduct(null)}
              className="absolute top-4 right-4 z-20 w-10 h-10 bg-white/80 backdrop-blur rounded-full flex items-center justify-center shadow-md hover:bg-[#337957] hover:text-white transition-all text-lg font-bold"
            >
              ✕
            </button>

            <div className="w-full md:w-1/2 shrink-0 flex flex-col">
              <div className="relative flex-1 h-56 md:h-auto min-h-0">
                <img
                  src={getImageUrl(modalMainImage || selectedProduct.image)}
                  alt={selectedProduct.name}
                  className="w-full h-full object-cover"
                />
                
                {/* Étiquette sur l'image de la modal */}
                {selectedProduct.preparationTimeHours && selectedProduct.preparationTimeHours >= 24 && (
                  <div className="absolute top-4 left-4 bg-amber-100 text-amber-800 text-sm font-bold px-4 py-2 rounded-sm border border-amber-300 shadow-md uppercase tracking-wider">
                    {selectedProduct.preparationTimeHours >= 168 ? '7j' : selectedProduct.preparationTimeHours >= 48 ? `${selectedProduct.preparationTimeHours}h` : '24h'}
                  </div>
                )}
                
                <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent md:hidden"></div>
              </div>

              {/* Galerie de photos supplémentaires */}
              {selectedProduct.images && selectedProduct.images.length > 0 && (
                <div className="flex gap-2 p-2 bg-gray-50 overflow-x-auto shrink-0">
                  {/* Miniature de la photo principale */}
                  <button
                    type="button"
                    onClick={() => setModalMainImage(selectedProduct.image || '')}
                    className={`w-14 h-14 rounded-lg overflow-hidden border-2 transition-all shrink-0 ${
                      (modalMainImage === selectedProduct.image || (!modalMainImage && true))
                        ? 'border-[#337957]'
                        : 'border-gray-200'
                    }`}
                  >
                    <img src={getImageUrl(selectedProduct.image)} alt="" className="w-full h-full object-cover" />
                  </button>
                  {/* Miniatures des photos supplémentaires */}
                  {selectedProduct.images.map((img, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setModalMainImage(img)}
                      className={`w-14 h-14 rounded-lg overflow-hidden border-2 transition-all shrink-0 ${
                        modalMainImage === img ? 'border-[#337957]' : 'border-gray-200'
                      }`}
                    >
                      <img src={getImageUrl(img)} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="w-full md:w-1/2 flex flex-col h-[60vh] md:h-[80vh] overflow-hidden">
              
              <div 
                className="flex-1 overflow-y-auto p-6 md:p-8" 
                style={{ 
                  WebkitOverflowScrolling: 'touch',
                  scrollbarWidth: 'thin',
                  scrollbarColor: '#337957 #f1f1f1'
                }}
              >
                
                <span className="text-[#337957] text-xs font-bold uppercase tracking-widest mb-2 block">
                  Artisan Pâtissier
                </span>
                
                <h2 className="text-2xl md:text-3xl font-medium mb-2 text-[#2D2A26]" style={{ fontFamily: '"Century Gothic", sans-serif' }}>
                  {selectedProduct.name}
                </h2>
                
                <div className="text-2xl font-medium text-[#337957] mb-6">
                  {/* Prix de base */}
                  <div className="mb-2">
                    {selectedProduct.discountPercentage && selectedProduct.discountPercentage > 0 ? (
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-base text-stone-400 line-through">
                          {selectedProduct.price.toFixed(2)} $
                        </span>
                        <span>
                          {getDiscountedPrice(selectedProduct.price, selectedProduct.discountPercentage).toFixed(2)} $
                        </span>
                        <span className="text-[11px] font-bold bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                          -{selectedProduct.discountPercentage}%
                        </span>
                      </div>
                    ) : (
                      <span>{selectedProduct.price.toFixed(2)} $</span>
                    )}
                    {selectedProduct.hasTaxes && (
                      <span className="text-xs text-stone-400 ml-2 font-normal">
                        + taxes
                      </span>
                    )}
                  </div>
                  
                  {/* Prix avec options (seulement si des options sont sélectionnées) */}
                  {Object.keys(selectedOptions).length > 0 && (
                    <div className="text-sm text-stone-500 border-t pt-2 mt-2">
                      Prix avec options : <span className="text-[#337957] font-bold">{getCurrentPrice().toFixed(2)} $</span>
                    </div>
                  )}
                </div>

                {/* JOURS DE DISPONIBILITÉ — affiché en premier pour bien le voir */}
                {selectedProduct.availableDays && selectedProduct.availableDays.length > 0 && (
                  <div className="mb-4 p-4 rounded-lg border border-blue-200 bg-blue-50">
                    <span className="text-xs font-bold uppercase tracking-widest text-blue-700 block mb-2">
                      Disponible uniquement
                    </span>
                    <p className="text-sm font-medium text-blue-800">
                      {selectedProduct.availableDays
                        .slice()
                        .sort((a, b) => a - b)
                        .map((d) => ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"][d])
                        .join(", ")}
                    </p>
                  </div>
                )}

                {/* ALLERGÈNES (SI SPÉCIFIÉ DANS LE PRODUIT) */}
                {selectedProduct.allergens && (
                  <div className="mb-4 flex items-center gap-2 text-red-600 bg-red-50 p-2 rounded border border-red-100">
                    <span className="text-xs font-bold uppercase">Allergènes :</span>
                    <span className="text-sm">{selectedProduct.allergens}</span>
                  </div>
                )}

                {/* OPTIONS DYNAMIQUES DU PRODUIT */}
                {selectedProduct.customOptions && selectedProduct.customOptions.length > 0 && (
                  <div className="space-y-6 mb-6">
                    {selectedProduct.customOptions.map((option, idx) => (
                      <div key={idx}>
                        <h4 className="text-xs font-bold uppercase mb-2 text-stone-500 flex items-center gap-2">
                          <span className="w-1 h-4 bg-[#337957] rounded-full"></span>
                          {option.name}
                        </h4>
                        <div className="flex gap-2 flex-wrap">
                          {option.choices.map((choice) => {
                            const displayText = formatChoiceDisplay(choice) || choice;
                            // Prix additionnel pour l'affichage
                            let additionalPrice = 0;
                            if (choice === "10 personnes") additionalPrice = 5.00;
                            else if (choice === "13 personnes") additionalPrice = 10.00;
                            
                            return (
                              <button
                                key={`${option.name}-${displayText}`}
                                type="button"
                                onClick={() =>
                                  setSelectedOptions((prev) => ({
                                    ...prev,
                                    [option.name]: choice,
                                  }))
                                }
                                className={`flex-1 py-3 px-2 rounded text-sm font-medium transition-all min-w-[100px] ${
                                  selectedOptions[option.name] === choice
                                    ? "bg-[#337957] text-white shadow-md"
                                    : "bg-white border border-stone-200 text-stone-600 hover:bg-stone-50"
                                }`}
                              >
                                <div>{displayText}</div>
                                {additionalPrice > 0 && (
                                  <div className="text-[10px] opacity-80">+{additionalPrice.toFixed(2)}$</div>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* OPTIONS POUR LES PAINS (Legacy support if not using customOptions) */}
                {selectedProduct?.category === "Pains" && !selectedProduct.customOptions?.length && (
                  <>
                    <div className="mb-6">
                      <h4 className="text-xs font-bold uppercase mb-2 text-stone-500 flex items-center gap-2">
                        <span className="w-1 h-4 bg-[#337957] rounded-full"></span>
                        Tranché ?
                      </h4>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setIsSliced(true)}
                          className={`flex-1 py-3 px-2 rounded text-sm font-medium transition-all ${
                            isSliced
                              ? "bg-[#337957] text-white shadow-md"
                              : "bg-white border border-stone-200 text-stone-600 hover:bg-stone-50"
                          }`}
                        >
                          Tranché
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsSliced(false)}
                          className={`flex-1 py-3 px-2 rounded text-sm font-medium transition-all ${
                            !isSliced
                              ? "bg-[#337957] text-white shadow-md"
                              : "bg-white border border-stone-200 text-stone-600 hover:bg-stone-50"
                          }`}
                        >
                          Non tranché
                        </button>
                      </div>
                    </div>
                  </>
                )}

                <p className="text-stone-600 mb-6 font-light leading-relaxed text-sm md:text-base">
                  {selectedProduct.description}
                </p>

                {/* TEMPS DE PRÉPARATION */}
                {selectedProduct.preparationTimeHours && selectedProduct.preparationTimeHours > 0 && (
                  <div
                    className="mb-6 p-4 rounded-lg border"
                    style={{
                      backgroundColor:
                        selectedProduct.preparationTimeHours >= 168
                          ? "#fffbeb"
                          : selectedProduct.preparationTimeHours >= 48
                          ? "#fffbeb"
                          : selectedProduct.preparationTimeHours >= 24
                          ? "#fefce8"
                          : selectedProduct.preparationTimeHours >= 12
                          ? "#fffbeb"
                          : "#f0fdf4",
                      borderColor:
                        selectedProduct.preparationTimeHours >= 168
                          ? "#fcd34d"
                          : selectedProduct.preparationTimeHours >= 48
                          ? "#fcd34d"
                          : selectedProduct.preparationTimeHours >= 24
                          ? "#fde047"
                          : selectedProduct.preparationTimeHours >= 12
                          ? "#fde68a"
                          : "#bbf7d0",
                    }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className="text-xs font-bold uppercase tracking-widest"
                        style={{
                          color:
                            selectedProduct.preparationTimeHours >= 168
                              ? "#b45309"
                              : selectedProduct.preparationTimeHours >= 48
                              ? "#b45309"
                              : selectedProduct.preparationTimeHours >= 24
                              ? "#a16207"
                              : selectedProduct.preparationTimeHours >= 12
                              ? "#d97706"
                              : "#16a34a",
                        }}
                      >
                        Préparation requise
                      </span>
                    </div>
                    <p
                      className="text-sm font-medium"
                      style={{
                        color:
                          selectedProduct.preparationTimeHours >= 168
                            ? "#b45309"
                            : selectedProduct.preparationTimeHours >= 48
                            ? "#b45309"
                            : selectedProduct.preparationTimeHours >= 24
                            ? "#a16207"
                            : selectedProduct.preparationTimeHours >= 12
                            ? "#d97706"
                            : "#16a34a",
                      }}
                    >
                      {selectedProduct.preparationTimeHours >= 48
                        ? `Commande à passer ${selectedProduct.preparationTimeHours / 24} jour${selectedProduct.preparationTimeHours / 24 > 1 ? "s" : ""} à l'avance minimum`
                        : selectedProduct.preparationTimeHours >= 24
                        ? `Préparation en ${selectedProduct.preparationTimeHours} heures - planifiez à l'avance`
                        : selectedProduct.preparationTimeHours >= 12
                        ? `Préparation en ${selectedProduct.preparationTimeHours} heures - commandez tôt`
                        : `Prêt en ${selectedProduct.preparationTimeHours} heure${selectedProduct.preparationTimeHours > 1 ? "s" : ""}`}
                    </p>
                  </div>
                )}

                {/* JOURS DE DISPONIBILITÉ déplacé en haut (déjà affiché avant allergènes) */}

                {/* OPTIONS BOÎTE À LUNCH (Legacy support) */}
                {isLunchCategory(selectedProduct?.category || "") && !selectedProduct.customOptions?.length && (
                  <>
                    <div className="mb-6">
                      <h4 className="text-xs font-bold uppercase mb-2 text-stone-500 flex items-center gap-2">
                        <span className="w-1 h-4 bg-[#337957] rounded-full"></span>
                        Pain
                      </h4>
                      <div className="flex gap-2 flex-wrap">
                        {["Baguette", "Roulé pita", "Croissant"].map((pain) => (
                          <button
                            key={pain}
                            type="button"
                            onClick={() => setSelectedBread(pain)}
                            className={`flex-1 py-3 px-2 rounded text-sm font-medium transition-all ${
                              selectedBread === pain
                                ? "bg-[#337957] text-white shadow-md"
                                : "bg-white border border-stone-200 text-stone-600 hover:bg-stone-50"
                            }`}
                          >
                            {pain}
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <div className="mb-6">
                      <h4 className="text-xs font-bold uppercase mb-2 text-stone-500 flex items-center gap-2">
                        <span className="w-1 h-4 bg-red-400 rounded-full"></span>
                        Allergies ?
                      </h4>
                      <textarea
                        value={allergyNote}
                        onChange={(e) => setAllergyNote(e.target.value)}
                        placeholder="Ex: Arachides, Sans gluten..."
                        className="w-full p-3 border border-stone-200 rounded-lg text-sm focus:outline-none focus:border-[#337957] bg-stone-50"
                        rows={2}
                      />
                    </div>
                  </>
                )}



                {/* ESPACE SUPPLÉMENTAIRE POUR LE SCROLL */}
                <div className="h-12 md:h-8"></div>
              </div>

              {/* BOUTONS FIXES EN BAS */}
              <div className="bg-white border-t border-stone-100 p-4 md:p-6 shrink-0">
                <div className="flex gap-4">
                  <div className="flex items-center border border-stone-200 rounded-lg h-14 shrink-0">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-4 h-full hover:bg-stone-50 text-xl text-stone-500 transition-colors"
                    >
                      -
                    </button>
                    <span className="px-3 font-bold min-w-[3rem] text-center text-[#2D2A26]">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="px-4 h-full hover:bg-stone-50 text-xl text-stone-500 transition-colors"
                    >
                      +
                    </button>
                  </div>
                  
                  <button
                    onClick={handleAddToCart}
                    className="flex-1 bg-[#2D2A26] text-white h-14 rounded-lg font-bold uppercase tracking-widest text-xs hover:bg-[#337957] transition-all shadow-lg active:scale-95"
                  >
                    Ajouter
                    <span className="ml-2 opacity-70 font-normal normal-case hidden sm:inline">
                      au panier
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      , document.body)}
    </div>
  );
};

export default ProductSelection;