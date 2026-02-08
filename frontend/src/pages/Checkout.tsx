import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, CreditCard, MapPin, ShoppingBag, CheckCircle2, AlertTriangle } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import SquarePaymentForm from "../components/SquarePaymentForm";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { authClient, normalizedApiUrl } from "../lib/AuthClient";
import { clearCart } from "../utils/cartPersistence";

interface CartItem {
  id: number;
  name: string;
  price: number;
  image: string;
  quantity: number;
  preparationTimeHours?: number;
}

interface CheckoutState {
  items: CartItem[];
  postalCode: string;
  deliveryType: "pickup" | "delivery";
  pickupLocation?: "Montreal" | "Laval";
  deliveryFee: number;
  subtotal: number;
  total: number;
}

const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as CheckoutState;

  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [isLoadingUserData, setIsLoadingUserData] = useState(true);
  const [paymentResultModal, setPaymentResultModal] = useState<{
    isOpen: boolean;
    type: "details" | "warning";
    title: string;
    content: React.ReactNode;
    onClose: () => void;
  }>({
    isOpen: false,
    type: "details",
    title: "",
    content: null,
    onClose: () => {},
  });

  useEffect(() => {
    console.log("🛒 [CHECKOUT] Component mounted, state:", state);
    if (!state || !state.items || state.items.length === 0) {
      console.log("⚠️ [CHECKOUT] No checkout data, redirecting to home");
      navigate("/");
    } else {
      console.log("✅ [CHECKOUT] Valid checkout data received:", {
        itemsCount: state.items.length,
        deliveryType: state.deliveryType,
        pickupLocation: state.pickupLocation,
        total: state.total,
      });
    }
  }, [state, navigate]);

  // Load user data for pre-populating contact information
  useEffect(() => {
    const loadUserData = async () => {
      try {
        console.log(
          "👤 [CHECKOUT] Loading user data for contact information...",
        );
        const response = await fetch(`${normalizedApiUrl}/api/users/me`, {
          credentials: "include",
        });

        if (response.ok) {
          const result = await response.json();
          const user = result.data;

          // Pre-populate contact information from user account
          setCustomerName(user.name || "");
          setCustomerEmail(user.email || "");
          setCustomerPhone(user.profile?.phoneNumber || "");

          console.log(
            "✅ [CHECKOUT] User data loaded and contact fields pre-populated",
          );
        } else {
          console.log(
            "⚠️ [CHECKOUT] Could not load user data, user may need to fill contact info manually",
          );
        }
      } catch (error) {
        console.error("❌ [CHECKOUT] Failed to load user data:", error);
      } finally {
        setIsLoadingUserData(false);
      }
    };

    loadUserData();
  }, []);

  if (!state || !state.items) {
    return null;
  }

  const handleCustomerFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerName.trim()) {
      alert("Veuillez entrer votre nom.");
      return;
    }

    if (!customerEmail.trim() || !customerEmail.includes("@")) {
      alert("Veuillez entrer une adresse email valide.");
      return;
    }

    if (!customerPhone.trim()) {
      alert("Veuillez entrer votre numéro de téléphone.");
      return;
    }

    if (customerPhone.replace(/\D/g, "").length < 7) {
      alert("Le numéro de téléphone doit contenir au moins 7 chiffres.");
      return;
    }

    console.log(
      `💳 [CHECKOUT] Customer info collected, showing payment form for ${customerName} (${customerEmail}, ${customerPhone}), payment type: full`,
    );
    setShowPaymentForm(true);
  };

  const handlePaymentSuccess = async (paymentResult: any) => {
    const amount = paymentResult.amountMoney?.amount
      ? Number(paymentResult.amountMoney.amount) / 100
      : 0;
    const paymentId = paymentResult.paymentId;
    const status = paymentResult.status;

    console.log(
      `✅ [CHECKOUT] Payment successful! ID: ${paymentId}, Status: ${status}, Amount: ${amount}$, Payment Type: full`,
    );

    // Save order to backend
    try {
      console.log("💾 [CHECKOUT] Saving order to backend...");

      // Prepare order data
      const nameParts = customerName.trim().split(" ");
      const firstName = nameParts[0] || customerName;
      const lastName =
        nameParts.length > 1 ? nameParts.slice(1).join(" ") : "N/A";

      const orderData = {
        clientInfo: {
          firstName: firstName,
          lastName: lastName,
          email: customerEmail,
          phone: customerPhone,
        },
        deliveryType: state.deliveryType,
        deliveryAddress:
          state.deliveryType === "delivery" && state.postalCode
            ? {
                street: "À déterminer", // Temporary placeholder
                city: "À déterminer", // Temporary placeholder
                province: "QC",
                postalCode: state.postalCode,
              }
            : undefined,
        pickupLocation:
          state.deliveryType === "pickup"
            ? state.pickupLocation || "Laval"
            : undefined,
        items: state.items.map((item) => ({
          productId: item.id,
          productName: item.name,
          quantity: item.quantity,
          unitPrice: item.price,
          amount: item.price * item.quantity,
        })),
        paymentType: "full",
        depositPaid: true, // Payment was made
        squarePaymentId: paymentId,
        notes: `Square Payment ID: ${paymentId}`,
      };

      const response = await fetch(`${normalizedApiUrl}/api/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Include cookies for auth
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save order");
      }

      const result = await response.json();
      console.log("✅ [CHECKOUT] Order saved successfully:", result);

      // Clear cart from localStorage and notify UI
      clearCart();

      // Show success message
      setPaymentResultModal({
        isOpen: true,
        type: "details",
        title: "Paiement réussi!",
        content: (
          <div className="space-y-4">
            <div className="flex items-start gap-3 text-green-700 bg-green-50 p-4 rounded-lg border border-green-200">
              <CheckCircle2 className="h-5 w-5 mt-0.5 shrink-0" />
              <div>
                <p className="font-semibold">Commande confirmée</p>
                <p>Nous livrons vos produits directement à la réception.</p>
              </div>
            </div>
            <div className="space-y-2 text-stone-600 bg-stone-50 p-4 rounded-lg">
              <p>
                <span className="font-medium">Numéro de commande:</span>{" "}
                {result.data.orderNumber}
              </p>
              <p>
                <span className="font-medium">Montant:</span> {amount}$ CAD
              </p>
              <p>
                <span className="font-medium">Statut:</span> {status}
              </p>
            </div>
            <p className="text-stone-500 text-sm">
              Votre commande a été confirmée. Vous recevrez un email de
              confirmation sous peu.
            </p>
          </div>
        ),
        onClose: () => {
          console.log("🏠 [CHECKOUT] Redirecting to home page");
          navigate("/");
        },
      });
    } catch (error) {
      console.error("❌ [CHECKOUT] Failed to save order:", error);
      setPaymentResultModal({
        isOpen: true,
        type: "warning",
        title: "Attention requise",
        content: (
          <div className="space-y-4">
            <div className="flex items-start gap-3 text-amber-700 bg-amber-50 p-4 rounded-lg border border-amber-200">
              <AlertTriangle className="h-5 w-5 mt-0.5 shrink-0" />
              <div>
                <p className="font-semibold">Problème d'enregistrement</p>
                <p>
                  Le paiement a été effectué, mais l'enregistrement de la
                  commande a échoué.
                </p>
              </div>
            </div>
            <div className="text-stone-600">
              <p>
                Veuillez contacter le support avec cet identifiant de paiement :
              </p>
              <code className="block mt-2 bg-stone-100 p-2 rounded text-sm text-stone-800">
                {paymentId}
              </code>
            </div>
          </div>
        ),
        onClose: () => navigate("/"),
      });
    }
  };

  const handlePaymentError = (error: any) => {
    console.error("❌ [CHECKOUT] Payment failed:", error);

    let errorMessage = "Une erreur est survenue lors du paiement.";

    if (error.message) {
      if (error.message.includes("card")) {
        errorMessage =
          "❌ Erreur de carte de crédit. Vérifiez les informations de votre carte et réessayez.";
      } else if (error.message.includes("network")) {
        errorMessage =
          "🌐 Erreur de connexion réseau. Vérifiez votre connexion internet et réessayez.";
      } else if (error.message.includes("declined")) {
        errorMessage =
          "🚫 Paiement refusé par votre banque. Contactez votre banque ou utilisez une autre carte.";
      } else if (error.message.includes("expired")) {
        errorMessage = "⏰ Carte expirée. Utilisez une carte valide.";
      } else if (error.message.includes("insufficient")) {
        errorMessage =
          "💸 Fonds insuffisants. Vérifiez votre solde ou utilisez une autre carte.";
      } else {
        errorMessage = `❌ Erreur de paiement: ${error.message}`;
      }
    }

    setPaymentResultModal({
      isOpen: true,
      type: "warning",
      title: "Échec du paiement",
      content: (
        <div className="space-y-4">
          <p className="text-red-600 font-medium">{errorMessage}</p>
          <p className="text-stone-600 text-sm">
            Veuillez réessayer ou contacter le support si le problème persiste.
          </p>
        </div>
      ),
      onClose: () => {
        setShowPaymentForm(false);
      },
    });
  };

  return (
    <>
      <Navbar onCartClick={() => {}} cartCount={state.items.length} />

      <div
        className="min-h-screen pt-24 pb-12 px-4"
        style={{ backgroundColor: "#F9F7F2" }}
      >
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-stone-600 hover:text-[#C5A065] transition-colors mb-4"
            >
              <ArrowLeft size={20} />
              Retour
            </button>
            <h1
              className="text-4xl md:text-5xl mb-2"
              style={{
                fontFamily: "'Great Vibes', cursive",
                color: "#C5A065",
              }}
            >
              Paiement
            </h1>
            <p className="text-stone-600">
              Finalisez votre commande en toute sécurité
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Left Column - Customer Info & Payment */}
            <div className="space-y-6">
              {!showPaymentForm ? (
                <div className="bg-white rounded-2xl p-6 shadow-lg">
                  <h2 className="text-xl font-serif text-[#2D2A26] mb-2">
                    Informations de contact
                  </h2>
                  <p className="text-sm text-stone-500 mb-4">
                    {isLoadingUserData
                      ? "Chargement de vos informations..."
                      : "Vos informations de compte ont été pré-remplies. Vous pouvez les modifier si nécessaire."}
                  </p>
                  <form
                    onSubmit={handleCustomerFormSubmit}
                    className="space-y-4"
                  >
                    <div>
                      <label className="block text-sm text-stone-600 mb-2">
                        Nom complet *
                      </label>
                      <input
                        type="text"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="Jean Dupont"
                        className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C5A065]"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-stone-600 mb-2">
                        Email *
                      </label>
                      <input
                        type="email"
                        value={customerEmail}
                        onChange={(e) => setCustomerEmail(e.target.value)}
                        placeholder="jean.dupont@example.com"
                        className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C5A065]"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-stone-600 mb-2">
                        Téléphone *
                      </label>
                      <input
                        type="tel"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        placeholder="(514) 123-4567"
                        pattern="[0-9\s\-\(\)\.\+]{7,}"
                        title="Numéro de téléphone (au moins 7 chiffres)"
                        className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C5A065]"
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-[#2D2A26] text-white py-4 rounded-xl font-bold uppercase tracking-widest text-sm flex items-center justify-center gap-3 hover:bg-[#C5A065] transition-all shadow-lg"
                    >
                      <CreditCard size={18} />
                      Continuer au paiement
                    </button>
                  </form>
                </div>
              ) : (
                <div className="bg-white rounded-2xl p-6 shadow-lg">
                  <h2 className="text-xl font-serif text-[#2D2A26] mb-2">
                    Informations de paiement
                  </h2>
                  <p className="text-sm text-stone-500 mb-4">
                    Montant à payer: {state.total.toFixed(2)}$ CAD (Paiement
                    complet)
                  </p>
                  <SquarePaymentForm
                    amount={state.total}
                    onPaymentSuccess={handlePaymentSuccess}
                    onPaymentError={handlePaymentError}
                    customerEmail={customerEmail}
                    customerName={customerName}
                    deliveryAddress={{
                      postalCode: state.postalCode,
                      street: "",
                      city: "",
                      province: "",
                    }}
                  />
                </div>
              )}
            </div>

            {/* Right Column - Order Summary */}
            <div className="space-y-6">
              {/* Delivery Info */}
              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <div className="flex items-center gap-2 mb-4">
                  <MapPin size={20} className="text-[#C5A065]" />
                  <h2 className="text-xl font-serif text-[#2D2A26]">
                    Livraison
                  </h2>
                </div>
                <p className="text-stone-600">
                  {state.deliveryType === "pickup"
                    ? "Récupération"
                    : "Livraison"}
                  :{" "}
                  <span className="font-bold">
                    {state.deliveryType === "pickup"
                      ? `${state.pickupLocation || "Laval"}`
                      : state.postalCode}
                  </span>
                </p>
                <p className="text-stone-600 text-sm mt-2">
                  Frais de livraison: {state.deliveryFee.toFixed(2)} $
                </p>
              </div>

              {/* Order Summary */}
              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <div className="flex items-center gap-2 mb-4">
                  <ShoppingBag size={20} className="text-[#C5A065]" />
                  <h2 className="text-xl font-serif text-[#2D2A26]">
                    Votre commande
                  </h2>
                </div>

                <div className="space-y-3 mb-4">
                  {state.items.map((item) => (
                    <div
                      key={item.id}
                      className="text-sm"
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-stone-600">
                          {item.name} × {item.quantity}
                        </span>
                        <span className="font-medium">
                          {(item.price * item.quantity).toFixed(2)} $
                        </span>
                      </div>
                      {item.preparationTimeHours && item.preparationTimeHours > 0 && (
                        <div className="mt-1 p-2 rounded text-xs" style={{
                          backgroundColor: item.preparationTimeHours >= 24 ? '#fef2f2' : item.preparationTimeHours >= 12 ? '#fffbeb' : '#f0fdf4',
                          color: item.preparationTimeHours >= 24 ? '#dc2626' : item.preparationTimeHours >= 12 ? '#d97706' : '#16a34a'
                        }}>
                          ⏰ {item.preparationTimeHours >= 24
                            ? `Préparation: ${item.preparationTimeHours / 24} jour${item.preparationTimeHours / 24 > 1 ? 's' : ''} requis`
                            : item.preparationTimeHours >= 12
                            ? `Préparation: ${item.preparationTimeHours} heures requises`
                            : `Prêt en ${item.preparationTimeHours} heure${item.preparationTimeHours > 1 ? 's' : ''}`
                          }
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="border-t border-stone-200 pt-4 space-y-2">
                  <div className="flex justify-between text-stone-600">
                    <span>Sous-total</span>
                    <span>{state.subtotal.toFixed(2)} $</span>
                  </div>
                  <div className="flex justify-between text-stone-600">
                    <span>Livraison</span>
                    <span>{state.deliveryFee.toFixed(2)} $</span>
                  </div>
                  <div className="flex justify-between text-xl font-serif text-[#2D2A26] pt-2 border-t border-stone-200">
                    <span>Total</span>
                    <span className="text-[#C5A065]">
                      {state.total.toFixed(2)} $
                    </span>
                  </div>
                </div>
              </div>

              {/* Security Notice */}
              <p className="text-xs text-center text-stone-400 uppercase tracking-wider">
                🔒 Paiements sécurisés par Square
              </p>
            </div>
          </div>
        </div>
      </div>

      <Modal
        open={paymentResultModal.isOpen}
        onOpenChange={(open) => {
          if (!open) {
            paymentResultModal.onClose();
            setPaymentResultModal((prev) => ({ ...prev, isOpen: false }));
          }
        }}
        type={paymentResultModal.type}
        title={paymentResultModal.title}
        closable={true}
      >
        {paymentResultModal.content}
      </Modal>

      <Footer />
    </>
  );
};

export default Checkout;
