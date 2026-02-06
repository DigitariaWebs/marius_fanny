import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import BestSellers from "./components/BestSellers";
import ParallaxSection from "./components/ParallaxSection";
import Time from "./components/Timeline";
import Footer from "./components/Footer";
import Shop from "./components/Shop";
import ProductSelection from "./components/ProductSelection";
import Politique from "./components/Politique";
import Video from "./components/Videoclient";
import GoldenBackground from "./components/GoldenBackground";
import CartDrawer from "./components/Cart";
import AuthPage from "./components/Autpage";
import AdminDashboard from "./components/Dashboard";
import Contact from "./components/Contact";

import User from "./pages/user";
import VerifyEmailPage from "./pages/Emailverified";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPassword from "./pages/ResetPassword";
import StaffManagement from "./pages/Stuff";
import StaffDashboard from "./pages/staffDahboard";
import Checkout from "./pages/Checkout";

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
    setCartItems((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        console.log(
          `➕ [CART] Increased quantity for existing item: ${product.name} (${existing.quantity} → ${existing.quantity + 1})`,
        );
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }
      console.log(
        `🛒 [CART] Added new item: ${product.name} (Price: ${product.price}$)`,
      );
      return [
        ...prev,
        { ...product, quantity: 1, image: product.image || product.img },
      ];
    });
    setIsCartOpen(true);
  };

  const updateQuantity = (id: number, delta: number) => {
    setCartItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const newQty = Math.max(1, item.quantity + delta);
          console.log(
            `🔄 [CART] Updated quantity for item ${id} (${item.name}): ${item.quantity} → ${newQty}`,
          );
          return { ...item, quantity: newQty };
        }
        return item;
      }),
    );
  };

  const removeItem = (id: number) => {
    const itemToRemove = cartItems.find((item) => item.id === id);
    console.log(
      `🗑️ [CART] Removed item: ${itemToRemove?.name || "Unknown"} (ID: ${id})`,
    );
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  const HomePage: React.FC = () => (
    <>
      <Navbar
        onCartClick={() => setIsCartOpen(true)}
        cartCount={cartItems.length}
      />
      <main className="relative z-10">
        <Hero />
        <section id="shop">
          <Shop onAddToCart={addToCart} />
        </section>

        <section id="best-sellers">
          <BestSellers onAddToCart={addToCart} />
        </section>
        <Video />
        <section id="timeline">
          <Time />
        </section>
        <ParallaxSection />
      </main>
      <Footer />
    </>
  );

  const ProductsPage: React.FC = () => (
    <>
      <Navbar
        onCartClick={() => setIsCartOpen(true)}
        cartCount={cartItems.length}
      />
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
          <Route path="/dashboard" element={<AdminDashboard />} />
          <Route path="/checkout" element={<Checkout />} />

          {/* Auth Routes */}
          <Route path="/se-connecter" element={<AuthPage />} />
          <Route
            path="/forgot_password"
            element={
              <ForgotPasswordPage
                onSuccess={(message: string) => alert(`Success: ${message}`)}
                onError={(error: string) => alert(`Error: ${error}`)}
              />
            }
          />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />

          <Route path="/user" element={<User />} />
          <Route path="/staff" element={<StaffManagement />} />
          <Route path="/staff/managements" element={<StaffDashboard />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
