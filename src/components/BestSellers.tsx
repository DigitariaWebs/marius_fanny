import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { FiMinus, FiPlus, FiShoppingCart, FiX } from 'react-icons/fi';

const products = [
  { id: 1, name: "Boîte à lunch", price: 19.95, img: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=500&q=80" },
  { id: 2, name: "Salade repas", price: 20.95, img: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=500&q=80" },
  { id: 3, name: "Gâteau croustillant", price: 37.50, img: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=500&q=80" },
  { id: 4, name: "Tarte citron", price: 29.95, img: "https://images.unsplash.com/photo-1519915028121-7d3463d20b13?auto=format&fit=crop&w=500&q=80" },
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

interface CartItem extends Product {
  quantity: number;
}

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product, quantity: number) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart }) => {
  const [qty, setQty] = useState(1);

  const handleDecrement = () => {
    if (qty > 1) setQty(qty - 1);
  };

  const handleIncrement = () => {
    setQty(qty + 1);
  };

  const handleAddToCart = () => {
    onAddToCart(product, qty);
  };

  return (
    <div className="relative flex flex-col items-center bg-white border-2 border-bakery-text/20 rounded-t-[100px] rounded-b-[30px] p-6 pt-12 transition-transform duration-300 hover:-translate-y-2 hover:shadow-xl">
      <div className="w-40 h-40 mb-4 rounded-full overflow-hidden shadow-md">
        <img 
          src={product.img} 
          alt={product.name} 
          className="w-full h-full object-cover transform hover:scale-110 transition-duration-500"
        />
      </div>

      <h3 className="font-sans font-bold text-lg uppercase tracking-wide text-bakery-text mb-1 text-center">
        {product.name}
      </h3>
      <p className="font-sans text-bakery-text/60 text-sm mb-6">
        Boîte de 6 • 4oz
      </p>
      <p className="font-sans font-bold text-xl text-bakery-text mb-6">
        {product.price.toFixed(2)}$
      </p>

      <div className="flex items-center justify-between w-full px-4 mb-4">
        <button 
          onClick={handleDecrement}
          className="w-8 h-8 rounded-full bg-[#7d5c27] text-white flex items-center justify-center hover:bg-[#6d4c17] transition-colors"
        >
          <FiMinus />
        </button>
        <span className="font-sans font-bold text-lg">{qty}</span>
        <button 
          onClick={handleIncrement}
          className="w-8 h-8 rounded-full bg-[#f0e1e3] text-bakery-text flex items-center justify-center hover:bg-[#e0d1d3] transition-colors"
        >
          <FiPlus />
        </button>
      </div>

      <button 
        onClick={handleAddToCart}
        className="w-full bg-[#c69d75] py-3 rounded-full font-sans font-bold text-xs uppercase tracking-widest text-bakery-text hover:bg-[#b68d65] transition-colors duration-300 flex items-center justify-center gap-2"
      >
        <FiPlus size={16} />
        Ajouter au panier
      </button>
    </div>
  );
};

const BestSellers: React.FC = () => {
  const marqueeRef = useRef(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.to(".marquee-text", {
        xPercent: -50,
        repeat: -1,
        duration: 20,
        ease: "linear",
      });
    }, marqueeRef);

    return () => ctx.revert();
  }, []);

  const handleAddToCart = (product: Product, quantity: number) => {
    const existingItem = cart.find(item => item.id === product.id);
    if (existingItem) {
      setCart(cart.map(item =>
        item.id === product.id
          ? { ...item, quantity: item.quantity + quantity }
          : item
      ));
    } else {
      setCart([...cart, { ...product, quantity }]);
    }
    setIsCartOpen(true);
  };

  const decreaseQuantity = (productId: number) => {
    const item = cart.find(item => item.id === productId);
    if (item && item.quantity === 1) {
      setCart(cart.filter(item => item.id !== productId));
    } else {
      setCart(cart.map(item =>
        item.id === productId
          ? { ...item, quantity: item.quantity - 1 }
          : item
      ));
    }
  };

  const removeFromCart = (productId: number) => {
    setCart(cart.filter(item => item.id !== productId));
  };

  const calculateTotal = (): string => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0).toFixed(2);
  };

  const getTotalItems = (): number => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  return (
    <section className="relative py-24 overflow-hidden bg-[#F9F7F2]">
      {/* Marquee */}
      <div ref={marqueeRef} className="absolute top-10 left-0 w-full z-0 select-none opacity-10 pointer-events-none whitespace-nowrap overflow-visible">
        <div className="marquee-text inline-block text-[12vw] font-black font-sans text-bakery-text uppercase leading-none tracking-tighter transform -rotate-2">
          Best Sellers — Nos Incontournables — Best Sellers — Nos Incontournables — 
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-5xl md:text-6xl font-script text-bakery-text mb-4">Les Favoris</h2>
          <p className="font-sans text-bakery-text/60">Découvrez les créations que tout le monde s'arrache.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 gap-y-12">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} onAddToCart={handleAddToCart} />
          ))}
        </div>
      </div>

      {/* Floating Cart Button */}
      {cart.length > 0 && (
        <button
          onClick={() => setIsCartOpen(true)}
          className="fixed bottom-8 right-8 bg-[#c69d75] text-bakery-text p-4 rounded-full shadow-2xl hover:scale-110 transition-transform duration-300 z-40"
        >
          <FiShoppingCart size={28} />
          <span className="absolute -top-2 -right-2 bg-[#7d5c27] text-white w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold">
            {getTotalItems()}
          </span>
        </button>
      )}

      {/* Cart Modal */}
      {isCartOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-[#F9F7F2] rounded-3xl max-w-lg w-full max-h-[90vh] overflow-hidden shadow-2xl">
            <div className="bg-white border-b-2 border-bakery-text/20 p-6 flex items-center justify-between">
              <h2 className="text-2xl font-black uppercase text-bakery-text">Panier</h2>
              <button
                onClick={() => setIsCartOpen(false)}
                className="text-bakery-text hover:text-[#7d5c27] transition-colors"
              >
                <FiX size={28} />
              </button>
            </div>

            <div className="overflow-y-auto max-h-[60vh] p-6">
              {cart.length === 0 ? (
                <p className="text-center text-bakery-text/60 py-10">Votre panier est vide</p>
              ) : (
                <div className="space-y-4">
                  {cart.map((item) => (
                    <div key={item.id} className="flex items-center gap-4 pb-4 border-b-2 border-bakery-text/10">
                      <div className="w-20 h-20 rounded-2xl overflow-hidden bg-white flex-shrink-0">
                        <img src={item.img} alt={item.name} className="w-full h-full object-cover" />
                      </div>

                      <div className="flex-1">
                        <h3 className="font-bold text-bakery-text uppercase text-sm">
                          {item.name}
                        </h3>
                        <p className="text-bakery-text/60 font-bold">{item.price.toFixed(2)}$</p>
                      </div>

                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => decreaseQuantity(item.id)}
                          className="w-8 h-8 rounded-full bg-[#7d5c27] text-white flex items-center justify-center hover:bg-[#6d4c17] transition-colors"
                        >
                          <FiMinus size={16} />
                        </button>
                        
                        <span className="font-bold text-lg w-8 text-center">{item.quantity}</span>
                        
                        <button
                          onClick={() => handleAddToCart(item, 1)}
                          className="w-8 h-8 rounded-full bg-[#f0e1e3] text-bakery-text flex items-center justify-center hover:bg-[#e0d1d3] transition-colors"
                        >
                          <FiPlus size={16} />
                        </button>
                      </div>

                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-bakery-text/60 hover:text-red-500 text-sm font-medium transition-colors"
                      >
                        Retirer
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {cart.length > 0 && (
              <div className="bg-white border-t-2 border-bakery-text/20 p-6">
                <button className="w-full bg-[#c69d75] text-bakery-text font-black text-lg py-4 rounded-full uppercase tracking-wider hover:bg-[#b68d65] transition-colors duration-300">
                  Commander · {calculateTotal()}$
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
};

export default BestSellers;