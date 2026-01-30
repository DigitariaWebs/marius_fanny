import React from 'react';

const styles = {
  cream: '#F9F7F2',
  text: '#2D2A26',
  gold: '#C5A065',
  fontScript: '"Great Vibes", cursive',
  fontSans: '"Inter", sans-serif',
};

interface Category {
  id: number;
  title: string;
  image: string;
  size: 'large' | 'small';
}

const categories: Category[] = [
  { id: 1, title: "Gâteaux et produits signatures", image: "./gateau.jpg", size: 'small' },
  { id: 2, title: "Nos pains", image: "./pains.jpg", size: 'small' },
  { id: 3, title: "Viennoiseries", image: "./vio.jpg", size: 'small' },
  { id: 4, title: "Chocolats et macarons", image: "./cho.jpg", size: 'small' },
  { id: 5, title: "Boîte à lunch Marius et Fanny", image: "./boite.jpg", size: 'large' },
  { id: 6, title: "À la carte", image: "./carte.jpg", size: 'small' },
];

const CategoryShowcase: React.FC = () => {
  return (
    <section className="py-20 px-6" style={{ backgroundColor: styles.cream, fontFamily: styles.fontSans }}>
      <div className="max-w-7xl mx-auto">
        
        {/* En-tête de section */}
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-5xl md:text-6xl" style={{ fontFamily: styles.fontScript, color: styles.gold }}>
            Bienvenue sur notre boutique en ligne
          </h2>
          <div className="flex flex-col items-center gap-2">
            <p className="uppercase tracking-[0.2em] text-xs font-bold" style={{ color: styles.text }}>
              Collecte gratuite dans nos 2 boutiques
            </p>
            <div className="h-px w-24" style={{ backgroundColor: styles.gold }}></div>
          </div>
          <p className="text-sm font-medium opacity-70" style={{ color: styles.text }}>
            DÉLAI DE 48H POUR TRAITER VOTRE COMMANDE
          </p>
        </div>

        {/* Grille Moderne (Bento Grid) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[300px]">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className={`group relative overflow-hidden rounded-2xl shadow-sm transition-all duration-500 hover:shadow-xl cursor-pointer
                ${cat.size === 'large' ? 'md:col-span-2' : 'md:col-span-1'}`}
            >
              {/* Image de fond avec zoom au survol */}
              <img
                src={cat.image}
                alt={cat.title}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              
              {/* Overlay dégradé pour la lisibilité */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />

              {/* Texte */}
              <div className="absolute inset-0 p-8 flex flex-col justify-end">
                <h3 className="text-white text-2xl font-semibold tracking-wide uppercase transition-transform duration-500 group-hover:-translate-y-2">
                  {cat.title}
                </h3>
                <div 
                  className="h-1 w-0 group-hover:w-16 transition-all duration-500" 
                  style={{ backgroundColor: styles.gold }} 
                />
                <span className="text-white/0 group-hover:text-white/100 text-xs uppercase tracking-[0.2em] mt-4 transition-all duration-500">
                  Voir la sélection →
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoryShowcase;