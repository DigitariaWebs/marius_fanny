import { useState, useEffect } from "react";
import {
  Plus,
  Search,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  Package,
  DollarSign,
  Tag,
  ShoppingBag,
  Check,
  X,
  ImageIcon,
} from "lucide-react";
import { DataTable } from "./ui/DataTable";
import { Modal } from "./ui/modal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { ImageUpload } from "./ImageUpload";
import type { Product, Category } from "../types";
import { productAPI } from "../lib/ProductAPI";
import { categoryAPI } from "../lib/CategoryAPI";

export function ProductManagement() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [productForm, setProductForm] = useState({
    name: "",
    category: "",
    price: "",
    description: "",
    image: "",
    available: true,
    minOrderQuantity: "1",
    maxOrderQuantity: "10",
    preparationTimeHours: "",
    hasTaxes: true,
    allergens: "",
    customOptions: [] as Array<{ name: string; choices: string[] }>,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const flattenCategoriesWithIndentation = (cats: any[] = [], level: number = 0): Array<{ id: number; name: string; display: string }> => {
    const result: Array<{ id: number; name: string; display: string }> = [];
    const indent = '  '.repeat(level) + (level > 0 ? '> ' : '');
    
    cats.forEach(cat => {
      result.push({
        id: cat.id,
        name: cat.name,
        display: indent + cat.name
      });
      if (cat.children && Array.isArray(cat.children)) {
        result.push(...flattenCategoriesWithIndentation(cat.children, level + 1));
      }
    });
    
    return result;
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [productsRes, categoriesRes] = await Promise.all([
        productAPI.getAllProducts(),
        categoryAPI.getAllCategories(),
      ]);
      setProducts(productsRes.data.products);
      setCategories(categoriesRes.data.categories);
      // Set default category to first available category
      if (categoriesRes.data.categories.length > 0) {
        const flattened = flattenCategoriesWithIndentation(categoriesRes.data.categories);
        if (flattened.length > 0) {
          setProductForm(prev => ({
            ...prev,
            category: flattened[0].name,
          }));
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const getAvailabilityBadge = (available: boolean) => {
    return (
      <span
        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
          available ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
        }`}
      >
        {available ? (
          <>
            <Check size={12} />
            En stock
          </>
        ) : (
          <>
            <X size={12} />
            Épuisé
          </>
        )}
      </span>
    );
  };

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString("fr-CA", {
      style: "currency",
      currency: "CAD",
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-CA", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const filters = [
    {
      key: "category",
      label: "Catégorie",
      options: [
        { value: "all", label: "Toutes les catégories" },
        ...categories.map((cat) => ({ value: cat.name, label: cat.name })),
      ],
    },
    {
      key: "available",
      label: "Disponibilité",
      options: [
        { value: "all", label: "Tous" },
        { value: "available", label: "Disponibles" },
        { value: "unavailable", label: "Indisponibles" },
      ],
    },
  ];

  const handleViewDetails = (product: Product) => {
    setSelectedProduct(product);
    setIsDetailsModalOpen(true);
  };

  const handleEdit = (product: Product) => {
    setSelectedProduct(product);
    setProductForm({
      name: product.name,
      category: product.category,
      price: product.price.toString(),
      description: product.description || "",
      image: product.image || "",
      available: product.available,
      minOrderQuantity: product.minOrderQuantity.toString(),
      maxOrderQuantity: product.maxOrderQuantity.toString(),
      preparationTimeHours: product.preparationTimeHours?.toString() || "",
      hasTaxes: product.hasTaxes ?? true,
      allergens: product.allergens || "",
      customOptions: product.customOptions || [],
    });
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = (product: Product) => {
    setProductToDelete(product);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!productToDelete) return;
    setIsSubmitting(true);
    try {
      await productAPI.deleteProduct(productToDelete.id);
      setProducts(products.filter((p) => p.id !== productToDelete.id));
      setIsDeleteModalOpen(false);
      setProductToDelete(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete product');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreate = async () => {
    setIsSubmitting(true);
    try {
      const productData = {
        name: productForm.name,
        category: productForm.category,
        price: parseFloat(productForm.price),
        description: productForm.description || undefined,
        image: productForm.image || undefined,
        available: productForm.available,
        minOrderQuantity: parseInt(productForm.minOrderQuantity),
        maxOrderQuantity: parseInt(productForm.maxOrderQuantity),
        preparationTimeHours: productForm.preparationTimeHours
          ? parseInt(productForm.preparationTimeHours)
          : undefined,
        hasTaxes: productForm.hasTaxes,
        allergens: productForm.allergens || undefined,
        customOptions: productForm.customOptions
          .filter(opt => opt.name.trim() !== "")
          .map(opt => ({
            name: opt.name.trim(),
            choices: opt.choices.filter(c => c.trim() !== "")
          })),
      };

      const response = await productAPI.createProduct(productData);
      setProducts([...products, response.data!]);
      setIsCreateModalOpen(false);
      setProductForm({
        name: "",
        category: categories.length > 0 ? categories[0].name : "",
        price: "",
        description: "",
        image: "",
        available: true,
        minOrderQuantity: "1",
        maxOrderQuantity: "10",
        preparationTimeHours: "",
        hasTaxes: true,
        allergens: "",
        customOptions: [],
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create product');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async () => {
    if (!selectedProduct) return;
    setIsSubmitting(true);
    try {
      const productData = {
        name: productForm.name,
        category: productForm.category,
        price: parseFloat(productForm.price),
        description: productForm.description || undefined,
        image: productForm.image || undefined,
        available: productForm.available,
        minOrderQuantity: parseInt(productForm.minOrderQuantity),
        maxOrderQuantity: parseInt(productForm.maxOrderQuantity),
        preparationTimeHours: productForm.preparationTimeHours
          ? parseInt(productForm.preparationTimeHours)
          : undefined,
        hasTaxes: productForm.hasTaxes,
        allergens: productForm.allergens || undefined,
        customOptions: productForm.customOptions
          .filter(opt => opt.name.trim() !== "")
          .map(opt => ({
            name: opt.name.trim(),
            choices: opt.choices.filter(c => c.trim() !== "")
          })),
      };

      const response = await productAPI.updateProduct(selectedProduct.id, productData);
      setProducts(
        products.map((p) =>
          p.id === selectedProduct.id ? response.data! : p,
        ),
      );
      setIsEditModalOpen(false);
      setSelectedProduct(null);
      setProductForm({
        name: "",
        category: categories.length > 0 ? categories[0].name : "",
        price: "",
        description: "",
        image: "",
        available: true,
        minOrderQuantity: "1",
        maxOrderQuantity: "10",
        preparationTimeHours: "",
        hasTaxes: true,
        allergens: "",
        customOptions: [],
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update product');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleAvailability = async (product: Product) => {
    try {
      const response = await productAPI.toggleProductAvailability(product.id);
      setProducts(
        products.map((p) =>
          p.id === product.id ? response.data! : p,
        ),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to toggle product availability');
    }
  };

  const columns = [
    {
      key: "name",
      label: "Produit",
      sortable: true,
      render: (product: Product) => (
        <div className="flex items-center gap-3">
          {product.image ? (
            <img
              src={product.image}
              alt={product.name}
              className="w-12 h-12 rounded-lg object-cover"
            />
          ) : (
            <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
              <ImageIcon size={20} className="text-gray-400" />
            </div>
          )}
          <div className="font-medium text-[#2D2A26]">{product.name}</div>
        </div>
      ),
    },
    {
      key: "category",
      label: "Catégorie",
      sortable: true,
      render: (product: Product) => (
        <div className="flex items-center gap-2">
          <Tag size={14} className="text-gray-400" />
          <span className="text-sm text-gray-600">{product.category}</span>
        </div>
      ),
    },
    {
      key: "price",
      label: "Prix",
      sortable: true,
      render: (product: Product) => (
        <div className="font-medium">{formatCurrency(product.price)}</div>
      ),
    },
    {
      key: "preparationTime",
      label: "préparation",
      sortable: true,
      render: (product: Product) => (
        <div className="text-sm text-gray-600">
          {product.preparationTimeHours ? (
            <span
              className={`flex justify-center items-center px-2 py-1 rounded-full text-xs font-medium ${
                product.preparationTimeHours >= 24
                  ? "bg-red-100 text-red-700"
                  : product.preparationTimeHours >= 12
                    ? "bg-orange-100 text-orange-700"
                    : "bg-blue-100 text-blue-700"
              }`}
            >
              {product.preparationTimeHours}h
            </span>
          ) : (
            <span className="text-gray-400">Immédiat</span>
          )}
        </div>
      ),
    },
    {
      key: "available",
      label: "Disponibilité",
      sortable: true,
      render: (product: Product) => getAvailabilityBadge(product.available),
    },
    {
      key: "actions",
      label: "Actions",
      render: (product: Product) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => toggleAvailability(product)}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
              product.available
                ? "bg-orange-100 text-orange-700 hover:bg-orange-200"
                : "bg-green-100 text-green-700 hover:bg-green-200"
            }`}
          >
            {product.available ? "Marquer épuisé" : "Remettre en stock"}
          </button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <MoreVertical className="w-4 h-4 text-gray-600" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => handleViewDetails(product)}>
                <Eye className="w-4 h-4 mr-2" />
                Voir les détails
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleEdit(product)}>
                <Edit className="w-4 h-4 mr-2" />
                Modifier
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleDeleteClick(product)}
                className="text-red-600 focus:text-red-600"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Supprimer
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ];

  return (
    <div className="h-full overflow-auto">
      <header className="p-4 md:p-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2
              className="text-4xl md:text-5xl mb-2"
              style={{ fontFamily: '"Great Vibes", cursive', color: "#C5A065" }}
            >
              Gestion des Produits
            </h2>
            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-stone-500">
              Gérer votre catalogue de produits
            </p>
          </div>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-[#C5A065] hover:bg-[#2D2A26] text-white font-bold px-6 py-3 rounded-xl transition-all duration-300 hover:shadow-lg flex items-center gap-2"
          >
            <Plus size={20} />
            Ajouter un produit
          </button>
        </div>
      </header>

      <div className="p-4 md:p-8">
        {loading && (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#C5A065]"></div>
            <span className="ml-2 text-gray-600">Chargement des produits...</span>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <div className="flex items-center">
              <X className="w-5 h-5 text-red-500 mr-2" />
              <span className="text-red-800">{error}</span>
            </div>
            <button
              onClick={fetchData}
              className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
            >
              Réessayer
            </button>
          </div>
        )}

        {!loading && !error && (
          <DataTable
            data={products}
            columns={columns}
            filters={filters}
            searchPlaceholder="Rechercher un produit..."
            searchKeys={["name", "category"]}
            itemsPerPage={10}
          />
        )}
      </div>

      {/* Create Product Modal */}
      <Modal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        type="form"
        title="Ajouter un produit"
        description="Créer un nouveau produit dans votre catalogue"
        actions={{
          primary: {
            label: "Créer le produit",
            onClick: handleCreate,
            variant: "default",
            disabled: !productForm.name || !productForm.price,
            loading: isSubmitting,
          },
          secondary: {
            label: "Annuler",
            onClick: () => {
              setIsCreateModalOpen(false);
              setProductForm({
                name: "",
                category: categories.length > 0 ? categories[0].name : "",
                price: "",
                description: "",
                image: "",
                available: true,
                minOrderQuantity: "1",
                maxOrderQuantity: "10",
                preparationTimeHours: "",
                hasTaxes: true,
                allergens: "",
                customOptions: [],
              });
            },
            disabled: isSubmitting,
          },
        }}
      >
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-gray-700">
                Nom du produit *
              </label>
              <input
                type="text"
                value={productForm.name}
                onChange={(e) =>
                  setProductForm({ ...productForm, name: e.target.value })
                }
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#C5A065]/50 outline-none"
                placeholder="Ex: Croissant Pur Beurre"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <ImageUpload
                value={productForm.image}
                onChange={(url) => setProductForm({ ...productForm, image: url })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Catégorie *
              </label>
              <select
                value={productForm.category}
                onChange={(e) =>
                  setProductForm({ ...productForm, category: e.target.value })
                }
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#C5A065]/50 outline-none"
              >
                {flattenCategoriesWithIndentation(categories).map((cat) => (
                  <option key={cat.id} value={cat.name}>
                    {cat.display}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Prix (CAD) *
              </label>
              <input
                type="number"
                step="0.01"
                value={productForm.price}
                onChange={(e) =>
                  setProductForm({ ...productForm, price: e.target.value })
                }
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#C5A065]/50 outline-none"
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Temps de préparation
              </label>
              <select
                value={productForm.preparationTimeHours}
                onChange={(e) =>
                  setProductForm({
                    ...productForm,
                    preparationTimeHours: e.target.value,
                  })
                }
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#C5A065]/50 outline-none"
              >
                <option value="">Immédiat (pas de préparation)</option>
                <option value="24">24 heures (1 jour)</option>
                <option value="48">48 heures (2 jours)</option>
                <option value="72">72 heures (3 jours)</option>
              </select>
              <p className="text-xs text-gray-500">
                Délai nécessaire pour préparer ce produit
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Quantité minimale par commande *
              </label>
              <input
                type="number"
                value={productForm.minOrderQuantity}
                onChange={(e) =>
                  setProductForm({
                    ...productForm,
                    minOrderQuantity: e.target.value,
                  })
                }
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#C5A065]/50 outline-none"
                placeholder="1"
                min="1"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Quantité maximale par commande *
              </label>
              <input
                type="number"
                value={productForm.maxOrderQuantity}
                onChange={(e) =>
                  setProductForm({
                    ...productForm,
                    maxOrderQuantity: e.target.value,
                  })
                }
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#C5A065]/50 outline-none"
                placeholder="10"
                min="1"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                value={productForm.description}
                onChange={(e) =>
                  setProductForm({
                    ...productForm,
                    description: e.target.value,
                  })
                }
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#C5A065]/50 outline-none"
                placeholder="Description du produit..."
                rows={3}
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={productForm.available}
                  onChange={(e) =>
                    setProductForm({
                      ...productForm,
                      available: e.target.checked,
                    })
                  }
                  className="w-5 h-5 text-[#C5A065] border-gray-300 rounded focus:ring-[#C5A065]"
                />
                <span className="text-sm font-medium text-gray-700">
                  Produit disponible à la commande
                </span>
              </label>
            </div>

            <div className="space-y-4 md:col-span-2 pt-4 border-t border-gray-100">
              <h4 className="font-semibold text-gray-900">Options supplémentaires</h4>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="create-has-taxes"
                  checked={productForm.hasTaxes}
                  onChange={(e) =>
                    setProductForm({
                      ...productForm,
                      hasTaxes: e.target.checked,
                    })
                  }
                  className="w-5 h-5 text-[#C5A065] border-gray-300 rounded focus:ring-[#C5A065]"
                />
                <label htmlFor="create-has-taxes" className="text-sm font-medium text-gray-700 cursor-pointer">
                  Appliquer les taxes
                </label>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Allergènes
                </label>
                <input
                  type="text"
                  value={productForm.allergens}
                  onChange={(e) =>
                    setProductForm({ ...productForm, allergens: e.target.value })
                  }
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#C5A065]/50 outline-none"
                  placeholder="Ex: Gluten, Lactose, Noix"
                />
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium text-gray-700">
                    Options personnalisables (ex: Taille, Tranchage)
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      const newOpts = [...productForm.customOptions, { name: "", choices: [""] }];
                      setProductForm({ ...productForm, customOptions: newOpts });
                    }}
                    className="text-sm text-[#C5A065] hover:underline flex items-center gap-1"
                  >
                    <Plus size={14} /> Ajouter une option
                  </button>
                </div>

                {productForm.customOptions.map((opt, idx) => (
                  <div key={idx} className="p-4 bg-gray-50 rounded-lg space-y-3 border border-gray-200">
                    <div className="flex gap-2">
                       <input
                        type="text"
                        placeholder="Nom de l'option (ex: Taille)"
                        value={opt.name}
                        onChange={(e) => {
                          const newOpts = [...productForm.customOptions];
                          newOpts[idx] = { ...newOpts[idx], name: e.target.value };
                          setProductForm({ ...productForm, customOptions: newOpts });
                        }}
                        className="flex-1 p-2 border border-gray-200 rounded outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const newOpts = productForm.customOptions.filter((_, i) => i !== idx);
                          setProductForm({ ...productForm, customOptions: newOpts });
                        }}
                        className="p-2 text-red-500 hover:bg-red-50 rounded"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-gray-500 uppercase">Choix possibles</p>
                      {opt.choices.map((choice, cidx) => (
                        <div key={cidx} className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Choix (ex: 12 personnes)"
                            value={choice}
                            onChange={(e) => {
                              const newOpts = [...productForm.customOptions];
                              const newChoices = [...newOpts[idx].choices];
                              newChoices[cidx] = e.target.value;
                              newOpts[idx] = { ...newOpts[idx], choices: newChoices };
                              setProductForm({ ...productForm, customOptions: newOpts });
                            }}
                            className="flex-1 p-2 border border-gray-200 rounded outline-none text-sm"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const newOpts = [...productForm.customOptions];
                              const newChoices = opt.choices.filter((_, i) => i !== cidx);
                              newOpts[idx] = { ...newOpts[idx], choices: newChoices };
                              setProductForm({ ...productForm, customOptions: newOpts });
                            }}
                            className="p-2 text-gray-400 hover:text-red-500"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => {
                          const newOpts = [...productForm.customOptions];
                          const newChoices = [...newOpts[idx].choices, ""];
                          newOpts[idx] = { ...newOpts[idx], choices: newChoices };
                          setProductForm({ ...productForm, customOptions: newOpts });
                        }}
                        className="text-xs text-[#C5A065] hover:underline"
                      >
                        + Ajouter un choix
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Modal>

      {/* Edit Product Modal */}
      <Modal
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        type="form"
        title="Modifier le produit"
        description="Mettre à jour les informations du produit"
        actions={{
          primary: {
            label: "Enregistrer",
            onClick: handleUpdate,
            variant: "default",
            disabled: !productForm.name || !productForm.price,
            loading: isSubmitting,
          },
          secondary: {
            label: "Annuler",
            onClick: () => {
              setIsEditModalOpen(false);
              setSelectedProduct(null);
              setProductForm({
                name: "",
                category: categories.length > 0 ? categories[0].name : "",
                price: "",
                description: "",
                image: "",
                available: true,
                minOrderQuantity: "1",
                maxOrderQuantity: "10",
                preparationTimeHours: "",
                hasTaxes: true,
                allergens: "",
                customOptions: [],
              });
            },
            disabled: isSubmitting,
          },
        }}
      >
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-gray-700">
                Nom du produit *
              </label>
              <input
                type="text"
                value={productForm.name}
                onChange={(e) =>
                  setProductForm({ ...productForm, name: e.target.value })
                }
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#C5A065]/50 outline-none"
                placeholder="Ex: Croissant Pur Beurre"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <ImageUpload
                value={productForm.image}
                onChange={(url) => setProductForm({ ...productForm, image: url })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Catégorie *
              </label>
              <select
                value={productForm.category}
                onChange={(e) =>
                  setProductForm({ ...productForm, category: e.target.value })
                }
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#C5A065]/50 outline-none"
              >
                {flattenCategoriesWithIndentation(categories).map((cat) => (
                  <option key={cat.id} value={cat.name}>
                    {cat.display}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Prix (CAD) *
              </label>
              <input
                type="number"
                step="0.01"
                value={productForm.price}
                onChange={(e) =>
                  setProductForm({ ...productForm, price: e.target.value })
                }
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#C5A065]/50 outline-none"
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Temps de préparation
              </label>
              <select
                value={productForm.preparationTimeHours}
                onChange={(e) =>
                  setProductForm({
                    ...productForm,
                    preparationTimeHours: e.target.value,
                  })
                }
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#C5A065]/50 outline-none"
              >
                <option value="">Immédiat (pas de préparation)</option>
                <option value="24">24 heures (1 jour)</option>
                <option value="48">48 heures (2 jours)</option>
                <option value="72">72 heures (3 jours)</option>
              </select>
              <p className="text-xs text-gray-500">
                Délai nécessaire pour préparer ce produit
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Quantité minimale par commande *
              </label>
              <input
                type="number"
                value={productForm.minOrderQuantity}
                onChange={(e) =>
                  setProductForm({
                    ...productForm,
                    minOrderQuantity: e.target.value,
                  })
                }
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#C5A065]/50 outline-none"
                placeholder="1"
                min="1"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Quantité maximale par commande *
              </label>
              <input
                type="number"
                value={productForm.maxOrderQuantity}
                onChange={(e) =>
                  setProductForm({
                    ...productForm,
                    maxOrderQuantity: e.target.value,
                  })
                }
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#C5A065]/50 outline-none"
                placeholder="10"
                min="1"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                value={productForm.description}
                onChange={(e) =>
                  setProductForm({
                    ...productForm,
                    description: e.target.value,
                  })
                }
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#C5A065]/50 outline-none"
                placeholder="Description du produit..."
                rows={3}
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={productForm.available}
                  onChange={(e) =>
                    setProductForm({
                      ...productForm,
                      available: e.target.checked,
                    })
                  }
                  className="w-5 h-5 text-[#C5A065] border-gray-300 rounded focus:ring-[#C5A065]"
                />
                <span className="text-sm font-medium text-gray-700">
                  Produit disponible à la commande
                </span>
              </label>
            </div>

            <div className="space-y-4 md:col-span-2 pt-4 border-t border-gray-100">
              <h4 className="font-semibold text-gray-900">Options supplémentaires</h4>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="edit-has-taxes"
                  checked={productForm.hasTaxes}
                  onChange={(e) =>
                    setProductForm({
                      ...productForm,
                      hasTaxes: e.target.checked,
                    })
                  }
                  className="w-5 h-5 text-[#C5A065] border-gray-300 rounded focus:ring-[#C5A065]"
                />
                <label htmlFor="edit-has-taxes" className="text-sm font-medium text-gray-700 cursor-pointer">
                  Appliquer les taxes
                </label>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Allergènes
                </label>
                <input
                  type="text"
                  value={productForm.allergens}
                  onChange={(e) =>
                    setProductForm({ ...productForm, allergens: e.target.value })
                  }
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#C5A065]/50 outline-none"
                  placeholder="Ex: Gluten, Lactose, Noix"
                />
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium text-gray-700">
                    Options personnalisables (ex: Taille, Tranchage)
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      const newOpts = [...productForm.customOptions, { name: "", choices: [""] }];
                      setProductForm({ ...productForm, customOptions: newOpts });
                    }}
                    className="text-sm text-[#C5A065] hover:underline flex items-center gap-1"
                  >
                    <Plus size={14} /> Ajouter une option
                  </button>
                </div>

                {productForm.customOptions.map((opt, idx) => (
                  <div key={idx} className="p-4 bg-gray-50 rounded-lg space-y-3 border border-gray-200">
                    <div className="flex gap-2">
                       <input
                        type="text"
                        placeholder="Nom de l'option (ex: Taille)"
                        value={opt.name}
                        onChange={(e) => {
                          const newOpts = [...productForm.customOptions];
                          newOpts[idx] = { ...newOpts[idx], name: e.target.value };
                          setProductForm({ ...productForm, customOptions: newOpts });
                        }}
                        className="flex-1 p-2 border border-gray-200 rounded outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const newOpts = productForm.customOptions.filter((_, i) => i !== idx);
                          setProductForm({ ...productForm, customOptions: newOpts });
                        }}
                        className="p-2 text-red-500 hover:bg-red-50 rounded"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-gray-500 uppercase">Choix possibles</p>
                      {opt.choices.map((choice, cidx) => (
                        <div key={cidx} className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Choix (ex: 12 personnes)"
                            value={choice}
                            onChange={(e) => {
                              const newOpts = [...productForm.customOptions];
                              const newChoices = [...newOpts[idx].choices];
                              newChoices[cidx] = e.target.value;
                              newOpts[idx] = { ...newOpts[idx], choices: newChoices };
                              setProductForm({ ...productForm, customOptions: newOpts });
                            }}
                            className="flex-1 p-2 border border-gray-200 rounded outline-none text-sm"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const newOpts = [...productForm.customOptions];
                              const newChoices = opt.choices.filter((_, i) => i !== cidx);
                              newOpts[idx] = { ...newOpts[idx], choices: newChoices };
                              setProductForm({ ...productForm, customOptions: newOpts });
                            }}
                            className="p-2 text-gray-400 hover:text-red-500"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => {
                          const newOpts = [...productForm.customOptions];
                          const newChoices = [...newOpts[idx].choices, ""];
                          newOpts[idx] = { ...newOpts[idx], choices: newChoices };
                          setProductForm({ ...productForm, customOptions: newOpts });
                        }}
                        className="text-xs text-[#C5A065] hover:underline"
                      >
                        + Ajouter un choix
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Modal>

      {/* Product Details Modal */}
      <Modal
        open={isDetailsModalOpen}
        onOpenChange={setIsDetailsModalOpen}
        type="details"
        title="Détails du produit"
        description={selectedProduct?.name || ""}
        actions={{
          secondary: {
            label: "Fermer",
            onClick: () => {
              setIsDetailsModalOpen(false);
              setSelectedProduct(null);
            },
          },
        }}
      >
        {selectedProduct && (
          <div className="space-y-6">
            {selectedProduct.image ? (
              <div className="flex justify-center mb-4">
                <img
                  src={selectedProduct.image}
                  alt={selectedProduct.name}
                  className="max-w-xs rounded-lg shadow-md"
                />
              </div>
            ) : (
              <div className="flex justify-center mb-4">
                <div className="w-48 h-48 rounded-lg bg-gray-100 flex items-center justify-center">
                  <ImageIcon size={64} className="text-gray-400" />
                </div>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Nom du produit
                </label>
                <p className="text-base text-[#2D2A26] mt-1">
                  {selectedProduct.name}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Catégorie
                </label>
                <p className="text-base text-[#2D2A26] mt-1">
                  {selectedProduct.category}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Prix
                </label>
                <p className="text-base text-[#2D2A26] mt-1 font-medium">
                  {formatCurrency(selectedProduct.price)}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Disponibilité
                </label>
                <div className="mt-1">
                  {getAvailabilityBadge(selectedProduct.available)}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Quantité minimale
                </label>
                <p className="text-base text-[#2D2A26] mt-1">
                  {selectedProduct.minOrderQuantity}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Quantité maximale
                </label>
                <p className="text-base text-[#2D2A26] mt-1">
                  {selectedProduct.maxOrderQuantity}
                </p>
              </div>
              {selectedProduct.description && (
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-gray-500">
                    Description
                  </label>
                  <p className="text-base text-[#2D2A26] mt-1">
                    {selectedProduct.description}
                  </p>
                </div>
              )}
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Date de création
                </label>
                <p className="text-base text-[#2D2A26] mt-1">
                  {formatDate(selectedProduct.createdAt)}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Dernière modification
                </label>
                <p className="text-base text-[#2D2A26] mt-1">
                  {formatDate(selectedProduct.updatedAt)}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Taxes
                </label>
                <p className="text-base text-[#2D2A26] mt-1">
                  {selectedProduct.hasTaxes ? "Taxes applicables" : "Sans taxes"}
                </p>
              </div>
              {selectedProduct.allergens && (
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-gray-500">
                    Allergènes
                  </label>
                  <p className="text-base text-[#2D2A26] mt-1">
                    {selectedProduct.allergens}
                  </p>
                </div>
              )}
              {selectedProduct.customOptions && selectedProduct.customOptions.length > 0 && (
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-gray-500">
                    Options supplémentaires
                  </label>
                  <div className="mt-2 space-y-2">
                    {selectedProduct.customOptions.map((opt, idx) => (
                      <div key={idx} className="p-2 bg-gray-50 rounded border border-gray-100">
                        <span className="font-semibold text-sm">{opt.name} : </span>
                        <span className="text-sm">{opt.choices.join(", ")}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Product Modal */}
      <Modal
        open={isDeleteModalOpen}
        onOpenChange={setIsDeleteModalOpen}
        type="warning"
        title="Supprimer le produit"
        description="Êtes-vous sûr de vouloir supprimer ce produit ? Cette action est irréversible."
        actions={{
          primary: {
            label: "Supprimer",
            onClick: handleDelete,
            variant: "destructive",
            loading: isSubmitting,
          },
          secondary: {
            label: "Annuler",
            onClick: () => {
              setIsDeleteModalOpen(false);
              setProductToDelete(null);
            },
            disabled: isSubmitting,
          },
        }}
      >
        {productToDelete && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-800">
              <strong>Produit :</strong> {productToDelete.name}
              <br />
              <strong>Catégorie :</strong> {productToDelete.category}
              <br />
              <strong>Prix :</strong> {formatCurrency(productToDelete.price)}
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
}
