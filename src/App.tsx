import React from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import BestSellers from './components/BestSellers'; 
import ParallaxSection from './components/ParallaxSection';
import Produits from './components/Produits';
import Time from './components/Timeline';
import Footer from './components/Footer';
import Shop from './components/Shop';

const App: React.FC = () => {
  return (
    <div className="bg-bakery-cream min-h-screen text-bakery-text bg-grain">
      <Navbar />
      
      <main>
          <Hero />
       <section id="shop">
        <Shop />
         </section>
        <section id="best-sellers">
          <BestSellers /> 
        </section>

        <section id="produits">
          <Produits />
        </section>
        <section id="timeline">
            <Time />
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