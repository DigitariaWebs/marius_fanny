import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, CreditCard, MapPin, ShoppingBag, CheckCircle2, AlertTriangle, Calendar, Clock } from "lucide-react";
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
  const [deliveryDate, setDeliveryDate] = useState("");
  const [deliveryTimeFrom, setDeliveryTimeFrom] = useState("");
  const [deliveryTimeTo, setDeliveryTimeTo] = useState("");
  const [dateValidationError, setDateValidationError] = useState("");
  const [timeSlotError, setTimeSlotError] = useState("");
  const [currentStep, setCurrentStep] = useState<
    "contact" | "delivery" | "payment"
  >("contact");
  const [isLoadingUserData, setIsLoadingUserData] = useState(true);
  const [availableHours, setAvailableHours] = useState<string[]>([]);
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

  // Delivery time slots configuration
  const getAvailableHours = (selectedDate: string) => {
    if (!selectedDate) return [];

    const date = new Date(selectedDate + "T00:00:00");
    const dayOfWeek = date.getDay(); // 0 = dimanche, 6 = samedi

    // Weekend (samedi = 6, dimanche = 0)
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      return ["08:00", "09:00", "10:00", "11:00"]; // Créneaux d'1 heure
    }

    // Semaine (lundi à vendredi)
    return [
      "08:00", // 8-9
      "09:00", // 9-10
      "10:00", // 10-11
      "11:00", // 11-11:30
      "11:30", // 11:30-12
      "12:00", // 12-12:30
      "12:30", // 12:30-13
      "13:00", // 13-13:30
      "13:30", // 13:30-14
      "14:00", // Ajouté pour permettre 13:30-14:00
    ];
  };

  // Calculate minimum delivery date based on preparation times
  const getMinimumDeliveryDate = () => {
    if (!state?.items || state.items.length === 0) {
      return new Date();
    }

    // Find the longest preparation time in hours
    const maxPreparationHours = Math.max(
      ...state.items.map((item) => item.preparationTimeHours || 0),
    );

    // Calculate when products will be ready
    const now = new Date();
    const readyTime = new Date();
    readyTime.setHours(now.getHours() + maxPreparationHours);

    // Get the day when products will be ready
    const readyDate = new Date(readyTime);
    readyDate.setHours(0, 0, 0, 0);

    // Business rule: Must order before noon for next day delivery
    // If it's after noon (12:00 PM) and trying to deliver tomorrow, push to day after
    if (now.getHours() >= 12 && maxPreparationHours === 24) {
      readyDate.setDate(readyDate.getDate() + 1);
    }

    // If products won't be ready until late in the day (after 6 PM),
    // push delivery to next day since we can't deliver late at night
    if (readyTime.getHours() >= 18) {
      readyDate.setDate(readyDate.getDate() + 1);
    }

    return readyDate;
  };

  // Format date for input field (YYYY-MM-DD)
  const formatDateForInput = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const minDeliveryDate = formatDateForInput(getMinimumDeliveryDate());
  const maxPreparationTime = state?.items
    ? Math.max(...state.items.map((item) => item.preparationTimeHours || 0))
    : 0;

  // Get products that require the maximum preparation time
  const getProductsRequiringMaxPreparation = () => {
    if (!state?.items) return [];
    return state.items.filter(
      (item) => item.preparationTimeHours === maxPreparationTime,
    );
  };

  // Validate the selected delivery date
  const validateDeliveryDate = (selectedDate: string) => {
    if (!selectedDate) {
      setDateValidationError("");
      return true;
    }

    // Parse selected date and normalize to midnight local time
    const selected = new Date(selectedDate + "T00:00:00");
    const minDate = getMinimumDeliveryDate();

    // Compare dates (both at midnight)
    if (selected < minDate) {
      const daysNeeded = Math.ceil(maxPreparationTime / 24);
      const productsRequiringTime = getProductsRequiringMaxPreparation();
      const productNames = productsRequiringTime.map((p) => p.name).join(", ");

      const now = new Date();
      const noonCutoffMessage =
        maxPreparationTime === 24 && now.getHours() >= 12
          ? " Note: Pour une livraison le lendemain, vous devez commander avant 12h (midi)."
          : "";

      setDateValidationError(
        `❌ Date trop tôt! Les produits suivants nécessitent ${maxPreparationTime}h (${daysNeeded} jour${daysNeeded > 1 ? "s" : ""}) de préparation: ${productNames}. Date minimum: ${minDate.toLocaleDateString("fr-CA", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}.${noonCutoffMessage}`,
      );
      return false;
    }

    setDateValidationError("");
    return true;
  };

  // Handle date change with real-time validation
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value;
    setDeliveryDate(newDate);
    validateDeliveryDate(newDate);
  };

  // Mettre à jour les heures disponibles quand la date change
  useEffect(() => {
    if (deliveryDate) {
      setAvailableHours(getAvailableHours(deliveryDate));
      // Reset les heures sélectionnées si la date change
      setDeliveryTimeFrom("");
      setDeliveryTimeTo("");
      setTimeSlotError("");
    }
  }, [deliveryDate]);

  // Validate time slot to ensure end time is after start time
  const validateTimeSlot = (from: string, to: string) => {
    if (!from || !to) {
      setTimeSlotError("");
      return;
    }

    // Convert time strings to comparable numbers (e.g., "15:30" -> 1530)
    const fromTime = parseInt(from.replace(":", ""));
    const toTime = parseInt(to.replace(":", ""));

    if (toTime <= fromTime) {
      setTimeSlotError("⚠️ L'heure de fin doit être après l'heure de début");
    } else {
      setTimeSlotError("");
    }
  };

  const handleTimeFromChange = (time: string) => {
    setDeliveryTimeFrom(time);
    setDeliveryTimeTo("");
    setTimeSlotError("");
  };

  const handleTimeToChange = (time: string) => {
    setDeliveryTimeTo(time);
    validateTimeSlot(deliveryTimeFrom, time);
  };

  // Filter available end times based on selected start time
  const getAvailableEndTimes = () => {
    if (!deliveryTimeFrom || !deliveryDate) return [];
    
    const date = new Date(deliveryDate + "T00:00:00");
    const dayOfWeek = date.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    if (isWeekend) {
      // Weekend: créneaux d'1 heure (8-9, 9-10, 10-11, 11-12)
      const fromHour = parseInt(deliveryTimeFrom);
      
      // Le dernier créneau commence à 11:00 et finit à 12:00
      if (fromHour === 11) {
        return ["12:00"];
      }
      
      const nextHour = String(fromHour + 1).padStart(2, '0') + ":00";
      return [nextHour];
    }

    // Semaine: logique avec demi-heures
    const endTimes: string[] = [];
    
    // Si l'heure de début se termine par :00 (heures pleines)
    if (deliveryTimeFrom.endsWith(":00")) {
      const fromHour = parseInt(deliveryTimeFrom);
      
      // Pour 8:00, 9:00, 10:00
      if (fromHour >= 8 && fromHour <= 10) {
        endTimes.push(String(fromHour) + ":30");
        endTimes.push(String(fromHour + 1).padStart(2, '0') + ":00");
      }
      // Pour 11:00
      else if (fromHour === 11) {
        endTimes.push("11:30");
        endTimes.push("12:00");
      }
      // Pour 12:00
      else if (fromHour === 12) {
        endTimes.push("12:30");
        endTimes.push("13:00");
      }
      // Pour 13:00
      else if (fromHour === 13) {
        endTimes.push("13:30");
        endTimes.push("14:00");
      }
    }
    
    // Si l'heure de début est :30
    if (deliveryTimeFrom.endsWith(":30")) {
      const fromHour = parseInt(deliveryTimeFrom);
      
      // Pour 11:30
      if (fromHour === 11) {
        endTimes.push("12:00");
      }
      // Pour 12:30
      else if (fromHour === 12) {
        endTimes.push("13:00");
      }
      // Pour 13:30
      else if (fromHour === 13) {
        endTimes.push("14:00");
      }
      // Pour les autres demi-heures (8:30, 9:30, 10:30)
      else if (fromHour >= 8 && fromHour <= 10) {
        endTimes.push(String(fromHour + 1).padStart(2, '0') + ":00");
      }
    }
    
    return endTimes;
  };

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
      `👤 [CHECKOUT] Customer info collected: ${customerName} (${customerEmail}, ${customerPhone}), moving to delivery step`,
    );
    setCurrentStep("delivery");
  };

  const handleDeliveryFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!deliveryDate) {
      alert("Veuillez sélectionner une date de livraison.");
      return;
    }

    if (!deliveryTimeFrom) {
      alert("Veuillez sélectionner l'heure de début de votre créneau.");
      return;
    }

    if (!deliveryTimeTo) {
      alert("Veuillez sélectionner l'heure de fin de votre créneau.");
      return;
    }

    // Validate that end time is after start time
    if (deliveryTimeFrom >= deliveryTimeTo) {
      alert("L'heure de fin doit être après l'heure de début.");
      return;
    }

    // Validate that the selected date is not before the minimum date
    if (!validateDeliveryDate(deliveryDate)) {
      // Error message already set by validateDeliveryDate
      return;
    }

    console.log(
      `📅 [CHECKOUT] Delivery info collected: ${deliveryDate} de ${deliveryTimeFrom} à ${deliveryTimeTo}, moving to payment step`,
    );
    setCurrentStep("payment");
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
        deliveryDate: deliveryDate,
        deliveryTimeSlot: `${deliveryTimeFrom} - ${deliveryTimeTo}`,
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
        notes: `Square Payment ID: ${paymentId} | Livraison prévue: ${deliveryDate} de ${deliveryTimeFrom} à ${deliveryTimeTo}`,
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
      onClose: () => {},
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
              {currentStep === "contact" && "Informations client"}
              {currentStep === "delivery" && "Créneau de livraison"}
              {currentStep === "payment" && "Paiement sécurisé"}
            </h1>
            <p className="text-stone-600">
              {currentStep === "contact" && "Renseignez vos coordonnées"}
              {currentStep === "delivery" &&
                "Choisissez votre créneau de livraison"}
              {currentStep === "payment" &&
                "Finalisez votre commande en toute sécurité"}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Left Column - Multi-step Checkout */}
            <div className="space-y-6">
              {/* Step 1: Contact Information */}
              {currentStep === "contact" && (
                <div className="bg-white rounded-2xl p-6 shadow-lg">
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 bg-[#C5A065] text-white rounded-full flex items-center justify-center text-sm font-bold">
                        1
                      </div>
                      <h2 className="text-xl font-serif text-[#2D2A26]">
                        Informations de contact
                      </h2>
                    </div>
                    <div className="w-full bg-stone-200 rounded-full h-2">
                      <div
                        className="bg-[#C5A065] h-2 rounded-full"
                        style={{ width: "33%" }}
                      ></div>
                    </div>
                  </div>
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
                      Suivant: Créneau de livraison
                      <ArrowLeft size={18} className="rotate-180" />
                    </button>
                  </form>
                </div>
              )}

              {/* Step 2: Delivery Time Slot */}
              {currentStep === "delivery" && (
                <div className="bg-white rounded-2xl p-6 shadow-lg">
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 bg-[#C5A065] text-white rounded-full flex items-center justify-center text-sm font-bold">
                        2
                      </div>
                      <h2 className="text-xl font-serif text-[#2D2A26]">
                        Créneau de livraison
                      </h2>
                    </div>
                    <div className="w-full bg-stone-200 rounded-full h-2">
                      <div
                        className="bg-[#C5A065] h-2 rounded-full"
                        style={{ width: "66%" }}
                      ></div>
                    </div>
                  </div>

                  {maxPreparationTime > 0 && (
                    <div
                      className="mb-6 p-4 rounded-lg"
                      style={{
                        backgroundColor:
                          maxPreparationTime >= 48 ? "#fef2f2" : "#fffbeb",
                        borderLeft: `4px solid ${maxPreparationTime >= 48 ? "#dc2626" : "#d97706"}`,
                      }}
                    >
                      <p
                        className="text-sm font-medium"
                        style={{
                          color:
                            maxPreparationTime >= 48 ? "#dc2626" : "#d97706",
                        }}
                      >
                        ⏰ Temps de préparation requis:{" "}
                        {maxPreparationTime >= 24
                          ? `${Math.ceil(maxPreparationTime / 24)} jour${Math.ceil(maxPreparationTime / 24) > 1 ? "s" : ""}`
                          : `${maxPreparationTime} heure${maxPreparationTime > 1 ? "s" : ""}`}
                      </p>
                      <p className="text-xs mt-2 text-stone-600">
                        <strong>Produit(s) concerné(s):</strong>{" "}
                        {getProductsRequiringMaxPreparation()
                          .map((p) => `${p.name} (${p.preparationTimeHours}h)`)
                          .join(", ")}
                      </p>
                      <p className="text-xs mt-2 text-stone-600">
                        📅 Livraison disponible à partir du{" "}
                        {new Date(minDeliveryDate).toLocaleDateString("fr-CA", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                      {maxPreparationTime === 24 && (
                        <p className="text-xs mt-2 text-stone-600 font-medium">
                          🕐 Pour une livraison le lendemain, commandez avant
                          12h (midi)
                        </p>
                      )}
                    </div>
                  )}

                  <form
                    onSubmit={handleDeliveryFormSubmit}
                    className="space-y-4"
                  >
                    <div>
                      <label className="block text-sm text-stone-600 mb-2">
                        Date de livraison *
                      </label>
                      <input
                        type="date"
                        value={deliveryDate}
                        onChange={handleDateChange}
                        min={minDeliveryDate}
                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 ${
                          dateValidationError
                            ? "border-red-500 focus:ring-red-500"
                            : "border-stone-300 focus:ring-[#C5A065]"
                        }`}
                        required
                      />
                      {dateValidationError && (
                        <p className="mt-2 text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">
                          {dateValidationError}
                        </p>
                      )}
                      {deliveryDate && !dateValidationError && (
                        <p className="mt-2 text-sm text-green-600 bg-green-50 p-3 rounded-lg border border-green-200">
                          ✅ Date valide! Livraison prévue le{" "}
                          {new Date(deliveryDate).toLocaleDateString("fr-CA", {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="flex text-sm text-stone-600 mb-2 items-center gap-2">
                          <Clock size={16} />
                          De *
                        </label>
                        <select
                          value={deliveryTimeFrom}
                          onChange={(e) => handleTimeFromChange(e.target.value)}
                          className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C5A065] bg-white"
                          required
                        >
                          <option value="">Heure de début</option>
                          {availableHours.map((time) => (
                            <option key={time} value={time}>
                              {time}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="flex text-sm text-stone-600 mb-2 items-center gap-2">
                          <Clock size={16} />À *
                        </label>
                        <select
                          value={deliveryTimeTo}
                          onChange={(e) => handleTimeToChange(e.target.value)}
                          className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 bg-white ${
                            timeSlotError
                              ? "border-red-500 focus:ring-red-500"
                              : "border-stone-300 focus:ring-[#C5A065]"
                          }`}
                          required
                          disabled={!deliveryTimeFrom}
                        >
                          <option value="">Heure de fin</option>
                          {getAvailableEndTimes().map((time) => (
                            <option key={time} value={time}>
                              {time}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {timeSlotError && (
                      <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">
                        {timeSlotError}
                      </p>
                    )}

                    {deliveryTimeFrom && deliveryTimeTo && !timeSlotError && (
                      <div className="text-sm text-green-600 bg-green-50 p-3 rounded-lg border border-green-200">
                        ✅ <strong>Créneau sélectionné:</strong>{" "}
                        {deliveryTimeFrom} - {deliveryTimeTo}
                      </div>
                    )}

                    <div className="flex gap-3 pt-4">
                      <button
                        type="button"
                        onClick={() => {
                          setCurrentStep("contact");
                          setDateValidationError("");
                          setTimeSlotError("");
                        }}
                        className="flex-1 bg-stone-200 text-stone-700 py-4 rounded-xl font-bold uppercase tracking-widest text-sm flex items-center justify-center gap-3 hover:bg-stone-300 transition-all"
                      >
                        <ArrowLeft size={18} />
                        Retour
                      </button>
                      <button
                        type="submit"
                        disabled={!!dateValidationError || !!timeSlotError || !deliveryTimeFrom || !deliveryTimeTo}
                        className={`flex-1 py-4 rounded-xl font-bold uppercase tracking-widest text-sm flex items-center justify-center gap-3 transition-all shadow-lg ${
                          dateValidationError || timeSlotError || !deliveryTimeFrom || !deliveryTimeTo
                            ? "bg-stone-400 text-stone-600 cursor-not-allowed"
                            : "bg-[#2D2A26] text-white hover:bg-[#C5A065]"
                        }`}
                      >
                        Paiement
                        <ArrowLeft size={18} className="rotate-180" />
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Step 3: Payment */}
              {currentStep === "payment" && (
                <div className="bg-white rounded-2xl p-6 shadow-lg">
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 bg-[#C5A065] text-white rounded-full flex items-center justify-center text-sm font-bold">
                        3
                      </div>
                      <h2 className="text-xl font-serif text-[#2D2A26]">
                        Informations de paiement
                      </h2>
                    </div>
                    <div className="w-full bg-stone-200 rounded-full h-2">
                      <div
                        className="bg-[#C5A065] h-2 rounded-full"
                        style={{ width: "100%" }}
                      ></div>
                    </div>
                  </div>
                  <p className="text-sm text-stone-500 mb-4">
                    Montant à payer: {state.total.toFixed(2)}$ CAD (Paiement
                    complet)
                  </p>
                  <div className="mb-4 p-3 bg-stone-50 rounded-lg">
                    <p className="text-sm text-stone-600">
                      <strong>Client:</strong> {customerName}
                    </p>
                    <p className="text-sm text-stone-600">
                      <strong>Livraison:</strong>{" "}
                      {new Date(deliveryDate).toLocaleDateString("fr-CA")} de{" "}
                      {deliveryTimeFrom} à {deliveryTimeTo}
                    </p>
                  </div>
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
                  <button
                    onClick={() => setCurrentStep("delivery")}
                    className="w-full mt-4 bg-stone-200 text-stone-700 py-3 rounded-xl font-bold uppercase tracking-widest text-sm flex items-center justify-center gap-3 hover:bg-stone-300 transition-all"
                  >
                    <ArrowLeft size={18} />
                    Retour au créneau
                  </button>
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
                    <div key={item.id} className="text-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-stone-600">
                          {item.name} × {item.quantity}
                        </span>
                        <span className="font-medium">
                          {(item.price * item.quantity).toFixed(2)} $
                        </span>
                      </div>
                      {item.preparationTimeHours &&
                        item.preparationTimeHours > 0 && (
                          <div
                            className="mt-1 p-2 rounded text-xs"
                            style={{
                              backgroundColor:
                                item.preparationTimeHours >= 24
                                  ? "#fef2f2"
                                  : item.preparationTimeHours >= 12
                                    ? "#fffbeb"
                                    : "#f0fdf4",
                              color:
                                item.preparationTimeHours >= 24
                                  ? "#dc2626"
                                  : item.preparationTimeHours >= 12
                                    ? "#d97706"
                                    : "#16a34a",
                            }}
                          >
                            ⏰{" "}
                            {item.preparationTimeHours >= 24
                              ? `Préparation: ${item.preparationTimeHours / 24} jour${item.preparationTimeHours / 24 > 1 ? "s" : ""} requis`
                              : item.preparationTimeHours >= 12
                                ? `Préparation: ${item.preparationTimeHours} heures requises`
                                : `Prêt en ${item.preparationTimeHours} heure${item.preparationTimeHours > 1 ? "s" : ""}`}
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