import { useState } from "react";
import { useNavigate } from "react-router-dom";


import {
  Users,
  UserPlus,
  Trash2,
  Edit,
  Search,
  Shield,
  Mail,
  Phone,
  Calendar,
  Settings,
  Eye,
  EyeOff,
  X,
  CheckCircle,
  AlertCircle,
  Clock,
  MoreVertical,
  Key,
  UserCheck,
  Menu,
} from "lucide-react";

interface Staff {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  role: "Admin" | "Manager" | "Vendeur";
  joinDate: string;
  status: "Actif" | "Inactif";
  lastLogin?: string;
}

interface User {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  memberSince: string;
  totalOrders: number;
  totalSpent: number;
  status: "Actif" | "Inactif";
}

interface StaffFormData {
  fullName: string;
  email: string;
  phone: string;
  role: "Admin" | "Manager" | "Vendeur";
  password: string;
}

type ViewMode = "staff" | "users" | "settings";


const MOCK_STAFF: Staff[] = [
  {
    id: 1,
    fullName: "Marie Dubois",
    email: "marie@mariusfanny.com",
    phone: "06 12 34 56 78",
    role: "Admin",
    joinDate: "2022-01-15",
    status: "Actif",
    lastLogin: "2024-02-04 09:30",
  },
  {
    id: 2,
    fullName: "Pierre Martin",
    email: "pierre@mariusfanny.com",
    phone: "06 23 45 67 89",
    role: "Manager",
    joinDate: "2022-06-20",
    status: "Actif",
    lastLogin: "2024-02-03 18:45",
  },
  {
    id: 3,
    fullName: "Sophie Laurent",
    email: "sophie@mariusfanny.com",
    phone: "06 34 56 78 90",
    role: "Vendeur",
    joinDate: "2023-03-10",
    status: "Actif",
    lastLogin: "2024-02-04 08:15",
  },
  {
    id: 4,
    fullName: "Jean Dupont",
    email: "jean@mariusfanny.com",
    phone: "06 45 67 89 01",
    role: "Vendeur",
    joinDate: "2023-09-05",
    status: "Inactif",
    lastLogin: "2024-01-28 16:20",
  },
];

const MOCK_USERS: User[] = [
  {
    id: 1,
    fullName: "Alice Moreau",
    email: "alice.moreau@email.com",
    phone: "06 11 22 33 44",
    memberSince: "2023-05-12",
    totalOrders: 24,
    totalSpent: 856.4,
    status: "Actif",
  },
  {
    id: 2,
    fullName: "Thomas Bernard",
    email: "thomas.b@email.com",
    phone: "06 22 33 44 55",
    memberSince: "2023-08-20",
    totalOrders: 15,
    totalSpent: 542.3,
    status: "Actif",
  },
  {
    id: 3,
    fullName: "Julie Petit",
    email: "julie.petit@email.com",
    phone: "06 33 44 55 66",
    memberSince: "2022-11-03",
    totalOrders: 47,
    totalSpent: 1847.9,
    status: "Actif",
  },
  {
    id: 4,
    fullName: "Marc Rousseau",
    email: "marc.r@email.com",
    phone: "06 44 55 66 77",
    memberSince: "2024-01-15",
    totalOrders: 3,
    totalSpent: 127.5,
    status: "Actif",
  },
  {
    id: 5,
    fullName: "Emma Leroy",
    email: "emma.leroy@email.com",
    phone: "06 55 66 77 88",
    memberSince: "2023-03-22",
    totalOrders: 31,
    totalSpent: 1124.8,
    status: "Inactif",
  },
];

