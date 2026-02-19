import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { categoryAPI } from '../lib/CategoryAPI';
import type { Category as CategoryType } from '../types';
import { getImageUrl } from '../utils/api';

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
  childTitles: string[];
}

interface ApiCategoryNode extends CategoryType {
  children?: ApiCategoryNode[];
}

interface CategoryShowcaseProps {
  onCategoryClick?: (categoryId: number, categoryTitle: string) => void;
  onAddToCart?: (product: any) => void;
}

const Shop: React.FC<CategoryShowcaseProps> = ({ onCategoryClick }) => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
            if (Array.isArray(item.children) && item.children.length > 0) {
              walk(item.children);
            }
          });
        };

        walk(nodes);
        return result;
      };

      const allNodes = flattenCategories((response.data.categories || []) as ApiCategoryNode[]);
      const byId = new Map<number, ApiCategoryNode & { children: ApiCategoryNode[] }>();

      allNodes.forEach((node) => {
        if (typeof node.id !== 'number') return;
        if (!byId.has(node.id)) {
          byId.set(node.id, {
            ...node,
            children: [],
          });
        }
      });

      byId.forEach((node) => {
        if (node.parentId && byId.has(node.parentId)) {
          byId.get(node.parentId)!.children.push(node);
        }
      });

      const rootCategories = Array.from(byId.values())
        .filter((node) => !node.parentId || !byId.has(node.parentId))
        .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0) || a.name.localeCompare(b.name));

      const getAllChildTitles = (children: ApiCategoryNode[] = []): string[] => {
        const titles: string[] = [];
        const walk = (nodes: ApiCategoryNode[]) => {
          nodes.forEach((node) => {
            titles.push(node.name);
            if (Array.isArray(node.children) && node.children.length > 0) {
              walk(node.children);
            }
          });
        };
        walk(children);
        return titles;
      };
      
      // Convert root categories to display format; children stay inside parent card
      const displayCategories: Category[] = rootCategories.map((cat, index) => ({
        id: cat.id,
        title: cat.name,
        image: cat.image || './gateau.jpg',
        size: (index === 4) ? 'large' : 'small', // Make the 5th item large
        childTitles: getAllChildTitles(cat.children || []),
      }));
      setCategories(displayCategories);
    } catch (error: any) {
      console.error('Failed to fetch categories:', error);
      setError(error?.message || 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryClick = (categoryId: number, categoryTitle: string) => {
    if (onCategoryClick) {
      onCategoryClick(categoryId, categoryTitle);
    }
    navigate(`/products?category=${categoryId}&title=${encodeURIComponent(categoryTitle)}`);
  };

  if (loading) {
    return (
      <section
        className="relative py-20 px-6"
        style={{
          fontFamily: styles.fontSans,
          backgroundColor: 'rgba(249, 247, 242, 0.85)',
        }}
      >
        <div className="max-w-7xl mx-auto text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C5A065] mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement des catégories...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section
        className="relative py-20 px-6"
        style={{
          fontFamily: styles.fontSans,
          backgroundColor: 'rgba(249, 247, 242, 0.85)',
        }}
      >
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-red-500 text-lg mb-4">Erreur: {error}</p>
          <button
            onClick={() => { setError(null); fetchCategories(); }}
            className="px-6 py-2 rounded-lg text-white transition-colors"
            style={{ backgroundColor: styles.gold }}
          >
            Réessayer
          </button>
        </div>
      </section>
    );
  }

  return (
    <section
      className="relative py-20 px-6"
      style={{
        fontFamily: styles.fontSans,
        backgroundColor: 'rgba(249, 247, 242, 0.85)', 
      }}
    >
      <div className="max-w-7xl mx-auto" style={{ position: 'relative', zIndex: 1 }}>

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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[300px]">
          {categories.map((cat, index) => (
            <div
              key={`category-${cat.id}-${index}`}
              onClick={() => handleCategoryClick(cat.id, cat.title)}
              className={`group overflow-hidden rounded-2xl shadow-sm transition-all duration-500 hover:shadow-xl cursor-pointer
                ${cat.size === 'large' ? 'md:col-span-2' : 'md:col-span-1'}`}
              style={{ position: 'relative', isolation: 'isolate' }}
            >
              <img
                src={getImageUrl(cat.image)}
                alt={cat.title}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                style={{ zIndex: 1 }}
              />

              <div
                className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity"
                style={{ zIndex: 2 }}
              />

              <div
                className="absolute inset-0 p-8 flex flex-col justify-end"
                style={{ zIndex: 3 }}
              >
                <h3 className="text-white text-2xl font-semibold tracking-wide uppercase transition-transform duration-500 group-hover:-translate-y-2">
                  {cat.title}
                </h3>
                {cat.childTitles.length > 0 && (
                  <p className="text-white/80 text-xs tracking-wide mt-2 line-clamp-2">
                    {cat.childTitles.join(' • ')}
                  </p>
                )}
                <div
                  className="h-1 w-0 group-hover:w-16 transition-all duration-500"
                  style={{ backgroundColor: styles.gold }}
                />
                <span className="text-white/0 group-hover:text-white text-xs uppercase tracking-[0.2em] mt-4 transition-all duration-500">
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

export default Shop;