import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { authClient } from "../lib/AuthClient";

// ===============================
// 🔧 MODE TEST
// ===============================
const TEST_MODE = false; // ⬅️ mets false en production
const TEST_USER_ROLE: "admin" | "kitchen_staff" | "customer_service" | "client" =
  "customer_service"; // change ici pour tester

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ("admin" | "kitchen_staff" | "customer_service")[];
}

export function ProtectedRoute({
  children,
  allowedRoles,
}: ProtectedRouteProps) {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const location = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // 🧪 MODE TEST
        if (TEST_MODE) {
          console.log("🧪 TEST MODE: Simulating user role:", TEST_USER_ROLE);
          setIsAuthenticated(true);
          setUserRole(TEST_USER_ROLE);
          setLoading(false);
          return;
        }

        // 🔐 MODE PRODUCTION
        const session = await authClient.getSession();

        if (!session?.data) {
          setIsAuthenticated(false);
          setLoading(false);
          return;
        }

        setIsAuthenticated(true);

        const role =
          session.data.user?.user_metadata?.role ||
          session.data.user?.role ||
          "client";

        setUserRole(role);
        setLoading(false);
      } catch (error) {
        console.error("Auth check error:", error);
        setIsAuthenticated(false);
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#C5A065] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/se-connecter" state={{ from: location }} replace />;
  }

  // 🎯 Vérification des rôles autorisés
  if (allowedRoles && !allowedRoles.includes(userRole as any)) {
    console.warn(
      `🚫 Access denied. Allowed: ${allowedRoles.join(
        ", "
      )}, User has: ${userRole}`
    );

    if (userRole === "admin") return <Navigate to="/dashboard" replace />;
    if (userRole === "kitchen_staff") return <Navigate to="/staff/production" replace />;
    if (userRole === "customer_service") return <Navigate to="/staff/commandes" replace />;

    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
