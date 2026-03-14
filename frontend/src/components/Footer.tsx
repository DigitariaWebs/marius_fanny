import { Phone, MapPin, Instagram, Facebook } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Footer: React.FC = () => {
  const navigate = useNavigate();

  const mainLinks = [
    { name: "La Boutique", id: "shop" },
    { name: "Notre Histoire", id: "timeline" },
    { name: "Devenir partenaire", id: "devenir-partenaire" },
    { name: "Contacter", id: "contact" },
  ];

  const handleAnchorClick = (id: string) => {
    if (id === "politique-de-retour") {
      navigate("/politique-retour");
      return;
    }
    if (id === "contact") {
      navigate("/contact");
      return;
    }

    if (window.location.pathname !== "/") {
      navigate("/");
      setTimeout(() => {
        const element = document.getElementById(id);
        element?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } else {
      const element = document.getElementById(id);
      element?.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <footer className="relative bg-[#F9F7F2] text-[#2D2A26] overflow-hidden">
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-16">
        {/* Grid layout - 3 Colonnes */}
        <div className="grid lg:grid-cols-3 gap-12 mb-16 items-start">
          
          {/* Colonne 1 - Nos Boutiques */}
          <div className="order-1">
            <h3 className="text-2xl font-black mb-6 uppercase tracking-wide text-[#337957]">
              Nos Boutiques
            </h3>
            <div className="space-y-6 text-sm">
              <div>
                <div className="flex items-start gap-3 mb-2">
                  <MapPin size={20} className="shrink-0 mt-1 text-[#337957]" />
                  <div>
                    <p className="font-black text-[#337957] uppercase mb-1">Laval</p>
                    <p className="font-bold">239-E Boulevard Samson, Laval</p>
                  </div>
                </div>
                <div className="ml-8 text-[#2D2A26]/70">
                  <p>Lun - Jeu : 7h00 à 18h00</p>
                  <p>Ven : 7h00 à 18h30</p>
                  <p>Sam - Dim : 8h00 à 18h00</p>
                </div>
                <div className="flex items-center gap-3 ml-8 mt-2">
                  <Phone size={18} className="shrink-0 text-[#337957]" />
                  <a href="tel:+14506890655" className="hover:text-[#337957] transition-colors font-bold">
                    450-689-0655
                  </a>
                </div>
              </div>

              <div>
                <div className="flex items-start gap-3 mb-2">
                  <MapPin size={20} className="shrink-0 mt-1 text-[#337957]" />
                  <div>
                    <p className="font-black text-[#337957] uppercase mb-1">Montréal</p>
                    <p className="font-bold">2006 rue St-Hubert, Montréal</p>
                  </div>
                </div>
                <div className="ml-8 text-[#2D2A26]/70">
                  <p>Lun - Ven : 7h00 à 17h00</p>
                  <p>Sam - Dim : 8h00 à 17h00</p>
                </div>
                <div className="flex items-center gap-3 ml-8 mt-2">
                  <Phone size={18} className="shrink-0 text-[#337957]" />
                  <a href="tel:+15143791898" className="hover:text-[#337957] transition-colors font-bold">
                    514-379-1898
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Colonne 2 - MILIEU : Marque & Description */}
          <div className="order-2 flex flex-col items-center text-center px-4">
            <h3 className="text-3xl font-black mb-6 uppercase tracking-widest text-[#337957]">
              Pâtisserie Provençale
            </h3>
            <p className="text-sm font-medium leading-relaxed text-[#2D2A26]/80 max-w-xs mb-8">
              Artisans passionnés depuis des générations, nous mettons tout notre savoir-faire au service de vos papilles pour créer des moments de pure gourmandise.
            </p>
            <div className="flex gap-4">
            </div>
          </div>

          <div className="order-3 lg:text-right">
            <h3 className="text-2xl font-black mb-6 uppercase tracking-wide text-[#337957]">
              Navigation
            </h3>
            <ul className="space-y-3">
              {mainLinks.map((link) => (
                <li key={link.id}>
                  <button
                    onClick={() => handleAnchorClick(link.id)}
                    className="text-lg font-bold hover:text-[#337957] transition-colors uppercase"
                  >
                    {link.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Section décorative (Grand texte en arrière-plan) */}
        <div className="relative overflow-hidden py-8">
          <h2 className="text-[4rem] md:text-[6rem] lg:text-[8rem] font-black uppercase leading-none text-[#337957] tracking-tighter opacity-10">
            PATISSERIE
            <br />
            PROVENCALE
          </h2>
        </div>

        {/* Bas du footer */}
        <div className="border-t-2 border-[#337957]/30 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
            <p className="text-[#2D2A26]/70 font-bold">
              Copyright 2026 | Pâtisserie Provençale
            </p>

            <div className="flex gap-6">
              <a
                href="#conditions"
                className="text-[#2D2A26]/70 hover:text-[#337957] transition-colors font-bold"
              >
                Conditions d'utilisation
              </a>
              <span className="text-[#2D2A26]/40">|</span>
              <button
                onClick={() => handleAnchorClick("politique-de-retour")}
                className="text-[#2D2A26]/70 hover:text-[#337957] transition-colors font-bold"
              >
                Politique de retour
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;