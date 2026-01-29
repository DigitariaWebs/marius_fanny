import { useState } from 'react';
import { Instagram, Phone, MapPin } from 'lucide-react';

const Footer: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [isSubscribed, setIsSubscribed] = useState<boolean>(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      console.log('Subscribed:', email);
      setIsSubscribed(true);
      setEmail('');
      
      setTimeout(() => {
        setIsSubscribed(false);
      }, 3000);
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
                  <MapPin size={20} className="flex-shrink-0 mt-1 text-[#C5A065]" />
                  <div>
                    <p className="font-black text-[#C5A065] uppercase mb-1">Laval</p>
                    <p className="font-bold">239-E Boulevard Samson, Laval</p>
                  </div>
                </div>
                <div className="ml-8 text-[#2D2A26]/70">
                  <p>Lundi au jeudi : 7h00 à 18h00</p>
                  <p>Vendredi : 7h00 à 18h30</p>
                  <p>Samedi-dimanche : 8h00 à 18h00</p>
                </div>
                <div className="flex items-center gap-3 ml-8 mt-2">
                  <Phone size={18} className="flex-shrink-0 text-[#C5A065]" />
                  <a href="tel:+14506890655" className="hover:text-[#C5A065] transition-colors font-bold">
                    450-689-0655
                  </a>
                </div>
              </div>

              {/* Montreal */}
              <div>
                <div className="flex items-start gap-3 mb-2">
                  <MapPin size={20} className="flex-shrink-0 mt-1 text-[#C5A065]" />
                  <div>
                    <p className="font-black text-[#C5A065] uppercase mb-1">Montréal</p>
                    <p className="font-bold">2006 rue St-Hubert, Montréal</p>
                  </div>
                </div>
                <div className="ml-8 text-[#2D2A26]/70">
                  <p>Lundi au vendredi : 7h00 à 17h00</p>
                  <p>Samedi : 8h00 à 17h00</p>
                  <p>Dimanche : 8h00 à 17h00</p>
                </div>
                <div className="flex items-center gap-3 ml-8 mt-2">
                  <Phone size={18} className="flex-shrink-0 text-[#C5A065]" />
                  <a href="tel:+15143791898" className="hover:text-[#C5A065] transition-colors font-bold">
                    514-379-1898
                  </a>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <p className="text-sm font-bold mb-3 text-[#C5A065]">Suivez-nous</p>
              <div className="flex gap-4">
                <a 
                  href="https://instagram.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-12 h-12 bg-[#C5A065] rounded-full flex items-center justify-center hover:bg-[#B59055] transition-colors"
                >
                  <Instagram size={24} className="text-white" />
                </a>
                <a 
                  href="https://facebook.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-12 h-12 bg-[#C5A065] rounded-full flex items-center justify-center hover:bg-[#B59055] transition-colors"
                >
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>

          {/* Colonne 2 - Navigation */}
          <div>
            <h3 className="text-2xl font-black mb-6 uppercase tracking-wide text-[#C5A065]">
              Navigation
            </h3>
            <ul className="space-y-3">
              <li>
                <a href="#biscuits" className="text-lg font-bold hover:text-[#C5A065] transition-colors uppercase">
                  Biscuits
                </a>
              </li>
              <li>
                <a href="#gateaux" className="text-lg font-bold hover:text-[#C5A065] transition-colors uppercase">
                  Gâteaux
                </a>
              </li>
              <li>
                <a href="#apropos" className="text-lg font-bold hover:text-[#C5A065] transition-colors uppercase">
                  À propos
                </a>
              </li>
              <li>
                <a href="#contact" className="text-lg font-bold hover:text-[#C5A065] transition-colors uppercase">
                  Contact
                </a>
              </li>
              <li>
                <a href="#wholesale" className="text-lg font-bold hover:text-[#C5A065] transition-colors uppercase">
                  Wholesale
                </a>
              </li>
            </ul>
          </div>

          {/* Colonne 3 - Newsletter */}
          <div>
            <h3 className="text-2xl font-black mb-6 uppercase tracking-wide text-[#C5A065]">
              Abonnez-vous à notre infolettre
            </h3>
            <p className="text-sm mb-6 leading-relaxed text-[#2D2A26]/70">
              Recevez nos nouveautés, promotions exclusives et nos meilleures recettes directement dans votre boîte mail.
            </p>
            
            {isSubscribed ? (
              <div className="bg-green-100 border-2 border-green-500 rounded-full px-6 py-4 text-center">
                <p className="font-bold text-green-700">✓ Merci pour votre inscription !</p>
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

        {/* Grand nom de la marque */}
        <div className="relative overflow-hidden py-12">
          <h2 className="text-[4rem] md:text-[6rem] lg:text-[8rem] font-black uppercase leading-none text-[#C5A065] tracking-tighter opacity-20">
            PATISSERIE<br/>PROVENCALE
          </h2>
        </div>

        {/* Ligne de séparation */}
        <div className="border-t-2 border-[#C5A065]/30 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
            <p className="text-[#2D2A26]/70">
              Copyright 2026 | Pâtisserie Provençale
            </p>
            
            <div className="flex gap-6">
              <a href="#conditions" className="text-[#2D2A26]/70 hover:text-[#C5A065] transition-colors">
                Conditions d'utilisation
              </a>
              <span className="text-[#2D2A26]/40">|</span>
              <a href="#confidentialite" className="text-[#2D2A26]/70 hover:text-[#C5A065] transition-colors">
                Politique de confidentialité
              </a>
            </div>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;