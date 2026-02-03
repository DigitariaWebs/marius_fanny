import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authClient } from '../lib/AuthClient.ts';
import GoldenBackground from './GoldenBackground';
import { Mail, ArrowLeft } from 'lucide-react';

const styles = {
  gold: '#C5A065',
  text: '#2D2A26',
  fontScript: '"Great Vibes", cursive',
  fontSans: '"Inter", sans-serif',
};

const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isVerificationSent, setIsVerificationSent] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        
        const { error: signInError } = await authClient.signIn.email({
          email,
          password,
        });

        if (signInError) {
          throw new Error(signInError.message ?? 'Connexion échouée');
        }

        navigate('/user');
      } else {
        const { error: signUpError } = await authClient.signUp.email({
          email,
          password,
          name,
        });

        if (signUpError) {
          throw new Error(signUpError.message ?? 'Inscription échouée');
        }

        setIsVerificationSent(true);
      }
    } catch (err: any) {
      console.error('Auth Error:', err);
      setError(err.message || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  // --- INTERFACE DE VÉRIFICATION D'EMAIL ---
  if (isVerificationSent) {
    return (
      <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-[#F9F7F2]">
        <div className="absolute inset-0 z-0">
          <GoldenBackground />
        </div>
        <div className="relative z-10 w-full max-w-md px-6 text-center">
          <div className="bg-white/80 backdrop-blur-xl p-10 rounded-3xl shadow-2xl border border-white/40">
            <div className="w-20 h-20 bg-[#C5A065]/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Mail className="text-[#C5A065]" size={40} />
            </div>
            <h2
              className="text-4xl mb-4"
              style={{ fontFamily: styles.fontScript, color: styles.gold }}
            >
              Presque terminé...
            </h2>
            <p className="text-[11px] font-bold uppercase tracking-widest text-stone-500 leading-relaxed mb-8">
              Un lien de confirmation a été envoyé à <br />
              <span className="text-[#2D2A26] underline">{email}</span>. <br />
              <br />
              Veuillez cliquer sur ce lien pour activer votre compte Marius & Fanny.
            </p>
            <button
              onClick={() => {
                setIsVerificationSent(false);
                setIsLogin(true);
              }}
              className="flex items-center justify-center gap-2 mx-auto text-[10px] font-black uppercase tracking-widest text-[#2D2A26] hover:text-[#C5A065] transition-all"
            >
              <ArrowLeft size={14} /> Retour à la connexion
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- INTERFACE CONNEXION / INSCRIPTION ---
  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-[#F9F7F2]">
      <div className="absolute inset-0 z-0">
        <GoldenBackground />
      </div>

      <div className="relative z-10 w-full max-w-md px-6">
        <div className="bg-white/80 backdrop-blur-xl p-10 rounded-3xl shadow-2xl border border-white/40">
          <div className="text-center mb-10">
            <h2
              className="text-5xl mb-2"
              style={{ fontFamily: styles.fontScript, color: styles.gold }}
            >
              Marius & Fanny
            </h2>
            <h1
              className="text-[10px] font-black uppercase tracking-[0.4em] mt-4"
              style={{ color: styles.text }}
            >
              {isLogin ? 'Connexion' : 'Inscription'}
            </h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div
                className="text-[10px] font-bold uppercase tracking-widest py-3 px-4 rounded-lg border text-center animate-pulse"
                style={{
                  borderColor: '#ef4444',
                  backgroundColor: '#fef2f2',
                  color: '#b91c1c',
                }}
                role="alert"
              >
                {error}
              </div>
            )}

            {!isLogin && (
              <div className="space-y-1">
                <label className="block text-[10px] font-black uppercase tracking-widest opacity-50">
                  Nom Complet
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-0 py-3 bg-transparent border-b border-black/10 focus:border-[#C5A065] outline-none transition-all placeholder:text-black/10"
                  placeholder="JEAN DUPONT"
                  required={!isLogin}
                />
              </div>
            )}

            <div className="space-y-1">
              <label className="block text-[10px] font-black uppercase tracking-widest opacity-50">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-0 py-3 bg-transparent border-b border-black/10 focus:border-[#C5A065] outline-none transition-all placeholder:text-black/10"
                placeholder="VOTRE@EMAIL.COM"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="block text-[10px] font-black uppercase tracking-widest opacity-50">
                Mot de passe
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-0 py-3 bg-transparent border-b border-black/10 focus:border-[#C5A065] outline-none transition-all placeholder:text-black/10"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-8 py-4 text-[11px] font-black uppercase tracking-[0.2em] text-white transition-all duration-300 hover:opacity-90 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              style={{ backgroundColor: styles.text }}
            >
              {loading ? 'CHARGEMENT...' : isLogin ? 'SE CONNECTER' : 'CRÉER MON COMPTE'}
            </button>
          </form>

          <div className="mt-8 text-center border-t border-black/5 pt-6">
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setError(null);
              }}
              className="text-[10px] font-bold uppercase tracking-widest opacity-40 hover:opacity-100 hover:text-[#C5A065] transition-all"
              style={{ color: styles.text }}
            >
              {isLogin ? "Nouveau ici ? S'inscrire" : 'Déjà un compte ? Se connecter'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;