import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  X,
  Plus,
  Minus,
  ShoppingBag,
  CreditCard,
  MapPin,
  AlertCircle,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  calculateDeliveryFee,
  DELIVERY_ZONES,
} from "../utils/deliveryZones";
import { authClient } from "../lib/AuthClient";
import { TAX_RATE } from "../data";

interface CartItem {
  id: number;
  name: string;
  price: number;
  image: string;
  quantity: number;
  hasTaxes?: boolean;
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
  const navigate = useNavigate();
  const [selectedPostalCode, setSelectedPostalCode] = useState<string>("");
  const [deliveryType, setDeliveryType] = useState<"pickup" | "delivery">(
    "pickup",
  );
  const [pickupLocation, setPickupLocation] = useState<"Montreal" | "Laval">(
    "Laval",
  );
  const [deliveryZoneInfo, setDeliveryZoneInfo] = useState<{
    fee: number;
    minimumOrder: number;
    zoneName: string;
    isValid: boolean;
  } | null>(null);

  // Log cart open/close events
  useEffect(() => {
    if (isOpen) {
      console.log(`🛒 [FRONTEND] Cart opened with ${items.length} items`);
    } else {
      console.log(`🛒 [FRONTEND] Cart closed`);
    }
  }, [isOpen, items.length]);

  // Calculs
  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  const taxes = items.reduce((sum, item) => {
    if (item.hasTaxes) {
      return sum + item.price * item.quantity * TAX_RATE;
    }
    return sum;
  }, 0);

  const delivery =
    deliveryType === "delivery" && deliveryZoneInfo?.isValid
      ? deliveryZoneInfo.fee
      : 0;

  const total = subtotal + taxes + delivery;

  // Validate minimum order
  const minimumOrderValidation =
    deliveryType === "delivery" && deliveryZoneInfo?.isValid
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

