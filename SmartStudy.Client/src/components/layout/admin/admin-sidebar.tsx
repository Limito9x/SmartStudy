import { Separator } from "@/components/ui/separator";
import {
  Sidebar as ShadcnSidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/useAuthStore";
import { User2, LayoutDashboard, LogOut } from "lucide-react";

const navigationItems = [
  { label: "Tổng quan", path: "/", icon: LayoutDashboard },
  { label: "Người dùng", path: "/users", icon: User2 },
];

export default function AdminSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <ShadcnSidebar>
      <SidebarHeader className="p-4">
        <h3 className="text-lg font-black text-primary">Smart Study Admin</h3>
      </SidebarHeader>

      <SidebarContent className="overflow-x-hidden">
        <SidebarGroup>
          <SidebarMenu>
            {navigationItems.map((item) => {
              const navPath =
                item.path === "/" ? "/admin" : `/admin${item.path}`;
              const isActive = location.pathname === navPath;
              const Icon = item.icon;

              return (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive}
                    onClick={() => navigate(navPath)}
                    className="cursor-pointer"
                  >
                    <div>
                      <Icon className="w-4 h-4 mr-2" />
                      {item.label}
                    </div>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4">
        <Button
          onClick={handleLogout}
          variant="outline"
          className="w-full justify-start gap-2"
        >
          <LogOut className="w-4 h-4" />
          <span>Đăng xuất</span>
        </Button>
      </SidebarFooter>
    </ShadcnSidebar>
  );
}