export default function StaffManagement() {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<ViewMode>("staff");
  const [staff, setStaff] = useState<Staff[]>(MOCK_STAFF);
  const [users] = useState<User[]>(MOCK_USERS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState<StaffFormData>({
    fullName: "",
    email: "",
    phone: "",
    role: "Vendeur",
    password: "",
  });

  const gold = "#C5A065";
  const dark = "#2D2A26";

  // Gestion formulaire
  const handleInputChange = (field: keyof StaffFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setFormData({
      fullName: "",
      email: "",
      phone: "",
      role: "Vendeur",
      password: "",
    });
    setEditingStaff(null);
    setShowPassword(false);
  };

  const handleSubmit = () => {
    if (!formData.fullName || !formData.email || !formData.password) {
      alert("Veuillez remplir tous les champs obligatoires.");
      return;
    }

    if (editingStaff) {
      // Modifier
      setStaff(
        staff.map((s) =>
          s.id === editingStaff.id
            ? {
                ...s,
                fullName: formData.fullName,
                email: formData.email,
                phone: formData.phone,
                role: formData.role,
              }
            : s,
        ),
      );
    } else {
      // Créer
      const newStaff: Staff = {
        id: Math.max(...staff.map((s) => s.id)) + 1,
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        role: formData.role,
        joinDate: new Date().toISOString().split("T")[0],
        status: "Actif",
        lastLogin: "-",
      };
      setStaff([...staff, newStaff]);
    }

    setIsModalOpen(false);
    resetForm();
  };

  const handleEdit = (member: Staff) => {
    setEditingStaff(member);
    setFormData({
      fullName: member.fullName,
      email: member.email,
      phone: member.phone,
      role: member.role,
      password: "••••••••", // Placeholder
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: number) => {
    if (
      window.confirm("Voulez-vous vraiment supprimer ce membre du personnel ?")
    ) {
      setStaff(staff.filter((s) => s.id !== id));
    }
  };

  const filteredStaff = staff.filter(
    (s) =>
      s.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.email.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const filteredUsers = users.filter(
    (u) =>
      u.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-[#2D2A26]">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 md:py-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-serif text-[#2D2A26] mb-1 md:mb-2">
                Gestion du Personnel
              </h1>
              <p className="text-sm md:text-base text-gray-500">
                Administration de l'équipe et des utilisateurs
              </p>
            </div>

            {viewMode === "staff" && (
              <button
                onClick={() => {
                  resetForm();
                  setIsModalOpen(true);
                }}
                className="flex items-center justify-center gap-2 bg-[#2D2A26] hover:bg-[#C5A065] text-white px-4 md:px-6 py-2.5 md:py-3 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-sm md:text-base"
              >
                <UserPlus size={20} />
                <span className="font-medium">Nouveau Staff</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Navigation tabs */}
      <div className="bg-white border-b border-gray-100 sticky top-[88px] md:top-[100px] z-30">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <nav className="flex gap-2 md:gap-8 overflow-x-auto">
            <TabButton
              active={viewMode === "staff"}
              onClick={() => setViewMode("staff")}
              icon={<Shield size={18} />}
              label="Personnel"
              count={staff.length}
            />
            <TabButton
              active={viewMode === "users"}
              onClick={() => setViewMode("users")}
              icon={<Users size={18} />}
              label="Utilisateurs"
              count={users.length}
            />
            <TabButton
              active={viewMode === "settings"}
              onClick={() => setViewMode("settings")}
              icon={<Settings size={18} />}
              label="Paramètres"
            />
          </nav>
        </div>
      </div>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 md:px-8 py-4 md:py-8">
        {/* Vue Personnel */}
        {viewMode === "staff" && (
          <div>
            {/* Barre de recherche */}
            <div className="mb-4 md:mb-6">
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type="text"
                  placeholder="Rechercher un membre..."
                  className="w-full pl-10 pr-4 py-2.5 md:py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#C5A065]/50 outline-none text-sm md:text-base"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

<div className="flex justify-end mb-4">
  <button
    onClick={() => navigate("/staff/managements")}
    className="bg-[#C5A065] hover:bg-[#b08f58] text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm md:text-base"
  >
    Gestion du staff
  </button>
</div>

            {/* Stats Cards - Responsive Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
              <StatsCard
                title="Total Personnel"
                value={staff.length}
                color="blue"
              />
              <StatsCard
                title="Actifs"
                value={staff.filter((s) => s.status === "Actif").length}
                color="green"
              />
              <StatsCard
                title="Admins"
                value={staff.filter((s) => s.role === "Admin").length}
                color="purple"
              />
              <StatsCard
                title="Vendeurs"
                value={staff.filter((s) => s.role === "Vendeur").length}
                color="gold"
              />
            </div>

            {/* Desktop Table View */}
            <div className="hidden lg:block bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="text-left p-4 text-sm font-semibold text-gray-600">
                        Membre
                      </th>
                      <th className="text-left p-4 text-sm font-semibold text-gray-600">
                        Contact
                      </th>
                      <th className="text-left p-4 text-sm font-semibold text-gray-600">
                        Rôle
                      </th>
                      <th className="text-left p-4 text-sm font-semibold text-gray-600">
                        Date d'arrivée
                      </th>
                      <th className="text-left p-4 text-sm font-semibold text-gray-600">
                        Statut
                      </th>
                      <th className="text-left p-4 text-sm font-semibold text-gray-600">
                        Dernière connexion
                      </th>
                      <th className="text-right p-4 text-sm font-semibold text-gray-600">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStaff.map((member) => (
                      <tr
                        key={member.id}
                        className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                      >
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-[#C5A065] text-white flex items-center justify-center font-bold text-sm">
                              {member.fullName
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </div>
                            <div>
                              <p className="font-semibold text-[#2D2A26]">
                                {member.fullName}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Mail size={14} />
                              <span>{member.email}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Phone size={14} />
                              <span>{member.phone}</span>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <RoleBadge role={member.role} />
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Calendar size={14} />
                            <span>
                              {new Date(member.joinDate).toLocaleDateString(
                                "fr-FR",
                              )}
                            </span>
                          </div>
                        </td>
                        <td className="p-4">
                          <StatusBadge status={member.status} />
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Clock size={14} />
                            <span>{member.lastLogin}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleEdit(member)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            >
                              <Edit size={18} />
                            </button>
                            <button
                              onClick={() => handleDelete(member.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile Card View */}
            <div className="lg:hidden space-y-4">
              {filteredStaff.map((member) => (
                <div
                  key={member.id}
                  className="bg-white rounded-xl shadow-sm border border-gray-100 p-4"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-[#C5A065] text-white flex items-center justify-center font-bold shrink-0">
                        {member.fullName
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </div>
                      <div>
                        <h3 className="font-semibold text-[#2D2A26]">
                          {member.fullName}
                        </h3>
                        <RoleBadge role={member.role} />
                      </div>
                    </div>
                    <StatusBadge status={member.status} />
                  </div>

                  <div className="space-y-2 mb-3 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Mail size={14} className="shrink-0" />
                      <span className="truncate">{member.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Phone size={14} className="shrink-0" />
                      <span>{member.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar size={14} className="shrink-0" />
                      <span>
                        Arrivé le{" "}
                        {new Date(member.joinDate).toLocaleDateString("fr-FR")}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-500">
                      <Clock size={14} className="shrink-0" />
                      <span>Dernière connexion: {member.lastLogin}</span>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-3 border-t border-gray-100">
                    <button
                      onClick={() => handleEdit(member)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors text-sm font-medium"
                    >
                      <Edit size={16} />
                      <span>Modifier</span>
                    </button>
                    <button
                      onClick={() => handleDelete(member.id)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors text-sm font-medium"
                    >
                      <Trash2 size={16} />
                      <span>Supprimer</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Vue Utilisateurs */}
        {viewMode === "users" && (
          <div>
            {/* Barre de recherche */}
            <div className="mb-4 md:mb-6">
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type="text"
                  placeholder="Rechercher un utilisateur..."
                  className="w-full pl-10 pr-4 py-2.5 md:py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#C5A065]/50 outline-none text-sm md:text-base"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Stats Cards - Responsive Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
              <StatsCard
                title="Total Utilisateurs"
                value={users.length}
                color="blue"
              />
              <StatsCard
                title="Actifs"
                value={users.filter((u) => u.status === "Actif").length}
                color="green"
              />
              <StatsCard
                title="Total Commandes"
                value={users.reduce((sum, u) => sum + u.totalOrders, 0)}
                color="purple"
              />
              <StatsCard
                title="Revenus"
                value={`${users.reduce((sum, u) => sum + u.totalSpent, 0).toFixed(2)} $`}
                color="gold"
              />
            </div>

            {/* Desktop Table View */}
            <div className="hidden lg:block bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="text-left p-4 text-sm font-semibold text-gray-600">
                        Utilisateur
                      </th>
                      <th className="text-left p-4 text-sm font-semibold text-gray-600">
                        Contact
                      </th>
                      <th className="text-left p-4 text-sm font-semibold text-gray-600">
                        Membre depuis
                      </th>
                      <th className="text-left p-4 text-sm font-semibold text-gray-600">
                        Commandes
                      </th>
                      <th className="text-left p-4 text-sm font-semibold text-gray-600">
                        Total dépensé
                      </th>
                      <th className="text-left p-4 text-sm font-semibold text-gray-600">
                        Statut
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user) => (
                      <tr
                        key={user.id}
                        className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                      >
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-sm">
                              {user.fullName
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </div>
                            <div>
                              <p className="font-semibold text-[#2D2A26]">
                                {user.fullName}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Mail size={14} />
                              <span>{user.email}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Phone size={14} />
                              <span>{user.phone}</span>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Calendar size={14} />
                            <span>
                              {new Date(user.memberSince).toLocaleDateString(
                                "fr-FR",
                              )}
                            </span>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="font-semibold text-[#2D2A26]">
                            {user.totalOrders}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className="font-semibold text-green-600">
                            {user.totalSpent.toFixed(2)} $
                          </span>
                        </td>
                        <td className="p-4">
                          <StatusBadge status={user.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile Card View */}
            <div className="lg:hidden space-y-4">
              {filteredUsers.map((user) => (
                <div
                  key={user.id}
                  className="bg-white rounded-xl shadow-sm border border-gray-100 p-4"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold shrink-0">
                        {user.fullName
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </div>
                      <div>
                        <h3 className="font-semibold text-[#2D2A26]">
                          {user.fullName}
                        </h3>
                        <p className="text-xs text-gray-500">
                          Membre depuis{" "}
                          {new Date(user.memberSince).toLocaleDateString(
                            "fr-FR",
                          )}
                        </p>
                      </div>
                    </div>
                    <StatusBadge status={user.status} />
                  </div>

                  <div className="space-y-2 mb-3 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Mail size={14} className="shrink-0" />
                      <span className="truncate">{user.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Phone size={14} className="shrink-0" />
                      <span>{user.phone}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-100">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Commandes</p>
                      <p className="font-semibold text-[#2D2A26]">
                        {user.totalOrders}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">
                        Total dépensé
                      </p>
                      <p className="font-semibold text-green-600">
                        {user.totalSpent.toFixed(2)} $
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Vue Paramètres */}
        {viewMode === "settings" && (
          <div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-8 max-w-2xl">
              <h3 className="text-lg md:text-xl font-serif text-[#2D2A26] mb-4 md:mb-6">
                Paramètres de sécurité
              </h3>

              <div className="space-y-4 md:space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Ancien mot de passe
                  </label>
                  <input
                    type="password"
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#C5A065]/50 outline-none text-sm md:text-base"
                    placeholder="••••••••"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Nouveau mot de passe
                  </label>
                  <input
                    type="password"
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#C5A065]/50 outline-none text-sm md:text-base"
                    placeholder="••••••••"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Confirmer le mot de passe
                  </label>
                  <input
                    type="password"
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#C5A065]/50 outline-none text-sm md:text-base"
                    placeholder="••••••••"
                  />
                </div>

                <button className="w-full bg-[#2D2A26] hover:bg-[#C5A065] text-white font-medium py-3 rounded-lg transition-colors text-sm md:text-base">
                  Mettre à jour le mot de passe
                </button>
              </div>

              <hr className="my-6 md:my-8 border-gray-200" />

              <div className="space-y-4">
                <h4 className="font-serif text-base md:text-lg text-[#2D2A26] mb-4">
                  Préférences de notification
                </h4>

                <label className="flex items-center justify-between p-3 md:p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                  <span className="text-sm md:text-base text-gray-700">
                    Notifications par email
                  </span>
                  <input
                    type="checkbox"
                    defaultChecked
                    className="w-5 h-5 text-[#C5A065]"
                  />
                </label>

                <label className="flex items-center justify-between p-3 md:p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                  <span className="text-sm md:text-base text-gray-700">
                    Alertes de stock bas
                  </span>
                  <input
                    type="checkbox"
                    defaultChecked
                    className="w-5 h-5 text-[#C5A065]"
                  />
                </label>

                <label className="flex items-center justify-between p-3 md:p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                  <span className="text-sm md:text-base text-gray-700">
                    Rapport hebdomadaire
                  </span>
                  <input type="checkbox" className="w-5 h-5 text-[#C5A065]" />
                </label>
              </div>

              <button className="w-full bg-[#2D2A26] hover:bg-[#C5A065] text-white font-medium py-3 rounded-lg transition-colors mt-6 text-sm md:text-base">
                Enregistrer les préférences
              </button>
            </div>
          </div>
        )}
      </main>

      {/* MODAL AJOUT/MODIFICATION STAFF */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
            <div className="p-4 md:p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50 sticky top-0">
              <h3 className="text-lg md:text-xl font-serif text-[#2D2A26] flex items-center gap-2">
                <UserPlus className="text-[#C5A065]" size={20} />
                {editingStaff
                  ? "Modifier le membre"
                  : "Nouveau membre du personnel"}
              </h3>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  resetForm();
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-4 md:p-8 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Nom complet *
                </label>
                <input
                  type="text"
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#C5A065]/50 outline-none text-sm md:text-base"
                  placeholder="Ex: Marie Dubois"
                  value={formData.fullName}
                  onChange={(e) =>
                    handleInputChange("fullName", e.target.value)
                  }
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Email *
                </label>
                <input
                  type="email"
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#C5A065]/50 outline-none text-sm md:text-base"
                  placeholder="prenom@mariusfanny.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Téléphone
                </label>
                <input
                  type="tel"
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#C5A065]/50 outline-none text-sm md:text-base"
                  placeholder="06 12 34 56 78"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Rôle *
                </label>
                <select
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#C5A065]/50 outline-none text-sm md:text-base"
                  value={formData.role}
                  onChange={(e) =>
                    handleInputChange("role", e.target.value as any)
                  }
                >
                  <option value="Vendeur">Vendeur</option>
                  <option value="Manager">Manager</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  {editingStaff
                    ? "Nouveau mot de passe (laisser vide pour conserver)"
                    : "Mot de passe *"}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#C5A065]/50 outline-none pr-12 text-sm md:text-base"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) =>
                      handleInputChange("password", e.target.value)
                    }
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <button
                onClick={handleSubmit}
                className="w-full bg-[#2D2A26] hover:bg-[#C5A065] text-white font-medium py-3 rounded-lg transition-colors mt-6 flex items-center justify-center gap-2 text-sm md:text-base"
              >
                <CheckCircle size={20} />
                {editingStaff
                  ? "Enregistrer les modifications"
                  : "Créer le membre"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// --- COMPOSANTS ---

interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  count?: number;
}

function TabButton({ active, onClick, icon, label, count }: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-3 md:px-4 py-3 md:py-4 font-medium transition-all border-b-2 whitespace-nowrap text-sm md:text-base ${
        active
          ? "border-[#C5A065] text-[#C5A065]"
          : "border-transparent text-gray-500 hover:text-[#2D2A26]"
      }`}
    >
      {icon}
      <span>{label}</span>
      {count !== undefined && (
        <span
          className={`px-2 py-0.5 rounded-full text-xs font-bold ${
            active ? "bg-[#C5A065] text-white" : "bg-gray-200 text-gray-600"
          }`}
        >
          {count}
        </span>
      )}
    </button>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles =
    status === "Actif"
      ? "bg-green-100 text-green-700 border-green-200"
      : "bg-gray-100 text-gray-700 border-gray-200";

  return (
    <span
      className={`px-2 md:px-3 py-1 rounded-full text-xs font-semibold border ${styles} whitespace-nowrap`}
    >
      {status}
    </span>
  );
}

function RoleBadge({ role }: { role: string }) {
  const styles =
    role === "Admin"
      ? "bg-red-500 text-white"
      : role === "Manager"
        ? "bg-[#C5A065] text-white"
        : "bg-blue-500 text-white";

  return (
    <span
      className={`inline-block px-2 md:px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${styles}`}
    >
      {role}
    </span>
  );
}

interface StatsCardProps {
  title: string;
  value: string | number;
  color: "blue" | "green" | "red" | "purple" | "gold";
}

function StatsCard({ title, value, color }: StatsCardProps) {
  const colorClasses = {
    blue: "bg-blue-100 text-blue-600",
    green: "bg-green-100 text-green-600",
    red: "bg-red-100 text-red-600",
    purple: "bg-purple-100 text-purple-600",
    gold: "bg-amber-100 text-amber-700",
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-6">
      <p className="text-xs md:text-sm text-gray-500 mb-2 uppercase tracking-wider font-semibold">
        {title}
      </p>
      <h3 className="text-2xl md:text-3xl font-bold text-[#2D2A26]">{value}</h3>
    </div>
  );
}
