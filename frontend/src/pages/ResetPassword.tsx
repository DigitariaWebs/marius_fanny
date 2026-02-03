import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { authClient } from '../lib/AuthClient.ts';
import GoldenBackground from '../components/GoldenBackground.tsx';
import { Lock, ArrowRight, CheckCircle2 } from 'lucide-react';

const styles = {
  gold: '#C5A065',
  text: '#2D2A26',
  fontScript: '"Great Vibes", cursive',
};

const ResetPasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const navigate = useNavigate();
  
  // On récupère le token dans l'URL (ex: ?token=abc...)
  const token = searchParams.get('token');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    if (!token) {
      setError("Le jeton (token) de réinitialisation est manquant.");
      return;
    }

    setLoading(true);

    try {
      // CORRECTION ICI : 'newPassword' au lieu de 'password'
      const { error: resetError } = await authClient.resetPassword({
        newPassword: password, 
        token: token,
      });

      if (resetError) throw new Error(resetError.message);

      setIsSuccess(true);
      setTimeout(() => navigate('/auth'), 3000);
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="relative min-h-screen w-full flex items-center justify-center bg-[#F9F7F2]">
        <div className="absolute inset-0 z-0"><GoldenBackground /></div>
        <div className="relative z-10 w-full max-w-md px-6 text-center">
          <div className="bg-white/80 backdrop-blur-xl p-10 rounded-3xl shadow-2xl border border-white/40">
            <CheckCircle2 className="mx-auto mb-4 text-green-500" size={50} />
            <h2 className="text-3xl mb-4" style={{ fontFamily: styles.fontScript, color: styles.gold }}>
              Mot de passe modifié
            </h2>
            <p className="text-[10px] font-bold uppercase tracking-widest text-stone-500">
              Redirection vers la connexion...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center bg-[#F9F7F2]">
      <div className="absolute inset-0 z-0"><GoldenBackground /></div>
      <div className="relative z-10 w-full max-w-md px-6">
        <div className="bg-white/80 backdrop-blur-xl p-10 rounded-3xl shadow-2xl border border-white/40">
          <div className="text-center mb-8">
            <h2 className="text-4xl mb-2" style={{ fontFamily: styles.fontScript, color: styles.gold }}>
              Nouveau mot de passe
            </h2>
            <p className="text-[10px] font-bold uppercase tracking-widest text-stone-500 mt-4">
              Choisissez votre nouveau code secret
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="text-[10px] font-bold uppercase tracking-widest p-3 rounded bg-red-50 text-red-600 border border-red-200 text-center">
                {error}
              </div>
            )}

            <div className="space-y-1 group">
              <label className="text-[10px] font-black uppercase tracking-widest opacity-50 group-focus-within:text-[#C5A065]">
                <Lock size={12} className="inline mr-1" /> Nouveau mot de passe
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full py-3 bg-transparent border-b border-black/10 focus:border-[#C5A065] outline-none text-sm"
                placeholder="••••••••"
                required
              />
            </div>

            <div className="space-y-1 group">
              <label className="text-[10px] font-black uppercase tracking-widest opacity-50 group-focus-within:text-[#C5A065]">
                Confirmer le mot de passe
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full py-3 bg-transparent border-b border-black/10 focus:border-[#C5A065] outline-none text-sm"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 text-[11px] font-black uppercase tracking-[0.2em] text-white shadow-lg flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50 transition-all"
              style={{ backgroundColor: styles.text }}
            >
              {loading ? 'MODIFICATION...' : 'RÉINITIALISER'} <ArrowRight size={14} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
