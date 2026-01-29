import React from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import BestSellers from './components/BestSellers'; 
import ParallaxSection from './components/ParallaxSection';
import Produits from './components/Produits';
import Footer from './components/Footer';

const App: React.FC = () => {
  return (
    <div className="bg-bakery-cream min-h-screen text-bakery-text bg-grain">
      <Navbar />
      
      <main>
        <section id="hero">
          <Hero />
        </section>

        <section id="best-sellers">
          <BestSellers /> 
        </section>

        <section id="produits">
          <Produits />
        </section>

        <ParallaxSection />
      </main>

      <section id="footer">
        <Footer />
      </section>
    </div>
  );
}

export default App;