import {
  Sidebar as ShadcnSidebar,
  SidebarHeader,
  SidebarContent,
} from "../ui/sidebar";

export function Sidebar() {
  return (
    <div className="sidebar">
      <h2>Sidebar</h2>
      <ShadcnSidebar>
        <SidebarHeader>
          <h3 className="text-lg font-semibold">Menu</h3>
        </SidebarHeader>
        <SidebarContent>
          <ul>
            <li>Tổng quan</li>
            <li>Quản lý học tập chính khóa</li>
            <li>Quản lý học tập tự chọn</li>
            <li>Thời khóa biểu</li>
          </ul>
        </SidebarContent>
      </ShadcnSidebar>
    </div>
  );
}
