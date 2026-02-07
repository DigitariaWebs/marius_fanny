import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { authClient } from "./lib/AuthClient";

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
import Checkout from "./pages/Checkout";
import CustomerServicePage from "./pages/Customerservicepage";
import StaffDashboardPage from "./pages/staffDahboard"; 
import Stuff from "./pages/Stuff";
import MonCompte from "./components/Moncompte";
import StaffPlanning from "./pages/Staffplaning";
import { ProtectedRoute } from "./components/Protectedroute";
import { Product } from "./types";
import { initializeCartSession, loadCart, saveCart } from "./utils/cartPersistence";


interface CartItem {
  id: number;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

interface PageProps {
  onCartClick: () => void;
  cartCount: number;
  onAddToCart: (product: Product) => void;
}

// --- Gardien pour rediriger le Staff loin de la Home client ---
const HomeGuard: React.FC<PageProps> = (props) => {
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const check = async () => {
      try {
        const session = await authClient.getSession();
        const user = session.data?.user as any;
        setRole(user?.role || "client");
      } catch (e) {
        setRole("client");
      } finally {
        setLoading(false);
      }
    };
    check();
  }, []);

  if (loading) return null;

  if (role === "kitchen_staff" || role === "customer_service") {
    return <Navigate to="/staff/dashboard" replace />;
  }
  return <HomePage {...props} />;
};

const HomePage: React.FC<PageProps> = ({
  onCartClick,
  cartCount,
  onAddToCart,
}) => (
  <>
    <Navbar onCartClick={onCartClick} cartCount={cartCount} />
    <main className="relative z-10">
      <Hero />
      <section id="shop">
        <Shop onAddToCart={onAddToCart} />
      </section>

      <section id="best-sellers">
        <BestSellers onAddToCart={onAddToCart} />
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

const ProductsPage: React.FC<PageProps> = ({
  onCartClick,
  cartCount,
  onAddToCart,
}) => (
  <>
    <Navbar onCartClick={onCartClick} cartCount={cartCount} />
    <main className="pt-24 min-h-screen relative z-10">
      <ProductSelection onAddToCart={onAddToCart} />
    </main>
    <Footer />
  </>
);

const App: React.FC = () => {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  // Initialize cart session and load cart on mount
  useEffect(() => {
    console.log('🛒 [CART] Initializing cart session');
    initializeCartSession();
    const savedCart = loadCart();
    if (savedCart.length > 0) {
      console.log(`🛒 [CART] Loaded ${savedCart.length} items from storage`);
      setCartItems(savedCart);
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (cartItems.length > 0) {
      console.log(`💾 [CART] Saving ${cartItems.length} items to storage`);
      saveCart(cartItems);
    }
  }, [cartItems]);

  // Keep cart in sync with storage updates (checkout clears storage)
  useEffect(() => {
    const syncCartFromStorage = () => {
      const savedCart = loadCart();
      setCartItems(savedCart);
    };

    const handleStorage = (event: StorageEvent) => {
      if (event.key === "marius_fanny_cart") {
        syncCartFromStorage();
      }
    };

    window.addEventListener("cart:updated", syncCartFromStorage);
    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener("cart:updated", syncCartFromStorage);
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  const addToCart = (product: Product) => {
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
      return [...prev, { ...product, quantity: 1, image: product.image || "" }];
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
          <Route
            path="/"
            element={
              <HomeGuard
                onCartClick={() => setIsCartOpen(true)}
                cartCount={cartItems.length}
                onAddToCart={addToCart}
              />
            }
          />
          <Route
            path="/products"
            element={
              <ProductsPage
                onCartClick={() => setIsCartOpen(true)}
                cartCount={cartItems.length}
                onAddToCart={addToCart}
              />
            }
          />
          <Route path="/politique-retour" element={<Politique />} />
          <Route path="/contact" element={<Contact />} />
          
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/mon-compte"
            element={
              <ProtectedRoute allowedRoles={["client"]}>
                <MonCompte />
              </ProtectedRoute>
            }
          />
          
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

          
          <Route
            path="/staff/dashboard"
            element={
              <ProtectedRoute allowedRoles={["kitchen_staff", "customer_service"]}>
                <Stuff />
              </ProtectedRoute>
            }
          />

          <Route
            path="/staff/production"
            element={
              <ProtectedRoute allowedRoles={["kitchen_staff"]}>
                <StaffDashboardPage />
              </ProtectedRoute>
            }
          />
     <Route
          path="/staff/planning"
  element={
    <ProtectedRoute allowedRoles={["kitchen_staff", "customer_service"]}>
      <StaffPlanning />
    </ProtectedRoute>
  }
/>
          <Route
            path="/staff/commandes"
            element={
              <ProtectedRoute allowedRoles={["customer_service"]}>
                <CustomerServicePage />
              </ProtectedRoute>
            }
          />
        </Routes>
   
      </div>
    </Router>
  );
};

export default App;