import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { authClient, normalizedApiUrl } from "../lib/AuthClient";

type RoleType =
  | "admin"
  | "kitchen_staff"
  | "customer_service"
  | "client"
  | "deliveryDriver"
  | "vendeur"
  | "four";

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
        // Try cookie session first
        let user: UserWithMetadata | null = null;
        const session = await authClient.getSession();

        if (session?.data?.user) {
          user = session.data.user as UserWithMetadata;
        } else {
          // Fallback: use bearer token directly via /api/auth/get-session
          const token = localStorage.getItem("bearer_token");
          if (token) {
            try {
              const response = await fetch(`${normalizedApiUrl}/api/auth/get-session`, {
                headers: { Authorization: `Bearer ${token}` },
                credentials: "include",
              });
              if (response.ok) {
                const data = await response.json();
                if (data?.user) user = data.user as UserWithMetadata;
              }
            } catch (e) {
              console.error("Bearer session check failed:", e);
            }
          }
        }

        if (!user) {
          setIsAuthenticated(false);
          setLoading(false);
          return;
        }

        setIsAuthenticated(true);

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
    if (userRole === "vendeur" || userRole === "four")
      return <Navigate to="/staff/vendeur" replace />;
    if (userRole === "client") return <Navigate to="/mon-compte" replace />;

    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
