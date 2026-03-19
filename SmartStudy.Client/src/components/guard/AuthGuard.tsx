import { Navigate, Outlet } from "react-router-dom";

export function AuthGuard() {
  const token = localStorage.getItem("token");
  if (!token) return <Navigate to="/login" replace />;
  
  const user = JSON.parse(localStorage.getItem("user")||"");
  if(!user || !user.token) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    return <Navigate to="/login" replace />;
  }
  if(user?.role==="admin") {
    return <Navigate to="/admin" replace />;
  }

  return <Outlet />;
}
