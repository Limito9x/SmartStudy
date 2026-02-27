import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/useAuthStore";
import { useDialogStore } from "@/stores/useDialogStore";
import { SettingForm } from "@/components/forms/user/setting";

export default function UserNav() {
  const navigate = useNavigate();
  const { logout } = useAuthStore();
  const { openDialog } = useDialogStore();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const userMenuItems = [
    {
      title: "Cài đặt",
      description: "Thiết lập thông tin cá nhân và cài đặt học tập",
      component: <SettingForm />,
    },
  ];

  return (
    <div className="p-2">
      {userMenuItems.map((item) => (
        <Button
          key={item.title}
          variant="ghost"
          className="w-full justify-start"
          onClick={() =>
            openDialog({
              title: item.title,
              description: item.description,
              view: item.component,
            })
          }
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
