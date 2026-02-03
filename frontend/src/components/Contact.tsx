import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Phone, Instagram, Send, MapPin, Mail, Clock } from 'lucide-react';
import GoldenBackground from './GoldenBackground';

const Contact: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 5000);
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-[#F9F7F2] to-white relative overflow-hidden">
      <GoldenBackground />

      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-sm border-b border-[#C5A065]/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center h-16">
            <Link 
              to="/" 
              className="flex items-center gap-2 text-[#2D2A26] hover:text-[#C5A065] transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-semibold uppercase tracking-widest text-xs">Retour à la boutique</span>
            </Link>
          </div>
        </div>
      </nav>

      <header className="relative py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 
            className="text-5xl md:text-7xl font-bold mb-4" 
            style={{ fontFamily: '"Great Vibes", cursive', color: '#C5A065' }}
          >
            Contactez-nous
          </h1>
          <p className="text-lg text-[#2D2A26]/70 max-w-2xl mx-auto font-light italic">
            Une question pour un événement spécial ou une commande personnalisée ? Nous sommes à votre écoute.
          </p>
          <div className="mt-8 h-1 w-24 bg-gradient-to-r from-transparent via-[#C5A065] to-transparent mx-auto"></div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 pb-24 relative z-10">
        <div className="grid lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl border border-[#C5A065]/20 shadow-sm">
              <h3 className="text-xl font-bold mb-6 text-[#2D2A26] uppercase tracking-wider border-b border-[#C5A065]/20 pb-2">Coordonnées</h3>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#C5A065]/10 flex items-center justify-center shrink-0">
                    <Phone className="w-5 h-5 text-[#C5A065]" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#C5A065] uppercase">Téléphone</p>
                    <p className="text-[#2D2A26] font-medium">Laval: 450-689-0655</p>
                    <p className="text-[#2D2A26] font-medium">Montréal: 514-379-1898</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#C5A065]/10 flex items-center justify-center shrink-0">
                    <Mail className="w-5 h-5 text-[#C5A065]" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#C5A065] uppercase">Email</p>
                    <p className="text-[#2D2A26] font-medium">contact@mariusfanny.com</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#C5A065]/10 flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5 text-[#C5A065]" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#C5A065] uppercase">Boutique Principale</p>
                    <p className="text-[#2D2A26] font-medium">239-E Boulevard Samson, Laval</p>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-8 border-t border-stone-100">
                <p className="text-sm italic text-stone-500 mb-4">Suivez nos créations :</p>
                <a href="https://www.instagram.com/patisseriemariusetfanny/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-3 px-4 py-2 bg-[#C5A065] text-white rounded-full hover:bg-[#B59055] transition-all">
                  <Instagram className="w-5 h-5" />
                  <span className="font-bold text-sm">@mariusetfanny</span>
                </a>
              </div>
            </div>
          </div>

          {/* Formulaire (Colonne Droite) */}
          <div className="lg:col-span-2">
            <div className="bg-white p-8 md:p-12 rounded-2xl shadow-xl border border-[#C5A065]/10">
              {submitted ? (
                <div className="text-center py-12 animate-fade-in">
                  <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Send className="w-10 h-10" />
                  </div>
                  <h2 className="text-3xl font-serif text-[#2D2A26] mb-4">Message envoyé !</h2>
                  <p className="text-stone-500">Merci de nous avoir contacté. Notre équipe vous répondra dans les plus brefs délais.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-stone-500">Prénom</label>
                      <input 
                        type="text" required
                        className="w-full bg-stone-50 border border-stone-200 px-4 py-3 rounded-lg focus:outline-none focus:border-[#C5A065] transition-colors"
                        placeholder="Jean"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-stone-500">Nom de famille</label>
                      <input 
                        type="text" required
                        className="w-full bg-stone-50 border border-stone-200 px-4 py-3 rounded-lg focus:outline-none focus:border-[#C5A065] transition-colors"
                        placeholder="Dupont"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-stone-500">Email</label>
                    <input 
                      type="email" required
                      className="w-full bg-stone-50 border border-stone-200 px-4 py-3 rounded-lg focus:outline-none focus:border-[#C5A065] transition-colors"
                      placeholder="jean.dupont@exemple.com"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-stone-500">Sujet</label>
                    <select className="w-full bg-stone-50 border border-stone-200 px-4 py-3 rounded-lg focus:outline-none focus:border-[#C5A065] transition-colors">
                      <option>Renseignement général</option>
                      <option>Commande spéciale / Gâteau de fête</option>
                      <option>Service traiteur</option>
                      <option>Réclamation / Qualité</option>
                      <option>Autre</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-stone-500">Votre Message</label>
                    <textarea 
                      required rows={5}
                      className="w-full bg-stone-50 border border-stone-200 px-4 py-3 rounded-lg focus:outline-none focus:border-[#C5A065] transition-colors resize-none"
                      placeholder="Comment pouvons-nous vous aider ?"
                    ></textarea>
                  </div>

                  <button 
                    type="submit"
                    className="w-full bg-[#2D2A26] text-white py-4 rounded-full font-black uppercase tracking-widest text-sm hover:bg-[#C5A065] hover:scale-[1.02] transition-all shadow-lg flex items-center justify-center gap-3"
                  >
                    Envoyer le message
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Footer (Réutilisé de ton code) */}
      <footer className="relative bg-[#F9F7F2] text-[#2D2A26] border-t border-[#C5A065]/20">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-sm text-[#2D2A26]/70">Copyright {currentYear} | Pâtisserie Provençale</p>
            <div className="flex gap-6 text-xs font-bold uppercase tracking-widest">
              <Link to="/politique-retour" className="hover:text-[#C5A065]">Politique de retour</Link>
              <span className="text-[#C5A065]/30">|</span>
              <span className="text-[#2D2A26]/50">Confidentialité</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Contact;