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
import UserNav from "./user-nav";
import Workspace from "./workspace";
import { useNavigate, useLocation } from "react-router-dom";
// Nhớ import icon để menu bớt phèn nhé bác
import { Calendar, LayoutDashboard, FileStack } from "lucide-react";

const navigationItems = [
  { label: "Hôm nay", path: "/", icon: LayoutDashboard },
  { label: "Lịch trình", path: "/calendar", icon: Calendar },
  { label: "Template", path: "/templates", icon: FileStack },
];

export function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <ShadcnSidebar>
      <SidebarHeader className="p-4">
        <h3 className="text-lg font-black text-primary">Smart Study</h3>
      </SidebarHeader>

      <SidebarContent className="overflow-x-hidden">
        <SidebarGroup>
          <SidebarMenu>
            {navigationItems.map((item) => {
              const navPath = item.path === "/" ? "/app" : `/app${item.path}`;
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

        <Separator className="mx-4 my-2 w-auto" />

        {/* Khu vực Chọn KHHT + Danh sách khóa học sẽ nằm hết ở đây */}
        <Workspace />
        <Separator className="mx-4 my-2 w-auto" />
      </SidebarContent>
      <SidebarFooter className="w-full border-t">
        <UserNav />
      </SidebarFooter>
    </ShadcnSidebar>
  );
}
