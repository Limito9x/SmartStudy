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

  const userMenuItems = [
    // {
    //   title: "Cài đặt",
    //   description: "Thiết lập thông tin cá nhân và cài đặt học tập",
    // },
  ];

  return (
    <div className="p-2">
      {userMenuItems.map((item) => (
        <Button
          key={item.title}
          variant="ghost"
          className="w-full justify-start"

        >
          {item.title}
        </Button>
      ))}
      <Button variant="outline" className="ml-auto" onClick={handleLogout}>
        Đăng xuất
      </Button>
    </div>
  );
}
