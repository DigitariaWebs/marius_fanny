import React from 'react';
import { Instagram } from 'lucide-react';

const ClientVideo: React.FC = () => {
  return (
    <section className="py-24 bg-[#F9F7F2]">
      <div className="max-w-7xl mx-auto px-6">
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          {/* COLONNE GAUCHE : LA VIDÉO (Format Smartphone Moderne) */}
          <div className="relative flex justify-center order-2 lg:order-1">
            {/* Décoration derrière la vidéo */}
            <div className="absolute -inset-4 border border-[#C5A065]/30 rounded-[3rem] -rotate-3" />
            
            <div className="relative w-full max-w-[320px] aspect-[9/16] rounded-[2.5rem] overflow-hidden shadow-2xl border-8 border-[#2D2A26]">
              <video 
                className="w-full h-full object-cover"
                autoPlay 
                muted 
                loop 
                playsInline
              >
                <source src="/video.mp4" type="video/mp4" />
                Votre navigateur ne supporte pas la vidéo.
              </video>
            </div>

            {/* Petit badge flottant */}
            <div className="absolute top-10 -right-8 bg-white p-4 rounded-2xl shadow-xl flex items-center gap-3 animate-bounce">
              <div className="w-10 h-10 bg-[#C5A065] rounded-full flex items-center justify-center text-white">
                <Instagram size={20} />
              </div>
              <span className="font-bold text-xs uppercase tracking-tighter">
                Vu sur nos réseaux
              </span>
            </div>
          </div>

          {/* COLONNE DROITE : LE TEXTE */}
          <div className="space-y-8 order-1 lg:order-2">
            <h2 className="text-5xl md:text-6xl font-serif italic text-[#C5A065]">
              Le bonheur se partage
            </h2>
            
            <div className="space-y-4">
              <h3 className="text-xl font-bold uppercase tracking-widest text-[#2D2A26]">
                Merci pour votre fidélité
              </h3>
              <p className="text-lg text-[#2D2A26]/70 leading-relaxed italic">
                "Voir vos yeux s'illuminer lors de la première bouchée de nos pâtisseries est notre plus belle récompense. Chaque jour, vous donnez vie à la maison Marius et Fanny."
              </p>
            </div>

            <div className="h-px w-24 bg-[#C5A065]" />
            
            <div className="flex gap-4">
               <p className="text-sm font-black uppercase tracking-widest opacity-40">
                 Partagez votre moment : #MariusEtFanny
               </p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default ClientVideo;