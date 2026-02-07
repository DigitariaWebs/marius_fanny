import React, { useState, useEffect, useRef } from "react";
import { gsap } from "gsap";
import { FiMenu, FiX, FiShoppingBag } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { authClient } from "../lib/AuthClient";

const styles = {
  cream: "#F9F7F2",
  gold: "#C5A065",
  text: "#2D2A26",
  fontScript: '"Great Vibes", cursive',
  fontSans: '"Inter", sans-serif',
};

interface NavbarProps {
  onCartClick: () => void;
  cartCount: number;
}

const Navbar: React.FC<NavbarProps> = ({ onCartClick, cartCount }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [role, setRole] = useState<string>("client");
  
  const sidebarRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const linksRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Vérification de l'authentification et du rôle
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const session = await authClient.getSession();
        console.log("📋 Session complète:", session);
        const user = session.data?.user;
        
        setIsLoggedIn(!!user);

        if (user) {
          console.log("👤 User object:", user);
          const userWithRole = user as any;
          console.log("🔍 user.role:", userWithRole.role);
          console.log("🔍 user.user_metadata:", userWithRole.user_metadata);
          console.log("🔍 user.app_metadata:", userWithRole.app_metadata);
          
          const detectedRole = 
            userWithRole.role || 
            userWithRole.user_metadata?.role || 
            userWithRole.app_metadata?.role || 
            "client";
          
          console.log("✅ Rôle final détecté:", detectedRole);
          setRole(detectedRole);
        } else {
          console.log("❌ Pas d'utilisateur connecté");
        }
      } catch (error) {
        console.error("❌ Session check error:", error);
        setIsLoggedIn(false);
      }
    };

    checkAuth();
    const interval = setInterval(checkAuth, 2000);
    return () => clearInterval(interval);
  }, []);

  const mainLinks = [
    { name: "La Boutique", id: "shop" },
    { name: "Nos Favoris", id: "best-sellers" },
    { name: "Notre Histoire", id: "timeline" },
    { name: "Politique de retour", id: "politique-de-retour" },
    { name: "Contacter", id: "contact" },
  ];

  const handleAnchorClick = (id: string) => {
    console.log("🎯 handleAnchorClick appelé avec id:", id);
    console.log("🎯 Rôle actuel:", role);
    
    setIsOpen(false);

    if (id === "politique-de-retour") {
      navigate("/politique-retour");
      return;
    }
    if (id === "contact") {
      navigate("/contact");
      return;
    }
    if (id === "se-connecter") {
      navigate("/se-connecter");
      return;
    }
    if (id === "dashboard") {
      console.log("🚀 Navigation dashboard - Rôle:", role);
      
      // Redirection selon le rôle
      if (role === "admin") {
        console.log("➡️ Navigation vers /dashboard (admin)");
        navigate("/dashboard");
      } else if (role === "kitchen_staff" || role === "customer_service") {
        console.log("➡️ Navigation vers /staff/dashboard (staff)");
        navigate("/staff/dashboard");
      } else {
        console.log("➡️ Navigation vers /mon-compte (client)");
        navigate("/mon-compte");
      }
      return;
    }

    if (window.location.pathname !== "/") {
      navigate("/");
      setTimeout(() => {
        const element = document.getElementById(id);
        element?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } else {
      const element = document.getElementById(id);
      element?.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleHeroClick = () => {
    setIsOpen(false);
    if (window.location.pathname !== "/") navigate("/");
    else window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Animations GSAP
  useEffect(() => {
    if (!sidebarRef.current || !overlayRef.current || !linksRef.current) return;
    const links = Array.from(linksRef.current.children);

    if (isOpen) {
      const tl = gsap.timeline();
      tl.to(overlayRef.current, { opacity: 1, duration: 0.3, pointerEvents: "all" });
      tl.to(sidebarRef.current, { x: 0, duration: 0.5, ease: "power3.out" }, "-=0.2");
      tl.fromTo(
        links,
        { x: 30, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.4, stagger: 0.08, ease: "power2.out" },
        "-=0.3"
      );
      document.body.style.overflow = "hidden";
    } else {
      const tl = gsap.timeline();
      tl.to(sidebarRef.current, { x: "100%", duration: 0.4, ease: "power3.in" });
      tl.to(overlayRef.current, { opacity: 0, duration: 0.3, pointerEvents: "none" }, "-=0.2");
      document.body.style.overflow = "unset";
    }
  }, [isOpen]);

  const handleLogout = async () => {
    try {
      await authClient.signOut();
      setIsLoggedIn(false);
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
      setIsLoggedIn(false);
      navigate("/");
    }
  };

  // Fonction pour obtenir le texte du bouton selon le rôle
  const getDashboardButtonText = () => {
    if (role === "client") return "Mon Compte";
    if (role === "admin") return "Dashboard Admin";
    if (role === "kitchen_staff" || role === "customer_service") return "Dashboard Staff";
    return "Dashboard";
  };

  return (
    <>
      <nav
        className="fixed top-0 w-full z-50 transition-all duration-300 border-b border-[#E5E0D8]"
        style={{
          backgroundColor: "rgba(249, 247, 242, 0.85)",
          backdropFilter: "blur(12px)",
        }}
      >
        <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center relative z-50">
          <button onClick={handleHeroClick} className="cursor-pointer focus:outline-none">
            <img src="/logo.avif" alt="Logo" className="h-10 md:h-12 w-auto object-contain" />
          </button>

          {/* NAV DESKTOP */}
          <div className="hidden md:flex items-center gap-8">
            {mainLinks.map((link) => (
              <button
                key={link.name}
                onClick={() => handleAnchorClick(link.id)}
                className="relative group text-[10px] font-black uppercase tracking-[0.2em] py-2 focus:outline-none"
                style={{ fontFamily: styles.fontSans, color: styles.text }}
              >
                {link.name}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 transition-all duration-300 group-hover:w-full" style={{ backgroundColor: styles.gold }} />
              </button>
            ))}

            <button onClick={onCartClick} className="relative p-2 text-[#2D2A26] hover:text-[#C5A065] transition-colors focus:outline-none">
              <FiShoppingBag size={22} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#C5A065] text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full shadow-sm">
                  {cartCount}
                </span>
              )}
            </button>

            {isLoggedIn ? (
              <>
                <button
                  onClick={() => handleAnchorClick("dashboard")}
                  className="ml-4 px-6 py-2.5 text-[10px] font-black uppercase tracking-widest text-[#2D2A26] hover:text-[#C5A065] transition-all duration-300 focus:outline-none"
                >
                  {getDashboardButtonText()}
                </button>
                <button
                  onClick={handleLogout}
                  className="ml-2 px-6 py-2.5 text-[10px] font-black uppercase tracking-widest text-white rounded-full hover:bg-[#C5A065] transition-all duration-300 focus:outline-none"
                  style={{ backgroundColor: styles.text }}
                >
                  Déconnexion
                </button>
              </>
            ) : (
              <button
                onClick={() => handleAnchorClick("se-connecter")}
                className="ml-4 px-6 py-2.5 text-[10px] font-black uppercase tracking-widest text-white rounded-full hover:bg-[#C5A065] transition-all duration-300 focus:outline-none"
                style={{ backgroundColor: styles.text }}
              >
                Se Connecter
              </button>
            )}
          </div>

          {/* MOBILE CONTROLS */}
          <div className="flex items-center gap-4 md:hidden">
            <button onClick={onCartClick} className="relative p-2 text-[#2D2A26] focus:outline-none">
              <FiShoppingBag size={24} />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 bg-[#C5A065] text-white text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                  {cartCount}
                </span>
              )}
            </button>
            <button className="text-2xl p-2 focus:outline-none" style={{ color: styles.text }} onClick={() => setIsOpen(!isOpen)}>
              <FiMenu />
            </button>
          </div>
        </div>
      </nav>

      {/* OVERLAY MOBILE */}
      <div ref={overlayRef} className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden" style={{ opacity: 0, pointerEvents: "none" }} onClick={() => setIsOpen(false)} />

      {/* SIDEBAR MOBILE */}
      <div ref={sidebarRef} className="fixed top-0 right-0 h-full w-[280px] z-50 md:hidden shadow-2xl overflow-y-auto" style={{ backgroundColor: styles.cream, transform: "translateX(100%)" }}>
        <div className="flex justify-between items-center p-6 border-b border-[#E5E0D8]">
          <h2 className="text-lg font-black uppercase tracking-wider" style={{ color: styles.text, fontFamily: styles.fontSans }}>Menu</h2>
          <button onClick={() => setIsOpen(false)} className="text-2xl p-2 focus:outline-none" style={{ color: styles.text }}><FiX /></button>
        </div>

        <div ref={linksRef} className="flex flex-col p-6 gap-6">
          {mainLinks.map((link) => (
            <button key={link.id} onClick={() => handleAnchorClick(link.id)} className="text-left focus:outline-none text-[12px] font-black uppercase tracking-[0.2em] py-2 border-b border-[#E5E0D8] hover:text-[#C5A065] transition-colors" style={{ color: styles.text, fontFamily: styles.fontSans }}>
              {link.name}
            </button>
          ))}

          <div className="h-px bg-[#C5A065] my-4" />

          {isLoggedIn ? (
            <>
              <button
                onClick={() => handleAnchorClick("dashboard")}
                className="w-full px-6 py-3 text-[11px] font-black uppercase tracking-widest text-[#2D2A26] border-2 border-[#2D2A26] rounded-full hover:bg-[#2D2A26] hover:text-white transition-all"
                style={{ fontFamily: styles.fontSans }}
              >
                {getDashboardButtonText()}
              </button>
              <button onClick={handleLogout} className="w-full px-6 py-3 text-[11px] font-black uppercase tracking-widest text-white rounded-full mt-2" style={{ backgroundColor: styles.text, fontFamily: styles.fontSans }}>
                Déconnexion
              </button>
            </>
          ) : (
            <button onClick={() => handleAnchorClick("se-connecter")} className="w-full px-6 py-3 text-[11px] font-black uppercase tracking-widest text-white rounded-full" style={{ backgroundColor: styles.text, fontFamily: styles.fontSans }}>
              Se Connecter
            </button>
          )}
        </div>
      </div>
    </>
  );
};

export default Navbar;