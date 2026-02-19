import { Header } from "../components/layout/Header";
import { Sidebar } from "../components/layout/Sidebar";

export default function DashboardLayout() {
  return (
    <div className="dashboard-layout">
      <Header />
      <div className="dashboard-content">
        <Sidebar />
        <div className="main-content">
        </div>
      </div>
    </div>
  );
}
