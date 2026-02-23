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
import AppHeader from "@/components/layout/app/app-header";

export default function DashboardLayout() {
  const { isOpen, title, description, view, closeDialog } = useDialogStore();

  return (
    <div className="dashboard-layout">
      <AppHeader />
      <div className="dashboard-content">
        <Sidebar />
        <div className="main-content">
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
                {description && <DialogDescription>{description}</DialogDescription>}
              </DialogHeader>
              {view}
            </DialogContent>
          </Dialog>
          <Outlet />
        </div>
      </div>
    </div>
  );
}
