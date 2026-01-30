import { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { FiMenu, FiX } from 'react-icons/fi';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  const links = [
    { name: 'Shop', id: 'shop' },
    { name: 'Les favoris', id: 'best-sellers' },
    { name: 'Produits', id: 'produits' },
    { name: 'Notre histoire', id: 'timeline' },
    { name: 'Contact', id: 'footer' },
  ];

  useEffect(() => {
    if (isOpen) {
      gsap.to(menuRef.current, { x: 0, duration: 0.5, ease: 'power3.out' });
    } else {
      gsap.to(menuRef.current, { x: '100%', duration: 0.5, ease: 'power3.in' });
    }
  }, [isOpen]);

  const handleScroll = (id: string) => {
    const target = document.getElementById(id);
    if (isOpen) setIsOpen(false);

    if (target && overlayRef.current) {
      const tl = gsap.timeline();

      tl.to(overlayRef.current, {
        yPercent: 100,
        duration: 0.5,
        ease: "power2.inOut"
      })
      .add(() => {
        target.scrollIntoView({ behavior: 'auto' });
      })
      .to(overlayRef.current, {
        yPercent: 200,
        duration: 0.5,
        ease: "power2.inOut",
        onComplete: () => {
          gsap.set(overlayRef.current, { yPercent: -100 });
        }
      });
    }
  };

  return (
    <>
      {/* L'ÉCRAN NOIR (Overlay) */}
      <div 
        ref={overlayRef}
        className="fixed inset-0 bg-black z-[100] pointer-events-none"
        style={{ transform: 'translateY(-100%)' }}
      />

      <nav className="fixed top-0 w-full z-50 bg-bakery-cream/90 backdrop-blur-sm border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div onClick={() => handleScroll('hero')} className="font-script text-3xl text-bakery-text cursor-pointer">
            Marius et Fanny
          </div>

          <div className="hidden md:flex space-x-8 font-sans text-sm tracking-widest uppercase text-bakery-text">
            {links.map((link) => (
              <button key={link.name} onClick={() => handleScroll(link.id)} className="hover:text-bakery-gold transition-colors">
                {link.name}
              </button>
            ))}
          </div>

          <button className="md:hidden text-2xl" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <FiX /> : <FiMenu />}
          </button>
        </div>

        {/* Menu Mobile */}
        <div ref={menuRef} className="fixed inset-0 bg-bakery-cream z-40 flex flex-col items-center justify-center translate-x-full md:hidden">
          {links.map((link) => (
            <button key={link.name} onClick={() => handleScroll(link.id)} className="text-3xl font-script py-4">
              {link.name}
            </button>
          ))}
        </div>
      </nav>
    </>
  );
};

export default Navbar;