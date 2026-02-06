import { useEffect, useRef } from "react";
import { gsap } from "gsap";

const Hero = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const tl = gsap.timeline();

    if (logoRef.current) {
      tl.fromTo(
        logoRef.current,
        { y: -50, opacity: 0, scale: 0.9 },
        { y: 0, opacity: 1, scale: 1, duration: 1.2, ease: "power3.out" }
      );
    }

    if (contentRef.current && contentRef.current.children) {
      tl.fromTo(
        contentRef.current.children,
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, stagger: 0.15, ease: "power2.out" },
        "-=0.5" 
      );
    }
  }, []);

  return (
    <section
      ref={containerRef}
      className="relative min-h-screen w-full overflow-hidden flex flex-col items-center justify-center py-20"
      style={{ backgroundColor: "#44413a" }}
    >

      <div className="absolute inset-0 w-full h-full z-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover opacity-50" 
        >
          <source src="/video.mp4" type="video/mp4" />
        </video>
\        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/60"></div>
      </div>

      <div className="relative z-10 w-full max-w-7xl px-4 flex flex-col items-center text-center">
        
        <div className="mb-6 md:mb-10"> 
          <img
            ref={logoRef}
            src="/logo.avif"
            alt="Marius & Fanny Logo"
     
            className="w-48 sm:w-64 md:w-80 lg:w-[450px] h-auto object-contain drop-shadow-2xl mx-auto"
          />
        </div>

        <div ref={contentRef} className="flex flex-col items-center max-w-4xl mx-auto">
          
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-black font-sans text-[#F9F7F2] tracking-tight uppercase mb-6 drop-shadow-md">
            Marius & <span className="text-bakery-gold">Fanny</span>
          </h1>

          <p className="font-sans text-gray-200 text-base sm:text-lg md:text-xl max-w-2xl mb-8 leading-relaxed font-light">
            L'excellence de la boulangerie provençale.
            <br className="hidden md:block" /> 
            Tradition, passion et savoir-faire artisanal.
          </p>

          <button className="bg-bakery-gold text-bakery-dark px-8 py-3 md:px-10 md:py-4 rounded-sm font-bold uppercase tracking-widest text-xs md:text-sm hover:bg-white hover:scale-105 transition-all duration-300 shadow-[0_0_20px_rgba(197,160,101,0.4)]">
            Commander maintenant
          </button>
        </div>
      </div>
    </section>
  );
};

export default Hero;