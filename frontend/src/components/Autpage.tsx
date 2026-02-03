import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { authClient } from '../lib/AuthClient.ts';
import GoldenBackground from './GoldenBackground';
import { Mail, ArrowLeft, Check, Lock, User } from 'lucide-react';

const styles = {
  gold: '#C5A065',
  text: '#2D2A26',
  fontScript: '"Great Vibes", cursive',
  fontSans: '"Inter", sans-serif',
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const AuthPage: React.FC = () => {
  const [view, setView] = useState<'login' | 'signup' | 'forgot-password'>('login');
  const [isVerificationSent, setIsVerificationSent] = useState(false);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  const navigate = useNavigate();
  const location = useLocation();

  const switchView = (newView: 'login' | 'signup' | 'forgot-password') => {
    setView(newView);
    setError(null);
    setSuccessMessage(null);
  };

  const validateForm = () => {
    if (!EMAIL_REGEX.test(email)) {
      setError("Format d'email invalide.");
      return false;
    }
    if (view !== 'forgot-password' && password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!validateForm()) return;

    setLoading(true);

    try {
      if (view === 'login') {
        const { data, error: signInError } = await authClient.signIn.email({
          email,
          password,
          // Note: rememberMe est géré par Better-Auth si configuré dans le client
        });

        if (signInError) throw new Error(signInError.message || 'Connexion échouée');

        const isVerified = data?.user?.emailVerified ?? false; 
        
        if (isVerified) {
            const from = (location.state as any)?.from?.pathname || '/user';
            navigate(from);
        } else {
            navigate('/email-verified');
        }

      } else if (view === 'signup') {
        const { error: signUpError } = await authClient.signUp.email({
          email,
          password,
          name,
        });

        if (signUpError) throw new Error(signUpError.message || 'Inscription échouée');
        
        setIsVerificationSent(true);

      } else if (view === 'forgot-password') {
        // --- CORRECTION CRUCIALE POUR LE BUILD ---
        const { error: forgotError } = await authClient.forgetPassword.sendForgotPasswordEmail({
            email,
            redirectTo: window.location.origin + '/reset-password', 
        });

        if (forgotError) throw new Error(forgotError.message || 'Impossible d\'envoyer l\'email');
        
        setSuccessMessage("Un lien de réinitialisation a été envoyé à votre adresse email.");
      }

    } catch (err: any) {
      console.error('Auth Error:', err);
      if (err.message === 'Failed to fetch') {
         setError('Erreur réseau. Vérifiez votre connexion.');
      } else {
         setError(err.message || 'Une erreur est survenue.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (isVerificationSent) {
    return (
      <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-[#F9F7F2]">
        <div className="absolute inset-0 z-0"><GoldenBackground /></div>
        <div className="relative z-10 w-full max-w-md px-6 text-center">
          <div className="bg-white/80 backdrop-blur-xl p-10 rounded-3xl shadow-2xl border border-white/40">
            <div className="w-20 h-20 bg-[#C5A065]/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Mail className="text-[#C5A065]" size={40} />
            </div>
            <h2 className="text-4xl mb-4" style={{ fontFamily: styles.fontScript, color: styles.gold }}>
              Presque terminé...
            </h2>
            <p className="text-[11px] font-bold uppercase tracking-widest text-stone-500 leading-relaxed mb-8">
              Un lien de confirmation a été envoyé à <br />
              <span className="text-[#2D2A26] underline">{email}</span>. <br /><br />
              Veuillez cliquer sur ce lien pour activer votre compte.
            </p>
            <button
              onClick={() => {
                setIsVerificationSent(false);
                switchView('login');
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

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-[#F9F7F2]">
      <div className="absolute inset-0 z-0"><GoldenBackground /></div>
      <div className="relative z-10 w-full max-w-md px-6">
        <div className="bg-white/80 backdrop-blur-xl p-10 rounded-3xl shadow-2xl border border-white/40">
          
          <div className="text-center mb-8">
            <h2 className="text-5xl mb-2" style={{ fontFamily: styles.fontScript, color: styles.gold }}>
              Marius & Fanny
            </h2>
            <h1 className="text-[10px] font-black uppercase tracking-[0.4em] mt-4" style={{ color: styles.text }}>
              {view === 'login' && 'Connexion'}
              {view === 'signup' && 'Inscription'}
              {view === 'forgot-password' && 'Récupération'}
            </h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="text-[10px] font-bold uppercase tracking-widest py-3 px-4 rounded-lg border text-center animate-pulse"
                style={{ borderColor: '#ef4444', backgroundColor: '#fef2f2', color: '#b91c1c' }}
                role="alert">
                {error}
              </div>
            )}

            {successMessage && (
               <div className="text-[10px] font-bold uppercase tracking-widest py-3 px-4 rounded-lg border text-center"
                 style={{ borderColor: '#22c55e', backgroundColor: '#f0fdf4', color: '#15803d' }}>
                 {successMessage}
               </div>
            )}

            {view === 'signup' && (
              <div className="space-y-1 group">
                <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest opacity-50 group-focus-within:opacity-100 group-focus-within:text-[#C5A065] transition-all">
                  <User size={12} /> Nom Complet
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-0 py-3 bg-transparent border-b border-black/10 focus:border-[#C5A065] outline-none transition-all placeholder:text-black/10 text-sm"
                  placeholder="JEAN DUPONT"
                  required
                />
              </div>
            )}

            <div className="space-y-1 group">
              <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest opacity-50 group-focus-within:opacity-100 group-focus-within:text-[#C5A065] transition-all">
                <Mail size={12} /> Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-0 py-3 bg-transparent border-b border-black/10 focus:border-[#C5A065] outline-none transition-all placeholder:text-black/10 text-sm"
                placeholder="VOTRE@EMAIL.COM"
                required
              />
            </div>

            {view !== 'forgot-password' && (
              <div className="space-y-1 group">
                <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest opacity-50 group-focus-within:opacity-100 group-focus-within:text-[#C5A065] transition-all">
                  <Lock size={12} /> Mot de passe
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-0 py-3 bg-transparent border-b border-black/10 focus:border-[#C5A065] outline-none transition-all placeholder:text-black/10 text-sm"
                  placeholder="••••••••"
                  required
                />
              </div>
            )}

            {view === 'login' && (
              <div className="flex items-center justify-between pt-2">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <div className={`w-4 h-4 border rounded flex items-center justify-center transition-colors ${rememberMe ? 'border-[#C5A065] bg-[#C5A065]' : 'border-black/20 group-hover:border-[#C5A065]'}`}>
                    {rememberMe && <Check size={10} className="text-white" />}
                  </div>
                  <input 
                    type="checkbox" 
                    className="hidden" 
                    checked={rememberMe} 
                    onChange={(e) => setRememberMe(e.target.checked)} 
                  />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#2D2A26]/60 group-hover:text-[#2D2A26] transition-colors">
                    Se souvenir
                  </span>
                </label>

                <button
                  type="button"
                  onClick={() => switchView('forgot-password')}
                  className="text-[10px] font-bold uppercase tracking-wider text-[#2D2A26]/60 hover:text-[#C5A065] transition-colors"
                >
                  Mot de passe oublié ?
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-8 py-4 text-[11px] font-black uppercase tracking-[0.2em] text-white transition-all duration-300 hover:opacity-90 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              style={{ backgroundColor: styles.text }}
            >
              {loading ? 'CHARGEMENT...' : 
                view === 'login' ? 'SE CONNECTER' : 
                view === 'signup' ? 'CRÉER MON COMPTE' : 
                'ENVOYER LE LIEN'}
            </button>
          </form>

          <div className="mt-8 text-center border-t border-black/5 pt-6 flex flex-col gap-3">
            {view !== 'login' && (
              <button
                type="button"
                onClick={() => switchView('login')}
                className="text-[10px] font-bold uppercase tracking-widest opacity-40 hover:opacity-100 hover:text-[#C5A065] transition-all"
                style={{ color: styles.text }}
              >
                Déjà un compte ? Se connecter
              </button>
            )}

            {view !== 'signup' && (
              <button
                type="button"
                onClick={() => switchView('signup')}
                className="text-[10px] font-bold uppercase tracking-widest opacity-40 hover:opacity-100 hover:text-[#C5A065] transition-all"
                style={{ color: styles.text }}
              >
                Nouveau ici ? S'inscrire
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
