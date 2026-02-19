import {
  Sidebar as ShadcnSidebar,
  SidebarHeader,
  SidebarContent,
} from "../../ui/sidebar";
import { Navigation } from "./Navigation";

export function Sidebar() {
  return (
    <div className="sidebar">
      <ShadcnSidebar>
        <SidebarHeader>
          <h3 className="text-lg font-semibold">Smart Study</h3>
        </SidebarHeader>
        <SidebarContent>
          <Navigation />
        </SidebarContent>
      </ShadcnSidebar>
    </div>
  );
}
