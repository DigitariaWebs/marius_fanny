import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Phone, Instagram } from 'lucide-react';
import GoldenBackground from './GoldenBackground';

const Politique: React.FC = () => {
  const currentYear = new Date().getFullYear();

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
              <span className="font-semibold">Retour à la boutique</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* En-tête */}
      <header className="relative overflow-hidden py-20">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-10 left-10 w-32 h-32 border-2 border-[#C5A065] rounded-full"></div>
          <div className="absolute bottom-10 right-10 w-24 h-24 border-2 border-[#C5A065] rounded-full"></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 
            className="text-5xl md:text-6xl font-bold mb-4" 
            style={{ 
              fontFamily: '"Great Vibes", cursive', 
              color: '#C5A065' 
            }}
          >
            Politique de retour
          </h1>
          <p className="text-lg text-[#2D2A26]/70 max-w-3xl mx-auto">
            Transparence et engagement envers l'excellence de nos produits
          </p>
          <div className="mt-8 h-1 w-24 bg-gradient-to-r from-transparent via-[#C5A065] to-transparent mx-auto"></div>
        </div>
      </header>

      {/* Contenu principal */}
      <main className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg p-8 md:p-12 mb-8 border border-[#C5A065]/10">
          <p className="text-lg text-[#2D2A26] mb-8 leading-relaxed">
            Nous nous engageons à vous offrir des produits de qualité supérieure et un service irréprochable.
            Toutefois, si un produit que vous avez acheté ne répond pas à vos attentes, nous vous invitons à lire 
            notre politique de retour pour savoir comment procéder.
          </p>

          <section className="mb-12">
            <div className="flex items-start gap-3 mb-6">
              <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0">
                <span className="text-red-600 font-bold">1</span>
              </div>
              <h2 className="text-2xl font-bold text-[#2D2A26]">Produits non retournables</h2>
            </div>
            <p className="text-[#2D2A26] mb-4">
              En raison de la nature périssable de nos produits, les articles suivants ne peuvent pas être retournés ni échangés :
            </p>
            <ul className="space-y-3 mb-6">
              {[
                "Pâtisseries, viennoiseries, pains et autres produits frais",
                "Produits personnalisés (gâteaux sur commande, buffet traiteur, etc.)",
                "Produits alimentaires entamés ou consommés"
              ].map((item, index) => (
                <li key={index} className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-[#C5A065] mt-2 flex-shrink-0"></div>
                  <span className="text-[#2D2A26]">{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="mb-12">
            <div className="flex items-start gap-3 mb-6">
              <div className="w-8 h-8 rounded-full bg-yellow-50 flex items-center justify-center flex-shrink-0">
                <span className="text-yellow-600 font-bold">2</span>
              </div>
              <h2 className="text-2xl font-bold text-[#2D2A26]">Retours en cas de problème de qualité</h2>
            </div>
            <p className="text-[#2D2A26] mb-4">
              Si un produit acheté ne répond pas aux normes de qualité (produit avarié, mauvaise conservation, erreur de préparation), 
              vous pouvez faire une réclamation dans un délai de 48 heures suivant l'achat.
            </p>
            
            <div className="bg-amber-50 border-l-4 border-amber-400 p-4 my-6 rounded-r-lg">
              <p className="text-amber-800 text-sm italic">
                &quot;Nos produits peuvent contenir des traces de noix, de fruits à coque, et d'autres allergènes. 
                Bien que nous ne travaillions pas avec des arachides dans notre atelier, nous ne pouvons garantir 
                l'absence de contamination croisée. Veuillez nous signaler toute allergie alimentaire avant de faire votre achat.&quot;
              </p>
            </div>

            <div className="bg-blue-50 rounded-xl p-6">
              <h3 className="font-bold text-[#2D2A26] mb-3">Conditions de retour :</h3>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Le produit doit être non consommé</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Un justificatif d'achat vous sera demandé (ticket de caisse, facture ou commande en ligne)</span>
                </li>
              </ul>
            </div>
          </section>

          <section className="mb-12">
            <div className="flex items-start gap-3 mb-6">
              <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center flex-shrink-0">
                <span className="text-green-600 font-bold">3</span>
              </div>
              <h2 className="text-2xl font-bold text-[#2D2A26]">Procédure de retour</h2>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="font-bold text-[#2D2A26] mb-4 text-lg">Étapes à suivre :</h3>
                <ol className="space-y-4">
                  {[
                    "Contactez-nous dans les 48 heures suivant l'achat",
                    "Décrivez le problème rencontré",
                    "Présentez votre justificatif d'achat",
                    "Ramenez le produit en magasin"
                  ].map((step, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-[#C5A065] text-white flex items-center justify-center flex-shrink-0 text-sm">
                        {index + 1}
                      </div>
                      <span className="text-[#2D2A26] pt-0.5">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
              
              <div className="bg-[#F9F7F2] rounded-xl p-6">
                <h3 className="font-bold text-[#2D2A26] mb-4 text-lg">Moyens de contact :</h3>
                <ul className="space-y-3">
                  <li className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-[#C5A065]" />
                    <span className="text-[#2D2A26]">Par téléphone : (123) 456-7890</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-[#C5A065]" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                    </svg>
                    <span className="text-[#2D2A26]">Par email : contact@mariusfanny.com</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-[#C5A065]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                    <span className="text-[#2D2A26]">Directement en magasin</span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {[
            {
              number: 4,
              title: "Échanges ou remboursements",
              content: "En cas de produit défectueux ou de problème de qualité, nous nous engageons à vous proposer un échange ou un remboursement intégral. Si vous préférez un échange, nous ferons de notre mieux pour vous offrir un produit similaire selon la disponibilité."
            },
            {
              number: 5,
              title: "Produits sur commande",
              content: "Les produits personnalisés, tels que les gâteaux de fête ou les commandes spéciales, ne sont pas remboursables ni échangeables, sauf en cas de défaut ou d'erreur de préparation de notre part."
            },
            {
              number: 6,
              title: "Modifications de la politique",
              content: "Cette politique de retour peut être modifiée à tout moment. Nous vous conseillons de consulter régulièrement cette page pour vous assurer que vous êtes informé des éventuels changements."
            }
          ].map((section, index) => (
            <section key={index} className="mb-8 last:mb-0">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-gray-600 font-bold">{section.number}</span>
                </div>
                <h2 className="text-xl font-bold text-[#2D2A26]">{section.title}</h2>
              </div>
              <p className="text-[#2D2A26] ml-11">{section.content}</p>
            </section>
          ))}

          <div className="mt-12 pt-8 border-t border-[#C5A065]/20 text-center">
            <p className="text-lg text-[#2D2A26] mb-4">
              Nous vous remercions de votre compréhension et de votre fidélité.
            </p>
            <p className="text-[#2D2A26]/70">
              N'hésitez pas à nous contacter pour toute question ou pour toute information supplémentaire.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative bg-[#F9F7F2] text-[#2D2A26] overflow-hidden">
        <div className="relative z-10 max-w-7xl mx-auto px-6 py-16">
          <div className="grid lg:grid-cols-3 gap-12 mb-16">
            <div>
              <h3 className="text-2xl font-black mb-6 uppercase tracking-wide text-[#C5A065]">Nos Boutiques</h3>
              <div className="space-y-6 text-sm">
                <div>
                  <div className="flex items-start gap-3 mb-2">
                    <svg className="w-5 h-5 flex-shrink-0 mt-1 text-[#C5A065]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
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
                    <Phone className="w-[18px] h-[18px] flex-shrink-0 text-[#C5A065]" />
                    <a href="tel:+14506890655" className="hover:text-[#C5A065] transition-colors font-bold">450-689-0655</a>
                  </div>
                </div>
                <div>
                  <div className="flex items-start gap-3 mb-2">
                    <svg className="w-5 h-5 flex-shrink-0 mt-1 text-[#C5A065]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
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
                    <Phone className="w-[18px] h-[18px] flex-shrink-0 text-[#C5A065]" />
                    <a href="tel:+15143791898" className="hover:text-[#C5A065] transition-colors font-bold">514-379-1898</a>
                  </div>
                </div>
              </div>
              <div className="mt-8 flex gap-4">
                <a href="https://www.instagram.com/patisseriemariusetfanny/" target="_blank" rel="noopener noreferrer" className="w-12 h-12 bg-[#C5A065] rounded-full flex items-center justify-center hover:bg-[#B59055] transition-colors"><Instagram className="w-6 h-6 text-white" /></a>
              </div>
            </div>

            <div>
              <h3 className="text-2xl font-black mb-6 uppercase tracking-wide text-[#C5A065]">Navigation</h3>
              <ul className="space-y-3">
                <li><a href="#biscuits" className="text-lg font-bold hover:text-[#C5A065] transition-colors uppercase">Biscuits</a></li>
                <li><a href="#gateaux" className="text-lg font-bold hover:text-[#C5A065] transition-colors uppercase">Gâteaux</a></li>
                <li><a href="#apropos" className="text-lg font-bold hover:text-[#C5A065] transition-colors uppercase">À propos</a></li>
                <li><a href="#contact" className="text-lg font-bold hover:text-[#C5A065] transition-colors uppercase">Contact</a></li>
              </ul>
            </div>

            <div>
              <h3 className="text-2xl font-black mb-6 uppercase tracking-wide text-[#C5A065]">Abonnez-vous à notre infolettre</h3>
              <p className="text-sm mb-6 leading-relaxed text-[#2D2A26]/70">Recevez nos nouveautés et promotions exclusives.</p>
              <form className="flex gap-2">
                <input type="email" placeholder="EMAIL" required className="flex-1 bg-white border-2 border-[#C5A065] text-[#2D2A26] px-6 py-4 rounded-full font-bold uppercase text-sm focus:outline-none" />
                <button type="submit" className="bg-[#C5A065] text-white px-8 py-4 rounded-full font-black uppercase text-sm hover:scale-105 transition-all">S'abonner</button>
              </form>
            </div>
          </div>

          <div className="relative overflow-hidden py-12">
            <h2 className="text-[4rem] md:text-[6rem] lg:text-[8rem] font-black uppercase leading-none text-[#C5A065] tracking-tighter opacity-20">
              PATISSERIE<br/>PROVENCALE
            </h2>
          </div>

          <div className="border-t-2 border-[#C5A065]/30 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
            <p className="text-[#2D2A26]/70">Copyright {currentYear} | Pâtisserie Provençale</p>
            <div className="flex gap-6">
              <span className="text-[#2D2A26]/70">Conditions d'utilisation</span>
              <span className="text-[#2D2A26]/70">Politique de confidentialité</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Politique;