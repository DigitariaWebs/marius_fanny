import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Navbar from './components/Navbar';
import Hero from './components/Hero';
import BestSellers from './components/BestSellers';
import ParallaxSection from './components/ParallaxSection';
import Time from './components/Timeline';
import Footer from './components/Footer';
import Shop from './components/Shop';
import ProductSelection from './components/ProductSelection';
import Politique from './components/Politique';
import Video from './components/Videoclient';
import GoldenBackground from './components/GoldenBackground';
import CartDrawer from './components/Cart'; // Importe le panier qu'on a créé

// Définition de l'interface pour un produit dans le panier
interface CartItem {
  id: number;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

const App: React.FC = () => {
  // --- LOGIQUE DU PANIER ---
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  // Fonction pour ajouter un produit
  const addToCart = (product: any) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    setIsCartOpen(true); // Ouvre le panier automatiquement à l'ajout
  };

  // Fonction pour changer la quantité
  const updateQuantity = (id: number, delta: number) => {
    setCartItems(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  // Fonction pour supprimer
  const removeItem = (id: number) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
  };

  // --- PAGES ---
  const HomePage: React.FC = () => (
    <>
      <Navbar onCartClick={() => setIsCartOpen(true)} cartCount={cartItems.length} />
      <main className="relative z-10">
        <Hero />
        <section id="shop"><Shop /></section>
        <Video />
        <section id="best-sellers">
           {/* On passe la fonction addToCart à tes composants si nécessaire */}
           <BestSellers onAddToCart={addToCart} />
        </section>
        <section id="timeline"><Time /></section>
        <ParallaxSection />
      </main>
      <section id="footer" className="relative z-10">
        <Footer />
      </section>
    </>
  );

  const ProductsPage: React.FC = () => (
    <>
      <Navbar onCartClick={() => setIsCartOpen(true)} cartCount={cartItems.length} />
      <main className="py-10 relative z-10">
        {/* On passe la fonction addToCart ici */}
        <ProductSelection onAddToCart={addToCart} />
      </main>
      <section id="footer" className="relative z-10">
        <Footer />
      </section>
    </>
  );

  return (
    <Router>
      <GoldenBackground />
      
      {/* Affichage du Panier sur toutes les pages */}
      <CartDrawer 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
        items={cartItems}
        onUpdateQuantity={updateQuantity}
        onRemove={removeItem}
      />

      <div className="min-h-screen relative">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/politique-retour" element={<Politique />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;