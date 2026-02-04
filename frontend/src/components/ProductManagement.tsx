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

interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  available: boolean;
  minOrderQuantity: number;
  maxOrderQuantity: number;
  description?: string;
  image?: string;
  createdAt: string;
  updatedAt: string;
}

const CATEGORIES = [
  "Gâteaux",
  "Pains",
  "Viennoiseries",
  "Chocolats",
  "Boîtes à lunch",
  "À la carte",
];

export function ProductManagement() {
  const [products, setProducts] = useState<Product[]>([
    {
      id: 1,
      name: "La Marguerite (6 pers.)",
      category: "Gâteaux",
      price: 37.5,
      available: true,
      minOrderQuantity: 1,
      maxOrderQuantity: 5,
      description: "Gâteau signature aux saveurs délicates",
      createdAt: "2024-01-15T10:00:00Z",
      updatedAt: "2024-01-15T10:00:00Z",
    },
    {
      id: 2,
      name: "Tarte Citron Meringuée",
      category: "Gâteaux",
      price: 29.95,
      available: true,
      minOrderQuantity: 1,
      maxOrderQuantity: 3,
      description: "Tarte au citron avec meringue italienne",
      createdAt: "2024-01-15T10:00:00Z",
      updatedAt: "2024-01-15T10:00:00Z",
    },
    {
      id: 3,
      name: "Baguette Tradition",
      category: "Pains",
      price: 3.5,
      available: false,
      minOrderQuantity: 1,
      maxOrderQuantity: 20,
      description: "Pain tradition français",
      createdAt: "2024-01-15T10:00:00Z",
      updatedAt: "2024-01-15T10:00:00Z",
    },
    {
      id: 4,
      name: "Pain Campagne Bio",
      category: "Pains",
      price: 4.8,
      available: true,
      minOrderQuantity: 1,
      maxOrderQuantity: 10,
      description: "Pain de campagne bio au levain",
      createdAt: "2024-01-15T10:00:00Z",
      updatedAt: "2024-01-15T10:00:00Z",
    },
    {
      id: 5,
      name: "Croissant Pur Beurre",
      category: "Viennoiseries",
      price: 2.2,
      available: true,
      minOrderQuantity: 1,
      maxOrderQuantity: 50,
      description: "Croissant artisanal au beurre",
      createdAt: "2024-01-15T10:00:00Z",
      updatedAt: "2024-01-15T10:00:00Z",
    },
    {
      id: 6,
      name: "Pain au Chocolat",
      category: "Viennoiseries",
      price: 2.4,
      available: true,
      minOrderQuantity: 1,
      maxOrderQuantity: 30,
      description: "Pain au chocolat avec chocolat belge",
      createdAt: "2024-01-15T10:00:00Z",
      updatedAt: "2024-01-15T10:00:00Z",
    },
    {
      id: 7,
      name: "Macarons Assortis (12 pcs)",
      category: "Chocolats",
      price: 24.0,
      available: true,
      minOrderQuantity: 1,
      maxOrderQuantity: 10,
      description: "Boîte de 12 macarons aux saveurs variées",
      createdAt: "2024-01-15T10:00:00Z",
      updatedAt: "2024-01-15T10:00:00Z",
    },
    {
      id: 8,
      name: "Chocolats Pralinés (250g)",
      category: "Chocolats",
      price: 18.5,
      available: true,
      minOrderQuantity: 1,
      maxOrderQuantity: 15,
      description: "Assortiment de chocolats pralinés maison",
      createdAt: "2024-01-15T10:00:00Z",
      updatedAt: "2024-01-15T10:00:00Z",
    },
  ]);

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
  });

  const getAvailabilityBadge = (available: boolean) => {
    return (
      <span
        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
          available
            ? "bg-green-100 text-green-700"
            : "bg-gray-100 text-gray-700"
        }`}
      >
        {available ? (
          <>
            <Check size={12} />
            Disponible
          </>
        ) : (
          <>
            <X size={12} />
            Indisponible
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
          <Tag size={16} className="text-gray-400" />
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
      key: "available",
      label: "Disponibilité",
      sortable: true,
      render: (product: Product) => getAvailabilityBadge(product.available),
    },
    {
      key: "limits",
      label: "Limites de commande",
      render: (product: Product) => (
        <div className="text-sm text-gray-600">
          Min: {product.minOrderQuantity} / Max: {product.maxOrderQuantity}
        </div>
      ),
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
                ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                : "bg-green-100 text-green-700 hover:bg-green-200"
            }`}
          >
            {product.available ? "Désactiver" : "Activer"}
          </button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <MoreVertical size={18} className="text-gray-600" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => handleViewDetails(product)}>
                <Eye size={16} className="mr-2" />
                Voir les détails
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleEdit(product)}>
                <Edit size={16} className="mr-2" />
                Modifier
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleDeleteClick(product)}
                className="text-red-600 focus:text-red-600"
              >
                <Trash2 size={16} className="mr-2" />
                Supprimer
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ];

  const getSearchValue = (product: Product) => {
    return `${product.name} ${product.category}`;
  };

  return (
    <div className="h-full overflow-auto">
      <header className="bg-white shadow-sm border-b border-gray-100 p-4 md:p-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-serif text-[#2D2A26]">
              Gestion des Produits
            </h2>
            <p className="text-sm md:text-base text-gray-500 mt-1">
              Gérer votre catalogue de produits
            </p>
          </div>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-[#C5A065] hover:bg-[#2D2A26] text-white font-medium px-6 py-3 rounded-lg transition-colors flex items-center gap-2"
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
          getSearchValue={getSearchValue}
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
