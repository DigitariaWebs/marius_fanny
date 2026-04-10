import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { authClient } from "../lib/AuthClient";
import { getSessionUniversal } from "../utils/getSession";

interface RoleBasedRedirectProps {
  children: React.ReactNode;
}

/**
 * Component that redirects delivery drivers to their dashboard
 * if they try to access public routes
 */
export function RoleBasedRedirect({ children }: RoleBasedRedirectProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    const checkRole = async () => {
      try {
        const session = await getSessionUniversal();

        if (session?.user) {
          const user: any = session.user;
          const userRole = user.user_metadata?.role || user.role;

          // If user is a delivery driver and NOT on their designated route
          if (userRole === "deliveryDriver" && location.pathname !== "/staff/delivery") {
            console.log("🚚 Redirecting delivery driver to their dashboard");
            navigate("/staff/delivery", { replace: true });
            return;
          }

          // If user is a cuisinier and NOT on their designated route
          if (userRole === "cuisinier" && location.pathname !== "/staff/cuisinier") {
            console.log("👨‍🍳 Redirecting cuisinier to their dashboard");
            navigate("/staff/cuisinier", { replace: true });
            return;
          }

          // If user is a patissier and NOT on their designated route
          if (userRole === "patissier" && location.pathname !== "/staff/patissier") {
            console.log("🧁 Redirecting patissier to their dashboard");
            navigate("/staff/patissier", { replace: true });
            return;
          }

          // If user is a vendeur/four and NOT on their designated route
          if (
            (userRole === "vendeur" || userRole === "four") &&
            location.pathname !== "/staff/vendeur" &&
            location.pathname !== "/staff/four"
          ) {
            console.log("🛍️ Redirecting vendeur to their dashboard");
            navigate("/staff/vendeur", { replace: true });
            return;
          }
        }

        // Allow rendering for all other cases
        setShouldRender(true);
        setLoading(false);
      } catch (error) {
        console.error("Role check error:", error);
        setShouldRender(true);
        setLoading(false);
      }
    };

    checkRole();
  }, [navigate, location.pathname]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F9F7F2]">
        <div className="w-12 h-12 border-4 border-[#C5A065] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return shouldRender ? <>{children}</> : null;
}
