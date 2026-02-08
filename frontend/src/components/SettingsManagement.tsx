import { useState } from "react";
import {
  Store,
  Mail,
  Phone,
  MapPin,
  Clock,
  CreditCard,
  Bell,
  Palette,
  Package,
  Globe,
  DollarSign,
  Calendar,
  AlertCircle,
  ShoppingCart,
  Truck,
  Facebook,
  Instagram,
  Twitter,
  Save,
} from "lucide-react";

interface BusinessHours {
  [key: string]: { open: string; close: string; closed: boolean };
}

interface Settings {
  // General
  storeName: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  
  // Business Hours
  businessHours: BusinessHours;
  
  // Order Settings
  minOrderValue: number;
  leadTimeDays: number;
  allowDelivery: boolean;
  allowPickup: boolean;
  deliveryFee: number;
  freeDeliveryThreshold: number;
  
  // Email Notifications
  emailOnNewOrder: boolean;
  emailOnOrderConfirmed: boolean;
  emailOnPaymentReceived: boolean;
  emailOnOrderReady: boolean;
  
  // Payment Settings
  acceptCash: boolean;
  acceptCard: boolean;
  acceptTransfer: boolean;
  depositPercentage: number;
  
  // Inventory
  lowStockThreshold: number;
  hideOutOfStock: boolean;
  
  // Social Media
  facebookUrl: string;
  instagramUrl: string;
  twitterUrl: string;
}

