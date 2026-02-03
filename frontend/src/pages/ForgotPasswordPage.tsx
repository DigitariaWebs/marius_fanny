import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authClient } from '../lib/AuthClient.ts';
import GoldenBackground from '../components/GoldenBackground.tsx';
import { Mail, ArrowLeft, ArrowRight } from 'lucide-react';

const styles = {
  gold: '#C5A065',
  text: '#2D2A26',
  fontScript: '"Great Vibes", cursive',
  fontSans: '"Inter", sans-serif',
};

const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // CORRECTION : Utilisation de la méthode correcte de Better-Auth
      const { error } = await authClient.forgetPassword.sendForgotPasswordEmail({
        email,
        redirectTo: window.location.origin + '/reset-password',
      });

      if (error) throw new Error(error.message);
      
      setIsSuccess(true);
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-[#F9F7F2]">
        <div className="absolute inset-0 z-0"><GoldenBackground /></div>
        <div className="relative z-10 w-full max-w-md px-6 text-center">
          <div className="bg-white/80 backdrop-blur-xl p-10 rounded-3xl shadow-2xl border border-white/40">
            <div className="w-20 h-20 bg-[#C5A065]/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Mail className="text-[#C5A065]" size={40} />
            </div>
            <h2 className="text-3xl mb-4" style={{ fontFamily: styles.fontScript, color: styles.gold }}>
              Email Envoyé
            </h2>
            <p className="text-[11px] font-bold uppercase tracking-widest text-stone-500 leading-relaxed mb-8">
              Si un compte existe pour <span className="text-[#2D2A26] underline">{email}</span>, 
              vous recevrez un code de réinitialisation.
            </p>
            <button
              onClick={() => navigate('/reset-password')}
              className="w-full py-4 text-[11px] font-black uppercase tracking-[0.2em] text-white shadow-lg flex items-center justify-center gap-2 hover:opacity-90 transition-all"
              style={{ backgroundColor: styles.text }}
            >
              J'ai reçu le code <ArrowRight size={14} />
            </button>
            <button
               onClick={() => setIsSuccess(false)}
               className="mt-6 text-[10px] font-bold uppercase tracking-widest text-[#2D2A26]/60 hover:text-[#C5A065] transition-all"
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
      <div className="absolute inset-0 z-0"><GoldenBackground /></div>
      <div className="relative z-10 w-full max-w-md px-6">
        <div className="bg-white/80 backdrop-blur-xl p-10 rounded-3xl shadow-2xl border border-white/40">
          <div className="text-center mb-8">
            <h2 className="text-4xl mb-2" style={{ fontFamily: styles.fontScript, color: styles.gold }}>
              Mot de passe oublié ?
            </h2>
            <p className="text-[10px] font-bold uppercase tracking-widest text-stone-500 mt-4">
              Entrez votre email pour recevoir le code
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="text-[10px] font-bold uppercase tracking-widest p-3 rounded bg-red-50 text-red-600 border border-red-200 text-center">
                {error}
              </div>
            )}

            <div className="space-y-1 group">
              <label className="text-[10px] font-black uppercase tracking-widest opacity-50 group-focus-within:text-[#C5A065] transition-colors">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full py-3 bg-transparent border-b border-black/10 focus:border-[#C5A065] outline-none transition-all placeholder:text-black/10 text-sm"
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
              {loading ? 'ENVOI...' : 'ENVOYER LE LIEN'}
            </button>
          </form>

          <div className="mt-8 text-center pt-6 border-t border-black/5">
            <Link to="/auth" className="flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest opacity-40 hover:opacity-100 hover:text-[#C5A065] transition-all">
              <ArrowLeft size={14} /> Retour à la connexion
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
