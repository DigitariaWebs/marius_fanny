import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChefHat,
  ShoppingCart,
  Clock,
  CheckCircle,
  Package,
  AlertCircle,
  Bell,
  Users,
  TrendingUp,
  Calendar,
  MessageSquare,
  UserCircle,
  LogOut,
  Menu,
  X,
  Settings,
  Activity,
} from "lucide-react";
import { authClient } from "../lib/AuthClient";

interface Staff {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  location: string;
  role: "kitchen_staff" | "customer_service";
  status: "active" | "busy" | "offline";
  createdAt: string;
  updatedAt: string;
}

interface RecentActivity {
  id: string;
  type: "order_assigned" | "dish_prepared" | "ticket_closed" | "status_changed";
  description: string;
  time: string;
  icon: React.ReactNode;
}

interface Notification {
  id: string;
  type: "new_ticket" | "alert" | "info";
  message: string;
  time: string;
  isRead: boolean;
}

export default function StaffDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState<Staff | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "1",
      type: "new_ticket",
      message: "Nouveau ticket: Commande CMD-2045 nécessite attention",
      time: "Il y a 5 min",
      isRead: false,
    },
    {
      id: "2",
      type: "alert",
      message: "Stock faible: Farine T55",
      time: "Il y a 15 min",
      isRead: false,
    },
    {
      id: "3",
      type: "info",
      message: "Réunion d'équipe demain à 9h",
      time: "Il y a 1h",
      isRead: true,
    },
  ]);

  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([
    {
      id: "1",
      type: "order_assigned",
      description: "Commande CMD-2050 assignée",
      time: "Il y a 10 min",
      icon: <Package className="w-4 h-4" />,
    },
    {
      id: "2",
      type: "dish_prepared",
      description: "15 Croissants au Beurre préparés",
      time: "Il y a 25 min",
      icon: <CheckCircle className="w-4 h-4" />,
    },
    {
      id: "3",
      type: "ticket_closed",
      description: "Ticket #1234 résolu",
      time: "Il y a 45 min",
      icon: <MessageSquare className="w-4 h-4" />,
    },
    {
      id: "4",
      type: "status_changed",
      description: "Statut changé: Disponible",
      time: "Il y a 2h",
      icon: <Activity className="w-4 h-4" />,
    },
  ]);

  // Check authentication and get user role
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const session = await authClient.getSession();
        
        if (!session?.data) {
          navigate("/se-connecter");
          return;
        }

        // IMPORTANT: Récupérer le rôle depuis votre backend
        // Adaptez selon votre structure de données
        const userRole = session.data.user?.user_metadata?.role || 
                        session.data.user?.role ||
                        "kitchen_staff"; // Par défaut

        // Créer un objet user basé sur le rôle
        const userData: Staff = {
          id: session.data.user?.id || 1,
          firstName: session.data.user?.user_metadata?.firstName || "Chef",
          lastName: session.data.user?.user_metadata?.lastName || "Marius",
          email: session.data.user?.email || "staff@mariusfanny.com",
          phone: "514-555-0100",
          location: "Montreal",
          role: userRole as "kitchen_staff" | "customer_service",
          status: "active",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        setUser(userData);
        setLoading(false);
      } catch (error) {
        console.error("Session check error:", error);
        navigate("/se-connecter");
      }
    };

    checkAuth();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await authClient.signOut();
      navigate("/se-connecter");
    } catch (error) {
      console.error("Logout error:", error);
      navigate("/se-connecter");
    }
  };

  const handleStatusChange = (newStatus: Staff["status"]) => {
    if (!user) return;
    
    setUser({ ...user, status: newStatus });
    setRecentActivities([
      {
        id: Date.now().toString(),
        type: "status_changed",
        description: `Statut changé: ${newStatus === "active" ? "Disponible" : newStatus === "busy" ? "Occupé" : "Hors ligne"}`,
        time: "À l'instant",
        icon: <Activity className="w-4 h-4" />,
      },
      ...recentActivities,
    ]);
  };

  const navigateToRole = () => {
    if (!user) return;
    
    if (user.role === "kitchen_staff") {
      navigate("/staff/production");
    } else {
      navigate("/staff/commandes");
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#C5A065] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  // Statistiques basées sur le rôle
  const stats =
    user.role === "kitchen_staff"
      ? {
          pending: 12,
          inProgress: 8,
          completed: 45,
          avgTime: "25 min",
        }
      : {
          pending: 7,
          confirmed: 18,
          ready: 23,
          avgTime: "15 min",
        };

  const unreadNotifications = notifications.filter((n) => !n.isRead).length;

  const statusConfig = {
    active: {
      label: "Disponible",
      color: "bg-green-500",
      textColor: "text-green-700",
      bgColor: "bg-green-50",
    },
    busy: {
      label: "Occupé",
      color: "bg-yellow-500",
      textColor: "text-yellow-700",
      bgColor: "bg-yellow-50",
    },
    offline: {
      label: "Hors ligne",
      color: "bg-gray-500",
      textColor: "text-gray-700",
      bgColor: "bg-gray-50",
    },
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* SIDEBAR DESKTOP */}
      <aside className="hidden lg:flex flex-col w-64 bg-[#2D2A26] text-white">
        <div className="p-6 border-b border-gray-700">
          <img src="/logo.avif" alt="Logo" className="h-12 w-auto mb-4" />
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#C5A065] flex items-center justify-center font-bold">
              {user.firstName[0]}
              {user.lastName[0]}
            </div>
            <div>
              <p className="font-semibold text-sm">
                {user.firstName} {user.lastName}
              </p>
              <p className="text-xs text-gray-400">
                {user.role === "kitchen_staff" ? "Cuisine" : "Service Client"}
              </p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <NavItem
            icon={<Activity size={20} />}
            label="Tableau de bord"
            active={true}
          />
          <NavItem
            icon={
              user.role === "kitchen_staff" ? (
                <ChefHat size={20} />
              ) : (
                <ShoppingCart size={20} />
              )
            }
            label={user.role === "kitchen_staff" ? "Production" : "Commandes"}
            onClick={navigateToRole}
          />
          <NavItem icon={<Settings size={20} />} label="Paramètres" />
        </nav>

        <div className="p-4 border-t border-gray-700">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full p-3 rounded-lg text-gray-400 hover:bg-gray-800/50 hover:text-white transition-all"
          >
            <LogOut size={20} />
            <span className="font-medium text-sm">Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* MOBILE MENU */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="absolute left-0 top-0 bottom-0 w-64 bg-[#2D2A26] text-white">
            <div className="p-6 border-b border-gray-700 flex justify-between items-center">
              <img src="/logo.avif" alt="Logo" className="h-10 w-auto" />
              <button onClick={() => setIsMobileMenuOpen(false)}>
                <X size={24} />
              </button>
            </div>

            <div className="p-6 border-b border-gray-700">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#C5A065] flex items-center justify-center font-bold">
                  {user.firstName[0]}
                  {user.lastName[0]}
                </div>
                <div>
                  <p className="font-semibold text-sm">
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="text-xs text-gray-400">
                    {user.role === "kitchen_staff"
                      ? "Cuisine"
                      : "Service Client"}
                  </p>
                </div>
              </div>
            </div>

            <nav className="flex-1 p-4 space-y-2">
              <NavItem
                icon={<Activity size={20} />}
                label="Tableau de bord"
                active={true}
                onClick={() => setIsMobileMenuOpen(false)}
              />
              <NavItem
                icon={
                  user.role === "kitchen_staff" ? (
                    <ChefHat size={20} />
                  ) : (
                    <ShoppingCart size={20} />
                  )
                }
                label={
                  user.role === "kitchen_staff" ? "Production" : "Commandes"
                }
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  navigateToRole();
                }}
              />
              <NavItem
                icon={<Settings size={20} />}
                label="Paramètres"
                onClick={() => setIsMobileMenuOpen(false)}
              />
            </nav>

            <div className="p-4 border-t border-gray-700">
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  handleLogout();
                }}
                className="flex items-center gap-3 w-full p-3 rounded-lg text-gray-400 hover:bg-gray-800/50 hover:text-white transition-all"
              >
                <LogOut size={20} />
                <span className="font-medium text-sm">Déconnexion</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MAIN CONTENT */}
      <main className="flex-1 overflow-y-auto">
        {/* HEADER */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="px-4 lg:px-8 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="lg:hidden"
              >
                <Menu size={24} className="text-gray-600" />
              </button>
              <div>
                <h1 className="text-2xl font-serif text-[#2D2A26]">
                  Tableau de bord
                </h1>
                <p className="text-sm text-gray-500">
                  {new Date().toLocaleDateString("fr-FR", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                  })}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Notifications */}
              <button className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <Bell size={20} className="text-gray-600" />
                {unreadNotifications > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                )}
              </button>

              {/* Status Dropdown */}
              <div className="relative group">
                <button
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${statusConfig[user.status].bgColor} ${statusConfig[user.status].textColor} border-gray-200`}
                >
                  <div className={`w-2 h-2 rounded-full ${statusConfig[user.status].color}`} />
                  <span className="text-xs font-medium hidden sm:inline">
                    {statusConfig[user.status].label}
                  </span>
                </button>

                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                  {(Object.keys(statusConfig) as Array<Staff["status"]>).map(
                    (status) => (
                      <button
                        key={status}
                        onClick={() => handleStatusChange(status)}
                        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 first:rounded-t-lg last:rounded-b-lg"
                      >
                        <div
                          className={`w-2 h-2 rounded-full ${statusConfig[status].color}`}
                        />
                        {statusConfig[status].label}
                      </button>
                    )
                  )}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* CONTENT */}
        <div className="p-4 lg:p-8 space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {user.role === "kitchen_staff" ? (
              <>
                <StatCard
                  title="En attente"
                  value={stats.pending}
                  icon={<Clock className="w-5 h-5" />}
                  color="bg-yellow-100 text-yellow-600"
                />
                <StatCard
                  title="En production"
                  value={stats.inProgress}
                  icon={<ChefHat className="w-5 h-5" />}
                  color="bg-blue-100 text-blue-600"
                />
                <StatCard
                  title="Terminés"
                  value={stats.completed}
                  icon={<CheckCircle className="w-5 h-5" />}
                  color="bg-green-100 text-green-600"
                />
                <StatCard
                  title="Temps moyen"
                  value={stats.avgTime}
                  icon={<TrendingUp className="w-5 h-5" />}
                  color="bg-purple-100 text-purple-600"
                />
              </>
            ) : (
              <>
                <StatCard
                  title="En attente"
                  value={stats.pending}
                  icon={<Clock className="w-5 h-5" />}
                  color="bg-yellow-100 text-yellow-600"
                />
                <StatCard
                  title="Confirmées"
                  value={stats.confirmed}
                  icon={<ShoppingCart className="w-5 h-5" />}
                  color="bg-blue-100 text-blue-600"
                />
                <StatCard
                  title="Prêtes"
                  value={stats.ready}
                  icon={<Package className="w-5 h-5" />}
                  color="bg-green-100 text-green-600"
                />
                <StatCard
                  title="Temps moyen"
                  value={stats.avgTime}
                  icon={<TrendingUp className="w-5 h-5" />}
                  color="bg-purple-100 text-purple-600"
                />
              </>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Activity */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  Activité récente
                </h3>
                <Activity className="text-[#C5A065] w-5 h-5" />
              </div>

              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-start gap-3 pb-4 border-b border-gray-100 last:border-0"
                  >
                    <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-600">
                      {activity.icon}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {activity.description}
                      </p>
                      <p className="text-xs text-gray-500">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Notifications */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  Notifications
                </h3>
                <Bell className="text-[#C5A065] w-5 h-5" />
              </div>

              <div className="space-y-3">
                {notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`p-3 rounded-lg border ${
                      notif.isRead
                        ? "bg-white border-gray-200"
                        : "bg-blue-50 border-blue-200"
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      {notif.type === "new_ticket" && (
                        <MessageSquare className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      )}
                      {notif.type === "alert" && (
                        <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                      )}
                      {notif.type === "info" && (
                        <Bell className="w-4 h-4 text-gray-600 mt-0.5 flex-shrink-0" />
                      )}
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {notif.message}
                        </p>
                        <p className="text-xs text-gray-500">{notif.time}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Actions rapides
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <button
                onClick={navigateToRole}
                className="p-4 border-2 border-gray-200 rounded-lg hover:border-[#C5A065] hover:bg-[#C5A065]/5 transition-all group"
              >
                <div className="flex items-center gap-3">
                  {user.role === "kitchen_staff" ? (
                    <ChefHat className="w-6 h-6 text-[#C5A065] group-hover:scale-110 transition-transform" />
                  ) : (
                    <ShoppingCart className="w-6 h-6 text-[#C5A065] group-hover:scale-110 transition-transform" />
                  )}
                  <span className="font-medium text-gray-900">
                    {user.role === "kitchen_staff"
                      ? "Voir production"
                      : "Gérer commandes"}
                  </span>
                </div>
              </button>

              <button className="p-4 border-2 border-gray-200 rounded-lg hover:border-[#C5A065] hover:bg-[#C5A065]/5 transition-all group">
                <div className="flex items-center gap-3">
                  <UserCircle className="w-6 h-6 text-[#C5A065] group-hover:scale-110 transition-transform" />
                  <span className="font-medium text-gray-900">
                    Modifier profil
                  </span>
                </div>
              </button>

              <button className="p-4 border-2 border-gray-200 rounded-lg hover:border-[#C5A065] hover:bg-[#C5A065]/5 transition-all group">
                <div className="flex items-center gap-3">
                  <Calendar className="w-6 h-6 text-[#C5A065] group-hover:scale-110 transition-transform" />
                  <span className="font-medium text-gray-900">
                    Voir planning
                  </span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// COMPONENTS

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
}

function NavItem({ icon, label, active = false, onClick }: NavItemProps) {
  return (
    <button
      onClick={onClick}
      className={`
        flex items-center gap-3 w-full p-3 rounded-lg transition-all duration-200
        ${
          active
            ? "bg-[#C5A065] text-white"
            : "text-gray-400 hover:bg-gray-800/50 hover:text-white"
        }
      `}
    >
      {icon}
      <span className="font-medium text-sm">{label}</span>
    </button>
  );
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
}

function StatCard({ title, value, icon, color }: StatCardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-gray-500 uppercase mb-2">
            {title}
          </p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${color}`}>{icon}</div>
      </div>
    </div>
  );
}