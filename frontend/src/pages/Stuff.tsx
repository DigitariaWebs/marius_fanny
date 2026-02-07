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

// ----- TYPES -----
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

interface UserWithRole {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  email: string;
  emailVerified: boolean;
  name: string;
  image?: string | null;
  role?: string;
  user_metadata?: {
    firstName?: string;
    lastName?: string;
    [key: string]: any;
  };
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

// ----- COMPONENT -----
export default function StaffDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState<Staff | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [notifications] = useState<Notification[]>([
    { id: "1", type: "new_ticket", message: "Nouveau ticket: Commande CMD-2045 nécessite attention", time: "Il y a 5 min", isRead: false },
    { id: "2", type: "alert", message: "Stock faible: Farine T55", time: "Il y a 15 min", isRead: false },
    { id: "3", type: "info", message: "Réunion d'équipe demain à 9h", time: "Il y a 1h", isRead: true },
  ]);

  const [recentActivities] = useState<RecentActivity[]>([
    { id: "1", type: "order_assigned", description: "Commande CMD-2050 assignée", time: "Il y a 10 min", icon: <Package className="w-4 h-4" /> },
    { id: "2", type: "dish_prepared", description: "Plats préparés pour CMD-2048", time: "Il y a 25 min", icon: <CheckCircle className="w-4 h-4" /> },
    { id: "3", type: "ticket_closed", description: "Ticket #1234 résolu", time: "Il y a 45 min", icon: <MessageSquare className="w-4 h-4" /> },
    { id: "4", type: "status_changed", description: "Statut changé: Disponible", time: "Il y a 2h", icon: <Activity className="w-4 h-4" /> },
  ]);

  // ----- CHECK AUTH -----
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const session = await authClient.getSession();

        if (!session?.data) {
          navigate("/se-connecter");
          return;
        }

        const sUser: UserWithRole = session.data.user;

        const userRole = sUser.user_metadata?.role || sUser.role || "kitchen_staff";

