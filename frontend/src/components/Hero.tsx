import { useEffect, useRef } from "react";
import { gsap } from "gsap";

const Hero = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const stickerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const tl = gsap.timeline();

    if (imageRef.current) {
      tl.fromTo(
        imageRef.current,
        { y: 100, opacity: 0 },
        { y: 0, opacity: 1, duration: 1.2, ease: "power3.out" },
      );
    }

    if (titleRef.current && titleRef.current.children) {
      tl.fromTo(
        titleRef.current.children,
        { x: -50, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.8, stagger: 0.1, ease: "power2.out" },
        "-=0.6",
      );
    }

    if (stickerRef.current) {
      tl.fromTo(
        stickerRef.current,
        { scale: 0, rotation: -45 },
        { scale: 1, rotation: 0, duration: 0.6, ease: "elastic.out(1, 0.5)" },
        "-=0.2",
      );
    }
  }, []);

  const handleStickerClick = () => {
    if (stickerRef.current) {
      gsap.to(stickerRef.current, {
        scale: 1.5,
        opacity: 0,
        duration: 0.3,
        ease: "power1.in",
        onComplete: () => {
          if (stickerRef.current) {
            stickerRef.current.style.display = "none";
          }
        },
      });
    }
  };

  return (
    <section
      ref={containerRef}
      className="relative min-h-screen text-bakery-cream overflow-hidden flex items-center justify-center py-16 md:py-20 lg:py-0"
      style={{ backgroundColor: "rgba(26, 26, 26, 0.85)" }}
    >
      <div className="absolute inset-0 opacity-10">
        <img
          src="https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=2000&auto=format&fit=crop"
          alt="Viennoiseries"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Main Grid: 1 colonne mobile, 2 colonnes sur lg */}
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center relative z-10">
        {/* TEXTE - Sur mobile en bas, sur desktop à gauche */}
        <div
          ref={titleRef}
          className="z-20 relative order-2 lg:order-1 flex flex-col items-center lg:items-start text-center lg:text-left"
        >
          {/* Titre responsive */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-[7rem] leading-[0.95] sm:leading-[0.9] font-black font-sans text-[#F9F7F2] tracking-tighter mb-4 md:mb-6 uppercase w-full">
            Marius &<br />
            <span className="text-bakery-gold">Fanny,</span>
          </h1>

          {/* Paragraphe responsive et pas qui dépasse */}
          <p className="font-sans text-gray-400 text-base sm:text-lg max-w-md mb-6 md:mb-10 leading-relaxed w-full px-2 sm:px-0">
            boulangerie PROVENCALE où chaque création est une œuvre d'art
            culinaire, façonnée avec passion et savoir-faire pour éveiller vos
            sens.
          </p>

          {/* Button responsive */}
          <button className="bg-bakery-gold text-bakery-dark px-6 sm:px-8 py-3 sm:py-4 rounded-sm font-bold uppercase tracking-widest text-xs hover:bg-white hover:scale-105 transition-all duration-300 shadow-[0_0_20px_rgba(197,160,101,0.3)] whitespace-nowrap">
            Découvrir nos créations
          </button>
        </div>

        {/* IMAGE - Sur mobile en haut, sur desktop à droite */}
        <div className="relative order-1 lg:order-2 flex justify-center w-full">
          <div
            ref={imageRef}
            className="relative w-[280px] h-[380px] sm:w-[350px] sm:h-[480px] md:w-[420px] md:h-[580px] lg:w-[450px] lg:h-[600px] bg-gray-800 rounded-t-[150px] sm:rounded-t-[180px] lg:rounded-t-[200px] overflow-hidden shadow-2xl border border-white/5 shrink-0"
          >
            <img
              src="https://images.unsplash.com/photo-1499636136210-6f4ee915583e?q=80&w=1000&auto=format&fit=crop"
              alt="Cookie aux pépites de chocolat"
              className="w-full h-full object-cover hover:scale-110 transition-transform duration-[2s] ease-in-out"
            />

            <div className="absolute inset-0 bg-black/10"></div>
          </div>
        </div>
      </div>

      {/* Gradient - caché sur mobile, visible sur desktop */}
      <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-white/5 to-transparent pointer-events-none hidden md:block"></div>
    </section>
  );
};

export default Hero;
