import { Outlet } from "react-router-dom";
import GlobalDialog from "@/components/dialogs/GlobalDialog";
import { SidebarProvider } from "@/components/ui/sidebar";
import AdminHeader from "@/components/layout/admin/admin-header";
import AdminSidebar from "@/components/layout/admin/admin-sidebar";

export default function AdminLayout() {
  return (
    <div className="dashboard-layout h-screen w-full overflow-hidden">
      <div className="dashboard-content flex h-full min-w-0">
        <SidebarProvider>
          <AdminSidebar/>
          <div className="main-content flex-1 min-w-0 flex flex-col overflow-hidden">
            <AdminHeader />
            <GlobalDialog />
            <div className="flex-1 min-h-0 min-w-0 overflow-hidden">
              <Outlet />
            </div>
          </div>
        </SidebarProvider>
      </div>
    </div>
  );
}
