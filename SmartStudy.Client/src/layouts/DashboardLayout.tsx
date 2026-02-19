import { Outlet } from "react-router-dom";
import { Header } from "../components/layout/Header/Header";
import { Sidebar } from "../components/layout/Sidebar/Sidebar";

export default function DashboardLayout() {
  return (
    <div className="dashboard-layout">
      <Header />
      <div className="dashboard-content">
        <Sidebar />
        <div className="main-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
