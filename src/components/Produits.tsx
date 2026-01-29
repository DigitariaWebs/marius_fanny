import React, { useState } from 'react';
import { X, Plus, Minus, ShoppingCart } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  color: string;
}

interface Product {
  id: number;
  image: string;
  name: string;
  price: number;
}

interface CartItem extends Product {
  quantity: number;
}

type ProductsData = {
  [key: string]: Product[];
}

const ProductsSection: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);

  // Catégories de produits
  const categories: Category[] = [
    { id: 'pains', name: 'PAINS', color: 'bg-[#E8DCC4]' },
    { id: 'viennoiseries', name: 'VIENNOISERIES', color: 'bg-[#FFB6C1]' },
    { id: 'chocolats', name: 'CHOCOLATS', color: 'bg-[#D4A574]' },
    { id: 'macarons', name: 'MACARONS', color: 'bg-[#B8E6D5]' },
    { id: 'alacarte', name: 'À LA CARTE', color: 'bg-[#E8DCC4]' },
    { id: 'boitelunch', name: 'BOÎTE À LUNCH', color: 'bg-[#FFB6C1]' },
    { id: 'petitdej', name: "P'TIT DÉJ", color: 'bg-[#D4A574]' },
    { id: 'galettes', name: 'GALETTES DES ROIS', color: 'bg-[#B8E6D5]' },
    { id: 'canapes', name: 'CANAPÉS', color: 'bg-[#E8DCC4]' },
    { id: 'bouchees', name: 'BOUCHÉES CHAUDES', color: 'bg-[#FFB6C1]' },
    { id: 'brochettes', name: 'BROCHETTES', color: 'bg-[#D4A574]' },
  ];

  const products: ProductsData = {
    pains: [
      { id: 1, image: 'pain1.jpg', name: 'Baguette Tradition', price: 2.50 },
      { id: 2, image: 'pain2.jpg', name: 'Pain Complet', price: 3.00 },
    ],
    viennoiseries: [
      { id: 3, image: 'croi1.jpg', name: 'Croissant', price: 1.50 },
    ],
    chocolats: [
      { id: 5, image: 'boite_chocolat.png', name: 'Truffes', price: 12.00 },
    ],
    macarons: [
      { id: 6, image: '', name: 'Macarons Assortis', price: 15.00 },
    ],
    alacarte: [
      { id: 7, image: '', name: 'Plateau à la Carte', price: 25.00 },
    ],
    boitelunch: [
      { id: 8, image: '', name: 'Boîte Lunch Premium', price: 18.00 },
    ],
    petitdej: [
      { id: 9, image: '', name: 'Petit Déjeuner Complet', price: 12.00 },
    ],
    galettes: [
      { id: 10, image: '', name: 'Galette des Rois', price: 22.00 },
    ],
    canapes: [
      { id: 11, image: '', name: 'Plateau Canapés', price: 35.00 },
    ],
    bouchees: [
      { id: 12, image: '', name: 'Bouchées Chaudes', price: 28.00 },
    ],
    brochettes: [
      { id: 13, image: '', name: 'Brochettes Gourmandes', price: 24.00 },
    ],
  };

  const addToCart = (product: Product): void => {
    const existingItem = cart.find(item => item.id === product.id);
    
    if (existingItem) {
      setCart(cart.map(item =>
        item.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
    
    setIsCartOpen(true);
  };

  const increaseQuantity = (productId: number): void => {
    setCart(cart.map(item =>
      item.id === productId
        ? { ...item, quantity: item.quantity + 1 }
        : item
    ));
  };

  // Diminuer la quantité
  const decreaseQuantity = (productId: number): void => {
    const item = cart.find(item => item.id === productId);
    
    if (item && item.quantity === 1) {
      removeFromCart(productId);
    } else {
      setCart(cart.map(item =>
        item.id === productId
          ? { ...item, quantity: item.quantity - 1 }
          : item
      ));
    }
  };

  // Retirer du panier
  const removeFromCart = (productId: number): void => {
    setCart(cart.filter(item => item.id !== productId));
  };

  // Calculer le total
  const calculateTotal = (): string => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0).toFixed(2);
  };

  // Nombre total d'articles
  const getTotalItems = (): number => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  return (
    <section className="min-h-screen bg-[#F5F5F0] py-20 px-6 relative">
      <div className="max-w-7xl mx-auto">
        
        {/* Titre de la section */}
        <div className="text-center mb-16">
          <h2 className="text-5xl md:text-6xl font-black text-[#1A1A1A] mb-4 uppercase tracking-tight">
            Nos Créations
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Découvrez notre gamme de produits artisanaux
          </p>
        </div>

        {/* Grille de catégories (pills) */}
        <div className="flex flex-wrap gap-3 mb-12 justify-center">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`
                px-6 py-3 rounded-full font-bold text-sm uppercase tracking-wider
                transition-all duration-300 hover:scale-105 border-2
                ${selectedCategory === category.id 
                  ? `${category.color} border-[#1A1A1A] text-[#1A1A1A]` 
                  : 'bg-white border-gray-300 text-gray-700 hover:border-gray-400'
                }
              `}
            >
              {category.name}
            </button>
          ))}
        </div>

        {/* Grille de produits */}
        {selectedCategory && products[selectedCategory] && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-fadeIn">
            {products[selectedCategory].map((product) => (
              <div 
                key={product.id}
                className="group relative bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500"
              >
                {/* Image du produit */}
                <div className="aspect-square overflow-hidden bg-gray-200">
                  {product.image ? (
                    <img 
                      src={product.image} 
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      Image à venir
                    </div>
                  )}
                </div>

                {/* Info produit */}
                <div className="p-6 text-center">
                  <h3 className="font-bold text-xl text-[#1A1A1A] mb-2 uppercase tracking-wide">
                    {product.name || 'Nom du produit'}
                  </h3>
                  <p className="text-bakery-gold text-2xl font-black mb-4">
                    ${product.price.toFixed(2)}
                  </p>
                  
                  {/* Bouton Ajouter au panier */}
                  <button
                    onClick={() => addToCart(product)}
                    className="w-full bg-[#FFB6C1] text-[#1A1A1A] font-bold py-3 rounded-full uppercase text-sm tracking-wider hover:bg-[#FF9AB0] transition-colors duration-300 flex items-center justify-center gap-2"
                  >
                    <Plus size={18} />
                    Ajouter au panier
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Message si aucune catégorie sélectionnée */}
        {!selectedCategory && (
          <div className="text-center py-20">
            <p className="text-gray-500 text-xl">
              Sélectionnez une catégorie pour voir nos produits
            </p>
          </div>
        )}
      </div>

      {/* Bouton Panier Flottant */}
      {cart.length > 0 && (
        <button
          onClick={() => setIsCartOpen(true)}
          className="fixed bottom-8 right-8 bg-[#FFB6C1] text-[#1A1A1A] p-4 rounded-full shadow-2xl hover:scale-110 transition-transform duration-300 z-40"
        >
          <ShoppingCart size={28} />
          <span className="absolute -top-2 -right-2 bg-[#1A1A1A] text-white w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold">
            {getTotalItems()}
          </span>
        </button>
      )}

      {/* Modal Panier - Style comme l'image */}
      {isCartOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-hidden shadow-2xl animate-slideUp">
            
            {/* Header */}
            <div className="bg-white border-b border-gray-200 p-6 flex items-center justify-between">
              <h2 className="text-2xl font-black uppercase text-[#1A1A1A]">Panier</h2>
              <button
                onClick={() => setIsCartOpen(false)}
                className="text-gray-600 hover:text-[#1A1A1A] transition-colors"
              >
                <X size={28} />
              </button>
            </div>

            {/* Liste des produits */}
            <div className="overflow-y-auto max-h-[60vh] p-6">
              {cart.length === 0 ? (
                <p className="text-center text-gray-500 py-10">Votre panier est vide</p>
              ) : (
                <div className="space-y-4">
                  {cart.map((item) => (
                    <div key={item.id} className="flex items-center gap-4 pb-4 border-b border-gray-200">
                      {/* Image */}
                      <div className="w-20 h-20 rounded-2xl overflow-hidden bg-gray-200 flex-shrink-0">
                        {item.image ? (
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                            Image
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1">
                        <h3 className="font-bold text-[#1A1A1A] uppercase text-sm">
                          {item.name || 'Produit'}
                        </h3>
                        <p className="text-gray-600 font-bold">$ {item.price.toFixed(2)}</p>
                      </div>

                      {/* Contrôles quantité */}
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => decreaseQuantity(item.id)}
                          className="w-8 h-8 rounded-full bg-[#1E8B9E] text-white flex items-center justify-center hover:bg-[#156B7A] transition-colors"
                        >
                          <Minus size={16} />
                        </button>
                        
                        <span className="font-bold text-lg w-8 text-center">{item.quantity}</span>
                        
                        <button
                          onClick={() => increaseQuantity(item.id)}
                          className="w-8 h-8 rounded-full bg-[#FFB6C1] text-white flex items-center justify-center hover:bg-[#FF9AB0] transition-colors"
                        >
                          <Plus size={16} />
                        </button>
                      </div>

                      {/* Bouton Remove */}
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-gray-500 hover:text-red-500 text-sm font-medium transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer - Bouton Commander */}
            {cart.length > 0 && (
              <div className="bg-white border-t border-gray-200 p-6">
                <button className="w-full bg-[#FFB6C1] text-[#1A1A1A] font-black text-lg py-4 rounded-full uppercase tracking-wider hover:bg-[#FF9AB0] transition-colors duration-300">
                  Commander · ${calculateTotal()}
                </button>
              </div>
            )}

          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(50px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }

        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </section>
  );
};

export default ProductsSection;