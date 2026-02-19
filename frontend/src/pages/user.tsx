import React from 'react';
import { Link } from 'react-router-dom';
import { User, Package, MapPin, LogOut, ArrowLeft, Clock, CheckCircle } from 'lucide-react';
import GoldenBackground from '../components/GoldenBackground'; 
import { useNavigate } from 'react-router-dom';
import { getImageUrl } from '../utils/api';

const MOCK_USER = {
  fullName: "Jean Dupont",
  email: "jean.dupont@example.com",
  phone: "514-123-4567",
  memberSince: "2023",
  address: "1234 Rue de la Pâtisserie, Laval, QC"
};

const MOCK_ORDERS = [
  {
    id: "CMD-2024-8821",
    date: "12 Octobre 2023",
    status: "Livré",
    total: 82.45,
    items: [
      { id: 101, name: "La Marguerite (6 pers.)", price: 37.50, quantity: 1, image: "./gateau.jpg" },
      { id: 201, name: "Baguette Tradition", price: 3.50, quantity: 2, image: "./pain1.jpg" }
    ]
  },
  {
    id: "CMD-2024-9902",
    date: "03 Février 2024",
    status: "En préparation",
    total: 44.95,
    items: [
      { id: 102, name: "Tarte Citron Meringuée", price: 29.95, quantity: 1, image: "./fav4.jpg" },
      { id: 5301, name: "Plateau Affaires", price: 22.00, quantity: 1, image: "./salade2.jpg" }
    ]
  }
];

const UserProfile: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
     navigate('/');
  };

  return (
    <div className="min-h-screen bg-[#F9F7F2] relative">
      <GoldenBackground />
      
      {/* Navigation Simple */}
      <nav className="relative z-20 bg-white/80 backdrop-blur-md border-b border-[#C5A065]/20 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2 text-[#2D2A26] hover:text-[#C5A065] transition-colors font-bold uppercase text-xs tracking-widest">
            <ArrowLeft size={16} /> Retour boutique
          </Link>
          <div className="font-serif text-2xl text-[#C5A065]">Mon Espace</div>
        </div>
      </nav>

      <main className="relative z-10 max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-[#C5A065]/10 sticky top-24">
              
              {/* En-tête Profil */}
              <div className="bg-[#2D2A26] p-8 text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-transparent via-[#C5A065] to-transparent"></div>
                <div className="w-24 h-24 bg-white rounded-full mx-auto mb-4 flex items-center justify-center border-4 border-[#C5A065] relative z-10">
                  <User size={40} className="text-[#2D2A26]" />
                </div>
                <h2 className="text-white font-serif text-2xl">{MOCK_USER.fullName}</h2>
                <p className="text-stone-400 text-sm">{MOCK_USER.email}</p>
                <div className="mt-4 inline-block bg-[#C5A065]/20 text-[#C5A065] px-3 py-1 rounded-full text-[10px] uppercase font-bold tracking-widest">
                  Membre depuis {MOCK_USER.memberSince}
                </div>
              </div>

              {/* Détails */}
              <div className="p-8 space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-stone-50 flex items-center justify-center shrink-0">
                    <MapPin size={20} className="text-[#C5A065]" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-1">Adresse de livraison</p>
                    <p className="text-[#2D2A26] text-sm font-medium leading-relaxed">{MOCK_USER.address}</p>
                  </div>
                </div>

                <hr className="border-stone-100" />

                <button
                  className="w-full flex items-center justify-center gap-2 text-red-400 hover:text-red-600 hover:bg-red-50 py-3 rounded-lg transition-all text-sm font-bold uppercase tracking-widest"
                  onClick={handleLogout}
                >
                  <LogOut size={16} />
                  Se déconnecter         
                </button>
                
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <h3 className="text-3xl font-serif text-[#2D2A26] mb-8 flex items-center gap-3">
              <Package className="text-[#C5A065]" />
              Mes dernières commandes
            </h3>

            <div className="space-y-6">
              {MOCK_ORDERS.map((order) => (
                <div key={order.id} className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-shadow border border-stone-100 overflow-hidden group">
                  
                  <div className="bg-stone-50 p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-stone-100">
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <span className="font-bold text-[#2D2A26] text-lg">{order.id}</span>
                        {order.status === "Livré" ? (
                          <span className="flex items-center gap-1 bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs font-bold uppercase">
                            <CheckCircle size={12} /> Livré
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded text-xs font-bold uppercase">
                            <Clock size={12} /> En cours
                          </span>
                        )}
                      </div>
                      <p className="text-stone-500 text-sm">{order.date}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-stone-400 uppercase font-bold">Total</p>
                      <p className="text-xl font-serif text-[#C5A065]">{order.total.toFixed(2)} $</p>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="space-y-4">
                      {order.items.map((item, index) => (
                        <div key={index} className="flex items-center gap-4">
                          <div className="w-16 h-16 bg-stone-100 rounded-md overflow-hidden shrink-0 border border-stone-200">
                            <img src={getImageUrl(item.image)} alt={item.name} className="w-full h-full object-cover" />
                          </div>
                          
                          <div className="grow">
                            <h4 className="font-serif text-[#2D2A26] text-lg">{item.name}</h4>
                            <p className="text-xs text-stone-400">Quantité: {item.quantity}</p>
                          </div>

                          <div className="font-bold text-stone-600">
                            {(item.price * item.quantity).toFixed(2)} $
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="mt-6 pt-4 border-t border-stone-100 text-center sm:text-right">
                       <button className="text-[#C5A065] text-xs font-bold uppercase tracking-widest hover:underline">
                         Voir la facture
                       </button>
                    </div>
                  </div>

                </div>
              ))}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default UserProfile;