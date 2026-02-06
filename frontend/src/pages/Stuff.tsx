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
  const [notifications, setNotifications] = useState<Notification[]>([
    { id: "1", type: "new_ticket", message: "Nouveau ticket: Commande CMD-2045 nécessite attention", time: "Il y a 5 min", isRead: false },
    { id: "2", type: "alert", message: "Stock faible: Farine T55", time: "Il y a 15 min", isRead: false },
    { id: "3", type: "info", message: "Réunion d'équipe demain à 9h", time: "Il y a 1h", isRead: true },
  ]);

  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([
    { id: "1", type: "order_assigned", description: "Commande CMD-2050 assignée", time: "Il y a 10 min", icon: <Package className="w-4 h-4" /> },
    { id: "2", type: "dish_prepared", description: "15 Croissants au Beurre préparés", time: "Il y a 25 min", icon: <CheckCircle className="w-4 h-4" /> },
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
          firstName: sUser.user_metadata?.firstName || "Chef",
          lastName: sUser.user_metadata?.lastName || "Marius",
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

  // ----- STATUS CHANGE -----
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
      {/* SIDEBAR + MOBILE + CONTENT */}
      {/* ... le reste de ton JSX reste identique */}
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
