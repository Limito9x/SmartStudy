import { Outlet } from "react-router-dom";
import {
  Dialog,
  DialogTitle,
  DialogDescription,
  DialogContent,
  DialogHeader,
} from "@/components/ui/dialog";
import { useDialogStore } from "@/stores/useDialogStore";
import { Sidebar } from "../components/layout/app/sidebar/sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import AppHeader from "@/components/layout/app/app-header";
import ChatDrawer from "@/components/chats/ChatDrawer";

export default function DashboardLayout() {
  const { isOpen, title, description, view, closeDialog } = useDialogStore();

  return (
    <div className="dashboard-layout h-screen w-full overflow-hidden">
      <div className="dashboard-content flex h-full min-w-0">
        <SidebarProvider>
          <Sidebar />
          <div className="main-content flex-1 min-w-0 flex flex-col overflow-hidden">
            <AppHeader />
            {/*Global dialog*/}
            <Dialog
              open={isOpen}
              onOpenChange={(open) => {
                if (!open) {
                  closeDialog();
                }
              }}
            >
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{title}</DialogTitle>
                  {description && (
                    <DialogDescription>{description}</DialogDescription>
                  )}
                </DialogHeader>
                {view}
              </DialogContent>
            </Dialog>
            <div className="flex-1 min-h-0 min-w-0 overflow-hidden">
              <Outlet />
            </div>
            <ChatDrawer />
          </div>
        </SidebarProvider>
      </div>
    </div>
  );
}
