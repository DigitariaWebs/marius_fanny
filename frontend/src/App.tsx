import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Components
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
import MonCompte from "./components/Moncompte";
import DevenirPartenaire from "./components/DevenirPartenaire";
import ProDashboard from "./components/ProDashboard";

// Pages
import User from "./pages/user";
import VerifyEmailPage from "./pages/Emailverified";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPassword from "./pages/ResetPassword";
import StaffManagement from "./pages/Stuff";
import Checkout from "./pages/Checkout";
import DeliveryDashboard from "./pages/DeliveryDashboard";
import { RoleBasedRedirect } from "./components/RoleBasedRedirect";

// Utils
import { loadCart, saveCart } from "./utils/cartPersistence";

interface CartItem {
  id: number;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

interface HomePageProps {
  onCartClick: () => void;
  cartCount: number;
  onAddToCart: (product: any) => void;
}

const HomePage: React.FC<HomePageProps> = ({
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

interface ProductsPageProps {
  onCartClick: () => void;
  cartCount: number;
  onAddToCart: (product: any) => void;
}

const ProductsPage: React.FC<ProductsPageProps> = ({
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
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    // Initialize cart state directly from localStorage
    const persistedCart = loadCart();
    console.log("🚀 [APP] Initializing cart from localStorage:", persistedCart);
    return persistedCart;
  });

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    console.log("💾 [APP] Saving cart to localStorage:", cartItems);
    saveCart(cartItems);
  }, [cartItems]);

  // Listen for cart updates from other components
  useEffect(() => {
    const handleCartUpdate = () => {
      console.log("🔄 [APP] Cart updated event received, reloading cart");
      const updatedCart = loadCart();
      setCartItems(updatedCart);
    };

    window.addEventListener("cart:updated", handleCartUpdate);
    return () => window.removeEventListener("cart:updated", handleCartUpdate);
  }, []);

  const addToCart = (product: any) => {
    console.log("➕ [APP] Adding to cart:", product);
    setCartItems((prev) => {
      console.log("📦 [APP] Previous cart:", prev);
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        const newCart = prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
        console.log("🔄 [APP] Updated existing item, new cart:", newCart);
        return newCart;
      }
      const newCart = [
        ...prev,
        { ...product, quantity: 1, image: product.image || product.img },
      ];
      console.log("🆕 [APP] Added new item, new cart:", newCart);
      return newCart;
    });
    setIsCartOpen(true);
  };

  const updateQuantity = (id: number, delta: number) => {
    setCartItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const newQty = Math.max(1, item.quantity + delta);
          return { ...item, quantity: newQty };
        }
        return item;
      }),
    );
  };

  const removeItem = (id: number) => {
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
          {/* Main Routes - Protected from delivery drivers */}
          <Route
            path="/"
            element={
              <RoleBasedRedirect>
                <HomePage
                  onCartClick={() => setIsCartOpen(true)}
                  cartCount={cartItems.reduce(
                    (sum, item) => sum + item.quantity,
                    0,
                  )}
                  onAddToCart={addToCart}
                />
              </RoleBasedRedirect>
            }
          />
          <Route
            path="/products"
            element={
              <RoleBasedRedirect>
                <ProductsPage
                  onCartClick={() => setIsCartOpen(true)}
                  cartCount={cartItems.reduce(
                    (sum, item) => sum + item.quantity,
                    0,
                  )}
                  onAddToCart={addToCart}
                />
              </RoleBasedRedirect>
            }
          />
          <Route
            path="/checkout"
            element={
              <RoleBasedRedirect>
                <Checkout />
              </RoleBasedRedirect>
            }
          />
          <Route
            path="/politique-retour"
            element={
              <RoleBasedRedirect>
                <Politique />
              </RoleBasedRedirect>
            }
          />
          <Route
            path="/contact"
            element={
              <RoleBasedRedirect>
                <Contact />
              </RoleBasedRedirect>
            }
          />
          <Route
            path="/dashboard"
            element={
              <RoleBasedRedirect>
                <AdminDashboard />
              </RoleBasedRedirect>
            }
          />
          <Route
            path="/mon-compte"
            element={
              <RoleBasedRedirect>
                <MonCompte />
              </RoleBasedRedirect>
            }
          />

          {/* Pro Partner Routes */}
          <Route
            path="/devenir-partenaire"
            element={
              <RoleBasedRedirect>
                <DevenirPartenaire
                  onCartClick={() => setIsCartOpen(true)}
                  cartCount={cartItems.reduce(
                    (sum, item) => sum + item.quantity,
                    0,
                  )}
                />
              </RoleBasedRedirect>
            }
          />
          <Route
            path="/pro"
            element={
              <RoleBasedRedirect>
                <ProDashboard />
              </RoleBasedRedirect>
            }
          />

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

          <Route
            path="/user"
            element={
              <RoleBasedRedirect>
                <User />
              </RoleBasedRedirect>
            }
          />
          <Route
            path="/stuff"
            element={
              <RoleBasedRedirect>
                <StaffManagement />
              </RoleBasedRedirect>
            }
          />
          <Route path="/staff/delivery" element={<DeliveryDashboard />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
