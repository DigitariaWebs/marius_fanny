import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { authClient } from "../lib/AuthClient";

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
        const session = await authClient.getSession();

        if (session?.data?.user) {
          const user: any = session.data.user;
          const userRole = user.user_metadata?.role || user.role;

          // If user is a delivery driver and NOT on their designated route
          if (userRole === "deliveryDriver" && location.pathname !== "/staff/delivery") {
            console.log("🚚 Redirecting delivery driver to their dashboard");
            navigate("/staff/delivery", { replace: true });
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