export default function SettingsManagement() {
  const [settings, setSettings] = useState<Settings>({
    // General
    storeName: "MARIUS & FANNY",
    contactEmail: "contact@mariusetfanny.com",
    contactPhone: "+1 514 123 4567",
    address: "123 Rue Saint-Laurent, Montréal, QC H2X 2T3",
    
    // Business Hours
    businessHours: {
      monday: { open: "09:00", close: "18:00", closed: false },
      tuesday: { open: "09:00", close: "18:00", closed: false },
      wednesday: { open: "09:00", close: "18:00", closed: false },
      thursday: { open: "09:00", close: "18:00", closed: false },
      friday: { open: "09:00", close: "18:00", closed: false },
      saturday: { open: "10:00", close: "16:00", closed: false },
      sunday: { open: "00:00", close: "00:00", closed: true },
    },
    
    // Order Settings
    minOrderValue: 0,
    leadTimeDays: 2,
    allowDelivery: true,
    allowPickup: true,
    deliveryFee: 10,
    freeDeliveryThreshold: 50,
    
    // Email Notifications
    emailOnNewOrder: true,
    emailOnOrderConfirmed: true,
    emailOnPaymentReceived: true,
    emailOnOrderReady: true,
    
    // Payment Settings
    acceptCash: true,
    acceptCard: true,
    acceptTransfer: true,
    depositPercentage: 50,
    
    // Inventory
    lowStockThreshold: 20,
    hideOutOfStock: false,
    
    // Social Media
    facebookUrl: "https://facebook.com/mariusetfanny",
    instagramUrl: "https://instagram.com/mariusetfanny",
    twitterUrl: "",
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  const handleInputChange = (field: keyof Settings, value: any) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  const handleBusinessHoursChange = (
    day: string,
    field: "open" | "close" | "closed",
    value: string | boolean
  ) => {
    setSettings((prev) => ({
      ...prev,
      businessHours: {
        ...prev.businessHours,
        [day]: {
          ...prev.businessHours[day],
          [field]: value,
        },
      },
    }));
  };

  const handleSave = () => {
    setIsSaving(true);
    // Simulate API call
    setTimeout(() => {
      setIsSaving(false);
      setSaveMessage("Paramètres enregistrés avec succès!");
      setTimeout(() => setSaveMessage(""), 3000);
    }, 1000);
  };

  const dayLabels: { [key: string]: string } = {
    monday: "Lundi",
    tuesday: "Mardi",
    wednesday: "Mercredi",
    thursday: "Jeudi",
    friday: "Vendredi",
    saturday: "Samedi",
    sunday: "Dimanche",
  };

  return (
    <div className="h-full overflow-auto">
      <header className="p-4 md:p-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2
              className="text-4xl md:text-5xl mb-2"
              style={{ fontFamily: '"Great Vibes", cursive', color: "#C5A065" }}
            >
              Paramètres
            </h2>
            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-stone-500">
              Configuration complète de votre boutique
            </p>
          </div>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 bg-[#C5A065] hover:bg-[#2D2A26] text-white px-6 py-3 rounded-xl transition-all duration-300 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save size={18} />
            {isSaving ? "Enregistrement..." : "Enregistrer tout"}
          </button>
        </div>
        {saveMessage && (
          <div className="mt-4 bg-green-100 border border-green-300 text-green-800 px-4 py-3 rounded-xl flex items-center gap-2">
            <AlertCircle size={18} />
            {saveMessage}
          </div>
        )}
      </header>

      <div className="p-4 md:p-8 space-y-6">
        {/* General Information */}
        <div className="bg-white/70 backdrop-blur-md rounded-3xl shadow-xl border border-white p-6 md:p-8 hover:shadow-2xl transition-all duration-300">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-[#C5A065] bg-opacity-20 flex items-center justify-center">
              <Store size={20} className="text-[#C5A065]" />
            </div>
            <h3 className="text-xl md:text-2xl font-bold text-[#2D2A26]">
              Informations générales
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-stone-600 flex items-center gap-2">
                <Store size={14} />
                Nom de la boutique
              </label>
              <input
                type="text"
                value={settings.storeName}
                onChange={(e) => handleInputChange("storeName", e.target.value)}
                className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-[#C5A065] focus:border-transparent outline-none text-sm transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-stone-600 flex items-center gap-2">
                <Mail size={14} />
                Email de contact
              </label>
              <input
                type="email"
                value={settings.contactEmail}
                onChange={(e) => handleInputChange("contactEmail", e.target.value)}
                className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-[#C5A065] focus:border-transparent outline-none text-sm transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-stone-600 flex items-center gap-2">
                <Phone size={14} />
                Téléphone
              </label>
              <input
                type="tel"
                value={settings.contactPhone}
                onChange={(e) => handleInputChange("contactPhone", e.target.value)}
                className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-[#C5A065] focus:border-transparent outline-none text-sm transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-stone-600 flex items-center gap-2">
                <MapPin size={14} />
                Adresse
              </label>
              <input
                type="text"
                value={settings.address}
                onChange={(e) => handleInputChange("address", e.target.value)}
                className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-[#C5A065] focus:border-transparent outline-none text-sm transition-all"
              />
            </div>
          </div>
        </div>

        {/* Business Hours */}
        <div className="bg-white/70 backdrop-blur-md rounded-3xl shadow-xl border border-white p-6 md:p-8 hover:shadow-2xl transition-all duration-300">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-[#C5A065] bg-opacity-20 flex items-center justify-center">
              <Clock size={20} className="text-[#C5A065]" />
            </div>
            <h3 className="text-xl md:text-2xl font-bold text-[#2D2A26]">
              Heures d'ouverture
            </h3>
          </div>

          <div className="space-y-3">
            {Object.entries(settings.businessHours).map(([day, hours]) => (
              <div
                key={day}
                className="flex flex-col md:flex-row md:items-center gap-3 p-3 bg-stone-50 rounded-xl"
              >
                <div className="flex items-center gap-3 md:w-40">
                  <input
                    type="checkbox"
                    checked={!hours.closed}
                    onChange={(e) =>
                      handleBusinessHoursChange(day, "closed", !e.target.checked)
                    }
                    className="w-4 h-4 rounded accent-[#C5A065]"
                  />
                  <span className="font-medium text-sm text-stone-700">
                    {dayLabels[day]}
                  </span>
                </div>

                {!hours.closed ? (
                  <div className="flex items-center gap-3 flex-1">
                    <input
                      type="time"
                      value={hours.open}
                      onChange={(e) =>
                        handleBusinessHoursChange(day, "open", e.target.value)
                      }
                      className="p-2 bg-white border border-stone-200 rounded-lg focus:ring-2 focus:ring-[#C5A065] focus:border-transparent outline-none text-sm"
                    />
                    <span className="text-stone-400">à</span>
                    <input
                      type="time"
                      value={hours.close}
                      onChange={(e) =>
                        handleBusinessHoursChange(day, "close", e.target.value)
                      }
                      className="p-2 bg-white border border-stone-200 rounded-lg focus:ring-2 focus:ring-[#C5A065] focus:border-transparent outline-none text-sm"
                    />
                  </div>
                ) : (
                  <span className="text-sm text-stone-400 italic">Fermé</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Order Settings */}
        <div className="bg-white/70 backdrop-blur-md rounded-3xl shadow-xl border border-white p-6 md:p-8 hover:shadow-2xl transition-all duration-300">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-[#C5A065] bg-opacity-20 flex items-center justify-center">
              <ShoppingCart size={20} className="text-[#C5A065]" />
            </div>
            <h3 className="text-xl md:text-2xl font-bold text-[#2D2A26]">
              Paramètres des commandes
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-stone-600 flex items-center gap-2">
                <DollarSign size={14} />
                Montant minimum de commande ($)
              </label>
              <input
                type="number"
                value={settings.minOrderValue}
                onChange={(e) =>
                  handleInputChange("minOrderValue", parseFloat(e.target.value))
                }
                className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-[#C5A065] focus:border-transparent outline-none text-sm transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-stone-600 flex items-center gap-2">
                <Calendar size={14} />
                Délai de préparation (jours)
              </label>
              <input
                type="number"
                value={settings.leadTimeDays}
                onChange={(e) =>
                  handleInputChange("leadTimeDays", parseInt(e.target.value))
                }
                className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-[#C5A065] focus:border-transparent outline-none text-sm transition-all"
              />
              <p className="text-xs text-stone-500">
                Nombre de jours minimum avant le retrait/livraison
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-stone-600 flex items-center gap-2">
                <Truck size={14} />
                Frais de livraison ($)
              </label>
              <input
                type="number"
                value={settings.deliveryFee}
                onChange={(e) =>
                  handleInputChange("deliveryFee", parseFloat(e.target.value))
                }
                className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-[#C5A065] focus:border-transparent outline-none text-sm transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-stone-600 flex items-center gap-2">
                <DollarSign size={14} />
                Seuil livraison gratuite ($)
              </label>
              <input
                type="number"
                value={settings.freeDeliveryThreshold}
                onChange={(e) =>
                  handleInputChange("freeDeliveryThreshold", parseFloat(e.target.value))
                }
                className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-[#C5A065] focus:border-transparent outline-none text-sm transition-all"
              />
              <p className="text-xs text-stone-500">
                Livraison gratuite au-dessus de ce montant
              </p>
            </div>

            <div className="space-y-3 md:col-span-2">
              <label className="text-xs font-bold uppercase tracking-wider text-stone-600">
                Options de retrait/livraison
              </label>
              <div className="flex flex-wrap gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.allowPickup}
                    onChange={(e) =>
                      handleInputChange("allowPickup", e.target.checked)
                    }
                    className="w-4 h-4 rounded accent-[#C5A065]"
                  />
                  <span className="text-sm text-stone-700">
                    Autoriser le ramassage en magasin
                  </span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.allowDelivery}
                    onChange={(e) =>
                      handleInputChange("allowDelivery", e.target.checked)
                    }
                    className="w-4 h-4 rounded accent-[#C5A065]"
                  />
                  <span className="text-sm text-stone-700">
                    Autoriser la livraison
                  </span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Settings */}
        <div className="bg-white/70 backdrop-blur-md rounded-3xl shadow-xl border border-white p-6 md:p-8 hover:shadow-2xl transition-all duration-300">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-[#C5A065] bg-opacity-20 flex items-center justify-center">
              <CreditCard size={20} className="text-[#C5A065]" />
            </div>
            <h3 className="text-xl md:text-2xl font-bold text-[#2D2A26]">
              Paramètres de paiement
            </h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-stone-600 mb-3 block">
                Méthodes de paiement acceptées
              </label>
              <div className="flex flex-wrap gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.acceptCash}
                    onChange={(e) =>
                      handleInputChange("acceptCash", e.target.checked)
                    }
                    className="w-4 h-4 rounded accent-[#C5A065]"
                  />
                  <span className="text-sm text-stone-700">Espèces</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.acceptCard}
                    onChange={(e) =>
                      handleInputChange("acceptCard", e.target.checked)
                    }
                    className="w-4 h-4 rounded accent-[#C5A065]"
                  />
                  <span className="text-sm text-stone-700">Carte de crédit</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.acceptTransfer}
                    onChange={(e) =>
                      handleInputChange("acceptTransfer", e.target.checked)
                    }
                    className="w-4 h-4 rounded accent-[#C5A065]"
                  />
                  <span className="text-sm text-stone-700">Virement bancaire</span>
                </label>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-stone-600 flex items-center gap-2">
                <DollarSign size={14} />
                Pourcentage de dépôt requis (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={settings.depositPercentage}
                onChange={(e) =>
                  handleInputChange("depositPercentage", parseInt(e.target.value))
                }
                className="w-full md:w-1/2 p-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-[#C5A065] focus:border-transparent outline-none text-sm transition-all"
              />
              <p className="text-xs text-stone-500">
                Pourcentage minimum requis lors de la commande (0-100%)
              </p>
            </div>
          </div>
        </div>

        {/* Email Notifications */}
        <div className="bg-white/70 backdrop-blur-md rounded-3xl shadow-xl border border-white p-6 md:p-8 hover:shadow-2xl transition-all duration-300">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-[#C5A065] bg-opacity-20 flex items-center justify-center">
              <Bell size={20} className="text-[#C5A065]" />
            </div>
            <h3 className="text-xl md:text-2xl font-bold text-[#2D2A26]">
              Notifications par email
            </h3>
          </div>

          <div className="space-y-3">
            <p className="text-sm text-stone-600 mb-4">
              Choisissez quand vous souhaitez recevoir des notifications par email
            </p>

            <label className="flex items-center gap-3 p-3 bg-stone-50 rounded-xl cursor-pointer hover:bg-stone-100 transition-colors">
              <input
                type="checkbox"
                checked={settings.emailOnNewOrder}
                onChange={(e) =>
                  handleInputChange("emailOnNewOrder", e.target.checked)
                }
                className="w-4 h-4 rounded accent-[#C5A065]"
              />
              <div>
                <div className="text-sm font-medium text-stone-700">
                  Nouvelle commande
                </div>
                <div className="text-xs text-stone-500">
                  Recevoir un email à chaque nouvelle commande
                </div>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 bg-stone-50 rounded-xl cursor-pointer hover:bg-stone-100 transition-colors">
              <input
                type="checkbox"
                checked={settings.emailOnOrderConfirmed}
                onChange={(e) =>
                  handleInputChange("emailOnOrderConfirmed", e.target.checked)
                }
                className="w-4 h-4 rounded accent-[#C5A065]"
              />
              <div>
                <div className="text-sm font-medium text-stone-700">
                  Commande confirmée
                </div>
                <div className="text-xs text-stone-500">
                  Notification quand une commande est confirmée
                </div>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 bg-stone-50 rounded-xl cursor-pointer hover:bg-stone-100 transition-colors">
              <input
                type="checkbox"
                checked={settings.emailOnPaymentReceived}
                onChange={(e) =>
                  handleInputChange("emailOnPaymentReceived", e.target.checked)
                }
                className="w-4 h-4 rounded accent-[#C5A065]"
              />
              <div>
                <div className="text-sm font-medium text-stone-700">
                  Paiement reçu
                </div>
                <div className="text-xs text-stone-500">
                  Notification quand un paiement est reçu
                </div>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 bg-stone-50 rounded-xl cursor-pointer hover:bg-stone-100 transition-colors">
              <input
                type="checkbox"
                checked={settings.emailOnOrderReady}
                onChange={(e) =>
                  handleInputChange("emailOnOrderReady", e.target.checked)
                }
                className="w-4 h-4 rounded accent-[#C5A065]"
              />
              <div>
                <div className="text-sm font-medium text-stone-700">
                  Commande prête
                </div>
                <div className="text-xs text-stone-500">
                  Notification quand une commande est prête pour le retrait
                </div>
              </div>
            </label>
          </div>
        </div>

        {/* Inventory Settings */}
        <div className="bg-white/70 backdrop-blur-md rounded-3xl shadow-xl border border-white p-6 md:p-8 hover:shadow-2xl transition-all duration-300">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-[#C5A065] bg-opacity-20 flex items-center justify-center">
              <Package size={20} className="text-[#C5A065]" />
            </div>
            <h3 className="text-xl md:text-2xl font-bold text-[#2D2A26]">
              Gestion de l'inventaire
            </h3>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-stone-600 flex items-center gap-2">
                <AlertCircle size={14} />
                Seuil de stock bas
              </label>
              <input
                type="number"
                value={settings.lowStockThreshold}
                onChange={(e) =>
                  handleInputChange("lowStockThreshold", parseInt(e.target.value))
                }
                className="w-full md:w-1/2 p-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-[#C5A065] focus:border-transparent outline-none text-sm transition-all"
              />
              <p className="text-xs text-stone-500">
                Les produits avec un stock inférieur seront marqués comme "Stock bas"
              </p>
            </div>

            <label className="flex items-center gap-3 p-3 bg-stone-50 rounded-xl cursor-pointer hover:bg-stone-100 transition-colors">
              <input
                type="checkbox"
                checked={settings.hideOutOfStock}
                onChange={(e) =>
                  handleInputChange("hideOutOfStock", e.target.checked)
                }
                className="w-4 h-4 rounded accent-[#C5A065]"
              />
              <div>
                <div className="text-sm font-medium text-stone-700">
                  Masquer les produits en rupture de stock
                </div>
                <div className="text-xs text-stone-500">
                  Ne pas afficher les produits indisponibles sur le site
                </div>
              </div>
            </label>
          </div>
        </div>

        {/* Social Media */}
        <div className="bg-white/70 backdrop-blur-md rounded-3xl shadow-xl border border-white p-6 md:p-8 hover:shadow-2xl transition-all duration-300">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-[#C5A065] bg-opacity-20 flex items-center justify-center">
              <Globe size={20} className="text-[#C5A065]" />
            </div>
            <h3 className="text-xl md:text-2xl font-bold text-[#2D2A26]">
              Réseaux sociaux
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-stone-600 flex items-center gap-2">
                <Facebook size={14} />
                Facebook
              </label>
              <input
                type="url"
                value={settings.facebookUrl}
                onChange={(e) => handleInputChange("facebookUrl", e.target.value)}
                placeholder="https://facebook.com/votreboutique"
                className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-[#C5A065] focus:border-transparent outline-none text-sm transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-stone-600 flex items-center gap-2">
                <Instagram size={14} />
                Instagram
              </label>
              <input
                type="url"
                value={settings.instagramUrl}
                onChange={(e) => handleInputChange("instagramUrl", e.target.value)}
                placeholder="https://instagram.com/votreboutique"
                className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-[#C5A065] focus:border-transparent outline-none text-sm transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-stone-600 flex items-center gap-2">
                <Twitter size={14} />
                Twitter / X
              </label>
              <input
                type="url"
                value={settings.twitterUrl}
                onChange={(e) => handleInputChange("twitterUrl", e.target.value)}
                placeholder="https://twitter.com/votreboutique"
                className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-[#C5A065] focus:border-transparent outline-none text-sm transition-all"
              />
            </div>
          </div>
        </div>

        {/* Save Button (Bottom) */}
        <div className="flex justify-center pt-4">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 bg-[#C5A065] hover:bg-[#2D2A26] text-white px-8 py-4 rounded-xl transition-all duration-300 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed text-lg font-semibold"
          >
            <Save size={20} />
            {isSaving ? "Enregistrement en cours..." : "Enregistrer tous les paramètres"}
          </button>
        </div>
      </div>
    </div>
  );
}
