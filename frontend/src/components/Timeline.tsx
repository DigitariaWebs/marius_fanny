import React from 'react';

const styles = {
  container: { 
    backgroundColor: '#F9F7F2', 
    color: '#2D2A26', 
    fontFamily: '"Inter", sans-serif',
    position: 'relative' as const,
    overflow: 'hidden'
  },
  title: { fontFamily: '"Great Vibes", cursive', color: '#C5A065' },
  accent: { backgroundColor: '#C5A065' },
  border: { borderColor: '#C5A065' } 
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
    description: "Fondation par le chef Marc Chiecchio. La naissance d'une tradition provençale au Québec."
  },
  {
    year: "2014",
    location: "Montréal",
    address: "2006 St-Hubert",
    description: "Expansion majeure pour offrir nos douceurs au coeur de la métropole."
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
          <p className="uppercase tracking-[0.3em] text-xs font-bold opacity-70">
            L'histoire de Marius et Fanny
          </p>
          <div className="h-px w-24 mx-auto mt-8" style={styles.accent}></div>
        </div>

        <div className="relative w-full max-w-4xl">
          {/* Ligne verticale centrale */}
          <div 
            className="absolute left-1/2 transform -translate-x-1/2 h-full w-px hidden md:block" 
            style={{ backgroundColor: '#C5A065', opacity: 0.2 }}
          ></div>

          <div className="space-y-16 md:space-y-0">
            {timelineData.map((step, index) => (
              <div key={index} className="relative flex flex-col md:flex-row items-center justify-between w-full md:mb-24">
                
                {/* Bloc de texte avec z-index forcé et fond opaque pour bien cacher le quadrillage dessous */}
                <div className={`w-full md:w-[45%] z-10 ${index % 2 === 0 ? 'md:text-right' : 'md:order-last md:text-left'}`}>
                  <div className="bg-white/95 backdrop-blur-sm p-8 rounded-sm shadow-xl border-b-4" style={styles.border}>
                    <span className="text-2xl font-black tracking-tighter" style={{ color: '#C5A065' }}>{step.year}</span>
                    <h3 className="text-2xl font-bold mt-2 uppercase">{step.location}</h3>
                    <p className="text-xs font-semibold text-stone-400 mb-6">{step.address}</p>
                    <p className="text-sm leading-relaxed italic text-stone-600 border-l-2 border-stone-100 pl-4 md:border-l-0 md:pl-0">
                      "{step.description}"
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
          <div className="bg-white/80 backdrop-blur-sm p-8 rounded-lg border border-[#C5A065]/20">
            <p className="text-lg leading-relaxed text-stone-800 font-light">
              Dès son ouverture, <span className="font-bold text-[#C5A065]">Marius et Fanny</span> a su conquérir le cœur des Québécois grâce à ses créations originales inspirées des saveurs de notre Provence natale.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BakeryTimeline;