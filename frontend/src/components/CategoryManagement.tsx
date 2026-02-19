import { useState, useEffect } from "react";
import {
  Plus,
  Search,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  X,
  ImageIcon,
  Check,
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
import type { Category } from "../types";
import { categoryAPI } from "../lib/CategoryAPI";
import { getImageUrl } from "../utils/api";

export function CategoryManagement() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [categoryForm, setCategoryForm] = useState({
    name: "",
    description: "",
    image: "",
    displayOrder: "0",
    parentId: "",
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await categoryAPI.getAllCategoriesAdmin();
      setCategories(response.data.categories);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (active: boolean) => {
    return (
      <span
        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
          active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
        }`}
      >
        {active ? (
          <>
            <Check size={12} />
            Actif
          </>
        ) : (
          <>
            <X size={12} />
            Inactif
          </>
        )}
      </span>
    );
  };

  const getCategoryPath = (category: Category): string => {
    if (!category.parentId) return category.name;
    
    const parent = categories.find(c => c.id === category.parentId);
    if (!parent) return category.name;
    
    return `${parent.name} > ${category.name}`;
  };

  const getRootCategories = (): Category[] => {
    return categories.filter(c => !c.parentId).sort((a, b) => a.displayOrder - b.displayOrder);
  };

  const handleViewDetails = (category: Category) => {
    setSelectedCategory(category);
    setIsDetailsModalOpen(true);
  };

  const handleEdit = (category: Category) => {
    setSelectedCategory(category);
    setCategoryForm({
      name: category.name,
      description: category.description || "",
      image: category.image || "",
      displayOrder: category.displayOrder.toString(),
      parentId: category.parentId ? category.parentId.toString() : "",
    });
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = (category: Category) => {
    setCategoryToDelete(category);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!categoryToDelete) return;
    setIsSubmitting(true);
    try {
      await categoryAPI.deleteCategory(categoryToDelete.id);
      setCategories(categories.filter((c) => c.id !== categoryToDelete.id));
      setIsDeleteModalOpen(false);
      setCategoryToDelete(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete category');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreate = async () => {
    setIsSubmitting(true);
    try {
      const categoryData: any = {
        name: categoryForm.name,
        description: categoryForm.description || "",
        image: categoryForm.image || "",
        displayOrder: categoryForm.displayOrder ? parseInt(categoryForm.displayOrder) : 0,
      };
      
      if (categoryForm.parentId) {
        categoryData.parentId = parseInt(categoryForm.parentId);
      }

      const response = await categoryAPI.createCategory(categoryData);
      setCategories([...categories, response.data!]);
      setIsCreateModalOpen(false);
      setCategoryForm({
        name: "",
        description: "",
        image: "",
        displayOrder: "0",
        parentId: "",
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create category');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async () => {
    if (!selectedCategory) return;
    setIsSubmitting(true);
    try {
      const categoryData: any = {
        name: categoryForm.name,
        description: categoryForm.description || "",
        image: categoryForm.image || "",
        displayOrder: categoryForm.displayOrder ? parseInt(categoryForm.displayOrder) : 0,
      };
      
      if (categoryForm.parentId) {
        categoryData.parentId = parseInt(categoryForm.parentId);
      } else {
        categoryData.parentId = undefined;
      }

      const response = await categoryAPI.updateCategory(selectedCategory.id, categoryData);
      setCategories(
        categories.map((c) =>
          c.id === selectedCategory.id ? response.data! : c,
        ),
      );
      setIsEditModalOpen(false);
      setSelectedCategory(null);
      setCategoryForm({
        name: "",
        description: "",
        image: "",
        displayOrder: "0",
        parentId: "",
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update category');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleStatus = async (category: Category) => {
    try {
      const response = await categoryAPI.toggleCategoryStatus(category.id);
      setCategories(
        categories.map((c) =>
          c.id === category.id ? response.data! : c,
        ),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to toggle category status');
    }
  };

  const columns = [
    {
      key: "image",
      label: "Image",
      render: (category: Category) => (
        <div className="flex items-center justify-center">
          {category.image ? (
            <img
              src={getImageUrl(category.image)}
              alt={category.name}
              className="w-12 h-12 rounded-lg object-cover"
            />
          ) : (
            <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
              <ImageIcon size={20} className="text-gray-400" />
            </div>
          )}
        </div>
      ),
    },
    {
      key: "name",
      label: "Nom de la catégorie",
      sortable: true,
      render: (category: Category) => (
        <div className="font-medium text-[#2D2A26]">{getCategoryPath(category)}</div>
      ),
    },
    {
      key: "description",
      label: "Description",
      render: (category: Category) => (
        <div className="text-sm text-gray-600 max-w-xs truncate">
          {category.description || "Aucune description"}
        </div>
      ),
    },
    {
      key: "displayOrder",
      label: "Ordre d'affichage",
      sortable: true,
      render: (category: Category) => (
        <div className="text-sm font-medium text-gray-700">{category.displayOrder}</div>
      ),
    },
    {
      key: "status",
      label: "Statut",
      render: (category: Category) => getStatusBadge(category.active),
    },
    {
      key: "actions",
      label: "Actions",
      render: (category: Category) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => toggleStatus(category)}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
              category.active
                ? "bg-red-100 text-red-700 hover:bg-red-200"
                : "bg-green-100 text-green-700 hover:bg-green-200"
            }`}
          >
            {category.active ? "Désactiver" : "Activer"}
          </button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <MoreVertical className="w-4 h-4 text-gray-600" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => handleViewDetails(category)}>
                <Eye className="w-4 h-4 mr-2" />
                Voir les détails
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleEdit(category)}>
                <Edit className="w-4 h-4 mr-2" />
                Modifier
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleDeleteClick(category)}
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
              Gestion des Catégories
            </h2>
            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-stone-500">
              Gérer les catégories de produits
            </p>
          </div>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-[#C5A065] hover:bg-[#2D2A26] text-white font-bold px-6 py-3 rounded-xl transition-all duration-300 hover:shadow-lg flex items-center gap-2"
          >
            <Plus size={20} />
            Ajouter une catégorie
          </button>
        </div>
      </header>

      <div className="p-4 md:p-8">
        {loading && (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#C5A065]"></div>
            <span className="ml-2 text-gray-600">Chargement des catégories...</span>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <div className="flex items-center">
              <X className="w-5 h-5 text-red-500 mr-2" />
              <span className="text-red-800">{error}</span>
            </div>
            <button
              onClick={fetchCategories}
              className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
            >
              Réessayer
            </button>
          </div>
        )}

        {!loading && !error && (
          <DataTable
            data={categories}
            columns={columns}
            searchPlaceholder="Rechercher une catégorie..."
            searchKeys={["name", "description"]}
            itemsPerPage={10}
          />
        )}
      </div>

      {/* Create Category Modal */}
      <Modal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        type="form"
        title="Ajouter une catégorie"
        description="Créer une nouvelle catégorie de produits"
        actions={{
          primary: {
            label: "Créer la catégorie",
            onClick: handleCreate,
            variant: "default",
            disabled: !categoryForm.name,
            loading: isSubmitting,
          },
          secondary: {
            label: "Annuler",
            onClick: () => {
              setIsCreateModalOpen(false);
              setCategoryForm({
                name: "",
                description: "",
                image: "",
                displayOrder: "0",
                parentId: "",
              });
            },
          },
        }}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nom de la catégorie *
            </label>
            <input
              type="text"
              value={categoryForm.name}
              onChange={(e) =>
                setCategoryForm({ ...categoryForm, name: e.target.value })
              }
              placeholder="Ex: Gâteaux spéciaux"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#C5A065]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Catégorie parent (optionnel)
            </label>
            <select
              value={categoryForm.parentId}
              onChange={(e) =>
                setCategoryForm({ ...categoryForm, parentId: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#C5A065]"
            >
              <option value="">Aucune (catégorie racine)</option>
              {getRootCategories().map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Sélectionnez une catégorie parent pour créer une sous-catégorie
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={categoryForm.description}
              onChange={(e) =>
                setCategoryForm({ ...categoryForm, description: e.target.value })
              }
              placeholder="Décrivez cette catégorie..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#C5A065]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Image de la catégorie
            </label>
            <ImageUpload
              value={categoryForm.image}
              onChange={(imageUrl) =>
                setCategoryForm({ ...categoryForm, image: imageUrl })
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ordre d'affichage
            </label>
            <input
              type="number"
              value={categoryForm.displayOrder}
              onChange={(e) =>
                setCategoryForm({ ...categoryForm, displayOrder: e.target.value })
              }
              placeholder="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#C5A065]"
            />
            <p className="text-xs text-gray-500 mt-1">
              Les catégories seront triées par ce numéro (0, 1, 2, etc.)
            </p>
          </div>
        </div>
      </Modal>

      {/* Edit Category Modal */}
      <Modal
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        type="form"
        title="Modifier la catégorie"
        description="Mettre à jour les informations de la catégorie"
        actions={{
          primary: {
            label: "Enregistrer les modifications",
            onClick: handleUpdate,
            variant: "default",
            disabled: !categoryForm.name,
            loading: isSubmitting,
          },
          secondary: {
            label: "Annuler",
            onClick: () => {
              setIsEditModalOpen(false);
              setSelectedCategory(null);
              setCategoryForm({
                name: "",
                description: "",
                image: "",
                displayOrder: "0",
                parentId: "",
              });
            },
          },
        }}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nom de la catégorie *
            </label>
            <input
              type="text"
              value={categoryForm.name}
              onChange={(e) =>
                setCategoryForm({ ...categoryForm, name: e.target.value })
              }
              placeholder="Ex: Gâteaux spéciaux"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#C5A065]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Catégorie parent (optionnel)
            </label>
            <select
              value={categoryForm.parentId}
              onChange={(e) =>
                setCategoryForm({ ...categoryForm, parentId: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#C5A065]"
            >
              <option value="">Aucune (catégorie racine)</option>
              {getRootCategories()
                .filter(cat => cat.id !== selectedCategory?.id)
                .map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Sélectionnez une catégorie parent pour en faire une sous-catégorie
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={categoryForm.description}
              onChange={(e) =>
                setCategoryForm({ ...categoryForm, description: e.target.value })
              }
              placeholder="Décrivez cette catégorie..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#C5A065]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Image de la catégorie
            </label>
            <ImageUpload
              value={categoryForm.image}
              onChange={(imageUrl) =>
                setCategoryForm({ ...categoryForm, image: imageUrl })
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ordre d'affichage
            </label>
            <input
              type="number"
              value={categoryForm.displayOrder}
              onChange={(e) =>
                setCategoryForm({ ...categoryForm, displayOrder: e.target.value })
              }
              placeholder="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#C5A065]"
            />
            <p className="text-xs text-gray-500 mt-1">
              Les catégories seront triées par ce numéro (0, 1, 2, etc.)
            </p>
          </div>
        </div>
      </Modal>

      {/* Category Details Modal */}
      <Modal
        open={isDetailsModalOpen}
        onOpenChange={setIsDetailsModalOpen}
        type="details"
        title={selectedCategory?.name || "Détails de la catégorie"}
        description="Informations complètes de la catégorie"
      >
        {selectedCategory && (
          <div className="space-y-4">
            {selectedCategory.image && (
              <img
                src={getImageUrl(selectedCategory.image)}
                alt={selectedCategory.name}
                className="w-full h-48 object-cover rounded-lg"
              />
            )}
            <div>
              <h3 className="font-semibold text-gray-700">Nom</h3>
              <p className="text-gray-600">{selectedCategory.name}</p>
            </div>
            {selectedCategory.description && (
              <div>
                <h3 className="font-semibold text-gray-700">Description</h3>
                <p className="text-gray-600">{selectedCategory.description}</p>
              </div>
            )}
            <div>
              <h3 className="font-semibold text-gray-700">Ordre d'affichage</h3>
              <p className="text-gray-600">{selectedCategory.displayOrder}</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-700">Statut</h3>
              <p className="text-gray-600">
                {selectedCategory.active ? "Actif" : "Inactif"}
              </p>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        open={isDeleteModalOpen}
        onOpenChange={setIsDeleteModalOpen}
        type="warning"
        title="Supprimer la catégorie"
        description={`Êtes-vous sûr de vouloir supprimer la catégorie "${categoryToDelete?.name}"? Cette action ne peut pas être annulée.`}
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
              setCategoryToDelete(null);
            },
          },
        }}
      >
        <div />
      </Modal>
    </div>
  );
}
