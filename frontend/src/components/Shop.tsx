import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { categoryAPI } from '../lib/CategoryAPI';
import type { Category as CategoryType } from '../types';
import { getImageUrl } from '../utils/api';
import ProductSelection from './ProductSelection'; 

const styles = {
  cream: '#F9F7F2',
  text: '#2D2A26',
  gold: '#337957',
  fontScript: '"Great Vibes", cursive',
  fontSans: '"Inter", sans-serif',
};

interface Category {
  id: number;
  title: string;
  image: string;
  size: 'large' | 'small';
  childTitles: string[];
}

interface ApiCategoryNode extends CategoryType {
  children?: ApiCategoryNode[];
}

interface CategoryShowcaseProps {
  onCategoryClick?: (categoryId: number, categoryTitle: string) => void;
  onAddToCart: (product: any) => void; // Changé en obligatoire pour ProductSelection
}

const Shop: React.FC<CategoryShowcaseProps> = ({ onCategoryClick, onAddToCart }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // ÉTAT : Pour savoir quelle catégorie est sélectionnée
  const [selectedCat, setSelectedCat] = useState<{id: number, title: string} | null>(null);
  
  // RÉFÉRENCE : Pour le scroll automatique
  const productsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await categoryAPI.getAllCategories();
      const flattenCategories = (nodes: ApiCategoryNode[] = []): ApiCategoryNode[] => {
        const result: ApiCategoryNode[] = [];
        const walk = (items: ApiCategoryNode[]) => {
          items.forEach((item) => {
            result.push(item);
            if (Array.isArray(item.children) && item.children.length > 0) walk(item.children);
          });
        };
        walk(nodes);
        return result;
      };

      const allNodes = flattenCategories((response.data.categories || []) as ApiCategoryNode[]);
      const byId = new Map<number, ApiCategoryNode & { children: ApiCategoryNode[] }>();
      allNodes.forEach((node) => {
        if (typeof node.id !== 'number') return;
        if (!byId.has(node.id)) byId.set(node.id, { ...node, children: [] });
      });
      byId.forEach((node) => {
        if (node.parentId && byId.has(node.parentId)) byId.get(node.parentId)!.children.push(node);
      });

      const rootCategories = Array.from(byId.values())
        .filter((node) => !node.parentId || !byId.has(node.parentId))
        .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0) || a.name.localeCompare(b.name));

      const getAllChildTitles = (children: ApiCategoryNode[] = []): string[] => {
        const titles: string[] = [];
        const walk = (nodes: ApiCategoryNode[]) => {
          nodes.forEach((node) => {
            titles.push(node.name);
            if (Array.isArray(node.children) && node.children.length > 0) walk(node.children);
          });
        };
        walk(children);
        return titles;
      };
      
      const displayCategories: Category[] = rootCategories.map((cat, index) => ({
        id: cat.id,
        title: cat.name,
        image: cat.image || './gateau.jpg',
        size: 'small', // On force 'small' pour que tout soit uniforme et compact
        childTitles: getAllChildTitles(cat.children || []),
      }));
      setCategories(displayCategories);
    } catch (error: any) {
      setError(error?.message || 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryClick = (categoryId: number, categoryTitle: string) => {
    setSelectedCat({ id: categoryId, title: categoryTitle });
    if (onCategoryClick) onCategoryClick(categoryId, categoryTitle);
    
    // Scroll vers les produits après un court délai
    setTimeout(() => {
      productsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  if (loading) return <div className="py-20 text-center">Chargement...</div>;

  return (
    <div className="flex flex-col bg-[#F9F7F2]">
      <section className="relative py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10 space-y-4">
            <h2 className="text-4xl md:text-5xl" style={{ fontFamily: styles.fontScript, color: styles.gold }}>
              Notre Boutique
            </h2>
            <p className="uppercase tracking-widest text-xs font-bold">Sélectionnez une catégorie</p>
          </div>

          {/* GRILLE COMPACTE */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {categories.map((cat) => {
              const isSelected = selectedCat?.id === cat.id;
              return (
                <div
                  key={cat.id}
                  onClick={() => handleCategoryClick(cat.id, cat.title)}
                  className={`group relative h-32 md:h-40 overflow-hidden rounded-xl cursor-pointer transition-all duration-300
                    ${isSelected ? 'ring-4 ring-[#337957] shadow-inner' : 'hover:shadow-md'}`}
                >
                  <img
                    src={getImageUrl(cat.image)}
                    alt={cat.title}
                    className={`absolute inset-0 w-full h-full object-cover transition-all duration-500
                      ${isSelected ? 'grayscale opacity-40 scale-100' : 'group-hover:scale-105'}`}
                  />
                  <div className={`absolute inset-0 flex items-center justify-center p-2 bg-black/30 group-hover:bg-black/20`}>
                    <h3 className="text-white text-sm md:text-base font-bold uppercase text-center drop-shadow-md">
                      {cat.title}
                    </h3>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ZONE D'AFFICHAGE DES PRODUITS */}
      <div ref={productsRef} className="min-h-screen">
        {selectedCat ? (
          <ProductSelection 
            categoryId={selectedCat.id} 
            categoryTitle={selectedCat.title}
            onAddToCart={onAddToCart}
            onBack={() => setSelectedCat(null)} // Optionnel: pour fermer la vue
          />
        ) : (
          <div className="py-20 text-center text-stone-400 italic font-light">
            Cliquez sur une catégorie pour découvrir nos délices...
          </div>
        )}
      </div>
    </div>
  );
};

export default Shop;