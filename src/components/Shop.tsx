import React, { useState } from 'react';
import ProductSelection from './ProductSelection';

// 1. On définit ce que le Shop doit recevoir
interface ShopProps {
  onAddToCart: (product: any) => void;
}

const Shop: React.FC<ShopProps> = ({ onAddToCart }) => {
  const [selectedCategory, setSelectedCategory] = useState<{ id: number; title: string } | null>(null);

  const categories = [
    { id: 1, title: "Pâtisseries", image: "./gateau.jpg", description: "Nos créations sucrées" },
    { id: 2, title: "Pains", image: "./pain1.jpg", description: "Farines biologiques" },
    { id: 3, title: "Viennoiseries", image: "./croi1.jpg", description: "Pur beurre AOP" },
    { id: 5, title: "Lunch", image: "./boite.jpg", description: "Fraîcheur midi" },
  ];

  if (selectedCategory) {
    return (
      <ProductSelection 
        categoryId={selectedCategory.id} 
        categoryTitle={selectedCategory.title}
        onBack={() => setSelectedCategory(null)}
        onAddToCart={onAddToCart} // 2. On passe la fonction au fils
      />
    );
  }

  return (
    <section className="py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-serif text-[#2D2A26] mb-4">Notre Boutique</h2>
          <p className="text-stone-500 italic">Choisissez une catégorie pour découvrir nos délices</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((cat) => (
            <div 
              key={cat.id}
              onClick={() => setSelectedCategory(cat)}
              className="group relative h-[400px] overflow-hidden rounded-2xl cursor-pointer shadow-lg transition-all duration-500"
            >
              <img 
                src={cat.image} 
                alt={cat.title}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 p-8 text-white">
                <h3 className="text-2xl font-serif mb-2">{cat.title}</h3>
                <p className="text-sm text-stone-300 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  {cat.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Shop;