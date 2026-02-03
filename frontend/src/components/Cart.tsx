import React, { useState } from 'react';
import { X, Plus, Minus, ShoppingBag, CreditCard, Loader2 } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';

const STRIPE_PUBLIC_KEY = 'pk_test_51Sw4uTHSNIUfvIQ0ghzLgI2l5uLzIqLJ2dF5LiST6Hf5exmZ4UIJ4OiLdlpbk7gkqAA8orrF818zLt1M4P7mjWy700kL1r7AM5';
const stripePromise = loadStripe(STRIPE_PUBLIC_KEY);

interface CartItem {
  id: number;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

interface CartProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (id: number, delta: number) => void;
  onRemove: (id: number) => void;
}

const CartDrawer: React.FC<CartProps> = ({ isOpen, onClose, items, onUpdateQuantity, onRemove }) => {
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  // Calculs
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const delivery = subtotal > 50 ? 0 : 5.00; 
  const total = subtotal + delivery;

  const handleCheckout = async () => {
    setIsCheckingOut(true);
    const stripe = await stripePromise;

    if (!stripe) {
      console.error("Stripe n'a pas pu être chargé");
      setIsCheckingOut(false);
      return;
    }

    try {
      // ⚠️ IMPORTANT : C'est ici que vous connecterez votre Backend plus tard.
      // Pour l'instant, on simule juste l'action car nous n'avons pas de serveur Node.js actif.
      
      console.log("Préparation de la commande pour :", items);
      
      // EXEMPLE DE CE QU'IL FAUDRA FAIRE AVEC UN SERVEUR :
      /*
      const response = await fetch('https://votre-api.com/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items }),
      });
      const session = await response.json();
      await stripe.redirectToCheckout({ sessionId: session.id });
      */

      // Simulation d'attente pour l'effet visuel
      setTimeout(() => {
        alert("Intégration Stripe prête ! creation de serveur backend en cours... pour créer la session de paiement sécurisée.");
        setIsCheckingOut(false);
      }, 1500);

    } catch (error) {
      console.error("Erreur de paiement:", error);
      setIsCheckingOut(false);
    }
  };

  return (
    <>
      <div 
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-[150] transition-opacity duration-500 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      <div className={`fixed top-0 right-0 h-full w-full max-w-md bg-white z-[200] shadow-2xl transform transition-transform duration-500 ease-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex flex-col h-full">
          
          <div className="p-6 border-b border-stone-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ShoppingBag className="text-[#C5A065]" size={24} />
              <h2 className="text-xl font-serif text-[#2D2A26]">Votre Sélection</h2>
              <span className="bg-[#C5A065]/10 text-[#C5A065] text-xs font-bold px-2 py-1 rounded-full">
                {items.length}
              </span>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-stone-100 rounded-full transition-colors">
              <X size={20} />
            </button>
          </div>

          <div className="flex-grow overflow-y-auto p-6 space-y-6">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                <div className="w-20 h-20 bg-stone-50 rounded-full flex items-center justify-center text-stone-300">
                  <ShoppingBag size={40} />
                </div>
                <p className="text-stone-500 font-light italic">Votre panier est encore vide...</p>
                <button onClick={onClose} className="text-[#C5A065] font-bold uppercase text-xs tracking-widest underline">
                  Continuer mes achats
                </button>
              </div>
            ) : (
              items.map((item) => (
                <div key={item.id} className="flex gap-4 group">
                  {/* Image Produit */}
                  <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0 bg-stone-100 border border-stone-100">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  
                  {/* Infos Produit */}
                  <div className="flex-grow">
                    <div className="flex justify-between mb-1">
                      <h3 className="font-serif text-[#2D2A26]">{item.name}</h3>
                      <button onClick={() => onRemove(item.id)} className="text-stone-300 hover:text-red-400 transition-colors">
                        <X size={16} />
                      </button>
                    </div>
                    <p className="text-[#C5A065] font-bold mb-3">{item.price.toFixed(2)} $</p>
                    
                    {/* Contrôle Quantité */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center border border-stone-200 rounded-lg">
                        <button onClick={() => onUpdateQuantity(item.id, -1)} className="p-1 px-2 hover:bg-stone-50">
                          <Minus size={14} />
                        </button>
                        <span className="px-3 text-sm font-medium">{item.quantity}</span>
                        <button onClick={() => onUpdateQuantity(item.id, 1)} className="p-1 px-2 hover:bg-stone-50">
                          <Plus size={14} />
                        </button>
                      </div>
                      <span className="text-sm font-medium text-[#2D2A26]">
                        {(item.price * item.quantity).toFixed(2)} $
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer - Paiement */}
          {items.length > 0 && (
            <div className="p-8 bg-stone-50 border-t border-stone-100 space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-stone-500 font-light">
                  <span>Sous-total</span>
                  <span>{subtotal.toFixed(2)} $</span>
                </div>
                <div className="flex justify-between text-sm text-stone-500 font-light">
                  <span>Frais de livraison</span>
                  <span>{delivery === 0 ? 'Gratuit' : `${delivery.toFixed(2)} $`}</span>
                </div>
                <div className="flex justify-between text-xl font-serif text-[#2D2A26] pt-2">
                  <span>Total</span>
                  <span className="text-[#C5A065]">{total.toFixed(2)} $</span>
                </div>
              </div>

              {/* BOUTON DE PAIEMENT */}
              <button 
                onClick={handleCheckout}
                disabled={isCheckingOut}
                className="w-full bg-[#2D2A26] text-white py-4 rounded-xl font-bold uppercase tracking-widest text-sm flex items-center justify-center gap-3 hover:bg-[#C5A065] transition-all shadow-lg mt-4 group disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isCheckingOut ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Patientez...
                  </>
                ) : (
                  <>
                    <CreditCard size={18} />
                    Passer au paiement
                  </>
                )}
              </button>
              
              <p className="text-[10px] text-center text-stone-400 uppercase tracking-tighter">
                Paiements sécurisés par Stripe • Taxes calculées au checkout
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default CartDrawer;