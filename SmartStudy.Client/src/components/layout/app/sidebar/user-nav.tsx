import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/useAuthStore";
import { User, LogOut } from "lucide-react";
import { SidebarMenuItem } from "@/components/ui/sidebar";

export default function UserNav() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <SidebarMenuItem className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <User className="w-4 h-4" />
          <span>{user?.fullName || "User"}</span>
        </div>

      <Button variant="ghost" size="icon" onClick={handleLogout}>
        <LogOut className="w-4 h-4" />
      </Button>
    </SidebarMenuItem>
  );
}
