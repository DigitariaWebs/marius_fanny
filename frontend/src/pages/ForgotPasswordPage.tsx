import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import GoldenBackground from "../components/GoldenBackground.tsx";
import { Mail, ArrowLeft, ArrowRight } from "lucide-react";
// Importation de la fonction centralisée qui utilise la bonne URL (/api/auth/forgot_password)
import { forgotPassword } from "../lib/AuthClient.ts";

const styles = {
  gold: "#337957",
  text: "#2D2A26",
  fontScript: '"Great Vibes", cursive',
  fontSans: '"Inter", sans-serif',
};

interface ForgotPasswordProps {
  onSuccess?: (message: string) => void;
  onError?: (error: string) => void;
}

const ForgotPassword: React.FC<ForgotPasswordProps> = ({ onSuccess, onError }) => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // CORRECTION : Appel de la fonction centralisée au lieu du fetch manuel
      // Cette fonction pointe vers la route correcte définie dans votre backend
      await forgotPassword(email);

      setIsSuccess(true);
      if (onSuccess) onSuccess("Un email de réinitialisation a été envoyé.");
    } catch (err: any) {
      // Récupération propre du message d'erreur
      const message = err.message || "Une erreur est survenue lors de l'envoi.";
      setError(message);
      if (onError) onError(message);
    } finally {
      setLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-[#F9F7F2]">
        <div className="absolute inset-0 z-0">
          <GoldenBackground />
        </div>
        <div className="relative z-10 w-full max-w-md px-6 text-center">
          <div className="bg-white/80 backdrop-blur-xl p-10 rounded-3xl shadow-2xl border border-white/40">
            <div className="w-20 h-20 bg-[#337957]/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Mail className="text-[#337957]" size={40} />
            </div>
            <h2 className="text-3xl mb-4" style={{ fontFamily: styles.fontScript, color: styles.gold }}>
              Email Envoyé
            </h2>
            <p className="text-[11px] font-bold uppercase tracking-widest text-stone-500 leading-relaxed mb-8">
              Si un compte existe pour <span className="text-[#2D2A26] underline">{email}</span>, vous recevrez un lien de réinitialisation.
            </p>
            <button
              onClick={() => navigate("/reset-password")}
              className="w-full py-4 text-[11px] font-black uppercase tracking-[0.2em] text-white shadow-lg flex items-center justify-center gap-2 hover:opacity-90 transition-all"
              style={{ backgroundColor: styles.text }}
            >
              J'ai reçu le code <ArrowRight size={14} />
            </button>
            <button
              onClick={() => setIsSuccess(false)}
              className="mt-6 text-[10px] font-bold uppercase tracking-widest text-[#2D2A26]/60 hover:text-[#337957] transition-all"
            >
              Renvoyer l'email
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-[#F9F7F2]">
      <div className="absolute inset-0 z-0">
        <GoldenBackground />
      </div>
      <div className="relative z-10 w-full max-w-md px-6">
        <div className="bg-white/80 backdrop-blur-xl p-10 rounded-3xl shadow-2xl border border-white/40">
          <div className="text-center mb-8">
            <h2 className="text-4xl mb-2" style={{ fontFamily: styles.fontScript, color: styles.gold }}>
              Mot de passe oublié ?
            </h2>
            <p className="text-[10px] font-bold uppercase tracking-widest text-stone-500 mt-4">
              Entrez votre email pour recevoir le lien
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-[10px] font-bold text-red-600 uppercase tracking-widest text-center">
                  {error}
                </p>
              </div>
            )}

            <div className="space-y-1 group">
              <label className="text-[10px] font-black uppercase tracking-widest opacity-50 group-focus-within:text-[#337957] transition-colors">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full py-3 bg-transparent border-b border-black/10 focus:border-[#337957] outline-none transition-all placeholder:text-black/10 text-sm"
                placeholder="VOTRE@EMAIL.COM"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 text-[11px] font-black uppercase tracking-[0.2em] text-white transition-all hover:opacity-90 disabled:opacity-50 shadow-lg"
              style={{ backgroundColor: styles.text }}
            >
              {loading ? "ENVOI..." : "ENVOYER LE LIEN"}
            </button>
          </form>

          <div className="mt-8 text-center pt-6 border-t border-black/5">
            <Link to="/se-connecter" className="flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest opacity-40 hover:opacity-100 hover:text-[#337957] transition-all">
              <ArrowLeft size={14} /> Retour à la connexion
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;