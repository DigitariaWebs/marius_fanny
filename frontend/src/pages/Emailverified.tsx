import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function EmailVerified() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F9F7F2] px-4">
      <h1 className="text-2xl font-bold mb-6">
        ✅ Email vérifié avec succès
      </h1>

      <button
        onClick={() => navigate(-1)} 
        className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-[#2D2A26] bg-white/80 border border-black/10 rounded-xl hover:bg-[#C5A065]/20 transition-all"
      >
        <ArrowLeft size={16} /> Retour
      </button>

      <button
        onClick={() => navigate('/')}
        className="mt-4 px-4 py-2 text-sm font-bold text-white bg-[#2D2A26] rounded-xl hover:opacity-90 transition-all"
      >
        Accueil
      </button>
    </div>
  );
}