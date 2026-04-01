import { Outlet } from "react-router-dom";
import GlobalDialog from "@/components/dialogs/GlobalDialog";
import { Sidebar } from "../components/layout/app/sidebar/sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import AppHeader from "@/components/layout/app/app-header";
import BubbleChat from "@/components/chats/BubbleChat";
import { useLocation } from "react-router-dom";

export default function DashboardLayout() {
  const location = useLocation();
  const showGlobalChat = !location.pathname.includes("/courses/");

  return (
    <div className="dashboard-layout h-screen w-full overflow-hidden">
      <div className="dashboard-content flex h-full min-w-0">
        <SidebarProvider>
          <Sidebar />
          <div className="main-content flex-1 min-w-0 flex flex-col overflow-hidden">
            <AppHeader />
            <GlobalDialog />
            <div className="flex-1 min-h-0 min-w-0 overflow-hidden">
              <Outlet />
            </div>
            {showGlobalChat && <BubbleChat />}
          </div>
        </SidebarProvider>
      </div>
    </div>
  );
}
