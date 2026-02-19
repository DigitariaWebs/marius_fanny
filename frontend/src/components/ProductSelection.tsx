import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { productAPI } from '../lib/ProductAPI';
import { categoryAPI } from '../lib/CategoryAPI';
import type { Product, Category as CategoryType } from '../types';
import { getImageUrl } from '../utils/api';

const styles = {
  gold: '#C5A065',
  dark: '#2D2A26',
  fontScript: '"Great Vibes", cursive',
  fontSans: '"Inter", sans-serif',
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
  categoryTitle,
  onBack,
  onAddToCart,
}) => {
  const location = useLocation();
  const navigate = useNavigate();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Category tree from API
  const [categoryTree, setCategoryTree] = useState<ApiCategoryNode[]>([]);

  const [currentCategory, setCurrentCategory] = useState<{
    id: number;
    title: string;
  } | null>(null);
  const [subCategory, setSubCategory] = useState<{
    id: number;
    title: string;
  } | null>(null);
  const [childCategories, setChildCategories] = useState<ApiCategoryNode[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const [quantity, setQuantity] = useState(1);
  const [cakeSize, setCakeSize] = useState<"6" | "12">("6");
  const [allergyNote, setAllergyNote] = useState("");
  const [selectedBread, setSelectedBread] = useState<string>("Baguette");
  const [isSliced, setIsSliced] = useState<boolean>(false);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});

  const isLunchCategory = (category: string) => {
    return [
      "Boîtes à lunch",
      "Boite à lunch",
      "Boîte à lunch",
      "Salade repas",
      "Plateau repas",
      "Option végétarienne"
    ].includes(category);
  };

  // Flatten API tree to get all nodes, then rebuild from parentId
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

  // Find a category node by ID in the flat list
  const findCategoryById = (id: number): ApiCategoryNode | undefined => {
    const all = flattenTree(categoryTree);
    return all.find((c) => c.id === id);
  };

  // Get all descendant category names for product filtering
  const getDescendantNames = (node: ApiCategoryNode): string[] => {
    const names: string[] = [node.name];
    if (node.children?.length) {
      node.children.forEach((child) => {
        names.push(...getDescendantNames(child));
      });
    }
    return names;
  };

  useEffect(() => {
    fetchCategoriesAndProducts();
  }, []);

  const fetchCategoriesAndProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const [catRes, prodRes] = await Promise.all([
        categoryAPI.getAllCategories(),
        productAPI.getAllProducts(),
      ]);

      // Rebuild tree from parentId to handle any shape from API
      const rawNodes = (catRes.data.categories || []) as ApiCategoryNode[];
      const allFlat = flattenTree(rawNodes);
      const byId = new Map<number, ApiCategoryNode>();
      allFlat.forEach((n) => {
        if (typeof n.id === 'number') {
          byId.set(n.id, { ...n, children: [] });
        }
      });
      byId.forEach((node) => {
        if (node.parentId && byId.has(node.parentId)) {
          byId.get(node.parentId)!.children!.push(node);
        }
      });
      const roots = Array.from(byId.values()).filter(
        (n) => !n.parentId || !byId.has(n.parentId)
      );
      setCategoryTree(roots);
      setProducts(prodRes.data.products);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentCategory, subCategory]);

  useEffect(() => {
    setQuantity(1);
    setCakeSize("6");
    setAllergyNote("");
    setSelectedBread("Baguette");
    setIsSliced(false);
    setSelectedOptions({});
  }, [selectedProduct]);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const urlCategoryId = searchParams.get("category");
    const urlCategoryTitle = searchParams.get("title");

    let activeId: number | null = null;
    let activeTitle: string = "";

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

  // When currentCategory changes, find its children in the tree
  useEffect(() => {
    if (!currentCategory || categoryTree.length === 0) return;
    const node = findCategoryById(currentCategory.id);
    if (node && node.children && node.children.length > 0) {
      setChildCategories(node.children);
    } else {
      setChildCategories([]);
    }
  }, [currentCategory, categoryTree]);

  useEffect(() => {
    if (!currentCategory || products.length === 0) return;

    // Determine which category names to filter products by
    let targetNames: string[] = [];

    if (subCategory) {
      // A sub-category is selected: show products from it and its descendants
      const subNode = findCategoryById(subCategory.id);
      if (subNode) {
        targetNames = getDescendantNames(subNode);
      } else {
        targetNames = [subCategory.title];
      }
    } else if (childCategories.length > 0) {
      // Parent has children but none selected yet: show ALL products (parent + all descendants)
      const parentNode = findCategoryById(currentCategory.id);
      if (parentNode) {
        targetNames = getDescendantNames(parentNode);
      } else {
        targetNames = [currentCategory.title];
      }
    } else {
      // Leaf category: show products matching this category name
      targetNames = [currentCategory.title];
    }

    const lowerNames = targetNames.map((n) => n.toLowerCase());

    const filtered = products.filter((p) => {
      if (!p.available) return false;
      return lowerNames.includes(p.category.toLowerCase());
    });
    setFilteredProducts(filtered);
  }, [currentCategory, subCategory, childCategories, products, categoryTree]);

  const handleBack = () => {
    if (subCategory) {
      // Go back to the parent category (show sub-categories)
      setSubCategory(null);
      return;
    }
    if (onBack) onBack();
    else navigate(-1);
  };

  const getCurrentPrice = () => {
    if (!selectedProduct) return 0;
    let price = selectedProduct.price;
    // For cakes, add size pricing (this logic might need to be updated based on your actual products)
    if (selectedProduct.category === "Gâteaux" && cakeSize === "12") {
      price += 21.5; // This is a placeholder - adjust based on your pricing logic
    }
    return price;
  };

  const handleAddToCart = () => {
    if (selectedProduct) {
      const productToAdd: any = { ...selectedProduct };

      // Handle cake sizing
      if (selectedProduct.category === "Gâteaux") {
        if (cakeSize === "12") {
          productToAdd.price += 21.5;
          productToAdd.name = `${productToAdd.name} (12 pers.)`;
          productToAdd.selectedSize = "12 personnes";
        } else {
          productToAdd.name = `${productToAdd.name} (6 pers.)`;
          productToAdd.selectedSize = "6 personnes";
        }
      }

      // Handle bread slicing
      if (selectedProduct.category === "Pains") {
        productToAdd.isSliced = isSliced;
        if (isSliced) {
          productToAdd.name = `${productToAdd.name} (Tranché)`;
        } else {
          productToAdd.name = `${productToAdd.name} (Non tranché)`;
        }
      }

      // Handle lunch box options
      if (isLunchCategory(selectedProduct.category)) {
        productToAdd.selectedBread = selectedBread;
        
        // Append selected bread to the product name for the cart
        if (selectedBread) {
          productToAdd.name = `${productToAdd.name} (${selectedBread})`;
        }
        
        if (allergyNote.trim() !== "") {
          productToAdd.userAllergies = allergyNote;
        }
      }

      // Handle dynamic custom options
      if (selectedOptions && Object.keys(selectedOptions).length > 0) {
        productToAdd.selectedOptions = { ...selectedOptions };
        // Optionally append to name for clarity in cart
        const optionsString = Object.entries(selectedOptions)
          .map(([name, choice]) => `${name}: ${choice}`)
          .join(", ");
        productToAdd.name = `${productToAdd.name} (${optionsString})`;
      }

      for (let i = 0; i < quantity; i++) {
        onAddToCart(productToAdd);
      }
      setSelectedProduct(null);
    }
  };

  useEffect(() => {
    if (selectedProduct) {
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
      document.documentElement.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
      document.documentElement.style.overflow = "unset";
    };
  }, [selectedProduct]);

  if (!currentCategory)
    return (
      <div className="min-h-screen flex items-center justify-center text-[#C5A065]">
        Chargement des délices...
      </div>
    );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C5A065] mx-auto mb-4"></div>
          <p className="text-[#C5A065] text-lg">Chargement des produits...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Erreur de chargement</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchCategoriesAndProducts}
            className="bg-[#C5A065] hover:bg-[#2D2A26] text-white px-6 py-2 rounded-lg transition-colors"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  const showSubCategories = childCategories.length > 0 && !subCategory;

  return (
    <div
      className="min-h-screen py-16 px-4 md:px-8 relative fade-in bg-transparent"
      style={{ fontFamily: styles.fontSans, color: styles.dark }}
    >
      <div className="max-w-7xl mx-auto">
        <nav className="flex items-center gap-3 mb-8 text-sm uppercase tracking-widest font-medium text-stone-500">
          <button
            onClick={handleBack}
            className="hover:text-[#C5A065] transition-colors flex items-center gap-2 group"
          >
            <span className="w-8 h-px bg-stone-400 group-hover:bg-[#C5A065] transition-colors"></span>
            Retour
          </button>
          <span className="opacity-30">|</span>
          <span className="text-[#C5A065]">
            {subCategory ? subCategory.title : currentCategory.title}
          </span>
        </nav>

        <header className="mb-20 text-center relative">
          <h1
            className="text-6xl md:text-7xl mb-6"
            style={{ fontFamily: styles.fontScript, color: styles.dark }}
          >
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
            {childCategories.map((child) => (
              <div
                key={child.id}
                onClick={() => setSubCategory({ id: child.id, title: child.name })}
                className="group relative h-80 overflow-hidden rounded-xl cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-500 border-4 border-white"
              >
                <img
                  src={getImageUrl(child.image, './gateau.jpg')}
                  alt={child.name}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-colors" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <h3 className="text-white text-4xl font-serif drop-shadow-lg">
                    {child.name}
                  </h3>
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
                  <img
                    src={getImageUrl(product.image)}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                </div>
                <div className="p-6 text-center grow">
                  <h3 className="text-xl font-serif mb-2 text-[#2D2A26] group-hover:text-[#C5A065] transition-colors">
                    {product.name}
                  </h3>
                  <p className="text-sm text-stone-500 line-clamp-2 mb-4 font-light">
                    {product.description}
                  </p>
                  <div className="mt-auto pt-4 border-t border-stone-100">
                    <span className="text-lg font-bold text-[#C5A065]">
                      {product.price.toFixed(2)} $
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODAL PRODUIT - AVEC SCROLL CORRIGÉ */}
      {selectedProduct && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-[#2D2A26]/90 backdrop-blur-md transition-opacity"
            onClick={() => setSelectedProduct(null)}
          />

          <div className="relative bg-white w-full md:max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row">
            
            <button
              onClick={() => setSelectedProduct(null)}
              className="absolute top-4 right-4 z-20 w-10 h-10 bg-white/80 backdrop-blur rounded-full flex items-center justify-center shadow-md hover:bg-[#C5A065] hover:text-white transition-all text-lg font-bold"
            >
              ✕
            </button>

            <div className="w-full md:w-1/2 h-64 md:h-auto shrink-0 relative">
              <img
                src={getImageUrl(selectedProduct.image)}
                alt={selectedProduct.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent md:hidden"></div>
            </div>

            <div className="w-full md:w-1/2 flex flex-col h-[60vh] md:h-[80vh] overflow-hidden">
              
              <div 
                className="flex-1 overflow-y-auto p-6 md:p-8" 
                style={{ 
                  WebkitOverflowScrolling: 'touch',
                  scrollbarWidth: 'thin',
                  scrollbarColor: '#C5A065 #f1f1f1'
                }}
              >
                
                <span className="text-[#C5A065] text-xs font-bold uppercase tracking-widest mb-2 block">
                  Artisan Pâtissier
                </span>
                
                <h2 className="text-2xl md:text-3xl font-serif mb-2 text-[#2D2A26]">
                  {selectedProduct.name}
                </h2>
                
                <div className="text-2xl font-medium text-[#C5A065] mb-6">
                  {getCurrentPrice().toFixed(2)} $
                  {selectedProduct.hasTaxes && (
                    <span className="text-xs text-stone-400 ml-2 font-normal">
                      + taxes
                    </span>
                  )}
                </div>

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
                          <span className="w-1 h-4 bg-[#C5A065] rounded-full"></span>
                          {option.name}
                        </h4>
                        <div className="flex gap-2 flex-wrap">
                          {option.choices.map((choice) => (
                            <button
                              key={choice}
                              type="button"
                              onClick={() => setSelectedOptions(prev => ({ ...prev, [option.name]: choice }))}
                              className={`flex-1 py-3 px-2 rounded text-sm font-medium transition-all min-w-[100px] ${
                                selectedOptions[option.name] === choice
                                  ? "bg-[#C5A065] text-white shadow-md"
                                  : "bg-white border border-stone-200 text-stone-600 hover:bg-stone-50"
                              }`}
                            >
                              {choice}
                            </button>
                          ))}
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
                        <span className="w-1 h-4 bg-[#C5A065] rounded-full"></span>
                        Tranché ?
                      </h4>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setIsSliced(true)}
                          className={`flex-1 py-3 px-2 rounded text-sm font-medium transition-all ${
                            isSliced
                              ? "bg-[#C5A065] text-white shadow-md"
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
                              ? "bg-[#C5A065] text-white shadow-md"
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
                        selectedProduct.preparationTimeHours >= 24
                          ? "#fef2f2"
                          : selectedProduct.preparationTimeHours >= 12
                          ? "#fffbeb"
                          : "#f0fdf4",
                      borderColor:
                        selectedProduct.preparationTimeHours >= 24
                          ? "#fecaca"
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
                            selectedProduct.preparationTimeHours >= 24
                              ? "#dc2626"
                              : selectedProduct.preparationTimeHours >= 12
                              ? "#d97706"
                              : "#16a34a",
                        }}
                      >
                        ⏰ Préparation requise
                      </span>
                    </div>
                    <p
                      className="text-sm font-medium"
                      style={{
                        color:
                          selectedProduct.preparationTimeHours >= 24
                            ? "#dc2626"
                            : selectedProduct.preparationTimeHours >= 12
                            ? "#d97706"
                            : "#16a34a",
                      }}
                    >
                      {selectedProduct.preparationTimeHours >= 24
                        ? `Commande à passer ${selectedProduct.preparationTimeHours / 24} jour${selectedProduct.preparationTimeHours / 24 > 1 ? "s" : ""} à l'avance minimum`
                        : selectedProduct.preparationTimeHours >= 12
                        ? `Préparation en ${selectedProduct.preparationTimeHours} heures - planifiez à l'avance`
                        : `Prêt en ${selectedProduct.preparationTimeHours} heure${selectedProduct.preparationTimeHours > 1 ? "s" : ""}`}
                    </p>
                  </div>
                )}

                {/* OPTIONS GÂTEAUX */}
                {(selectedProduct.id === 101 || selectedProduct.id === 103) && (
                  <div className="mb-6 bg-stone-50 p-4 rounded-lg border border-stone-100">
                    <h4 className="text-xs font-bold uppercase mb-3 text-stone-500">
                      Choisissez la taille
                    </h4>
                    <div className="flex gap-3">
                      <button
                        onClick={() => setCakeSize("6")}
                        className={`flex-1 py-3 px-3 rounded text-sm font-medium transition-all ${
                          cakeSize === "6"
                            ? "bg-[#C5A065] text-white shadow-md"
                            : "bg-white border border-stone-200 text-stone-600 hover:bg-stone-50"
                        }`}
                      >
                        6 Pers.
                      </button>
                      <button
                        onClick={() => setCakeSize("12")}
                        className={`flex-1 py-3 px-3 rounded text-sm font-medium transition-all ${
                          cakeSize === "12"
                            ? "bg-[#C5A065] text-white shadow-md"
                            : "bg-white border border-stone-200 text-stone-600 hover:bg-stone-50"
                        }`}
                      >
                        12 Pers.
                        <span className="text-[10px] block opacity-80">+21.50$</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* OPTIONS BOÎTE À LUNCH (Legacy support) */}
                {isLunchCategory(selectedProduct?.category || "") && !selectedProduct.customOptions?.length && (
                  <>
                    <div className="mb-6">
                      <h4 className="text-xs font-bold uppercase mb-2 text-stone-500 flex items-center gap-2">
                        <span className="w-1 h-4 bg-[#C5A065] rounded-full"></span>
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
                                ? "bg-[#C5A065] text-white shadow-md"
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
                        className="w-full p-3 border border-stone-200 rounded-lg text-sm focus:outline-none focus:border-[#C5A065] bg-stone-50"
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
                    className="flex-1 bg-[#2D2A26] text-white h-14 rounded-lg font-bold uppercase tracking-widest text-xs hover:bg-[#C5A065] transition-all shadow-lg active:scale-95"
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
      )}
    </div>
  );
};

export default ProductSelection;