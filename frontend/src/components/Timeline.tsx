import React from 'react';

const styles = {
  container: {
    backgroundColor: '#F9F7F2',
    color: '#1a1a1a',
    fontFamily: '"Inter", sans-serif',
    position: 'relative' as const,
    overflow: 'hidden'
  },
  title: { fontFamily: '"Great Vibes", cursive', color: '#337957' },
  serif: { fontFamily: '"Playfair Display", serif' },
  accent: { backgroundColor: '#337957' },
  border: { borderColor: '#337957' }
};

interface TimelineStep {
  year: string;
  location: string;
  address: string;
  description: string;
}

const timelineData: TimelineStep[] = [
  {
    year: "2002",
    location: "Laval",
    address: "239 boul. Samson",
    description: "Le chef Marc Chiecchio fonde Marius et Fanny, en apportant une touche de renouveau et de gourmandise au quartier."
  },
  {
    year: "2016",
    location: "Montréal",
    address: "2006 St-Hubert",
    description: "La maison s'installe à Montréal, dans le Quartier Latin, avec l'ouverture d'une nouvelle boutique."
  },
  {
    year: "2023",
    location: "Food Truck",
    address: "Événements & Festivals",
    description: "Marius et Fanny développe son offre avec la création de son propre food truck, lui permettant de participer à plusieurs événements."
  }
];

const BakeryTimeline: React.FC = () => {
  return (
    // Le container principal
    <section style={styles.container} className="py-20 px-6 min-h-screen">
      
      {/* SI TU AS UN COMPOSANT "GoldenBackground" OU UN QUADRILLAGE, 
         IL DOIT ÊTRE PLACÉ ICI AVEC UN Z-INDEX BAS 
      */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-40">
        {/* Ici se trouve virtuellement ton quadrillage */}
      </div>

      {/* CONTENU : On force le z-10 et relative pour passer AU-DESSUS du quadrillage
      */}
      <div className="relative z-10 max-w-5xl mx-auto flex flex-col items-center">
        
        {/* En-tête centré */}
        <div className="max-w-2xl text-center mb-24">
          <h2 style={styles.title} className="text-5xl md:text-7xl mb-4">
            Tradition gourmande
          </h2>
          <p className="uppercase tracking-[0.3em] text-xs font-semibold text-stone-900" style={styles.serif}>
            L'histoire de Marius et Fanny
          </p>
          <div className="h-px w-24 mx-auto mt-8" style={styles.accent}></div>
        </div>

        <div className="relative w-full max-w-4xl">
          {/* Ligne verticale centrale */}
          <div 
            className="absolute left-1/2 transform -translate-x-1/2 h-full w-px hidden md:block" 
            style={{ backgroundColor: '#337957', opacity: 0.2 }}
          ></div>

          <div className="space-y-16 md:space-y-0">
            {timelineData.map((step, index) => (
              <div key={index} className="relative flex flex-col md:flex-row items-center justify-between w-full md:mb-24">
                
                {/* Bloc de texte avec z-index forcé et fond opaque pour bien cacher le quadrillage dessous */}
                <div className={`w-full md:w-[45%] z-10 ${index % 2 === 0 ? 'md:text-right' : 'md:order-last md:text-left'}`}>
                  <div className="bg-white/95 backdrop-blur-sm p-8 rounded-sm shadow-xl border-b-4" style={styles.border}>
                    <span className="text-4xl font-black tracking-tight" style={{ color: '#337957', ...styles.serif }}>{step.year}</span>
                    <h3 className="text-xl font-bold mt-2 uppercase tracking-widest text-black" style={styles.serif}>{step.location}</h3>
                    <p className="text-xs font-medium text-stone-600 tracking-wide mb-6">{step.address}</p>
                    <p className="text-sm leading-relaxed font-normal text-stone-900 border-l-2 border-[#337957]/20 pl-4">
                      {step.description}
                    </p>
                  </div>
                </div>

                {/* Point central */}
                <div className="absolute left-1/2 transform -translate-x-1/2 hidden md:flex items-center justify-center z-20">
                  <div className="w-5 h-5 rounded-full border-4 border-[#F9F7F2] shadow-md" style={styles.accent}></div>
                </div>

                <div className="hidden md:block md:w-[45%]"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Conclusion */}
        <div className="mt-20 max-w-2xl text-center relative z-10">
          <div className="bg-white/80 backdrop-blur-sm p-8 rounded-lg border border-[#337957]/20">
            <p className="text-base leading-relaxed text-black font-normal">
              Fondée en octobre 2002 par le chef Marc Chiecchio, la Pâtisserie <span className="font-bold text-[#337957]" style={styles.serif}>Marius et Fanny</span> reflète l'authenticité et la générosité de la gastronomie provençale. Dès ses débuts, la maison a su séduire les habitants de la région ainsi que les visiteurs de passage grâce à ses créations inspirées des saveurs du Sud, préparées avec passion et savoir-faire.
            </p>
            <p className="text-base leading-relaxed text-black font-normal mt-8">
              Au fil des années, <span className="font-semibold">Marius et Fanny</span> a grandi pour offrir une expérience gourmande complète, à travers la pâtisserie, la boulangerie, le traiteur et la chocolaterie. L'établissement propose également une gamme d'épicerie fine mettant en valeur des produits maison, pensés pour être partagés et appréciés en toute simplicité.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BakeryTimeline;