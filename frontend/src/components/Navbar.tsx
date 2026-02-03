import React, { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { FiMenu, FiX, FiShoppingBag } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

const styles = {
  cream: '#F9F7F2',
  gold: '#C5A065',
  text: '#2D2A26',
  fontScript: '"Great Vibes", cursive',
  fontSans: '"Inter", sans-serif',
};

interface NavbarProps {
  onCartClick: () => void;
  cartCount: number;
}

const Navbar: React.FC<NavbarProps> = ({ onCartClick, cartCount }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const linksRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const mainLinks = [
    { name: 'La Boutique', id: 'shop' },
    { name: 'Nos Favoris', id: 'best-sellers' },
    { name: 'Notre Histoire', id: 'timeline' },
    { name: 'Politique de retour', id: 'politique-de-retour' },
    { name: 'Contacter', id: 'contact' },
  ];

  const handleAnchorClick = (id: string) => {
    if (isOpen) setIsOpen(false);

    if (id === 'politique-de-retour') {
      navigate('/politique-retour');
      return;
    }
    if (id === 'contact') {
      navigate('/contact');
      return;
    }
    if (id === 'se-connecter') {
      navigate('/se-connecter');
      return;
    }

    // GESTION DU SCROLL SUR LA HOME
    if (window.location.pathname !== '/') {
      navigate('/');
      setTimeout(() => {
        const element = document.getElementById(id);
        element?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      const element = document.getElementById(id);
      element?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleHeroClick = () => {
    if (isOpen) setIsOpen(false);
    if (window.location.pathname !== '/') navigate('/');
    else window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    if (!menuRef.current || !linksRef.current) return;
    const links = Array.from(linksRef.current.children);

    if (isOpen) {
      const tl = gsap.timeline();
      tl.to(menuRef.current, { 
        y: 0, 
        duration: 0.6, 
        ease: 'power3.out',
        pointerEvents: 'all'
      })
      .fromTo(links, 
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.4, stagger: 0.1, ease: 'power2.out' },
        "-=0.3"
      );
      document.body.style.overflow = 'hidden';
    } else {
      gsap.to(menuRef.current, { 
        y: '-100%', 
        duration: 0.5, 
        ease: 'power3.in',
        pointerEvents: 'none' 
      });
      document.body.style.overflow = 'unset';
    }
  }, [isOpen]);

  return (
    <nav 
      className="fixed top-0 w-full z-50 transition-all duration-300 border-b border-[#E5E0D8]"
      style={{ 
        backgroundColor: 'rgba(249, 247, 242, 0.85)',
        backdropFilter: 'blur(12px)' 
      }}
    >
      <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center relative z-50">
        
        {/* LOGO */}
        <button onClick={handleHeroClick} className="cursor-pointer focus:outline-none">
          <img src="/logo.avif" alt="Logo" className="h-10 md:h-12 w-auto object-contain" />
        </button>

        {/* DESKTOP NAV */}
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
          
          <button 
            onClick={onCartClick}
            className="relative p-2 text-[#2D2A26] hover:text-[#C5A065] transition-colors focus:outline-none"
          >
            <FiShoppingBag size={22} />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#C5A065] text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full shadow-sm">
                {cartCount}
              </span>
            )}
          </button>

          <button 
            onClick={() => handleAnchorClick('se-connecter')} 
            className="ml-4 px-6 py-2.5 text-[10px] font-black uppercase tracking-widest text-white rounded-full hover:bg-[#C5A065] transition-all duration-300 focus:outline-none" 
            style={{ backgroundColor: styles.text }}
          >
            Se Connecter
          </button>
        </div>

        {/* MOBILE CONTROLS */}
        <div className="flex items-center gap-4 md:hidden">
          <button 
            onClick={onCartClick}
            className="relative p-2 text-[#2D2A26] focus:outline-none"
          >
            <FiShoppingBag size={24} />
            {cartCount > 0 && (
              <span className="absolute -top-0 -right-0 bg-[#C5A065] text-white text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                {cartCount}
              </span>
            )}
          </button>

          <button 
            className="text-2xl p-2 focus:outline-none" 
            style={{ color: styles.text }} 
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <FiX /> : <FiMenu />}
          </button>
        </div>
      </div>

      {/* MOBILE MENU OVERLAY */}
      <div 
        ref={menuRef} 
        className="fixed inset-0 z-40 flex flex-col items-center justify-center md:hidden"
        style={{ 
          backgroundColor: styles.cream,
          transform: 'translateY(-100%)',
          pointerEvents: 'none'
        }}
      >
        <div ref={linksRef} className="flex flex-col items-center gap-10 p-6 text-center">
          {mainLinks.map((link) => (
            <button 
              key={link.id} 
              onClick={() => handleAnchorClick(link.id)} 
              className="focus:outline-none text-[12px] font-black uppercase tracking-[0.3em]"
              style={{ 
                color: styles.text,
                fontFamily: styles.fontSans
              }}
            >
              {link.name}
            </button>
          ))}
          
          {/* BOUTON SE CONNECTER MOBILE (MÊME TYPO) */}
          <button 
            onClick={() => handleAnchorClick('se-connecter')}
            className="mt-4 px-8 py-3 text-[11px] font-black uppercase tracking-widest text-white rounded-full"
            style={{ backgroundColor: styles.text, fontFamily: styles.fontSans }}
          >
            Se Connecter
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;