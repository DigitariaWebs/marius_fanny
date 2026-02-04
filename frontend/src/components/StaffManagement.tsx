import { useState } from "react";
import {
  Users,
  Plus,
  Edit,
  Trash2,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  MoreVertical,
  Edit2,
} from "lucide-react";
import { DataTable } from "./ui/DataTable";
import { Modal } from "./ui/modal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import type { Staff, StaffFormData } from "../types";

const MOCK_STAFF: Staff[] = [
  {
    id: 1,
    firstName: "Marie",
    lastName: "Dubois",
    email: "marie.dubois@mariusetfanny.com",
    phone: "514-555-0101",
    location: "Montreal",
    department: "customer_service",
    status: "active",
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-01-15T10:00:00Z",
  },
  {
    id: 2,
    firstName: "Jean",
    lastName: "Tremblay",
    email: "jean.tremblay@mariusetfanny.com",
    phone: "450-555-0202",
    location: "Laval",
    department: "kitchen_staff",
    status: "active",
    createdAt: "2024-01-20T10:00:00Z",
    updatedAt: "2024-01-20T10:00:00Z",
  },
  {
    id: 3,
    firstName: "Sophie",
    lastName: "Laurent",
    email: "sophie.laurent@mariusetfanny.com",
    phone: "514-555-0303",
    location: "Montreal",
    department: "customer_service",
    status: "suspended",
    createdAt: "2024-02-01T10:00:00Z",
    updatedAt: "2024-02-01T10:00:00Z",
  },
  {
    id: 4,
    firstName: "Pierre",
    lastName: "Martin",
    email: "pierre.martin@mariusetfanny.com",
    phone: "450-555-0404",
    location: "Laval",
    department: "customer_service",
    status: "active",
    createdAt: "2024-02-10T10:00:00Z",
    updatedAt: "2024-02-10T10:00:00Z",
  },
];

const LOCATIONS = [
  { value: "Montreal", label: "Montréal" },
  { value: "Laval", label: "Laval" },
];

const DEPARTMENTS = [
  { value: "customer_service", label: "Service Client" },
  { value: "kitchen_staff", label: "Personnel de Cuisine" },
];

