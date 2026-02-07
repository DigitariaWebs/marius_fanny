import { useState } from "react";
import { Phone, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Footer: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [isSubscribed, setIsSubscribed] = useState<boolean>(false);
  const navigate = useNavigate();

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      console.log("Subscribed:", email);
      setIsSubscribed(true);
      setEmail("");

      setTimeout(() => {
        setIsSubscribed(false);
      }, 3000);
    }
  };

  const mainLinks = [
    { name: "La Boutique", id: "shop" },
    { name: "Nos Favoris", id: "best-sellers" },
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
      {/* Section principale du footer */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-16">
        {/* Grid layout */}
        <div className="grid lg:grid-cols-3 gap-12 mb-16">
          {/* Colonne 1 - Info entreprise */}
          <div>
            <h3 className="text-2xl font-black mb-6 uppercase tracking-wide text-[#C5A065]">
              Nos Boutiques
            </h3>
            <div className="space-y-6 text-sm">
              {/* Laval */}
              <div>
                <div className="flex items-start gap-3 mb-2">
                  <MapPin size={20} className="shrink-0 mt-1 text-[#C5A065]" />
                  <div>
                    <p className="font-black text-[#C5A065] uppercase mb-1">
                      Laval
                    </p>
                    <p className="font-bold">239-E Boulevard Samson, Laval</p>
                  </div>
                </div>
                <div className="ml-8 text-[#2D2A26]/70">
                  <p>Lundi au jeudi : 7h00 à 18h00</p>
                  <p>Vendredi : 7h00 à 18h30</p>
                  <p>Samedi-dimanche : 8h00 à 18h00</p>
                </div>
                <div className="flex items-center gap-3 ml-8 mt-2">
                  <Phone size={18} className="shrink-0 text-[#C5A065]" />
                  <a
                    href="tel:+14506890655"
                    className="hover:text-[#C5A065] transition-colors font-bold"
                  >
                    450-689-0655
                  </a>
                </div>
              </div>

              {/* Montreal */}
              <div>
                <div className="flex items-start gap-3 mb-2">
                  <MapPin size={20} className="shrink-0 mt-1 text-[#C5A065]" />
                  <div>
                    <p className="font-black text-[#C5A065] uppercase mb-1">
                      Montréal
                    </p>
                    <p className="font-bold">2006 rue St-Hubert, Montréal</p>
                  </div>
                </div>
                <div className="ml-8 text-[#2D2A26]/70">
                  <p>Lundi au vendredi : 7h00 à 17h00</p>
                  <p>Samedi : 8h00 à 17h00</p>
                  <p>Dimanche : 8h00 à 17h00</p>
                </div>
                <div className="flex items-center gap-3 ml-8 mt-2">
                  <Phone size={18} className="shrink-0 text-[#C5A065]" />
                  <a
                    href="tel:+15143791898"
                    className="hover:text-[#C5A065] transition-colors font-bold"
                  >
                    514-379-1898
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Colonne 2 - Navigation */}
          <div>
            <h3 className="text-2xl font-black mb-6 uppercase tracking-wide text-[#C5A065]">
              Navigation
            </h3>
            <ul className="space-y-3">
              {mainLinks.map((link) => (
                <li key={link.id}>
                  <button
                    onClick={() => handleAnchorClick(link.id)}
                    className="text-lg font-bold hover:text-[#C5A065] transition-colors uppercase text-left"
                  >
                    {link.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Colonne 3 - Newsletter */}
          <div>
            <h3 className="text-2xl font-black mb-6 uppercase tracking-wide text-[#C5A065]">
              Abonnez-vous à notre infolettre
            </h3>
            <p className="text-sm mb-6 leading-relaxed text-[#2D2A26]/70">
              Recevez nos nouveautés, promotions exclusives et nos meilleures
              recettes directement dans votre boîte mail.
            </p>

            {isSubscribed ? (
              <div className="bg-green-100 border-2 border-green-500 rounded-full px-6 py-4 text-center">
                <p className="font-bold text-green-700">
                  ✓ Merci pour votre inscription !
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="EMAIL"
                  required
                  className="flex-1 bg-white border-2 border-[#C5A065] text-[#2D2A26] placeholder-[#2D2A26]/50 px-6 py-4 rounded-full font-bold uppercase text-sm focus:outline-none focus:ring-4 focus:ring-[#C5A065]/30 transition-all"
                />
                <button
                  type="submit"
                  className="bg-[#C5A065] text-white px-8 py-4 rounded-full font-black uppercase text-sm hover:bg-[#B59055] transition-all duration-300 hover:scale-105"
                >
                  S'abonner
                </button>
              </form>
            )}
          </div>
        </div>

        <div className="relative overflow-hidden py-12">
          <h2 className="text-[4rem] md:text-[6rem] lg:text-[8rem] font-black uppercase leading-none text-[#C5A065] tracking-tighter opacity-20">
            PATISSERIE
            <br />
            PROVENCALE
          </h2>
        </div>

        <div className="border-t-2 border-[#C5A065]/30 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
            <p className="text-[#2D2A26]/70">
              Copyright 2026 | Pâtisserie Provençale
            </p>

            <div className="flex gap-6">
              <a
                href="#conditions"
                className="text-[#2D2A26]/70 hover:text-[#C5A065] transition-colors"
              >
                Conditions d'utilisation
              </a>
              <span className="text-[#2D2A26]/40">|</span>
              <button
                onClick={() => handleAnchorClick("politique-de-retour")}
                className="text-[#2D2A26]/70 hover:text-[#C5A065] transition-colors"
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