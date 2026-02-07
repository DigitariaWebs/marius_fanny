import React, { useEffect, useState } from "react";
import { authClient } from "../lib/AuthClient";
import GoldenBackground from "./GoldenBackground";
import { User, Package, Settings, LogOut } from "lucide-react";

const Dashboard: React.FC = () => {
  const [userInfo, setUserInfo] = useState<any>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const session = await authClient.getSession();
      setUserInfo(session.data?.user);
    };
    fetchUser();
  }, []);

  const role = userInfo?.role || "client";

  return (
    <div className="relative min-h-screen w-full bg-[#F9F7F2] pt-28 pb-12 px-6">
      <div className="absolute inset-0 z-0 opacity-30">
        <GoldenBackground />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto">
        {/* Header de bienvenue */}
        <div className="text-center mb-12">
          <h1 className="text-5xl mb-4" style={{ fontFamily: '"Great Vibes", cursive', color: "#C5A065" }}>
            {role === "admin" ? "Tableau de Bord" : "Mon Espace Personnel"}
          </h1>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-500">
            Bienvenue, {userInfo?.name || "Cher Client"}
          </p>
        </div>

        {/* Grille de cartes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Carte Profil */}
          <div className="bg-white/70 backdrop-blur-md p-8 rounded-3xl border border-white shadow-xl">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-[#C5A065]/10 rounded-2xl text-[#C5A065]">
                <User size={24} />
              </div>
              <h3 className="font-bold uppercase tracking-widest text-sm">Mon Profil</h3>
            </div>
            <div className="space-y-3 text-sm text-stone-600">
              <p><span className="font-bold opacity-50 uppercase text-[10px] block">Email</span> {userInfo?.email}</p>
              <p><span className="font-bold opacity-50 uppercase text-[10px] block">Statut</span> {role}</p>
            </div>
          </div>

          {/* Carte Commandes */}
          <div className="bg-white/70 backdrop-blur-md p-8 rounded-3xl border border-white shadow-xl">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-[#C5A065]/10 rounded-2xl text-[#C5A065]">
                <Package size={24} />
              </div>
              <h3 className="font-bold uppercase tracking-widest text-sm">Mes Commandes</h3>
            </div>
            <p className="text-sm text-stone-400 italic">Vous n'avez pas encore de commande.</p>
          </div>
        </div>

        {/* Bouton Quitter */}
        <button 
          onClick={() => authClient.signOut().then(() => window.location.href = "/")}
          className="mt-12 flex items-center gap-2 mx-auto text-[10px] font-black uppercase tracking-widest text-red-800/50 hover:text-red-800 transition-all"
        >
          <LogOut size={14} /> Se déconnecter
        </button>
      </div>
    </div>
  );
};

export default Dashboard;