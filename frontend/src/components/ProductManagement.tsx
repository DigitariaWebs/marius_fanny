import { useState } from "react";
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
import type { Product } from "../types";
import { MOCK_PRODUCTS, CATEGORIES } from "../data";

export function ProductManagement() {
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [productForm, setProductForm] = useState({
    name: "",
    category: "Gâteaux",
    price: "",
    description: "",
    image: "",
    available: true,
    minOrderQuantity: "1",
    maxOrderQuantity: "10",
    preparationTimeHours: "",
  });

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
        ...CATEGORIES.map((cat) => ({ value: cat, label: cat })),
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
    // Simulate API call
    setTimeout(() => {
      setProducts(products.filter((p) => p.id !== productToDelete.id));
      setIsDeleteModalOpen(false);
      setProductToDelete(null);
      setIsSubmitting(false);
    }, 1000);
  };

  const handleCreate = async () => {
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      const newProduct: Product = {
        id: Math.max(...products.map((p) => p.id)) + 1,
        name: productForm.name,
        category: productForm.category,
        price: parseFloat(productForm.price),
        description: productForm.description,
        image: productForm.image || undefined,
        available: productForm.available,
        minOrderQuantity: parseInt(productForm.minOrderQuantity),
        maxOrderQuantity: parseInt(productForm.maxOrderQuantity),
        preparationTimeHours: productForm.preparationTimeHours
          ? parseInt(productForm.preparationTimeHours)
          : undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setProducts([...products, newProduct]);
      setIsCreateModalOpen(false);
      setProductForm({
        name: "",
        category: "Gâteaux",
        price: "",
        description: "",
        image: "",
        available: true,
        minOrderQuantity: "1",
        maxOrderQuantity: "10",
        preparationTimeHours: "",
      });
      setIsSubmitting(false);
    }, 1000);
  };

  const handleUpdate = async () => {
    if (!selectedProduct) return;
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setProducts(
        products.map((p) =>
          p.id === selectedProduct.id
            ? {
                ...p,
                name: productForm.name,
                category: productForm.category,
                price: parseFloat(productForm.price),
                description: productForm.description,
                image: productForm.image || undefined,
                available: productForm.available,
                minOrderQuantity: parseInt(productForm.minOrderQuantity),
                maxOrderQuantity: parseInt(productForm.maxOrderQuantity),
                preparationTimeHours: productForm.preparationTimeHours
                  ? parseInt(productForm.preparationTimeHours)
                  : undefined,
                updatedAt: new Date().toISOString(),
              }
            : p,
        ),
      );
      setIsEditModalOpen(false);
      setSelectedProduct(null);
      setProductForm({
        name: "",
        category: "Gâteaux",
        price: "",
        description: "",
        image: "",
        available: true,
        minOrderQuantity: "1",
        maxOrderQuantity: "10",
        preparationTimeHours: "",
      });
      setIsSubmitting(false);
    }, 1000);
  };

  const toggleAvailability = (product: Product) => {
    setProducts(
      products.map((p) =>
        p.id === product.id
          ? {
              ...p,
              available: !p.available,
              updatedAt: new Date().toISOString(),
            }
          : p,
      ),
    );
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
        <DataTable
          data={products}
          columns={columns}
          filters={filters}
          searchPlaceholder="Rechercher un produit..."
          searchKeys={["name", "category"]}
          itemsPerPage={10}
        />
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
                category: "Gâteaux",
                price: "",
                description: "",
                image: "",
                available: true,
                minOrderQuantity: "1",
                maxOrderQuantity: "10",
                preparationTimeHours: "",
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
              <label className="text-sm font-medium text-gray-700">
                Image URL
              </label>
              <input
                type="text"
                value={productForm.image}
                onChange={(e) =>
                  setProductForm({ ...productForm, image: e.target.value })
                }
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#C5A065]/50 outline-none"
                placeholder="https://exemple.com/image.jpg"
              />
              <p className="text-xs text-gray-500">
                Laissez vide pour utiliser un placeholder
              </p>
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
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
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
                category: "Gâteaux",
                price: "",
                description: "",
                image: "",
                available: true,
                minOrderQuantity: "1",
                maxOrderQuantity: "10",
                preparationTimeHours: "",
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
              <label className="text-sm font-medium text-gray-700">
                Image URL
              </label>
              <input
                type="text"
                value={productForm.image}
                onChange={(e) =>
                  setProductForm({ ...productForm, image: e.target.value })
                }
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#C5A065]/50 outline-none"
                placeholder="https://exemple.com/image.jpg"
              />
              <p className="text-xs text-gray-500">
                Laissez vide pour utiliser un placeholder
              </p>
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
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
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
