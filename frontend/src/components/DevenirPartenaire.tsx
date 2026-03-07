import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { normalizedApiUrl } from "../lib/AuthClient";
import GoldenBackground from "./GoldenBackground";
import Navbar from "./Navbar";
import Footer from "./Footer";
import {
  CheckCircle2,
  Lock,
  Briefcase,
  Loader2,
  Eye,
  EyeOff,
} from "lucide-react";

const styles = {
  gold: "#337957",
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [activateSuccess, setActivateSuccess] = useState(false);
  const [activateData, setActivateData] = useState({ password: "", confirmPassword: "" });

  const location = useLocation();
  const navigate = useNavigate();

  const searchParams = new URLSearchParams(location.search);
  const justApproved = searchParams.get("approved") === "1";
  const alreadyApproved = searchParams.get("already_approved") === "1";
  const activateToken = searchParams.get("token") || "";

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  const handleActivateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setActivateData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError(null);
  };

  const handleActivate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (activateData.password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères.");
      return;
    }
    if (activateData.password !== activateData.confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${normalizedApiUrl}/api/partner-request/activate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: activateToken, password: activateData.password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Une erreur est survenue.");

      setActivateSuccess(true);
      setError(null);
    } catch (err: any) {
      if (err.message === "Failed to fetch") {
        setError("Erreur réseau. Vérifiez votre connexion.");
      } else {
        setError(err.message || "Une erreur est survenue.");
      }
    } finally {
      setLoading(false);
    }
  };

  // ----------- "JUST APPROVED" BANNER (admin clicked the approval link) -----------
  if (justApproved || alreadyApproved) {
    return (
      <>
        <Navbar onCartClick={onCartClick} cartCount={cartCount} />
        <div className="relative min-h-screen pt-20">
          <div className="fixed inset-0 z-0 opacity-30">
            <GoldenBackground />
          </div>
          <div className="relative z-10 flex items-center justify-center min-h-[80vh] px-4">
            <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-2xl border border-white p-8 md:p-12 w-full max-w-md text-center">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[#337957]/10 flex items-center justify-center">
                <CheckCircle2 size={40} className="text-[#337957]" />
              </div>
              <h2
                className="text-4xl mb-3"
                style={{ fontFamily: styles.fontScript, color: styles.gold }}
              >
                {alreadyApproved ? "Déjà approuvé !" : "Partenaire approuvé !"}
              </h2>
              <p className="text-stone-600 mb-6">
                {alreadyApproved
                  ? "Ce compte partenaire était déjà actif."
                  : "Le compte professionnel a été créé avec succès. Le partenaire va recevoir un email de confirmation avec ses accès."}
              </p>
              <button
                onClick={() => navigate("/se-connecter")}
                className="px-6 py-3 rounded-xl text-white font-bold text-sm uppercase tracking-widest hover:opacity-90 transition-all"
                style={{ backgroundColor: styles.gold }}
              >
                Page de connexion
              </button>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  // ----------- ACTIVATION VIEW (partner arrived via email invite link with ?token=) -----------
  if (activateToken) {
    return (
      <>
        <Navbar onCartClick={onCartClick} cartCount={cartCount} />
        <div className="relative min-h-screen pt-20">
          <div className="fixed inset-0 z-0 opacity-30">
            <GoldenBackground />
          </div>
          <div className="relative z-10 flex items-center justify-center min-h-[80vh] px-4">
            <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-2xl border border-white p-8 md:p-12 w-full max-w-md text-center">
              {activateSuccess ? (
                <>
                  <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[#337957]/10 flex items-center justify-center">
                    <CheckCircle2 size={40} className="text-[#337957]" />
                  </div>
                  <h2 className="text-4xl mb-3" style={{ fontFamily: styles.fontScript, color: styles.gold }}>
                    Compte créé !
                  </h2>
                  <p className="text-stone-600 mb-6">
                    Votre compte professionnel a été créé avec succès. Vous pouvez maintenant vous connecter.
                  </p>
                  <button
                    onClick={() => navigate("/se-connecter")}
                    className="px-6 py-3 rounded-xl text-white font-bold text-sm uppercase tracking-widest hover:opacity-90 transition-all"
                    style={{ backgroundColor: styles.gold }}
                  >
                    Se connecter
                  </button>
                </>
              ) : (
                <>
                  <div className="text-center mb-8">
                    <h2 className="text-3xl mb-2" style={{ fontFamily: styles.fontScript, color: styles.gold }}>
                      Créer mon Compte Pro
                    </h2>
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-stone-400">
                      Choisissez votre mot de passe pour finaliser votre inscription
                    </p>
                  </div>
                  <form onSubmit={handleActivate} className="space-y-4 text-left">
                    <div>
                      <label className="block text-[9px] font-black uppercase tracking-[0.2em] text-stone-500 mb-2">
                        Mot de passe *
                      </label>
                      <div className="relative">
                        <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                        <input
                          type={showPassword ? "text" : "password"}
                          name="password"
                          value={activateData.password}
                          onChange={handleActivateChange}
                          required
                          minLength={6}
                          placeholder="Minimum 6 caractères"
                          className="w-full pl-10 pr-12 py-3 rounded-xl border border-stone-200 focus:border-[#337957] focus:ring-2 focus:ring-[#337957]/20 outline-none text-sm"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                        >
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-[9px] font-black uppercase tracking-[0.2em] text-stone-500 mb-2">
                        Confirmer le mot de passe *
                      </label>
                      <div className="relative">
                        <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                        <input
                          type={showPassword ? "text" : "password"}
                          name="confirmPassword"
                          value={activateData.confirmPassword}
                          onChange={handleActivateChange}
                          required
                          minLength={6}
                          placeholder="Retapez le mot de passe"
                          className="w-full pl-10 pr-4 py-3 rounded-xl border border-stone-200 focus:border-[#337957] focus:ring-2 focus:ring-[#337957]/20 outline-none text-sm"
                        />
                      </div>
                    </div>
                    {error && (
                      <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm text-center">
                        {error}
                      </div>
                    )}
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
                          <CheckCircle2 size={18} />
                          Créer mon compte
                        </>
                      )}
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  // ----------- DEFAULT: redirect to the inquiry form -----------
  return (
    <>
      <Navbar onCartClick={onCartClick} cartCount={cartCount} />
      <div className="relative min-h-screen pt-20">
        <div className="fixed inset-0 z-0 opacity-30">
          <GoldenBackground />
        </div>
        <div className="relative z-10 flex items-center justify-center min-h-[80vh] px-4">
          <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-2xl border border-white p-8 md:p-12 w-full max-w-md text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[#337957]/10 flex items-center justify-center">
              <Briefcase size={40} className="text-[#337957]" />
            </div>
            <h2 className="text-4xl mb-3" style={{ fontFamily: styles.fontScript, color: styles.gold }}>
              Espace Partenaire
            </h2>
            <p className="text-stone-600 mb-6">
              Pour créer un compte professionnel, remplissez notre formulaire de demande. Notre équipe examinera votre
              dossier et vous enverra un lien d'invitation par email.
            </p>
            <button
              onClick={() => navigate("/#devenir-partenaire")}
              className="px-6 py-3 rounded-xl text-white font-bold text-sm uppercase tracking-widest hover:opacity-90 transition-all"
              style={{ backgroundColor: styles.gold }}
            >
              Faire une demande
            </button>
            <p className="mt-4 text-xs text-stone-400">
              Déjà invité ? Utilisez le lien reçu par email.
            </p>
            <p className="mt-3 text-xs text-stone-400">
              Vous avez déjà un compte ?{" "}
              <button
                type="button"
                onClick={() => navigate("/se-connecter")}
                className="text-[#337957] font-bold hover:underline"
              >
                Se connecter
              </button>
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default DevenirPartenaire;
