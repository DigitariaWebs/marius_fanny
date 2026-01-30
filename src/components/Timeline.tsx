import React from 'react';

const styles = {
  container: { backgroundColor: '#F9F7F2', color: '#2D2A26', fontFamily: '"Inter", sans-serif' },
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
    year: "2006",
    location: "Montréal",
    address: "2006 St-Hubert",
    description: "Expansion majeure pour offrir nos douceurs au coeur de la métropole."
  }
];

const BakeryTimeline: React.FC = () => {
  return (
    <section style={styles.container} className="py-20 px-6 min-h-screen flex flex-col items-center">
      {/* En-tête centré */}
      <div className="max-w-2xl text-center mb-16">
        <h2 style={styles.title} className="text-5xl md:text-6xl mb-4">
          Tradition gourmande
        </h2>
        <p className="uppercase tracking-[0.2em] text-sm font-semibold opacity-80">
          La douceur provençale à chaque bouchée
        </p>
        <div className="h-px w-20 mx-auto mt-6" style={styles.accent}></div>
      </div>

      <div className="relative w-full max-w-4xl">
        <div 
          className="absolute left-1/2 transform -translate-x-1/2 h-full w-px hidden md:block" 
          style={{ backgroundColor: '#C5A065', opacity: 0.3 }}
        ></div>

        <div className="space-y-12 md:space-y-0">
          {timelineData.map((step, index) => (
            <div key={index} className="relative flex flex-col md:flex-row items-center justify-between w-full">
              
              <div className={`w-full md:w-[45%] ${index % 2 === 0 ? 'md:text-right' : 'md:order-last md:text-left'}`}>
                <div className="bg-white p-8 rounded-sm shadow-sm border-t-2" style={styles.border}>
                  <span className="text-xl font-bold tracking-widest" style={{ color: '#C5A065' }}>{step.year}</span>
                  <h3 className="text-2xl font-medium mt-2">{step.location}</h3>
                  <p className="text-sm opacity-60 mb-4">{step.address}</p>
                  <p className="text-sm leading-relaxed italic">{step.description}</p>
                </div>
              </div>

              <div className="absolute left-1/2 transform -translate-x-1/2 hidden md:flex items-center justify-center">
                <div className="w-3 h-3 rounded-full shadow-inner" style={styles.accent}></div>
              </div>

              <div className="hidden md:block md:w-[45%]"></div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-20 max-w-2xl text-center border-t pt-10" style={{ borderColor: 'rgba(197, 160, 101, 0.2)' }}>
        <p className="text-lg leading-relaxed opacity-90">
          Dès son ouverture, <span className="font-bold">Marius et Fanny</span> a su conquérir le cœur des habitants de la région et des visiteurs grâce à ses créations originales inspirées des saveurs provençales.
        </p>
      </div>
    </section>
  );
};

export default BakeryTimeline;