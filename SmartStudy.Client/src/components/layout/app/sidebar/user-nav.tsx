import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/useAuthStore";
import { useDialogStore } from "@/stores/useDialogStore";
import StudentInfoForm from "@/components/forms/user/student-info/StudentInfoForm";

export default function UserNav() {
  const navigate = useNavigate();
  const { logout } = useAuthStore();
  const { openDialog } = useDialogStore();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="p-2">

      <Button variant="outline" onClick={handleLogout}>
        Đăng xuất
      </Button>
    </div>
  );
}
