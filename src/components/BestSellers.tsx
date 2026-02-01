import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { FiMinus, FiPlus } from 'react-icons/fi';

const products = [
  { id: 1, name: "Boîte à lunch", price: 19.95, img: "./fav1.jpg" },
  { id: 2, name: "Salade repas", price: 20.95, img: "./fav2.jpg" },
  { id: 3, name: "Gâteau croustillant", price: 37.50, img: "./fav3.jpg" },
  { id: 4, name: "Tarte citron", price: 29.95, img: "./fav4.jpg" },
  { id: 5, name: "Plateau sandwich", price: 42.95, img: "https://images.unsplash.com/photo-1554433607-66b5efe9d304?auto=format&fit=crop&w=500&q=80" },
  { id: 6, name: "6 Croissants", price: 16.50, img: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=500&q=80" },
  { id: 7, name: "12 Macarons", price: 24.95, img: "https://images.unsplash.com/photo-1569864358642-9d1684040f43?auto=format&fit=crop&w=500&q=80" },
];

interface Product {
  id: number;
  name: string;
  price: number;
  img: string;
}

interface BestSellersProps {
  onAddToCart: (product: any) => void;
}

const ProductCard: React.FC<{ product: Product; onAddToCart: (product: any, qty: number) => void }> = ({ product, onAddToCart }) => {
  const [qty, setQty] = useState(1);

  return (
    <div className="relative flex flex-col items-center bg-white border-2 border-[#2D2A26]/10 rounded-t-[100px] rounded-b-[30px] p-6 pt-12 transition-transform duration-300 hover:-translate-y-2 hover:shadow-xl">
      <div className="w-40 h-40 mb-4 rounded-full overflow-hidden shadow-md">
        <img 
          src={product.img} 
          alt={product.name} 
          className="w-full h-full object-cover transform hover:scale-110 transition-all duration-500"
        />
      </div>

      <h3 className="font-sans font-bold text-lg uppercase tracking-wide text-[#2D2A26] mb-1 text-center">
        {product.name}
      </h3>
      <p className="font-sans text-[#2D2A26]/60 text-sm mb-6 italic">Marius & Fanny</p>
      <p className="font-sans font-bold text-xl text-[#2D2A26] mb-6">
        {product.price.toFixed(2)}$
      </p>

      {/* Sélecteur de quantité */}
      <div className="flex items-center justify-between w-full px-4 mb-4">
        <button 
          onClick={() => qty > 1 && setQty(qty - 1)}
          className="w-8 h-8 rounded-full bg-[#7d5c27] text-white flex items-center justify-center hover:bg-[#2D2A26] transition-colors"
        >
          <FiMinus />
        </button>
        <span className="font-sans font-bold text-lg">{qty}</span>
        <button 
          onClick={() => setQty(qty + 1)}
          className="w-8 h-8 rounded-full bg-[#F9F7F2] text-[#2D2A26] border border-[#2D2A26]/10 flex items-center justify-center hover:bg-[#e0d1d3] transition-colors"
        >
          <FiPlus />
        </button>
      </div>

      <button 
        onClick={() => {
          // On adapte l'objet pour qu'il match le format attendu par le panier (image vs img)
          onAddToCart({ ...product, image: product.img }, qty);
          setQty(1); // Reset après ajout
        }}
        className="w-full bg-[#c69d75] py-3 rounded-full font-sans font-bold text-xs uppercase tracking-widest text-[#2D2A26] hover:bg-[#2D2A26] hover:text-white transition-all duration-300 flex items-center justify-center gap-2"
      >
        <FiPlus size={16} />
        Ajouter au panier
      </button>
    </div>
  );
};

const BestSellers: React.FC<BestSellersProps> = ({ onAddToCart }) => {
  const marqueeRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.to(".marquee-text", {
        xPercent: -50,
        repeat: -1,
        duration: 25,
        ease: "linear",
      });
    }, marqueeRef);
    return () => ctx.revert();
  }, []);

  const handleAddToCartWithQty = (product: any, qty: number) => {
    for (let i = 0; i < qty; i++) {
      onAddToCart(product);
    }
  };

  return (
    <section className="relative py-24 overflow-hidden bg-[#F9F7F2]">
      {/* Marquee GSAP */}
      <div ref={marqueeRef} className="absolute top-10 left-0 w-full z-0 select-none opacity-5 pointer-events-none whitespace-nowrap overflow-visible">
        <div className="marquee-text inline-block text-[12vw] font-black font-sans text-[#2D2A26] uppercase leading-none tracking-tighter transform -rotate-2">
          Best Sellers — Nos Incontournables — Best Sellers — Nos Incontournables — 
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-6xl md:text-7xl font-script text-[#2D2A26] mb-4">Les Favoris</h2>
          <div className="w-20 h-1 bg-[#c69d75] mx-auto mb-6 rounded-full"></div>
          <p className="font-sans text-[#2D2A26]/60 italic uppercase tracking-widest text-xs">Découvrez les créations préférées de nos clients</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 gap-y-16">
          {products.map((product) => (
            <ProductCard 
              key={product.id} 
              product={product} 
              onAddToCart={handleAddToCartWithQty} 
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default BestSellers;