import {
  Sidebar as ShadcnSidebar,
  SidebarHeader,
  SidebarContent,
} from "../../../ui/sidebar";
import Navigation  from "./navigation";
import UserNav from "./user-nav";

export function Sidebar() {
  return (
    <div className="sidebar">
      <ShadcnSidebar>
        <SidebarHeader>
          <h3 className="text-lg font-semibold">Smart Study</h3>
        </SidebarHeader>
        <SidebarContent>
          <Navigation />
          <UserNav />
        </SidebarContent>
      </ShadcnSidebar>
    </div>
  );
}
