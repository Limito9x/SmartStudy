import { useLocation } from "react-router-dom";
import { Navigate, Outlet } from "react-router-dom";

export function AuthGuard() {
  const location = useLocation();
  const isAdminRoute = location.pathname.includes("/admin");
  const token = localStorage.getItem("token");
  if (!token) return <Navigate to="/login" replace />;

  const user = JSON.parse(localStorage.getItem("user") || "");
  if (!user || !user.token) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    return <Navigate to="/login" replace />;
  }
  const isAdmin = user.role == "Admin";
  if (isAdminRoute && !isAdmin) {
    return <Navigate to="/app" replace />;
  }

  return <Outlet />;
}
