import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/useAuthStore";

export default function UserNav() {
  const navigate = useNavigate();
  const { logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="p-2">
      <Button variant="outline" className="ml-auto" onClick={handleLogout}>
        Đăng xuất
      </Button>
    </div>
  );
}