  const handleProceedToPayment = async () => {
    console.log("🛒 [CART] handleProceedToPayment called", {
      deliveryType,
      pickupLocation,
      itemsCount: items.length,
    });
    if (deliveryType === "delivery" && !selectedPostalCode) {
      alert("Veuillez sélectionner un code postal pour la livraison.");
      return;
    }

    if (minimumOrderValidation && !minimumOrderValidation.isValid) {
      alert(
        `Minimum de commande non atteint. Il manque ${minimumOrderValidation.shortfall.toFixed(2)}$ pour ${minimumOrderValidation.postalCode}.`,
      );
      return;
    }

    // Check if user is authenticated
    console.log("🔐 [CART] Checking authentication status...");
    try {
      const session = await authClient.getSession({
        query: { disableCookieCache: true },
      });
      console.log("🔐 [CART] Session result:", session);

      if (!session.data) {
        console.log("⚠️ [CART] User not authenticated, redirecting to login");
        // Save checkout intent to localStorage
        localStorage.setItem(
          "checkout_intent",
          JSON.stringify({
            items: items,
            postalCode: selectedPostalCode,
            deliveryType: deliveryType,
            pickupLocation:
              deliveryType === "pickup" ? pickupLocation : undefined,
            deliveryFee: delivery,
            subtotal: subtotal,
            taxes: taxes,
            total: total,
            timestamp: Date.now(),
          }),
        );

        alert(
          "Vous devez être connecté pour passer une commande. Votre panier sera conservé.",
        );
        onClose();
        navigate("/se-connecter");
        return;
      }

      console.log("✅ [CART] User authenticated, proceeding to checkout");
    } catch (error) {
      console.error("❌ [CART] Error checking authentication:", error);
      alert(
        "Erreur lors de la vérification de la connexion. Veuillez réessayer.",
      );
      return;
    }

    console.log(
      `💳 [FRONTEND] Navigating to checkout page for order total: ${total.toFixed(2)}$`,
    );

    // Navigate to checkout page with order data
    const checkoutState = {
      items: items,
      postalCode: selectedPostalCode,
      deliveryType: deliveryType,
      pickupLocation: deliveryType === "pickup" ? pickupLocation : undefined,
      deliveryFee: delivery,
      subtotal: subtotal,
      taxes: taxes,
      total: total,
    };
    console.log("📦 [CART] Checkout state:", checkoutState);

    navigate("/checkout", {
      state: checkoutState,
    });

    // Close the cart drawer
    onClose();
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

            {/* Delivery Type Selection */}
            {items.length > 0 && (
              <div className="bg-white p-4 rounded-lg border border-stone-200">
                <label className="flex items-center gap-2 text-sm font-medium text-[#2D2A26] mb-3">
                  <ShoppingBag size={16} className="text-[#C5A065]" />
                  Mode de récupération:
                </label>
                <div className="flex gap-3">
                  <button
                    onClick={() => setDeliveryType("pickup")}
                    className={`flex-1 py-2 px-3 rounded-lg border text-sm font-medium transition-colors ${
                      deliveryType === "pickup"
                        ? "bg-[#C5A065] text-white border-[#C5A065]"
                        : "bg-white text-[#2D2A26] border-stone-300 hover:border-[#C5A065]"
                    }`}
                  >
                    Ramassage
                  </button>
                  <button
                    onClick={() => setDeliveryType("delivery")}
                    className={`flex-1 py-2 px-3 rounded-lg border text-sm font-medium transition-colors ${
                      deliveryType === "delivery"
                        ? "bg-[#C5A065] text-white border-[#C5A065]"
                        : "bg-white text-[#2D2A26] border-stone-300 hover:border-[#C5A065]"
                    }`}
                  >
                    Livraison
                  </button>
                </div>
              </div>
            )}

            {/* Pickup Location Selection */}
            {items.length > 0 && deliveryType === "pickup" && (
              <div className="bg-white p-4 rounded-lg border border-stone-200">
                <label className="flex items-center gap-2 text-sm font-medium text-[#2D2A26] mb-3">
                  <MapPin size={16} className="text-[#C5A065]" />
                  Lieu de ramassage:
                </label>
                <div className="flex gap-3">
                  <button
                    onClick={() => setPickupLocation("Laval")}
                    className={`flex-1 py-2 px-3 rounded-lg border text-sm font-medium transition-colors ${
                      pickupLocation === "Laval"
                        ? "bg-[#C5A065] text-white border-[#C5A065]"
                        : "bg-white text-[#2D2A26] border-stone-300 hover:border-[#C5A065]"
                    }`}
                  >
                    Laval
                  </button>
                  <button
                    onClick={() => setPickupLocation("Montreal")}
                    className={`flex-1 py-2 px-3 rounded-lg border text-sm font-medium transition-colors ${
                      pickupLocation === "Montreal"
                        ? "bg-[#C5A065] text-white border-[#C5A065]"
                        : "bg-white text-[#2D2A26] border-stone-300 hover:border-[#C5A065]"
                    }`}
                  >
                    Montréal
                  </button>
                </div>
              </div>
            )}

            {/* Postal Code Input */}
            {items.length > 0 && deliveryType === "delivery" && (
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
                {taxes > 0 && (
                  <div className="flex justify-between text-sm text-stone-500 font-light">
                    <span>Taxes</span>
                    <span>{taxes.toFixed(2)} $</span>
                  </div>
                )}
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

            {/* Payment Section */}
            {items.length > 0 && (
              <button
                onClick={handleProceedToPayment}
                disabled={
                  deliveryType === "delivery" &&
                  (!deliveryZoneInfo?.isValid ||
                    (minimumOrderValidation !== null &&
                      !minimumOrderValidation.isValid))
                }
                className={`w-full py-4 rounded-xl font-bold uppercase tracking-widest text-sm flex items-center justify-center gap-3 transition-all shadow-lg mt-4 group ${
                  deliveryType === "delivery" &&
                  (!deliveryZoneInfo?.isValid ||
                    (minimumOrderValidation !== null &&
                      !minimumOrderValidation.isValid))
                    ? "bg-stone-400 text-stone-600 cursor-not-allowed"
                    : "bg-[#2D2A26] text-white hover:bg-[#C5A065]"
                }`}
                title={
                  deliveryType === "delivery" && !deliveryZoneInfo?.isValid
                    ? "Veuillez entrer un code postal valide"
                    : deliveryType === "delivery" &&
                        minimumOrderValidation &&
                        !minimumOrderValidation.isValid
                      ? "Montant minimum non atteint"
                      : ""
                }
              >
                <CreditCard size={18} />
                Passer au paiement
              </button>
            )}

            {/* Footer */}
            {items.length > 0 && (
              <p className="text-[10px] text-center text-stone-400 uppercase tracking-tighter mt-4">
                Paiements sécurisés par Square • Taxes calculées au checkout
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default CartDrawer;
