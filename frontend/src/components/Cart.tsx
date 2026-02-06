import React, { useState } from "react";
import {
  X,
  Plus,
  Minus,
  ShoppingBag,
  CreditCard,
  Loader2,
  MapPin,
  AlertCircle,
} from "lucide-react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  calculateDeliveryFee,
  validateMinimumOrder,
  DELIVERY_ZONES,
} from "../utils/deliveryZones";

const STRIPE_PUBLIC_KEY =
  "pk_test_51Sw4uTHSNIUfvIQ0ghzLgI2l5uLzIqLJ2dF5LiST6Hf5exmZ4UIJ4OiLdlpbk7gkqAA8orrF818zLt1M4P7mjWy700kL1r7AM5";
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

const CartDrawer: React.FC<CartProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemove,
}) => {
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [selectedPostalCode, setSelectedPostalCode] = useState<string>("");
  const [deliveryZoneInfo, setDeliveryZoneInfo] = useState<{
    fee: number;
    minimumOrder: number;
    zoneName: string;
    isValid: boolean;
  } | null>(null);

  // Calculs
  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const delivery = deliveryZoneInfo?.isValid ? deliveryZoneInfo.fee : 0;
  const total = subtotal + delivery;

  // Validate minimum order
  const minimumOrderValidation = deliveryZoneInfo?.isValid
    ? {
        isValid: subtotal >= deliveryZoneInfo.minimumOrder,
        shortfall: Math.max(0, deliveryZoneInfo.minimumOrder - subtotal),
        postalCode: selectedPostalCode,
        minimumOrder: deliveryZoneInfo.minimumOrder,
      }
    : null;

  const handlePostalCodeChange = (postalCode: string) => {
    setSelectedPostalCode(postalCode);

    if (postalCode) {
      const zoneInfo = calculateDeliveryFee(postalCode);
      setDeliveryZoneInfo(zoneInfo);
    } else {
      setDeliveryZoneInfo(null);
    }
  };

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
        alert(
          "Intégration Stripe prête ! creation de serveur backend en cours... pour créer la session de paiement sécurisée.",
        );
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
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-150 transition-opacity duration-500 ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        onClick={onClose}
      />

      <div
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-white z-200 shadow-2xl transform transition-transform duration-500 ease-out ${isOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-stone-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ShoppingBag className="text-[#C5A065]" size={24} />
              <h2 className="text-xl font-serif text-[#2D2A26]">
                Votre Sélection
              </h2>
              <span className="bg-[#C5A065]/10 text-[#C5A065] text-xs font-bold px-2 py-1 rounded-full">
                {items.length}
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-stone-100 rounded-full transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <div className="grow overflow-y-auto p-6 space-y-6">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                <div className="w-20 h-20 bg-stone-50 rounded-full flex items-center justify-center text-stone-300">
                  <ShoppingBag size={40} />
                </div>
                <p className="text-stone-500 font-light italic">
                  Votre panier est encore vide...
                </p>
                <button
                  onClick={onClose}
                  className="text-[#C5A065] font-bold uppercase text-xs tracking-widest underline"
                >
                  Continuer mes achats
                </button>
              </div>
            ) : (
              items.map((item) => (
                <div key={item.id} className="flex gap-4 group">
                  {/* Image Produit */}
                  <div className="w-24 h-24 rounded-lg overflow-hidden shrink-0 bg-stone-100 border border-stone-100">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Infos Produit */}
                  <div className="grow">
                    <div className="flex justify-between mb-1">
                      <h3 className="font-serif text-[#2D2A26]">{item.name}</h3>
                      <button
                        onClick={() => onRemove(item.id)}
                        className="text-stone-300 hover:text-red-400 transition-colors"
                      >
                        <X size={16} />
                      </button>
                    </div>
                    <p className="text-[#C5A065] font-bold mb-3">
                      {item.price.toFixed(2)} $
                    </p>

                    {/* Contrôle Quantité */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center border border-stone-200 rounded-lg">
                        <button
                          onClick={() => onUpdateQuantity(item.id, -1)}
                          className="p-1 px-2 hover:bg-stone-50"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="px-3 py-1 text-sm font-medium">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => onUpdateQuantity(item.id, 1)}
                          className="p-1 px-2 hover:bg-stone-50"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                      <span className="text-sm font-bold text-[#C5A065]">
                        {(item.price * item.quantity).toFixed(2)} $
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}

            {/* Postal Code Input */}
            {items.length > 0 && (
              <div className="bg-white p-4 rounded-lg border border-stone-200">
                <label className="flex items-center gap-2 text-sm font-medium text-[#2D2A26] mb-2">
                  <MapPin size={16} className="text-[#C5A065]" />
                  Code Postal pour Livraison:
                </label>
                <Select
                  value={selectedPostalCode}
                  onValueChange={handlePostalCodeChange}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Sélectionnez votre code postal" />
                  </SelectTrigger>
                  <SelectContent
                    className="z-300 max-h-60"
                    side="bottom"
                    align="start"
                  >
                    {DELIVERY_ZONES.flatMap((zone) =>
                      zone.postalCodes.map((postalCode) => (
                        <SelectItem
                          key={`${zone.name}-${postalCode}`}
                          value={postalCode}
                        >
                          {postalCode} ({zone.deliveryFee.toFixed(2)}$
                          livraison, min. {zone.minimumOrder.toFixed(2)}$)
                        </SelectItem>
                      )),
                    )}
                  </SelectContent>
                </Select>
                {deliveryZoneInfo && (
                  <div
                    className={`mt-2 p-2 rounded text-xs ${
                      deliveryZoneInfo.isValid
                        ? "bg-green-50 text-green-700"
                        : "bg-red-50 text-red-700"
                    }`}
                  >
                    {deliveryZoneInfo.isValid ? (
                      <>
                        <div className="font-semibold">
                          ✓ {selectedPostalCode}
                        </div>
                        <div>
                          Frais: {deliveryZoneInfo.fee.toFixed(2)}$ | Minimum:{" "}
                          {deliveryZoneInfo.minimumOrder.toFixed(2)}$
                        </div>
                      </>
                    ) : (
                      <div className="flex items-center gap-1">
                        <AlertCircle size={14} />
                        Code postal non trouvé
                      </div>
                    )}
                  </div>
                )}
                {minimumOrderValidation && !minimumOrderValidation.isValid && (
                  <div className="mt-2 p-2 rounded text-xs bg-amber-50 text-amber-700 flex items-start gap-1">
                    <AlertCircle size={14} className="mt-0.5 shrink-0" />
                    <div>
                      Minimum de commande non atteint. Il manque{" "}
                      {minimumOrderValidation.shortfall.toFixed(2)}$ pour{" "}
                      {minimumOrderValidation.postalCode}.
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Totals and Payment */}
            {items.length > 0 && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-stone-500 font-light">
                  <span>Sous-total</span>
                  <span>{subtotal.toFixed(2)} $</span>
                </div>
                <div className="flex justify-between text-sm text-stone-500 font-light">
                  <span>Frais de livraison</span>
                  <span>
                    {delivery === 0
                      ? selectedPostalCode
                        ? "Code postal requis"
                        : "Sélectionnez code postal"
                      : `${delivery.toFixed(2)} $`}
                  </span>
                </div>
                <div className="flex justify-between text-xl font-serif text-[#2D2A26] pt-2">
                  <span>Total</span>
                  <span className="text-[#C5A065]">{total.toFixed(2)} $</span>
                </div>
              </div>
            )}

            {/* Payment Button */}
            {items.length > 0 && (
              <button
                onClick={handleCheckout}
                disabled={
                  isCheckingOut ||
                  !deliveryZoneInfo?.isValid ||
                  (minimumOrderValidation !== null &&
                    !minimumOrderValidation.isValid)
                }
                className="w-full bg-[#2D2A26] text-white py-4 rounded-xl font-bold uppercase tracking-widest text-sm flex items-center justify-center gap-3 hover:bg-[#C5A065] transition-all shadow-lg mt-4 group disabled:opacity-70 disabled:cursor-not-allowed"
                title={
                  !deliveryZoneInfo?.isValid
                    ? "Veuillez entrer un code postal valide"
                    : minimumOrderValidation && !minimumOrderValidation.isValid
                      ? "Montant minimum non atteint"
                      : ""
                }
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
            )}

            {/* Footer */}
            {items.length > 0 && (
              <p className="text-[10px] text-center text-stone-400 uppercase tracking-tighter">
                Paiements sécurisés par Stripe • Taxes calculées au checkout
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default CartDrawer;
