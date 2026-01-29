import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

const Hero = () => {
  const containerRef = useRef(null);
  const titleRef = useRef(null);
  const imageRef = useRef(null);
  const stickerRef = useRef(null);

  useEffect(() => {
    const tl = gsap.timeline();

    tl.fromTo(imageRef.current, 
      { y: 100, opacity: 0 },
      { y: 0, opacity: 1, duration: 1.2, ease: "power3.out" }
    );

    tl.fromTo(titleRef.current.children, 
      { x: -50, opacity: 0 },
      { x: 0, opacity: 1, duration: 0.8, stagger: 0.1, ease: "power2.out" },
      "-=0.6"
    );

    tl.fromTo(stickerRef.current,
      { scale: 0, rotation: -45 },
      { scale: 1, rotation: 0, duration: 0.6, ease: "elastic.out(1, 0.5)" },
      "-=0.2"
    );
  }, []);

  const handleStickerClick = () => {
    gsap.to(stickerRef.current, {
      scale: 1.5,
      opacity: 0,
      duration: 0.3,
      ease: "power1.in",
      onComplete: () => {
        stickerRef.current.style.display = 'none';
      }
    });
  };

  return (
    <section 
      ref={containerRef} 
      className="relative min-h-screen bg-[#1A1A1A] text-bakery-cream overflow-hidden flex items-center justify-center pt-20 md:pt-0"
    >
      <div className="absolute inset-0 opacity-10">
        <img 
          src="https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=2000&auto=format&fit=crop" 
          alt="Viennoiseries" 
          className="w-full h-full object-cover"
        />
      </div>

      <div className="max-w-7xl w-full mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center relative z-10">
        
        <div ref={titleRef} className="z-20 relative order-2 lg:order-1">
          
          <h1 className="text-6xl md:text-7xl lg:text-[7rem] leading-[0.9] font-black font-sans text-[#F9F7F2] tracking-tighter mb-6 uppercase">
            Tradition <br />
            <span className="text-bakery-gold">
            gourmande,
            </span>
          </h1>

          <p className="font-sans text-gray-400 text-lg max-w-md mb-10 leading-relaxed">
            Chaque création est une histoire, une passion authentique et fait maison. Retrouvez le goût de la tradition.
          </p>

          <button className="bg-bakery-gold text-bakery-dark px-8 py-4 rounded-sm font-bold uppercase tracking-widest text-xs hover:bg-white hover:scale-105 transition-all duration-300 shadow-[0_0_20px_rgba(197,160,101,0.3)]">
            Découvrir nos créations
          </button>
        </div>

        <div className="relative order-1 lg:order-2 flex justify-center lg:justify-end">
          
          <div 
            ref={imageRef}
            className="relative w-[350px] h-[500px] md:w-[450px] md:h-[600px] bg-gray-800 rounded-t-[200px] overflow-hidden shadow-2xl border border-white/5"
          >
            <img 
              src="https://images.unsplash.com/photo-1499636136210-6f4ee915583e?q=80&w=1000&auto=format&fit=crop" 
              alt="Cookie aux pépites de chocolat" 
              className="w-full h-full object-cover hover:scale-110 transition-transform duration-[2s] ease-in-out"
            />
            
            <div className="absolute inset-0 bg-black/10"></div>
          </div>

          <button
            ref={stickerRef}
            onClick={handleStickerClick}
            className="absolute bottom-10 -left-6 md:bottom-20 md:-left-12 w-32 h-32 md:w-40 md:h-40 bg-[#FFB6C1] rounded-full flex items-center justify-center text-bakery-text font-bold text-center uppercase text-xs md:text-sm leading-tight tracking-widest shadow-2xl cursor-pointer hover:bg-pink-300 z-30 group"
          >
            <span className="group-hover:scale-90 transition-transform duration-300">
              Une émotion <br/> à déguster
            </span>
          </button>

        </div>
      </div>

      <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-white/5 to-transparent pointer-events-none"></div>
    </section>
  );
};

export default Hero;