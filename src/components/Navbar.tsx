import React, { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { FiMenu, FiX, FiShoppingBag } from 'react-icons/fi'; // Ajout de l'icône panier
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
  const overlayRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const mainLinks = [
    { name: 'La Boutique', id: 'shop' },
    { name: 'Nos Favoris', id: 'best-sellers' },
    { name: 'Notre Histoire', id: 'timeline' },
  ];

  // Séparé pour le menu mobile si besoin de libellés différents
  const mobileLinks = [
    ...mainLinks,
    { name: 'Politique de retour', id: 'politique-de-retour' },
  ];

  const handleAnchorClick = (id: string) => {
    if (isOpen) setIsOpen(false);
    if (id === 'politique-de-retour') {
      navigate('/politique-retour');
    } else {
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
    }
  };

  const handleMobileClick = (id: string) => {
    setIsOpen(false);
    handleAnchorClick(id);
  };

  const handleHeroClick = () => {
    if (window.location.pathname !== '/') navigate('/');
    else window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    if (!menuRef.current || !linksRef.current) return;
    const links = Array.from(linksRef.current.children);

    if (isOpen) {
      const tl = gsap.timeline();
      tl.to(menuRef.current, { y: 0, duration: 0.6, ease: 'power3.out' })
        .fromTo(links, 
          { y: 50, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.4, stagger: 0.1, ease: 'power2.out' },
          "-=0.2"
        );
      document.body.style.overflow = 'hidden';
    } else {
      gsap.to(menuRef.current, { y: '-100%', duration: 0.5, ease: 'power3.in' });
      document.body.style.overflow = 'unset';
    }
  }, [isOpen]);

  return (
    <>
      <div 
        ref={overlayRef}
        className="fixed inset-0 bg-[#1a1a1a] z-[100] pointer-events-none"
        style={{ transform: 'translateY(-100%)' }}
      />

      <nav 
        className="fixed top-0 w-full z-50 transition-all duration-300 border-b border-[#E5E0D8]"
        style={{ 
          backgroundColor: 'rgba(249, 247, 242, 0.85)',
          backdropFilter: 'blur(12px)' 
        }}
      >
        <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
          
          <button onClick={handleHeroClick} className="cursor-pointer z-50 focus:outline-none">
            <img src="/logo.avif" alt="Logo" className="h-10 md:h-12 w-auto object-contain" />
          </button>

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
                <span className="absolute -top-1 -right-1 bg-[#C5A065] text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full shadow-sm animate-fadeIn">
                  {cartCount}
                </span>
              )}
            </button>

            <button 
              onClick={() => handleAnchorClick('footer')} 
              className="ml-4 px-6 py-2.5 text-[10px] font-black uppercase tracking-widest text-white rounded-full hover:bg-[#C5A065] transition-all duration-300 focus:outline-none" 
              style={{ backgroundColor: styles.text }}
            >
              Contact
            </button>
          </div>

          <div className="flex items-center gap-4 md:hidden z-50">
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

            {/* MENU BURGER */}
            <button 
              className="text-2xl p-2 focus:outline-none" 
              style={{ color: styles.text }} 
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <FiX /> : <FiMenu />}
            </button>
          </div>
        </div>

        {/* MOBILE MENU DRAWER */}
        <div 
          ref={menuRef} 
          className="fixed inset-0 z-40 flex flex-col items-center justify-center md:hidden"
          style={{ 
            backgroundColor: styles.cream,
            transform: 'translateY(-100%)' 
          }}
        >
          <div ref={linksRef} className="flex flex-col items-center gap-8 p-6 text-center">
            {mobileLinks.map((link) => (
              <button 
                key={`${link.name}-${link.id}`} 
                onClick={() => handleMobileClick(link.id)} 
                className="focus:outline-none"
                style={{ 
                  color: styles.text,
                  fontFamily: link.id === 'politique-de-retour' ? styles.fontSans : styles.fontScript,
                  fontSize: link.id === 'politique-de-retour' ? '1rem' : '2.5rem',
                  textTransform: link.id === 'politique-de-retour' ? 'uppercase' : 'none',
                  letterSpacing: link.id === 'politique-de-retour' ? '0.2em' : 'normal'
                }}
              >
                {link.name}
              </button>
            ))}
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;