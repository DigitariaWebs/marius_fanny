import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Components
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
import CartDrawer from './components/Cart'; 
import AuthPage from './components/Autpage';
import AdminDashboard from './components/Dashboard';
import Contact from './components/Contact';

// Pages
import User from './pages/user';
import VerifyEmailPage from './pages/Emailverified'; 
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPassword';

interface CartItem {
  id: number;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

const App: React.FC = () => {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  const addToCart = (product: any) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1, image: product.image || product.img }];
    });
    setIsCartOpen(true);
  };

  const updateQuantity = (id: number, delta: number) => {
    setCartItems(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const removeItem = (id: number) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
  };

  // --- Layout Helpers ---
  const HomePage: React.FC = () => (
    <>
      <Navbar onCartClick={() => setIsCartOpen(true)} cartCount={cartItems.length} />
      <main className="relative z-10">
        <Hero />
        <section id="shop">
          <Shop onAddToCart={addToCart} />
        </section>
        <Video />
        <section id="best-sellers">
           <BestSellers onAddToCart={addToCart} />
        </section>
        <section id="timeline"><Time /></section>
        <ParallaxSection />
      </main>
      <Footer />
    </>
  );

  const ProductsPage: React.FC = () => (
    <>
      <Navbar onCartClick={() => setIsCartOpen(true)} cartCount={cartItems.length} />
      <main className="pt-24 min-h-screen relative z-10">
        <ProductSelection onAddToCart={addToCart} />
      </main>
      <Footer />
    </>
  );

  return (
    <Router>
      <GoldenBackground />
      
      <CartDrawer 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
        items={cartItems}
        onUpdateQuantity={updateQuantity}
        onRemove={removeItem}
      />

      <div className="min-h-screen relative">
        <Routes>
          {/* Main Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/politique-retour" element={<Politique />} />
          <Route path="/contact" element={<Contact />} />
          
          {/* Auth Routes */}
          <Route path="/se-connecter" element={<AuthPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />
          
          {/* Protected/User Routes */}
          <Route path="/user" element={<User />} />
          <Route path="/panneau" element={<AdminDashboard />} />
        </Routes> 
      </div>
    </Router>
  );
}

export default App;
