import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { authClient } from "../lib/AuthClient";

type RoleType =
  | "admin"
  | "kitchen_staff"
  | "customer_service"
  | "client"
  | "deliveryDriver";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: RoleType[];
}

interface UserWithMetadata {
  id: string;
  email: string;
  role?: RoleType;
  user_metadata?: {
    role?: RoleType;
    [key: string]: any;
  };
  [key: string]: any;
}

export function ProtectedRoute({
  children,
  allowedRoles,
}: ProtectedRouteProps) {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<RoleType | null>(null);
  const location = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const session = await authClient.getSession();

        if (!session?.data?.user) {
          setIsAuthenticated(false);
          setLoading(false);
          return;
        }

        setIsAuthenticated(true);
        const user = session.data.user as UserWithMetadata;

        // ✅ Récupération du rôle avec "client" par défaut
        const rawRole = user.user_metadata?.role || user.role || "client";

        // 🧹 NETTOYAGE DU RÔLE (suppression des guillemets et espaces)
        const cleanedRole = String(rawRole)
          .replace(/['"]/g, "")
          .trim() as RoleType;

        console.log("🔐 [ProtectedRoute] Rôle brut:", rawRole);
        console.log("🔐 [ProtectedRoute] Rôle nettoyé:", cleanedRole);
        console.log("🔐 [ProtectedRoute] Rôles autorisés:", allowedRoles);

        setUserRole(cleanedRole);
        setLoading(false);
      } catch (error) {
        console.error("Auth check error:", error);
        setIsAuthenticated(false);
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // ⏳ Écran de chargement stylisé
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F9F7F2]">
        <div className="w-12 h-12 border-4 border-[#C5A065] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // 🔒 Redirection si non connecté
  if (!isAuthenticated) {
    return <Navigate to="/se-connecter" state={{ from: location }} replace />;
  }

  // 🎯 Vérification des permissions
  if (allowedRoles && userRole && !allowedRoles.includes(userRole)) {
    console.warn(
      `🚫 Accès refusé. Requis: ${allowedRoles}, Utilisateur: ${userRole}`,
    );

    // Redirections automatiques vers les bons espaces selon le rôle
    if (userRole === "admin") return <Navigate to="/dashboard" replace />;
    if (userRole === "kitchen_staff")
      return <Navigate to="/staff/production" replace />;
    if (userRole === "customer_service")
      return <Navigate to="/staff/commandes" replace />;
    if (userRole === "deliveryDriver")
      return <Navigate to="/staff/delivery" replace />;
    if (userRole === "client") return <Navigate to="/mon-compte" replace />;

    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