export default function StaffManagement() {
  const [staff, setStaff] = useState<Staff[]>(MOCK_STAFF);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [deletingStaff, setDeletingStaff] = useState<Staff | null>(null);
  const [formData, setFormData] = useState<StaffFormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    location: "Montreal",
    department: "customer_service",
  });
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);

  const resetForm = () => {
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      location: "Montreal",
      department: "customer_service",
    });
    setPassword("");
    setPasswordConfirmation("");
    setEditingStaff(null);
  };

  const handleInputChange = (field: keyof StaffFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validateForm = (includePassword = false): boolean => {
    if (!formData.firstName.trim()) {
      setErrorMessage("Veuillez entrer le prénom du membre du personnel.");
      setIsErrorModalOpen(true);
      return false;
    }
    if (!formData.lastName.trim()) {
      setErrorMessage(
        "Veuillez entrer le nom de famille du membre du personnel.",
      );
      setIsErrorModalOpen(true);
      return false;
    }
    if (!formData.email.trim() || !formData.email.includes("@")) {
      setErrorMessage("Veuillez entrer une adresse email valide.");
      setIsErrorModalOpen(true);
      return false;
    }
    if (!formData.phone.trim()) {
      setErrorMessage("Veuillez entrer un numéro de téléphone.");
      setIsErrorModalOpen(true);
      return false;
    }
    if (includePassword) {
      if (!password.trim()) {
        setErrorMessage("Veuillez entrer un mot de passe.");
        setIsErrorModalOpen(true);
        return false;
      }
      if (password.length < 6) {
        setErrorMessage("Le mot de passe doit contenir au moins 6 caractères.");
        setIsErrorModalOpen(true);
        return false;
      }
      if (password !== passwordConfirmation) {
        setErrorMessage("Les mots de passe ne correspondent pas.");
        setIsErrorModalOpen(true);
        return false;
      }
    }
    return true;
  };

  const handleCreate = () => {
    if (!validateForm(true)) return;

    setIsSubmitting(true);
    setTimeout(() => {
      const newStaff: Staff = {
        id: Math.max(...staff.map((s) => s.id)) + 1,
        ...formData,
        status: "active",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setStaff([...staff, newStaff]);
      setIsCreateModalOpen(false);
      resetForm();
      setIsSubmitting(false);
    }, 300);
  };

  const handleEditClick = (staffMember: Staff) => {
    setEditingStaff(staffMember);
    setFormData({
      firstName: staffMember.firstName,
      lastName: staffMember.lastName,
      email: staffMember.email,
      phone: staffMember.phone,
      location: staffMember.location,
      department: staffMember.department,
    });
    setIsEditModalOpen(true);
  };

  const handleEdit = () => {
    if (!validateForm(false) || !editingStaff) return;

    setIsSubmitting(true);
    setTimeout(() => {
      setStaff(
        staff.map((s) =>
          s.id === editingStaff.id
            ? {
                ...s,
                ...formData,
                updatedAt: new Date().toISOString(),
              }
            : s,
        ),
      );
      setIsEditModalOpen(false);
      resetForm();
      setIsSubmitting(false);
    }, 300);
  };

  const handleDeleteClick = (staffMember: Staff) => {
    setDeletingStaff(staffMember);
    setIsDeleteModalOpen(true);
  };

  const getFullName = (staff: Staff) => {
    return `${staff.firstName} ${staff.lastName}`;
  };

  const handleToggleStatus = (staffMember: Staff) => {
    setStaff(
      staff.map((s) =>
        s.id === staffMember.id
          ? {
              ...s,
              status: s.status === "active" ? "suspended" : "active",
              updatedAt: new Date().toISOString(),
            }
          : s,
      ),
    );
  };

  const handleDelete = () => {
    if (!deletingStaff) return;

    setIsSubmitting(true);
    setTimeout(() => {
      setStaff(staff.filter((s) => s.id !== deletingStaff.id));
      setIsDeleteModalOpen(false);
      setDeletingStaff(null);
      setIsSubmitting(false);
    }, 300);
  };

  const getDepartmentLabel = (dept: string) => {
    return DEPARTMENTS.find((d) => d.value === dept)?.label || dept;
  };

  const getLocationLabel = (loc: string) => {
    return LOCATIONS.find((l) => l.value === loc)?.label || loc;
  };

  // DataTable configuration
  const columns = [
    {
      key: "firstName",
      label: "Nom",
      sortable: true,
      render: (item: Staff) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[#C5A065] text-white flex items-center justify-center font-semibold text-sm">
            {item.firstName.charAt(0).toUpperCase()}
          </div>
          <span className="font-medium text-[#2D2A26]">
            {getFullName(item)}
          </span>
        </div>
      ),
    },
    {
      key: "email",
      label: "Email",
      sortable: true,
      render: (item: Staff) => (
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Mail size={14} className="text-gray-400" />
          {item.email}
        </div>
      ),
    },
    {
      key: "phone",
      label: "Téléphone",
      sortable: false,
      render: (item: Staff) => (
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Phone size={14} className="text-gray-400" />
          {item.phone}
        </div>
      ),
    },
    {
      key: "location",
      label: "Emplacement",
      sortable: true,
      render: (item: Staff) => (
        <div className="flex items-center gap-2">
          <MapPin size={14} className="text-[#C5A065]" />
          <span className="text-sm font-medium">
            {getLocationLabel(item.location)}
          </span>
        </div>
      ),
    },
    {
      key: "department",
      label: "Département",
      sortable: true,
      render: (item: Staff) => (
        <div className="flex items-center gap-2">
          <Briefcase size={14} className="text-[#C5A065]" />
          <span className="text-sm">{getDepartmentLabel(item.department)}</span>
        </div>
      ),
    },
    {
      key: "status",
      label: "Statut",
      sortable: true,
      render: (item: Staff) => (
        <button
          onClick={() => handleToggleStatus(item)}
          className="flex items-center gap-2 cursor-pointer"
          title={`Cliquez pour ${item.status === "active" ? "suspendre" : "activer"}`}
        >
          {item.status === "active" ? (
            <span className="px-3 py-1 rounded-full text-xs font-semibold border bg-green-100 text-green-700 border-green-200">
              Actif
            </span>
          ) : (
            <span className="px-3 py-1 rounded-full text-xs font-semibold border bg-red-100 text-red-700 border-red-200">
              Suspendu
            </span>
          )}
        </button>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      sortable: false,
      render: (staff: Staff) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <MoreVertical className="w-4 h-4 text-gray-600" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={() => handleEditClick(staff)}>
              <Edit2 className="w-4 h-4 mr-2" />
              Modifier
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleToggleStatus(staff)}
              className="text-orange-600"
            >
              <Users className="w-4 h-4 mr-2" />
              {staff.status === "active" ? "Suspendre" : "Activer"}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => handleDeleteClick(staff)}
              className="text-red-600"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Supprimer
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  const filters = [
    {
      key: "location",
      label: "Filtrer par localisation",
      options: [
        { value: "all", label: "Toutes les localisations" },
        { value: "Montreal", label: "Montreal" },
        { value: "Laval", label: "Laval" },
      ],
    },
    {
      key: "department",
      label: "Filtrer par département",
      options: [
        { value: "all", label: "Tous les départements" },
        { value: "customer_service", label: "Service client" },
        { value: "kitchen_staff", label: "Cuisine" },
      ],
    },
    {
      key: "status",
      label: "Filtrer par statut du compte",
      options: [
        { value: "all", label: "Tous les statuts" },
        { value: "active", label: "Comptes actifs" },
        { value: "suspended", label: "Comptes suspendus" },
      ],
    },
  ];

  // Available departments based on selected location
  const getAvailableDepartments = (location: string) => {
    if (location === "Laval") {
      return DEPARTMENTS;
    }
    return DEPARTMENTS.filter((d) => d.value === "customer_service");
  };

  // Update department if location changes and current department is not available
  const handleLocationChange = (newLocation: string) => {
    handleInputChange("location", newLocation);
    const availableDepts = getAvailableDepartments(newLocation);
    if (!availableDepts.find((d) => d.value === formData.department)) {
      handleInputChange("department", "customer_service");
    }
  };

  return (
    <>
      <header className="bg-white shadow-sm border-b border-gray-100 p-4 md:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-serif text-[#2D2A26]">
              Gestion du Personnel
            </h2>
            <p className="text-sm md:text-base text-gray-500 mt-1">
              Gérer les membres de l'équipe
            </p>
          </div>
          <button
            onClick={() => {
              resetForm();
              setIsCreateModalOpen(true);
            }}
            className="flex items-center gap-2 bg-[#2D2A26] hover:bg-[#C5A065] text-white px-4 md:px-6 py-2.5 md:py-3 rounded-lg transition-colors text-sm md:text-base whitespace-nowrap"
          >
            <Plus size={20} />
            <span>Ajouter un membre</span>
          </button>
        </div>
      </header>

      <div className="p-4 md:p-8">
        <DataTable
          data={staff}
          columns={columns}
          filters={filters}
          searchPlaceholder="Rechercher un membre du personnel..."
          searchKeys={["firstName", "lastName", "email", "phone"]}
          itemsPerPage={10}
          selectable={false}
        />
      </div>

      {/* Create Staff Modal */}
      <Modal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        type="form"
        title="Ajouter un membre du personnel"
        description="Remplissez les informations pour créer un nouveau membre du personnel"
        icon={<Users className="h-6 w-6 text-[#C5A065]" />}
        actions={{
          primary: {
            label: "Créer",
            onClick: handleCreate,
            disabled: isSubmitting,
            loading: isSubmitting,
          },
          secondary: {
            label: "Annuler",
            onClick: () => {
              setIsCreateModalOpen(false);
              resetForm();
            },
            disabled: isSubmitting,
          },
        }}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Prénom <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#C5A065]/50 outline-none text-sm"
                placeholder="Ex: Marie"
                value={formData.firstName}
                onChange={(e) => handleInputChange("firstName", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Nom de famille <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#C5A065]/50 outline-none text-sm"
                placeholder="Ex: Dubois"
                value={formData.lastName}
                onChange={(e) => handleInputChange("lastName", e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#C5A065]/50 outline-none text-sm"
              placeholder="Ex: marie.dubois@mariusetfanny.com"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Téléphone <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#C5A065]/50 outline-none text-sm"
              placeholder="Ex: 514-555-0101"
              value={formData.phone}
              onChange={(e) => handleInputChange("phone", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Mot de passe <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#C5A065]/50 outline-none text-sm"
              placeholder="Minimum 6 caractères"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Confirmer le mot de passe <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#C5A065]/50 outline-none text-sm"
              placeholder="Confirmez le mot de passe"
              value={passwordConfirmation}
              onChange={(e) => setPasswordConfirmation(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Emplacement <span className="text-red-500">*</span>
              </label>
              <select
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#C5A065]/50 outline-none text-sm"
                value={formData.location}
                onChange={(e) => handleLocationChange(e.target.value)}
              >
                {LOCATIONS.map((loc) => (
                  <option key={loc.value} value={loc.value}>
                    {loc.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Département <span className="text-red-500">*</span>
              </label>
              <select
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#C5A065]/50 outline-none text-sm"
                value={formData.department}
                onChange={(e) =>
                  handleInputChange("department", e.target.value)
                }
              >
                {getAvailableDepartments(formData.location).map((dept) => (
                  <option key={dept.value} value={dept.value}>
                    {dept.label}
                  </option>
                ))}
              </select>
              {formData.location === "Montreal" && (
                <p className="text-xs text-gray-500">
                  Personnel de cuisine disponible uniquement à Laval
                </p>
              )}
            </div>
          </div>
        </div>
      </Modal>

      {/* Edit Staff Modal */}
      <Modal
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        type="form"
        title="Modifier le membre du personnel"
        description="Modifiez les informations du membre du personnel"
        icon={<Edit className="h-6 w-6 text-blue-500" />}
        actions={{
          primary: {
            label: "Enregistrer",
            onClick: handleEdit,
            disabled: isSubmitting,
            loading: isSubmitting,
          },
          secondary: {
            label: "Annuler",
            onClick: () => {
              setIsEditModalOpen(false);
              resetForm();
            },
            disabled: isSubmitting,
          },
          tertiary: editingStaff
            ? {
                label:
                  editingStaff.status === "active" ? "Suspendre" : "Activer",
                onClick: () => {
                  if (editingStaff) {
                    handleToggleStatus(editingStaff);
                    setIsEditModalOpen(false);
                    resetForm();
                  }
                },
                variant:
                  editingStaff.status === "active" ? "destructive" : "default",
                disabled: isSubmitting,
              }
            : undefined,
        }}
      >
        <div className="space-y-4">
          {editingStaff && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-700">
                    Statut actuel
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Utilisez le bouton ci-dessous pour changer le statut
                  </p>
                </div>
                {editingStaff.status === "active" ? (
                  <span className="px-3 py-1 rounded-full text-xs font-semibold border bg-green-100 text-green-700 border-green-200">
                    Actif
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded-full text-xs font-semibold border bg-red-100 text-red-700 border-red-200">
                    Suspendu
                  </span>
                )}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Prénom <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#C5A065]/50 outline-none text-sm"
                placeholder="Ex: Marie"
                value={formData.firstName}
                onChange={(e) => handleInputChange("firstName", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Nom de famille <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#C5A065]/50 outline-none text-sm"
                placeholder="Ex: Dubois"
                value={formData.lastName}
                onChange={(e) => handleInputChange("lastName", e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#C5A065]/50 outline-none text-sm"
              placeholder="Ex: marie.dubois@mariusetfanny.com"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Téléphone <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#C5A065]/50 outline-none text-sm"
              placeholder="Ex: 514-555-0101"
              value={formData.phone}
              onChange={(e) => handleInputChange("phone", e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Emplacement <span className="text-red-500">*</span>
              </label>
              <select
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#C5A065]/50 outline-none text-sm"
                value={formData.location}
                onChange={(e) => handleLocationChange(e.target.value)}
              >
                {LOCATIONS.map((loc) => (
                  <option key={loc.value} value={loc.value}>
                    {loc.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Département <span className="text-red-500">*</span>
              </label>
              <select
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#C5A065]/50 outline-none text-sm"
                value={formData.department}
                onChange={(e) =>
                  handleInputChange("department", e.target.value)
                }
              >
                {getAvailableDepartments(formData.location).map((dept) => (
                  <option key={dept.value} value={dept.value}>
                    {dept.label}
                  </option>
                ))}
              </select>
              {formData.location === "Montreal" && (
                <p className="text-xs text-gray-500">
                  Personnel de cuisine disponible uniquement à Laval
                </p>
              )}
            </div>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        open={isDeleteModalOpen}
        onOpenChange={setIsDeleteModalOpen}
        type="warning"
        title="Supprimer le membre du personnel"
        description={
          deletingStaff
            ? `Êtes-vous sûr de vouloir supprimer ${getFullName(deletingStaff)} ? Cette action est irréversible.`
            : ""
        }
        closable={!isSubmitting}
        actions={{
          primary: {
            label: "Supprimer",
            onClick: handleDelete,
            variant: "destructive",
            disabled: isSubmitting,
            loading: isSubmitting,
          },
          secondary: {
            label: "Annuler",
            onClick: () => {
              setIsDeleteModalOpen(false);
              setDeletingStaff(null);
            },
            disabled: isSubmitting,
          },
        }}
      >
        {deletingStaff && (
          <div className="space-y-3 py-2">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Trash2 className="text-red-600 shrink-0 mt-0.5" size={20} />
                <div className="flex-1">
                  <p className="text-sm font-medium text-red-900 mb-1">
                    Informations du membre
                  </p>
                  <div className="text-sm text-red-700 space-y-1">
                    <p>
                      <strong>Nom:</strong> {getFullName(deletingStaff)}
                    </p>
                    <p>
                      <strong>Email:</strong> {deletingStaff.email}
                    </p>
                    <p>
                      <strong>Emplacement:</strong>{" "}
                      {getLocationLabel(deletingStaff.location)}
                    </p>
                    <p>
                      <strong>Statut:</strong>{" "}
                      {deletingStaff.status === "active" ? "Actif" : "Suspendu"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Error Modal */}
      <Modal
        open={isErrorModalOpen}
        onOpenChange={setIsErrorModalOpen}
        type="warning"
        title="Erreur de validation"
        actions={{
          primary: {
            label: "OK",
            onClick: () => setIsErrorModalOpen(false),
          },
        }}
      >
        <p className="text-sm text-gray-700">{errorMessage}</p>
      </Modal>
    </>
  );
}
