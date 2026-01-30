import { useRef } from 'react';
import { gsap } from 'gsap';


interface Product {
  id: number;
  name: string;
  price: string;
  img: string;
}

const products = [
  { id: 1, name: "Pain au Chocolat", price: "$4.50", img: "https://images.unsplash.com/photo-1530610476181-d8ceb28bc272?auto=format&fit=crop&w=800&q=80" },
  { id: 2, name: "Classic Croissant", price: "$3.75", img: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=800&q=80" },
  { id: 3, name: "Sourdough Loaf", price: "$8.00", img: "https://images.unsplash.com/photo-1585478474936-e248a3181812?auto=format&fit=crop&w=800&q=80" },
];

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleAddToCart = () => {
    if (buttonRef.current) {
      gsap.to(buttonRef.current, { 
        scale: 0.95, 
        duration: 0.1, 
        yoyo: true, 
        repeat: 1 
      });
    }
  };

  return (
    <div className="group relative bg-white p-4 shadow-sm hover:shadow-xl transition-all duration-500 rounded-sm hover:-translate-y-2">
      <div className="relative overflow-hidden aspect-[4/5] mb-4 bg-gray-100">
        <img 
          src={product.img} 
          alt={product.name} 
          className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700 ease-in-out"
        />
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <button 
                ref={buttonRef}
                onClick={handleAddToCart}
                className="bg-white text-bakery-text px-6 py-2 text-sm font-sans uppercase tracking-wider hover:bg-bakery-text hover:text-white transition-colors"
            >
                Add to Cart
            </button>
        </div>
      </div>
      <div className="text-center">
        <h3 className="font-script text-2xl text-bakery-text mb-1">{product.name}</h3>
        <p className="font-sans text-sm text-bakery-gold font-medium">{product.price}</p>
      </div>
    </div>
  );
};

const ProductGrid = () => {
  return (
    <section className="py-24 max-w-7xl mx-auto px-6">
      <div className="text-center mb-16">
        <h2 className="text-5xl font-script text-bakery-text mb-4">Fresh from the Oven</h2>
        <div className="w-24 h-1 bg-bakery-accent mx-auto"></div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {products.map(p => <ProductCard key={p.id} product={p} />)}
      </div>
    </section>
  );
};

export default ProductGrid;