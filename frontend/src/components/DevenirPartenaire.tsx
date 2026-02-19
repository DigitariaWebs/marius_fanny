import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authClient } from "../lib/AuthClient";
import GoldenBackground from "./GoldenBackground";
import Navbar from "./Navbar";
import Footer from "./Footer";
import {
  Building2,
  ShoppingBag,
  TrendingUp,
  Shield,
  CheckCircle2,
  ArrowRight,
  Mail,
  Lock,
  User,
  Phone,
  MapPin,
  Briefcase,
  Loader2,
  Eye,
  EyeOff,
} from "lucide-react";

const styles = {
  gold: "#C5A065",
  text: "#2D2A26",
  cream: "#F9F7F2",
  fontScript: '"Great Vibes", cursive',
  fontSans: '"Inter", sans-serif',
};

interface DevenirPartenaireProps {
  onCartClick: () => void;
  cartCount: number;
}

const DevenirPartenaire: React.FC<DevenirPartenaireProps> = ({
  onCartClick,
  cartCount,
}) => {
  const [showRegistration, setShowRegistration] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isVerificationSent, setIsVerificationSent] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [pendingEmail, setPendingEmail] = useState("");

  // Form fields
  const [formData, setFormData] = useState({
    businessName: "",
    contactName: "",
    email: "",
    phone: "",
    address: "",
    password: "",
    confirmPassword: "",
  });

  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (formData.password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères.");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }
    if (!formData.businessName.trim()) {
      setError("Le nom de l'entreprise est requis.");
      return;
    }

    setLoading(true);

    try {
      const { error: signUpError } = await authClient.signUp.email({
        email: formData.email,
        password: formData.password,
        name: formData.businessName,
        role: "pro",
      } as any);

      if (signUpError) {
        throw new Error(signUpError.message || "Inscription échouée");
      }

      // Show OTP verification
      setPendingEmail(formData.email);
      setIsVerificationSent(true);
    } catch (err: any) {
      console.error("Pro signup error:", err);
      if (err.message === "Failed to fetch") {
        setError("Erreur réseau. Vérifiez votre connexion.");
      } else {
        setError(err.message || "Une erreur est survenue.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();

    if (verificationCode.length !== 6) {
      setError("Le code doit contenir 6 chiffres.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await authClient.emailOtp.verifyEmail({
        email: pendingEmail,
        otp: verificationCode,
      });

      if (result.data) {
        // Sign in after verification
        const { error: signInError } = await authClient.signIn.email({
          email: pendingEmail,
          password: formData.password,
        });

        if (signInError) {
          throw new Error(
            signInError.message || "Erreur lors de la connexion"
          );
        }

        setSuccess(true);
        setTimeout(() => {
          navigate("/pro");
        }, 2000);
      } else {
        throw new Error("Code de vérification invalide");
      }
    } catch (err: any) {
      setError(err.message || "Erreur de vérification.");
    } finally {
      setLoading(false);
    }
  };

  const advantages = [
    {
      icon: <ShoppingBag size={32} />,
      title: "Catalogue Complet",
      description:
        "Accédez à l'ensemble de notre gamme de produits artisanaux directement depuis votre espace dédié.",
    },
    {
      icon: <TrendingUp size={32} />,
      title: "Prix Professionnels",
      description:
        "Bénéficiez de tarifs préférentiels réservés exclusivement à nos partenaires professionnels.",
    },
    {
      icon: <Shield size={32} />,
      title: "Qualité Garantie",
      description:
        "Tous nos produits sont fabriqués artisanalement avec des ingrédients de première qualité.",
    },
    {
      icon: <Building2 size={32} />,
      title: "Support Dédié",
      description:
        "Un accompagnement personnalisé pour vous aider dans vos commandes et vos besoins spécifiques.",
    },
  ];

  // ----------- OTP VERIFICATION VIEW -----------
  if (isVerificationSent && !success) {
    return (
      <>
        <Navbar onCartClick={onCartClick} cartCount={cartCount} />
        <div className="relative min-h-screen pt-20">
          <div className="fixed inset-0 z-0 opacity-30">
            <GoldenBackground />
          </div>
          <div className="relative z-10 flex items-center justify-center min-h-[80vh] px-4">
            <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-2xl border border-white p-8 md:p-12 w-full max-w-md">
              <div className="text-center mb-8">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#C5A065]/10 flex items-center justify-center">
                  <Mail size={32} className="text-[#C5A065]" />
                </div>
                <h2
                  className="text-3xl mb-2"
                  style={{ fontFamily: styles.fontScript, color: styles.gold }}
                >
                  Vérification
                </h2>
                <p className="text-sm text-stone-500">
                  Un code de vérification a été envoyé à{" "}
                  <span className="font-semibold text-stone-700">
                    {pendingEmail}
                  </span>
                </p>
              </div>

              <form onSubmit={handleVerifyCode} className="space-y-6">
                <div>
                  <label className="block text-[9px] font-black uppercase tracking-[0.2em] text-stone-500 mb-2">
                    Code de vérification
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    value={verificationCode}
                    onChange={(e) =>
                      setVerificationCode(e.target.value.replace(/\D/g, ""))
                    }
                    placeholder="000000"
                    className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:border-[#C5A065] focus:ring-2 focus:ring-[#C5A065]/20 outline-none text-center text-2xl tracking-[0.5em] font-mono"
                  />
                </div>

                {error && (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm text-center">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || verificationCode.length !== 6}
                  className="w-full py-3 rounded-xl text-white font-bold text-sm uppercase tracking-widest transition-all disabled:opacity-50 hover:opacity-90"
                  style={{ backgroundColor: styles.gold }}
                >
                  {loading ? (
                    <Loader2 size={20} className="animate-spin mx-auto" />
                  ) : (
                    "Vérifier"
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  // ----------- SUCCESS VIEW -----------
  if (success) {
    return (
      <>
        <Navbar onCartClick={onCartClick} cartCount={cartCount} />
        <div className="relative min-h-screen pt-20">
          <div className="fixed inset-0 z-0 opacity-30">
            <GoldenBackground />
          </div>
          <div className="relative z-10 flex items-center justify-center min-h-[80vh] px-4">
            <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-2xl border border-white p-8 md:p-12 w-full max-w-md text-center">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle2 size={40} className="text-green-600" />
              </div>
              <h2
                className="text-4xl mb-3"
                style={{ fontFamily: styles.fontScript, color: styles.gold }}
              >
                Bienvenue !
              </h2>
              <p className="text-stone-600 mb-6">
                Votre compte professionnel a été créé avec succès. Vous allez
                être redirigé vers votre espace partenaire.
              </p>
              <div className="w-12 h-12 mx-auto border-4 border-[#C5A065] border-t-transparent rounded-full animate-spin" />
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  // ----------- MAIN PAGE -----------
  return (
    <>
      <Navbar onCartClick={onCartClick} cartCount={cartCount} />
      <div className="relative min-h-screen pt-20">
        <div className="fixed inset-0 z-0 opacity-30">
          <GoldenBackground />
        </div>

        <div className="relative z-10">
          {/* HERO SECTION */}
          <section className="py-16 md:py-24 px-4">
            <div className="max-w-6xl mx-auto text-center">
              <h1
                className="text-5xl md:text-7xl mb-4"
                style={{ fontFamily: styles.fontScript, color: styles.gold }}
              >
                Devenir Partenaire
              </h1>
              <p className="text-[9px] font-black uppercase tracking-[0.3em] text-stone-500 mb-6">
                Rejoignez le réseau Marius & Fanny
              </p>
              <p className="text-stone-600 max-w-2xl mx-auto text-lg mb-10">
                Vous êtes un professionnel de la restauration, un hôtelier, ou
                un commerçant ? Accédez à notre catalogue complet de produits
                artisanaux et bénéficiez d'avantages exclusifs.
              </p>

              {!showRegistration && (
                <button
                  onClick={() => setShowRegistration(true)}
                  className="inline-flex items-center gap-3 px-8 py-4 rounded-full text-white font-bold text-sm uppercase tracking-widest transition-all hover:opacity-90 hover:scale-105 shadow-lg shadow-[#C5A065]/30"
                  style={{ backgroundColor: styles.gold }}
                >
                  <Briefcase size={20} />
                  Ouvrir un Compte Pro
                  <ArrowRight size={18} />
                </button>
              )}
            </div>
          </section>

          {/* ADVANTAGES SECTION */}
          <section className="py-12 px-4">
            <div className="max-w-6xl mx-auto">
              <h2
                className="text-4xl text-center mb-12"
                style={{ fontFamily: styles.fontScript, color: styles.gold }}
              >
                Vos avantages
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {advantages.map((adv, idx) => (
                  <div
                    key={idx}
                    className="bg-white/70 backdrop-blur-md rounded-2xl shadow-lg border border-white p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-center"
                  >
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#C5A065]/10 flex items-center justify-center text-[#C5A065]">
                      {adv.icon}
                    </div>
                    <h3 className="text-lg font-bold text-stone-800 mb-2">
                      {adv.title}
                    </h3>
                    <p className="text-sm text-stone-500">{adv.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* REGISTRATION FORM */}
          {showRegistration && (
            <section className="py-12 px-4" id="pro-form">
              <div className="max-w-lg mx-auto">
                <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-2xl border border-white p-8 md:p-10">
                  <div className="text-center mb-8">
                    <h2
                      className="text-3xl mb-2"
                      style={{
                        fontFamily: styles.fontScript,
                        color: styles.gold,
                      }}
                    >
                      Ouvrir un Compte Pro
                    </h2>
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-stone-400">
                      Créez votre espace professionnel
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Business Name */}
                    <div>
                      <label className="block text-[9px] font-black uppercase tracking-[0.2em] text-stone-500 mb-2">
                        Nom de l'entreprise *
                      </label>
                      <div className="relative">
                        <Building2
                          size={18}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400"
                        />
                        <input
                          type="text"
                          name="businessName"
                          value={formData.businessName}
                          onChange={handleChange}
                          required
                          placeholder="Ex: Café Le Parisien"
                          className="w-full pl-10 pr-4 py-3 rounded-xl border border-stone-200 focus:border-[#C5A065] focus:ring-2 focus:ring-[#C5A065]/20 outline-none text-sm"
                        />
                      </div>
                    </div>

                    {/* Contact Name */}
                    <div>
                      <label className="block text-[9px] font-black uppercase tracking-[0.2em] text-stone-500 mb-2">
                        Nom du contact *
                      </label>
                      <div className="relative">
                        <User
                          size={18}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400"
                        />
                        <input
                          type="text"
                          name="contactName"
                          value={formData.contactName}
                          onChange={handleChange}
                          required
                          placeholder="Prénom et nom"
                          className="w-full pl-10 pr-4 py-3 rounded-xl border border-stone-200 focus:border-[#C5A065] focus:ring-2 focus:ring-[#C5A065]/20 outline-none text-sm"
                        />
                      </div>
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-[9px] font-black uppercase tracking-[0.2em] text-stone-500 mb-2">
                        Email professionnel *
                      </label>
                      <div className="relative">
                        <Mail
                          size={18}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400"
                        />
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          placeholder="contact@entreprise.com"
                          className="w-full pl-10 pr-4 py-3 rounded-xl border border-stone-200 focus:border-[#C5A065] focus:ring-2 focus:ring-[#C5A065]/20 outline-none text-sm"
                        />
                      </div>
                    </div>

                    {/* Phone */}
                    <div>
                      <label className="block text-[9px] font-black uppercase tracking-[0.2em] text-stone-500 mb-2">
                        Téléphone
                      </label>
                      <div className="relative">
                        <Phone
                          size={18}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400"
                        />
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          placeholder="514-555-0000"
                          className="w-full pl-10 pr-4 py-3 rounded-xl border border-stone-200 focus:border-[#C5A065] focus:ring-2 focus:ring-[#C5A065]/20 outline-none text-sm"
                        />
                      </div>
                    </div>

                    {/* Address */}
                    <div>
                      <label className="block text-[9px] font-black uppercase tracking-[0.2em] text-stone-500 mb-2">
                        Adresse
                      </label>
                      <div className="relative">
                        <MapPin
                          size={18}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400"
                        />
                        <input
                          type="text"
                          name="address"
                          value={formData.address}
                          onChange={handleChange}
                          placeholder="123 Rue Exemple, Montréal"
                          className="w-full pl-10 pr-4 py-3 rounded-xl border border-stone-200 focus:border-[#C5A065] focus:ring-2 focus:ring-[#C5A065]/20 outline-none text-sm"
                        />
                      </div>
                    </div>

                    {/* Password */}
                    <div>
                      <label className="block text-[9px] font-black uppercase tracking-[0.2em] text-stone-500 mb-2">
                        Mot de passe *
                      </label>
                      <div className="relative">
                        <Lock
                          size={18}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400"
                        />
                        <input
                          type={showPassword ? "text" : "password"}
                          name="password"
                          value={formData.password}
                          onChange={handleChange}
                          required
                          minLength={6}
                          placeholder="Minimum 6 caractères"
                          className="w-full pl-10 pr-12 py-3 rounded-xl border border-stone-200 focus:border-[#C5A065] focus:ring-2 focus:ring-[#C5A065]/20 outline-none text-sm"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                        >
                          {showPassword ? (
                            <EyeOff size={18} />
                          ) : (
                            <Eye size={18} />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Confirm Password */}
                    <div>
                      <label className="block text-[9px] font-black uppercase tracking-[0.2em] text-stone-500 mb-2">
                        Confirmer le mot de passe *
                      </label>
                      <div className="relative">
                        <Lock
                          size={18}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400"
                        />
                        <input
                          type={showPassword ? "text" : "password"}
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          required
                          minLength={6}
                          placeholder="Retapez le mot de passe"
                          className="w-full pl-10 pr-4 py-3 rounded-xl border border-stone-200 focus:border-[#C5A065] focus:ring-2 focus:ring-[#C5A065]/20 outline-none text-sm"
                        />
                      </div>
                    </div>

                    {/* Error */}
                    {error && (
                      <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm text-center">
                        {error}
                      </div>
                    )}

                    {/* Submit */}
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3.5 rounded-xl text-white font-bold text-sm uppercase tracking-widest transition-all disabled:opacity-50 hover:opacity-90 flex items-center justify-center gap-2"
                      style={{ backgroundColor: styles.gold }}
                    >
                      {loading ? (
                        <Loader2 size={20} className="animate-spin" />
                      ) : (
                        <>
                          <Briefcase size={18} />
                          Créer mon Compte Pro
                        </>
                      )}
                    </button>

                    <p className="text-center text-xs text-stone-400">
                      Vous avez déjà un compte ?{" "}
                      <button
                        type="button"
                        onClick={() => navigate("/se-connecter")}
                        className="text-[#C5A065] font-bold hover:underline"
                      >
                        Se connecter
                      </button>
                    </p>
                  </form>
                </div>
              </div>
            </section>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default DevenirPartenaire;
