import React, { useState } from 'react';
import { Package, Users, TrendingUp, Mail, Phone, FileText, CheckCircle } from 'lucide-react';

// Types
interface WholesaleFeature {
  icon: React.ReactNode;
  title: string;
  description: string;
}

interface WholesalePackage {
  id: string;
  name: string;
  minOrder: string;
  discount: string;
  features: string[];
  highlight: boolean;
}

interface FormData {
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  businessType: string;
  message: string;
}

const WholesaleSection: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    companyName: '',
    contactName: '',
    email: '',
    phone: '',
    businessType: '',
    message: ''
  });

  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  // Fonctionnalités Wholesale
  const features: WholesaleFeature[] = [
    {
      icon: <Package size={40} />,
      title: 'Commandes en Volume',
      description: 'Commandes minimales adaptées à vos besoins professionnels avec des délais garantis'
    },
    {
      icon: <TrendingUp size={40} />,
      title: 'Prix Préférentiels',
      description: 'Tarifs dégressifs et remises exclusives selon vos volumes de commande'
    },
    {
      icon: <Users size={40} />,
      title: 'Service Dédié',
      description: 'Un gestionnaire de compte personnel pour un suivi personnalisé de vos projets'
    },
    {
      icon: <FileText size={40} />,
      title: 'Personnalisation',
      description: 'Créations sur-mesure et personnalisées avec votre branding et logo'
    }
  ];

  // Packages Wholesale
  const packages: WholesalePackage[] = [
    {
      id: 'starter',
      name: 'Starter',
      minOrder: '50+ unités',
      discount: '15% de remise',
      features: [
        'Livraison standard gratuite',
        'Support par email',
        'Catalogue produits complet',
        'Facturation simplifiée'
      ],
      highlight: false
    },
    {
      id: 'professional',
      name: 'Professional',
      minOrder: '150+ unités',
      discount: '25% de remise',
      features: [
        'Livraison express gratuite',
        'Gestionnaire de compte dédié',
        'Personnalisation disponible',
        'Conditions de paiement flexibles',
        'Catalogue prioritaire',
        'Échantillons gratuits'
      ],
      highlight: true
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      minOrder: '300+ unités',
      discount: '35% de remise',
      features: [
        'Livraison prioritaire 24/7',
        'Gestionnaire dédié + hotline',
        'Création sur-mesure illimitée',
        'Paiement à 60 jours',
        'Accès avant-première nouveautés',
        'Formation équipe offerte',
        'Rapports analytics mensuels'
      ],
      highlight: false
    }
  ];

  const businessTypes = [
    'Restaurant / Café',
    'Hôtel',
    'Traiteur / Événementiel',
    'Épicerie Fine',
    'Boutique Spécialisée',
    'Autre'
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Ici vous ajouteriez la logique d'envoi du formulaire
    console.log('Form submitted:', formData);
    setIsSubmitted(true);
    
    // Reset après 3 secondes
    setTimeout(() => {
      setIsSubmitted(false);
      setFormData({
        companyName: '',
        contactName: '',
        email: '',
        phone: '',
        businessType: '',
        message: ''
      });
    }, 3000);
  };

  return (
    <section className="relative min-h-screen bg-[#F9F7F2] text-[#2D2A26] overflow-hidden">
      
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(45,42,38,.03) 35px, rgba(45,42,38,.03) 70px)`
        }}></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-24">

        {/* Hero Section */}
        <div className="text-center mb-20 animate-fadeInUp">
          <div className="inline-block mb-6">
            <span className="bg-[#C5A065] text-white font-black text-sm uppercase tracking-[0.3em] px-6 py-2 rounded-full">
              Programme Professionnel
            </span>
          </div>
          
          <h1 className="text-6xl md:text-8xl font-black mb-6 leading-[0.9] tracking-tighter text-[#2D2A26]">
            WHOLESALE
            <span className="block text-[#C5A065]">
              EXCELLENCE
            </span>
          </h1>
          
          <p className="text-xl text-[#2D2A26]/70 max-w-3xl mx-auto leading-relaxed font-light">
            Partenaire privilégié des professionnels de la restauration et de l'hôtellerie.
            <br />
            Des créations artisanales d'exception à des tarifs préférentiels.
          </p>

          <div className="flex flex-wrap gap-4 justify-center mt-10">
            <a 
              href="#contact" 
              className="group bg-[#C5A065] text-white px-10 py-5 rounded-full font-black uppercase text-sm tracking-widest hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              Devenir Partenaire
              <span className="inline-block ml-2 group-hover:translate-x-1 transition-transform">→</span>
            </a>
            <a 
              href="#packages" 
              className="bg-white text-[#2D2A26] px-10 py-5 rounded-full font-bold uppercase text-sm tracking-widest hover:bg-gray-50 transition-all duration-300 border-2 border-[#C5A065]"
            >
              Voir les Offres
            </a>
          </div>
        </div>

        {/* Packages Section */}
        <div id="packages" className="mb-24">
          <h2 className="text-4xl md:text-5xl font-black text-center mb-4 uppercase tracking-tight text-[#2D2A26]">
            Nos <span className="text-[#C5A065]">Formules</span>
          </h2>
          <p className="text-center text-[#2D2A26]/70 mb-16 text-lg">
            Choisissez la formule adaptée à votre volume d'activité
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            {packages.map((pkg, index) => (
              <div 
                key={pkg.id}
                className={`relative p-8 rounded-3xl border-2 transition-all duration-500 hover:scale-105 ${
                  pkg.highlight 
                    ? 'bg-white border-[#C5A065] shadow-xl' 
                    : 'bg-white/80 border-gray-200 hover:border-[#C5A065]/50'
                }`}
                style={{ animationDelay: `${index * 200}ms` }}
              >
                {pkg.highlight && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#C5A065] text-white px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest">
                    Recommandé
                  </div>
                )}

                <h3 className="text-3xl font-black mb-2 uppercase tracking-tight text-[#2D2A26]">
                  {pkg.name}
                </h3>
                
                <div className="text-5xl font-black text-[#C5A065] mb-2">
                  {pkg.discount}
                </div>
                
                <p className="text-[#2D2A26]/70 mb-8 text-sm uppercase tracking-wider">
                  {pkg.minOrder}
                </p>

                <ul className="space-y-4 mb-8">
                  {pkg.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm">
                      <CheckCircle size={20} className="text-[#C5A065] flex-shrink-0 mt-0.5" />
                      <span className="text-[#2D2A26]">{feature}</span>
                    </li>
                  ))}
                </ul>

                <a 
                  href="#contact"
                  className={`block text-center py-4 rounded-full font-bold uppercase text-sm tracking-widest transition-all duration-300 ${
                    pkg.highlight
                      ? 'bg-[#C5A065] text-white hover:scale-105 shadow-lg'
                      : 'bg-[#F9F7F2] text-[#2D2A26] hover:bg-[#C5A065] hover:text-white border-2 border-[#C5A065]'
                  }`}
                >
                  Demander un Devis
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* Contact Form */}
        <div id="contact" className="max-w-4xl mx-auto">
          <div className="bg-white rounded-3xl border-2 border-[#C5A065] p-8 md:p-12 shadow-xl">
            <h2 className="text-4xl md:text-5xl font-black mb-4 uppercase tracking-tight text-center text-[#2D2A26]">
              Devenir <span className="text-[#C5A065]">Partenaire</span>
            </h2>
            <p className="text-center text-[#2D2A26]/70 mb-10">
              Remplissez ce formulaire et notre équipe vous contactera sous 24h
            </p>

            {isSubmitted ? (
              <div className="text-center py-16 animate-fadeIn">
                <div className="inline-block p-6 bg-green-100 rounded-full mb-6">
                  <CheckCircle size={64} className="text-green-600" />
                </div>
                <h3 className="text-2xl font-black mb-3 text-[#2D2A26]">Demande Envoyée !</h3>
                <p className="text-[#2D2A26]/70">
                  Merci pour votre intérêt. Nous vous recontacterons très prochainement.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold uppercase tracking-wider mb-3 text-[#2D2A26]">
                      Nom de l'entreprise *
                    </label>
                    <input
                      type="text"
                      name="companyName"
                      value={formData.companyName}
                      onChange={handleInputChange}
                      required
                      className="w-full bg-[#F9F7F2] border-2 border-gray-300 rounded-xl px-6 py-4 text-[#2D2A26] placeholder-gray-400 focus:border-[#C5A065] focus:outline-none focus:ring-2 focus:ring-[#C5A065]/30 transition-all"
                      placeholder="Votre entreprise"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold uppercase tracking-wider mb-3 text-[#2D2A26]">
                      Nom du contact *
                    </label>
                    <input
                      type="text"
                      name="contactName"
                      value={formData.contactName}
                      onChange={handleInputChange}
                      required
                      className="w-full bg-[#F9F7F2] border-2 border-gray-300 rounded-xl px-6 py-4 text-[#2D2A26] placeholder-gray-400 focus:border-[#C5A065] focus:outline-none focus:ring-2 focus:ring-[#C5A065]/30 transition-all"
                      placeholder="Votre nom"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold uppercase tracking-wider mb-3 text-[#2D2A26]">
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full bg-[#F9F7F2] border-2 border-gray-300 rounded-xl px-6 py-4 text-[#2D2A26] placeholder-gray-400 focus:border-[#C5A065] focus:outline-none focus:ring-2 focus:ring-[#C5A065]/30 transition-all"
                      placeholder="email@entreprise.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold uppercase tracking-wider mb-3 text-[#2D2A26]">
                      Téléphone *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                      className="w-full bg-[#F9F7F2] border-2 border-gray-300 rounded-xl px-6 py-4 text-[#2D2A26] placeholder-gray-400 focus:border-[#C5A065] focus:outline-none focus:ring-2 focus:ring-[#C5A065]/30 transition-all"
                      placeholder="+33 6 00 00 00 00"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold uppercase tracking-wider mb-3 text-[#2D2A26]">
                    Type d'activité *
                  </label>
                  <select
                    name="businessType"
                    value={formData.businessType}
                    onChange={handleInputChange}
                    required
                    className="w-full bg-[#F9F7F2] border-2 border-gray-300 rounded-xl px-6 py-4 text-[#2D2A26] focus:border-[#C5A065] focus:outline-none focus:ring-2 focus:ring-[#C5A065]/30 transition-all"
                  >
                    <option value="">Sélectionnez votre activité</option>
                    {businessTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold uppercase tracking-wider mb-3 text-[#2D2A26]">
                    Message
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    rows={5}
                    className="w-full bg-[#F9F7F2] border-2 border-gray-300 rounded-xl px-6 py-4 text-[#2D2A26] placeholder-gray-400 focus:border-[#C5A065] focus:outline-none focus:ring-2 focus:ring-[#C5A065]/30 transition-all resize-none"
                    placeholder="Parlez-nous de votre projet et de vos besoins..."
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#C5A065] text-white py-5 rounded-full font-black uppercase text-sm tracking-widest hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  Envoyer la Demande
                </button>
              </form>
            )}
          </div>

          {/* Contact Info */}
          <div className="grid md:grid-cols-2 gap-6 mt-12">
            <div className="flex items-center gap-4 p-6 bg-white rounded-2xl border-2 border-gray-200">
              <div className="p-4 bg-[#C5A065]/10 rounded-full">
                <Mail className="text-[#C5A065]" size={24} />
              </div>
              <div>
                <div className="text-sm text-[#2D2A26]/70 uppercase tracking-wider font-medium mb-1">Email</div>
                <div className="font-bold text-[#2D2A26]">wholesale@bakery.com</div>
              </div>
            </div>

            <div className="flex items-center gap-4 p-6 bg-white rounded-2xl border-2 border-gray-200">
              <div className="p-4 bg-[#C5A065]/10 rounded-full">
                <Phone className="text-[#C5A065]" size={24} />
              </div>
              <div>
                <div className="text-sm text-[#2D2A26]/70 uppercase tracking-wider font-medium mb-1">Téléphone</div>
                <div className="font-bold text-[#2D2A26]">Laval : 450-689-0655  <br />Montréal : 514-379-1898
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .animate-fadeInUp {
          animation: fadeInUp 0.8s ease-out;
        }

        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
      `}</style>
    </section>
  );
};

export default WholesaleSection;