        const userData: Staff = {
          id: Number(sUser.id),
          firstName: sUser.user_metadata?.firstName || "Staff",
          lastName: sUser.user_metadata?.lastName || "Member",
          email: sUser.email,
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

  // ----- LOGOUT -----
  const handleLogout = async () => {
    try {
      await authClient.signOut();
      navigate("/se-connecter");
    } catch (error) {
      console.error("Logout error:", error);
      navigate("/se-connecter");
    }
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
      ? { pending: 12, inProgress: 8, completed: 45, avgTime: "25 min" }
      : { pending: 7, confirmed: 18, ready: 23, avgTime: "15 min" };

  const unreadNotifications = notifications.filter((n) => !n.isRead).length;

  const statusConfig = {
    active: { label: "Disponible", color: "bg-green-500", textColor: "text-green-700", bgColor: "bg-green-50" },
    busy: { label: "Occupé", color: "bg-yellow-500", textColor: "text-yellow-700", bgColor: "bg-yellow-50" },
    offline: { label: "Hors ligne", color: "bg-gray-500", textColor: "text-gray-700", bgColor: "bg-gray-50" },
  };

  // ----- RENDER -----
  return (
    <div className="flex h-screen bg-gray-50">
      {/* SIDEBAR */}
      <aside className="hidden lg:flex flex-col w-64 bg-gray-900 text-white">
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <ChefHat className="w-8 h-8 text-[#C5A065]" />
            <div>
              <h1 className="font-bold text-lg">Marius & Fanny</h1>
              <p className="text-xs text-gray-400">Tableau de bord</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <NavItem icon={<Activity className="w-5 h-5" />} label="Tableau de bord" active />
          <NavItem 
            icon={user.role === "kitchen_staff" ? <ChefHat className="w-5 h-5" /> : <ShoppingCart className="w-5 h-5" />} 
            label={user.role === "kitchen_staff" ? "Production" : "Commandes"} 
            onClick={navigateToRole} 
          />
          <NavItem 
            icon={<Calendar className="w-5 h-5" />} 
            label="Planning" 
            onClick={() => navigate("/staff/planning")}
          />
          <NavItem icon={<MessageSquare className="w-5 h-5" />} label="Messages" />
          <NavItem icon={<Settings className="w-5 h-5" />} label="Paramètres" />
        </nav>

        <div className="p-4 border-t border-gray-800">
          <button onClick={handleLogout} className="flex items-center gap-3 w-full p-3 rounded-lg text-gray-400 hover:bg-gray-800/50 hover:text-white transition-all">
            <LogOut className="w-5 h-5" />
            <span className="font-medium text-sm">Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* HEADER */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="lg:hidden p-2 hover:bg-gray-100 rounded-lg">
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Bonjour, {user.firstName}!</h2>
                <p className="text-sm text-gray-500">Voici votre activité d'aujourd'hui</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="relative">
                <button className="relative p-2 hover:bg-gray-100 rounded-lg">
                  <Bell className="w-6 h-6 text-gray-600" />
                  {unreadNotifications > 0 && <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />}
                </button>
              </div>

              <div className="flex items-center gap-3">
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${statusConfig[user.status].bgColor}`}>
                  <div className={`w-2 h-2 rounded-full ${statusConfig[user.status].color}`} />
                  <span className={`text-xs font-medium ${statusConfig[user.status].textColor}`}>{statusConfig[user.status].label}</span>
                </div>
                <div className="w-10 h-10 bg-[#C5A065] rounded-full flex items-center justify-center">
                  <UserCircle className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* CONTENT */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* STATS */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {user.role === "kitchen_staff" ? (
                <>
                  <StatCard title="En attente" value={stats.pending ?? 0} icon={<Clock className="w-6 h-6 text-orange-600" />} color="bg-orange-50" />
                  <StatCard title="En cours" value={(stats as any).inProgress ?? 0} icon={<ChefHat className="w-6 h-6 text-blue-600" />} color="bg-blue-50" />
                  <StatCard title="Terminées" value={(stats as any).completed ?? 0}icon={<CheckCircle className="w-6 h-6 text-green-600" />} color="bg-green-50" />
                  <StatCard title="Temps moy."  value={stats.avgTime ?? "0 min"}  icon={<TrendingUp className="w-6 h-6 text-purple-600" />} color="bg-purple-50" />
                </>
              ) : (
                <>
                  <StatCard title="En attente" value={stats.pending} icon={<Clock className="w-6 h-6 text-orange-600" />} color="bg-orange-50" />
                  <StatCard title="Confirmées" value={stats.confirmed} icon={<CheckCircle className="w-6 h-6 text-blue-600" />} color="bg-blue-50" />
                  <StatCard title="Prêtes" value={stats.ready} icon={<Package className="w-6 h-6 text-green-600" />} color="bg-green-50" />
                  <StatCard title="Temps moy." value={stats.avgTime} icon={<TrendingUp className="w-6 h-6 text-purple-600" />} color="bg-purple-50" />
                </>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* ACTIVITÉS */}
              <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Activité récente</h3>
                <div className="space-y-4">
                  {recentActivities.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                      <div className="p-2 bg-gray-100 rounded-lg">{activity.icon}</div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{activity.description}</p>
                        <p className="text-xs text-gray-500">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* NOTIFICATIONS */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Notifications</h3>
                <div className="space-y-3">
                  {notifications.map((notif) => (
                    <div key={notif.id} className={`p-3 rounded-lg ${notif.isRead ? "bg-gray-50" : "bg-blue-50"}`}>
                      <p className="text-sm font-medium text-gray-900">{notif.message}</p>
                      <p className="text-xs text-gray-500 mt-1">{notif.time}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

// ----- COMPONENTS -----
interface NavItemProps { icon: React.ReactNode; label: string; active?: boolean; onClick?: () => void; }
function NavItem({ icon, label, active = false, onClick }: NavItemProps) {
  return (
    <button onClick={onClick} className={`flex items-center gap-3 w-full p-3 rounded-lg transition-all duration-200 ${active ? "bg-[#C5A065] text-white" : "text-gray-400 hover:bg-gray-800/50 hover:text-white"}`}>
      {icon}
      <span className="font-medium text-sm">{label}</span>
    </button>
  );
}

interface StatCardProps { title: string; value: string | number; icon: React.ReactNode; color: string; }
function StatCard({ title, value, icon, color }: StatCardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-gray-500 uppercase mb-2">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${color}`}>{icon}</div>
      </div>
    </div>
  );
}